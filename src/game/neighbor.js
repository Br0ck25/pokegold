// The neighbor's house (cells match art/neighborHouse.js): shelves (0..1,1), TV (2,1), radio (7,1), table (3..4,3..4). The neighbor's daughter is the only one home.
// Gold: PlayersNeighborsHouse.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
(() => {
  const talk = Game.talk;
  Game.indoor("neighbor", "PlayersNeighborsHouse", {
    art: "neighborHouse", label: "New Bark Town · Neighbors' House",
    npcs: [{
      id: 1, name: "COOLTRAINER_F", x: 2, y: 3, dir: 3,
      script: Game.said("PlayersNeighborsHouse", "PlayersNeighborsDaughterText"),
    }],
    signs: [
      { x: 0, y: 1, script: talk("A shelf of magazines about BUDDYMON trainers.") },
      { x: 1, y: 1, script: talk("A shelf of magazines about BUDDYMON trainers.") },
      { x: 7, y: 1, script: async (s) => { // PlayersNeighborsHouseRadioScript
          const T = (label) => s.text("PlayersNeighborsHouse", label);
          if (s.flag("GOT_STARTER")) return T("PlayerNeighborRadioText1");
          if (s.flag("LISTENED_TO_RADIO_NEIGHBOR")) return T("PlayerNeighborRadioText4");
          await T("PlayerNeighborRadioText1"); await T("PlayerNeighborRadioText2"); await T("PlayerNeighborRadioText3");
          s.flag("LISTENED_TO_RADIO_NEIGHBOR", true);
        } },
    ],
  });
})();
