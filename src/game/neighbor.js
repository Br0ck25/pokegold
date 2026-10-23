// The neighbor's house (cells match art/neighborHouse.js): shelves (0..1,1), TV (2,1), radio (7,1), table (3..4,3..4). The neighbor's daughter is the only one home.
// Gold: PlayersNeighborsHouse.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
(() => {
  const talk = Game.talk;
  Game.indoor("neighbor", "PlayersNeighborsHouse", {
    art: "neighborHouse", label: "New Bark Town · Neighbors' House",
    npcs: [{
      id: 1, name: "COOLTRAINER_F", x: 2, y: 3, dir: 3,
      script: talk("A buddymon that evolves is a wonder. I was amazed by PROF. WILLOW's findings.", "He's so famous for his research on BUDDYMON evolution. ...sigh... I wish I could be a researcher like him..."),
    }],
    signs: [
      { x: 0, y: 1, script: talk("A shelf of magazines about BUDDYMON trainers.") },
      { x: 1, y: 1, script: talk("A shelf of magazines about BUDDYMON trainers.") },
      {
        x: 7, y: 1,
        script: async (s) => {
          await s.say("Tuning in to BUDDYMON TALK with PROF. ASPEN...");
          await s.say("...BUDDYMON CHANNEL!");
        },
      },
    ],
  });
})();
