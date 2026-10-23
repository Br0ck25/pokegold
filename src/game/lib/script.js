// Scripts are async functions taking `s`: the same verbs Gold's scripts use (text, yes/no, flags, movement, warps).
// Only one script runs at a time; the player cannot move while it does.
function scriptApi(G) {
  const frame = () => new Promise((ok) => requestAnimationFrame(ok));
  const press = async (k) => { Input.clear(); while (!Input.pressed(k)) { Input.poll(); await frame(); } };
  const actor = (who) => (who === "player" ? G.state : G.state.objects.find((o) => o.id === who));
  const s = {
    G,
    screen: (name, extra) => Object.assign(G.state, { screen: name, ...extra }),
    get name() { return G.player.name; },
    flag: (name, v) => (v === undefined ? !!G.player.flags[name] : void (G.player.flags[name] = v)),
    // Show a line for `ms` (a press of A skips ahead): battle messages that flow by without waiting for a button.
    async msg(text, ms = Game.msgMs * (0.6 + text.length / 28)) { // longer lines stay up longer
      G.state.dialogue = { text, more: false };
      Input.clear();
      for (const t0 = performance.now(); performance.now() - t0 < ms;) { Input.poll(); if (Input.pressed("A")) break; await frame(); }
    },
    // A button menu in the battle screen: arrows + A, or tap a button. Returns the index, or -1 for B.
    async menu(items, cols = 1, kind = "cmd") {
      let i = 0;
      G.state.dialogue = null; // the menu takes the message box's place, leaving the battle screen clear
      const B = G.state.battle, show = () => (B.menu = { kind, cols, items: items.map((label, n) => ({ label, sel: n === i })) });
      G.picked = null; show();
      for (Input.clear(); ;) {
        Input.poll();
        const n = items.length;
        if (Input.pressed("UP")) i = (i - cols + n) % n;
        if (Input.pressed("DOWN")) i = (i + cols) % n;
        if (cols > 1 && Input.pressed("LEFT")) i = (i + n - 1) % n;
        if (cols > 1 && Input.pressed("RIGHT")) i = (i + 1) % n;
        show();
        if (Input.pressed("A")) break;
        if (Input.pressed("B")) { i = -1; break; }
        if (G.picked !== null) { i = G.picked; G.picked = null; break; }
        await frame();
      }
      B.menu = null;
      return i;
    },
    async say(text) {
      G.state.dialogue = { text, more: true };
      await press("A");
      G.state.dialogue = { text, more: false };
    },
    // Yes/No over a question; resolves 0 for yes, like ask(), but with the question shown in the box.
    async confirm(text) { G.state.dialogue = { text, more: false }; return s.ask(); },
    // Opens the phone's own keyboard on a real input.
    prompt(label, max = 10) {
      return new Promise((ok) => {
        const box = h(`<form class="ask"><label>${label}</label><input maxlength="${max}" autocomplete="off" autocapitalize="words" spellcheck="false"><button>OK</button></form>`);
        G.root.appendChild(box);
        const input = box.querySelector("input");
        input.focus();
        box.addEventListener("submit", (e) => { e.preventDefault(); const v = input.value.trim(); if (v) { box.remove(); ok(v); } });
      });
    },
    // Walk one person along `dirs` (0 down, 1 up, 2 left, 3 right); `face` keeps them looking that way while they move.
    async move(who, dirs, face) {
      const a = actor(who);
      for (const d of dirs) { a.dir = face ?? d; G.step(a, d); await s.wait(16); }
    },
    // Several people walking together: pairs of [who, dirs], moved in the order given each step.
    async walk(pairs) {
      const n = Math.max(...pairs.map(([, dirs]) => dirs.length));
      for (let i = 0; i < n; i++) {
        for (const [who, dirs] of pairs) if (i < dirs.length) { const a = actor(who); a.dir = dirs[i]; G.step(a, dirs[i]); }
        await s.wait(16);
      }
    },
    // The player follows `who` along `dirs`, one cell behind (Gold's "follow"): used for the Guide Gent's tour.
    async follow(who, dirs) {
      const a = actor(who), trail = [];
      for (const d of dirs) {
        trail.push({ x: a.x, y: a.y });
        a.dir = d; G.step(a, d);
        const t = trail.shift(), p = G.state;
        if (t.x !== p.x || t.y !== p.y) { p.dir = t.x > p.x ? 3 : t.x < p.x ? 2 : t.y > p.y ? 0 : 1; p.x = t.x; p.y = t.y; }
        await s.wait(16);
      }
    },
    // A "!" over someone's head for a moment.
    async emote(who) { const a = actor(who); a.emote = true; await s.wait(36); a.emote = false; },
    // Send someone to stand next to the player (on the given side: 0 below, 1 above, 2 left, 3 right).
    approach: (who, side = 3) => {
      const a = actor(who), p = G.state, off = [[0, 1], [0, -1], [-1, 0], [1, 0]][side];
      return s.move(who, G.path(a.x, a.y, p.x + off[0], p.y + off[1]));
    },
    // The big picture of a buddymon (like Gold's pokepic) until unpic().
    pic: (species) => { G.state.pic = species; },
    unpic: () => { G.state.pic = null; },
    // A short pause with a message when something is restored or given.
    async notify(text) { await s.say(text); },
    turn(who, d) { actor(who).dir = d; },
    wait: async (frames) => { for (let i = 0; i < frames; i++) await frame(); },
    warp: (map, x, y, dir) => G.warp(map, x, y, dir),
    give(item, n = 1) { G.player.bag[item] = (G.player.bag[item] || 0) + n; },
    addBuddy(species, level) { G.player.party.push(makeMon(species, level)); (G.player.dex ||= {})[species] = "caught"; },
    hide(id) { G.state.objects = G.state.objects.filter((o) => o.id !== id); },
  };
  return Object.assign(s, menuVerbs(G, s));
}
