// Scene 1: your room (upstairs) and the living room. Original text; same beats as Gold's start.
// Gold: PlayersHouse1F.asm, PlayersHouse2F.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// Collision comes from Gold (data/terrain.js); the living room has bespoke art (art/room1F.js), the bedroom is drawn from the collision (art/roomGrid.js).
(() => {
  const talk = Game.talk;

  // Gold's room has only the PC, radio, TV and bookshelf: the console, dolls and poster appear only through the decoration system.
  Game.indoor("bedroom", "PlayersHouse2F", {
    label: "Home · Your Room",
    signs: [
      { x: 2, y: 1, script: talk("The PC is off. Nothing to do on it yet.") },
      { x: 3, y: 1, script: async (s) => { // PlayersHouseRadioScript: the first time (before you have a buddymon) the whole show, then a short bit
          const T = (label) => s.text("PlayersHouse2F", label);
          if (s.flag("GOT_STARTER")) return T("PlayersRadioText1");
          if (s.flag("LISTENED_TO_RADIO")) return T("PlayersRadioText4");
          await T("PlayersRadioText1"); await T("PlayersRadioText2"); await T("PlayersRadioText3");
          s.flag("LISTENED_TO_RADIO", true);
        } },
      { x: 5, y: 1, script: talk("A shelf full of picture books about buddymon.") },
    ],
  });

  Game.indoor("livingroom", "PlayersHouse1F", {
    art: "room1F", label: "Home · Living Room",
    npcs: [{
      id: 1, name: "MOM", x: 7, y: 3, dir: 2,
      // Gold's MomScript, by what you have done: errand, starter, egg (then the Bank of Mom).
      script: async (s) => {
        const T = (label) => s.text("PlayersHouse1F", label);
        if (!s.flag("GOT_BUDDYGEAR")) return;
        if (s.flag("MOM_FIRST_BANKING")) return T("ImBehindYouText");
        if (s.flag("MOM_TALKED_AFTER_EGG")) return Game.bankOfMom(s);
        if (s.flag("GAVE_EGG")) { s.flag("MOM_FIRST_BANKING", true); s.flag("MOM_TALKED_AFTER_EGG", true); return Game.bankOfMom(s); }
        if (s.flag("GOT_STARTER")) return T("SoWhatWasProfElmsErrandText");
        return T("HurryUpElmIsWaitingText");
      },
    }],
    signs: [
      { x: 4, y: 1, script: Game.said("PlayersHouse1F", "PlayersHouse1FTVText") },
      { x: 0, y: 1, script: Game.said("PlayersHouse1F", "PlayersHouse1FStoveText") },
      { x: 1, y: 1, script: Game.said("PlayersHouse1F", "PlayersHouse1FSinkText") },
      { x: 2, y: 1, script: Game.said("PlayersHouse1F", "PlayersHouse1FFridgeText") },
    ],
    // Like Gold: Mom spots you on the stairs, walks over to give you the BUDDYGEAR, then walks back.
    enter: async (s) => {
      if (s.flag("GOT_BUDDYGEAR")) return;
      s.turn(1, 1);
      await s.wait(30);
      await s.move(1, [3, 3, 1]);
      s.turn("player", 0);
      const T = (label) => s.text("PlayersHouse1F", label);
      await T("ElmsLookingForYouText");
      s.flag("GOT_BUDDYGEAR", true);
      await s.say(`${s.name} received BUDDYGEAR!`);
      await T("MomGivesPokegearText");
      await T("KnowThePhoneText");
      if ((await s.ask()) === 0) await T("KnowTheInstructionsText"); else await T("DontKnowTheInstructionsText");
      await T("InstructionsNextText");
      await s.move(1, [0, 2, 2]);
      s.turn(1, 2);
    },
  });
})();
