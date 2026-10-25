// Menu verbs for scripts: choose() draws a small list box (Start menu, Yes/No) and panel() a full-height list screen
// (party, pack, trainer card...). Arrows + A, B to cancel, or tap a row (Game.pick). Added to the script API by scriptApi().
function menuVerbs(G, s) {
  const frame = () => new Promise((ok) => requestAnimationFrame(ok));
  return {
    // A list box over the scene: pos "low" sits just above the message box, "top" at the top; c0 >= 7 puts it on the right. Returns the index;
    // B returns `cancel` when given (e.g. the last row for Yes/No), else B is ignored.
    async choose(options, { c0 = 14, r0 = 6, pos = "low", cancel } = {}) {
      let i = 0;
      const show = () => (G.state.boxes = [{ c0, r0, c1: 19, r1: r0 + options.length * 2 + 1, rows: options.map((text, n) => ({ text, selected: n === i })), pos }]);
      G.picked = null; show();
      for (Input.clear(); ;) {
        Input.poll();
        if (Input.pressed("UP")) { i = (i + options.length - 1) % options.length; show(); }
        if (Input.pressed("DOWN")) { i = (i + 1) % options.length; show(); }
        if (Input.pressed("A")) break;
        if ((Input.pressed("B") || Input.pressed("START")) && cancel !== undefined) { i = cancel; break; }
        if (G.picked !== null) { i = G.picked; G.picked = null; break; }
        await frame();
      }
      G.state.boxes = [];
      return i;
    },
    ask: (options = ["YES", "NO"]) => s.choose(options, { cancel: options.length - 1 }),
    // A full list screen: spec = { title, art, tabs, lines, rows: [{label, right, bar, art, dim}], hint }. Returns { i, key } where key is
    // "A" (row chosen), "B" (back), or "L"/"R" (left/right arrows, for tabs and values). Rows start with `start` selected.
    async panel(spec, start = 0) {
      let i = Math.min(start, Math.max(0, spec.rows.length - 1));
      const show = () => (G.state.panel = { ...spec, sel: i });
      G.state.dialogue = null; // the list takes the message box's place (it used to hide the Back button)
      G.picked = null; show();
      let out;
      for (Input.clear(); !out;) {
        Input.poll();
        const n = spec.rows.length;
        if (n && Input.pressed("UP")) i = (i + n - 1) % n;
        if (n && Input.pressed("DOWN")) i = (i + 1) % n;
        show();
        if (n && Input.pressed("A")) out = { i, key: "A" };
        else if (Input.pressed("B")) out = { i, key: "B" };
        else if (Input.pressed("LEFT")) out = { i, key: "L" };
        else if (Input.pressed("RIGHT")) out = { i, key: "R" };
        else if (G.picked !== null) { out = G.picked < 0 ? { i, key: "B" } : { i: (i = G.picked), key: "A" }; G.picked = null; }
        else await frame();
      }
      return out;
    },
  };
}
