"use strict";
// HD layer core: reads the emulator's memory, works out which screen the game
// is showing, and lets a scene in scenes.js draw it as crisp DOM/SVG.
// Whatever isn't redrawn falls back to the normal pixel canvas.

const HD = (() => {
  // WasmBoy keeps work RAM (0xC000-0xDFFF, banks 0 and 1) contiguous here.
  const WRAM_START = 0x4800;
  const WRAM_END = WRAM_START + 0x2000;


  // Tile ids in wTilemap -> characters (see constants/charmap.asm).
  const CHARS = { 0x7f: " ", 0x75: "…", 0xe0: "'", 0xe3: "-", 0xe6: "?", 0xe7: "!", 0xe8: ".", 0xe9: "&",
    0xea: "é", 0xed: "▶", 0xee: "▼", 0xef: "♂", 0xf0: "¥", 0xf3: "/", 0xf4: ",", 0xf5: "♀", 0x9a: "(", 0x9b: ")",
    0x9c: ":", 0x9d: ";", 0x9e: "[", 0x9f: "]", 0x72: "“", 0x73: "”", 0xd4: "'s", 0xd5: "'t", 0xd0: "'d",
    0xd1: "'l", 0xd2: "'m", 0xd3: "'r", 0xd6: "'v", 0xe1: "PK", 0xe2: "MN" };
  for (let i = 0; i < 26; i++) {
    CHARS[0x80 + i] = String.fromCharCode(65 + i);
    CHARS[0xa0 + i] = String.fromCharCode(97 + i);
  }
  for (let i = 0; i < 10; i++) CHARS[0xf6 + i] = String(i);

  const decode = (tiles, from, to) => {
    let s = "";
    for (let i = from; i < to; i++) s += CHARS[tiles[i]] ?? (tiles[i] === 0x7f ? " " : "\u0000");
    return s.replace(/\u0000+/g, "").replace(/\s+$/g, "");
  };

  let wb, root, scenes, current = null, currentId = null, busy = false, timer = null;
  const flags = { seenNaming: false };
  const listeners = [];

  // Every bordered box except the dialogue box: { c0, r0, c1, r1, rows: [{ text, selected }] } (cols/rows are tile coords).
  function readBoxes(tiles) {
    const boxes = [];
    for (let i = 0; i < 360; i++) {
      if (tiles[i] !== 0x79 || i === 12 * 20) continue;
      const c0 = i % 20, r0 = (i / 20) | 0;
      let c1 = c0 + 1, r1 = r0 + 1;
      while (c1 < 20 && tiles[r0 * 20 + c1] !== 0x7b) c1++;
      while (r1 < 18 && tiles[r1 * 20 + c0] !== 0x7d) r1++;
      if (c1 >= 20 || r1 >= 18) continue;
      const rows = [];
      for (let r = r0 + 1; r < r1; r++) {
        const text = decode(tiles, r * 20 + c0 + 2, r * 20 + c1).trim();
        if (text) rows.push({ text, selected: tiles[r * 20 + c0 + 1] === 0xed });
      }
      boxes.push({ c0, r0, c1, r1, rows });
    }
    return boxes;
  }

  // A name as the game stores it: charmap bytes ending in 0x50.
  function readName(mem, addr, max) {
    let n = "";
    for (let i = 0; i < max && mem[addr - 0xc000 + i] !== 0x50; i++) n += CHARS[mem[addr - 0xc000 + i]] ?? "";
    return n;
  }

  // The battle mons (battle_struct: species +0, level +13, HP +16, max HP +18, HP big-endian), or null outside battle.
  function readBattle(mem) {
    const mode = mem[HD_SYMS.wBattleMode - 0xc000];
    if (!mode) return null;
    const mon = (addr, nick) => {
      const o = addr - 0xc000;
      return { species: mem[o], level: mem[o + 13], hp: (mem[o + 16] << 8) | mem[o + 17], max: (mem[o + 18] << 8) | mem[o + 19], name: readName(mem, nick, 10) };
    };
    return { mode, enemy: mon(HD_SYMS.wEnemyMon, HD_SYMS.wEnemyMonNickname), player: mon(HD_SYMS.wBattleMon, HD_SYMS.wBattleMonNickname) };
  }

  function readState(mem) {
    const at = (sym) => mem[HD_SYMS[sym] - 0xc000];
    const tiles = mem.subarray(HD_SYMS.wTilemap - 0xc000, HD_SYMS.wTilemap - 0xc000 + 360);
    const rows = [];
    for (let r = 0; r < 18; r++) rows.push(decode(tiles, r * 20, r * 20 + 20));
    return {
      scene: at("wHDScene"),
      tiles, rows,
      map: { group: at("wMapGroup"), number: at("wMapNumber") },
      x: at("wXCoord"), y: at("wYCoord"),
      dir: (at("wPlayerDirection") >> 2) & 3, // 0 down, 1 up, 2 left, 3 right
      // Bordered boxes other than the dialogue box (Start menu, Yes/No...), see readBoxes().
      boxes: readBoxes(tiles),
      species: at("wCurPartySpecies"),
      // Other people on the map (object 0 is the player); structs are 40 bytes, coords carry a +4 offset.
      objects: (() => {
        const out = [], base = HD_SYMS.wObjectStructs - 0xc000;
        for (let i = 1; i < 13; i++) {
          const o = base + i * 40;
          if (mem[o]) out.push({ id: i, sprite: mem[o], x: mem[o + 0x10] - 4, y: mem[o + 0x11] - 4, dir: (mem[o + 8] >> 2) & 3 });
        }
        return out;
      })(),
      naming: (() => {
        const p = mem[HD_SYMS.wNamingScreenCursorObjectPointer - 0xc000] | (mem[HD_SYMS.wNamingScreenCursorObjectPointer + 1 - 0xc000] << 8);
        if (p < 0xc000 || p > 0xdfff) return null;
        return { col: mem[p + 12 - 0xc000], row: mem[p + 13 - 0xc000], max: at("wNamingScreenMaxNameLength") };
      })(),
      name: readName(mem, HD_SYMS.wPlayerName, 8),
      battle: readBattle(mem),
      cursorRow: at("wMenuCursorY"),
      // A dialogue box is the bordered text window on rows 12-17.
      dialogue: tiles[12 * 20] === 0x79 && tiles[17 * 20] === 0x7d
        ? { lines: [decode(tiles, 14 * 20 + 1, 14 * 20 + 19), decode(tiles, 16 * 20 + 1, 16 * 20 + 19)],
            more: tiles[16 * 20 + 18] === 0xee }
        : null,
    };
  }

  const text = (state, row, from, to) => decode(state.tiles, row * 20 + from, row * 20 + to);
  // Known characters on a row with their exact tile columns.
  const cells = (state, row) => {
    const out = [];
    for (let c = 0; c < 20; c++) {
      const ch = CHARS[state.tiles[row * 20 + c]];
      if (ch && ch !== " ") out.push({ col: c, ch });
    }
    return out;
  };

  function pick(state) {
    switch (state.scene) {
      case 1: return "title";
      case 2: return "menu";
      case 3: return "clock";
      case 4: return "prof";
      case 5: return "names";
      case 6: return "naming";
      case 7: return "splash";
      case 8: return "intro";
      case 9: return "options";
      case 0:
        // The battle HUD is on screen (not a Pack/Party screen or a transition): an enemy or player name in its place.
        if (state.battle && state.battle.enemy.name && (text(state, 0, 0, 12).includes(state.battle.enemy.name) || text(state, 7, 0, 20).includes(state.battle.player.name))) return "battle";
        if (state.map.group !== HD_GROUP || (state.boxes.length && !state.boxes.every((b) => b.rows.length))) return null;
        if (Scenes.room.maps.includes(state.map.number)) return "room";
        return Scenes.world.maps.includes(state.map.number) ? "world" : null;
      default: return null;
    }
  }

  function show(id) {
    if (id === currentId) return;
    if (current && current.destroy) current.destroy();
    root.textContent = "";
    current = id ? scenes[id](root, flags) : null;
    currentId = id;
    root.parentElement.classList.toggle("hd-on", !!id);
    root.dataset.scene = id || "";
  }

  async function tick() {
    if (busy) return;
    busy = true;
    try {
      const mem = await wb._getWasmMemorySection(WRAM_START, WRAM_END);
      const state = readState(mem);
      if (state.scene === 5 || state.scene === 6) flags.seenNaming = true;
      if (state.scene === 1 || state.scene === 2) flags.seenNaming = false;
      show(pick(state));
      if (current) current.update(state);
      HD.last = state;
    } catch (err) {
      console.warn("HD tick failed", err);
    } finally {
      busy = false;
    }
  }

  return {
    last: null, text, cells, decode,
    start(emulator, rootEl, sceneTable) {
      wb = emulator; root = rootEl; scenes = sceneTable;
      timer = setInterval(tick, 1000 / 30);
    },
    stop() { clearInterval(timer); show(null); },
  };
})();
