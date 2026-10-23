// Start-up flow: splash -> intro cinematic -> title -> menu -> (new game) Willow's welcome talk and name entry.
Game.flow = (() => {
  const frame = () => new Promise((ok) => requestAnimationFrame(ok));
  const anyPress = () => ["A", "B", "START"].some((k) => Input.pressed(k));
  // Shows a screen for `ms` (or until a button when skippable).
  const hold = async (screen, ms, skippable = true) => {
    Game.state.screen = screen;
    Input.clear();
    for (const t0 = performance.now(); performance.now() - t0 < ms;) {
      Input.poll();
      if (skippable && anyPress()) break;
      await frame();
    }
  };
  const menu = async (items) => {
    let i = 0;
    const show = () => (Game.state.menu = { items: items.map((it, n) => ({ label: it.label, selected: n === i })), info: items[i].info || "" });
    Game.state.screen = "menu";
    show();
    for (Input.clear(); ;) {
      Input.poll();
      if (Input.pressed("UP")) { i = (i + items.length - 1) % items.length; show(); }
      if (Input.pressed("DOWN")) { i = (i + 1) % items.length; show(); }
      if (Input.pressed("A") || Input.pressed("START")) return items[i].id;
      await frame();
    }
  };

  const welcome = async (s) => {
    s.screen("prof", { prof: { who: "professor" } });
    await s.say("Hello there! Welcome to the world of BUDDYMON!");
    await s.say("My name is WILLOW. People call me the BUDDYMON PROF!");
    await s.say("This world is full of creatures called BUDDYMON. Some people keep them as friends. Others battle with them.");
    await s.say("As for me, I study BUDDYMON for a living. But first, tell me a little about yourself.");
    s.G.player.name = await s.prompt("What is your name?", 7);
    s.screen("prof", { prof: { who: "hero" } });
    await s.say(`${s.name}! Your very own BUDDYMON story is about to unfold. A world of dreams and adventure is waiting. Let's go!`);
    s.screen(null, { prof: null });
  };

  // Runs everything up to the first map. `saved` is the loaded save or null.
  return async (saved) => {
    await hold("splash", 5500, false);
    await hold("intro", 24000);
    await hold("title", 1e9);
    const items = [{ id: "new", label: "New Game" }];
    if (saved) items.unshift({ id: "continue", label: "Continue", info: `${saved.player.name}` });
    if ((await menu(items)) === "continue") return saved;
    Game.player = Game.newPlayer();
    await Game.run(welcome);
    return null;
  };
})();
