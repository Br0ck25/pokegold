"use strict";
// HD layer core: reads the emulator's memory, works out which screen the game
// is showing, and lets a scene in scenes.js draw it as crisp DOM/SVG.
// Whatever isn't redrawn falls back to the normal pixel canvas.

const HD = (() => {
  // WasmBoy keeps work RAM (0xC000-0xDFFF, banks 0 and 1) contiguous here.
  const WRAM_START = 0x4800;
  const WRAM_END = WRAM_START + 0x2000;

  const ROOM = { group: 24, number: 7 }; // PLAYERS_HOUSE_2F

  // Tile ids in wTilemap -> characters (see constants/charmap.asm).
  const CHARS = { 0x7f: " ", 0x75: "…", 0xe0: "'", 0xe3: "-", 0xe6: "?", 0xe7: "!", 0xe8: ".", 0xe9: "&",
    0xea: "é", 0xed: "▶", 0xee: "▼", 0xef: "♂", 0xf0: "¥", 0xf3: "/", 0xf4: ",", 0xf5: "♀", 0x9a: "(", 0x9b: ")",
    0x9c: ":", 0x9d: ";", 0x9e: "[", 0x9f: "]", 0x72: "“", 0x73: "”", 0xd4: "'s", 0xd5: "'t", 0xd0: "'d",
    0xd1: "'l", 0xd2: "'m", 0xd3: "'r", 0xd6: "'v" };
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
      species: at("wCurPartySpecies"),
      naming: (() => {
        const p = mem[HD_SYMS.wNamingScreenCursorObjectPointer - 0xc000] | (mem[HD_SYMS.wNamingScreenCursorObjectPointer + 1 - 0xc000] << 8);
        if (p < 0xc000 || p > 0xdfff) return null;
        return { col: mem[p + 12 - 0xc000], row: mem[p + 13 - 0xc000], max: at("wNamingScreenMaxNameLength") };
      })(),
      name: (() => {
        const o = HD_SYMS.wPlayerName - 0xc000;
        let n = "";
        for (let i = 0; i < 8 && mem[o + i] !== 0x50; i++) n += CHARS[mem[o + i]] ?? "";
        return n;
      })(),
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
      case 0:
        return state.map.group === ROOM.group && state.map.number === ROOM.number ? "room" : null;
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
