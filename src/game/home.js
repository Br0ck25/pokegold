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
      { x: 3, y: 1, script: talk("PROF. ASPEN'S BUDDYMON TALK! Please tune in next time!") },
      { x: 5, y: 1, script: talk("A shelf full of picture books about buddymon.") },
    ],
  });

  Game.indoor("livingroom", "PlayersHouse1F", {
    art: "room1F", label: "Home · Living Room",
    npcs: [{
      id: 1, name: "MOM", x: 7, y: 3, dir: 2,
      script: async (s) => {
        if (!s.flag("GOT_BUDDYGEAR")) return;
        await s.say(s.flag("GOT_STARTER") ? "Welcome home! Tell me all about your buddymon." : "PROF. WILLOW is waiting for you. Hurry up!");
      },
    }],
    signs: [
      { x: 4, y: 1, script: talk("The TV is showing a show about faraway towns.") },
      { x: 0, y: 1, script: talk("The stove is warm. Something smells good.") },
      { x: 1, y: 1, script: talk("The sink is spotless.") },
      { x: 2, y: 1, script: talk("The fridge hums quietly. It is full of food.") },
    ],
    // Like Gold: Mom spots you on the stairs, walks over to give you the BUDDYGEAR, then walks back.
    enter: async (s) => {
      if (s.flag("GOT_BUDDYGEAR")) return;
      s.turn(1, 1);
      await s.wait(30);
      await s.move(1, [3, 3, 1]);
      s.turn("player", 0);
      await s.say(`Oh, ${s.name}! PROF. WILLOW from next door was looking for you.`);
      await s.say("He wants you to do something for him. Oh, and your BUDDYGEAR came back from the repair shop!");
      s.flag("GOT_BUDDYGEAR", true);
      await s.say(`${s.name} got the BUDDYGEAR!`);
      await s.say("It is a handy device. You can use it to call your friends. Now go see PROF. WILLOW. His lab is just next door!");
      await s.move(1, [0, 2, 2]);
      s.turn(1, 2);
    },
  });
})();
