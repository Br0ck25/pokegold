// SELECT on the map: use the registered key item (Gold). Items we have: the MAP CARD's map and the BUDDYGEAR.
Game.registered = async (s) => {
  const k = s.G.player.registered;
  if (k === "mapcard") await Game.townMap(s);
  else if (k === "buddygear") await Game.gearScreen(s);
  s.G.state.panel = null;
};

// The Start menu: Buddymon, Pack, BuddyGear (once you have it), your name card, Save, Option, Exit. Like Gold's list down the right side.
Game.startMenu = async (s) => {
  const P = s.G.player;
  const save = async () => {
    if ((await s.confirm("Would you like to save the game?")) !== 0) return;
    Game.save(true);
    await s.say(`${s.name} saved the game!`);
  };
  for (;;) {
    const entries = [];
    if (s.flag("GOT_BUDDYDEX")) entries.push(["BUDDYDEX", Game.dexScreen]);
    if (P.party.length) entries.push(["BUDDYMON", Game.partyScreen]);
    entries.push(["PACK", Game.packScreen]);
    if (s.flag("GOT_BUDDYGEAR")) entries.push(["BUDDYGEAR", Game.gearScreen]);
    entries.push([P.name, Game.cardScreen], ["SAVE", save], ["OPTION", Game.optionsScreen], ["EXIT", null]);
    const i = await s.choose(entries.map((e) => e[0]), { c0: 10, r0: 0, pos: "top", cancel: entries.length - 1 });
    s.G.state.dialogue = null;
    if (!entries[i][1]) return;
    await entries[i][1](s);
    s.G.state.panel = null;
  }
};
