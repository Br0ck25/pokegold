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
    async say(text) {
      G.state.dialogue = { text, more: true };
      await press("A");
      G.state.dialogue = { text, more: false };
    },
    async ask(options = ["YES", "NO"]) {
      let i = 0;
      const show = () => (G.state.boxes = [{ c0: 14, r0: 6, c1: 19, r1: 6 + options.length * 2 + 1, rows: options.map((text, n) => ({ text, selected: n === i })) }]);
      show();
      for (Input.clear(); ;) {
        Input.poll();
        if (Input.pressed("UP")) { i = (i + options.length - 1) % options.length; show(); }
        if (Input.pressed("DOWN")) { i = (i + 1) % options.length; show(); }
        if (Input.pressed("A")) break;
        await frame();
      }
      G.state.boxes = [];
      return i;
    },
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
    async move(who, dirs) {
      const a = actor(who);
      for (const d of dirs) { a.dir = d; G.step(a, d); await s.wait(16); }
    },
    turn(who, d) { actor(who).dir = d; },
    wait: async (frames) => { for (let i = 0; i < frames; i++) await frame(); },
    warp: (map, x, y, dir) => G.warp(map, x, y, dir),
    give(item, n = 1) { G.player.bag[item] = (G.player.bag[item] || 0) + n; },
    addBuddy(species, level) { G.player.party.push({ species, level, nick: species.toUpperCase() }); },
    hide(id) { G.state.objects = G.state.objects.filter((o) => o.id !== id); },
  };
  return s;
}
