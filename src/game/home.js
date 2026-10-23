// Scene 1: your room (upstairs) and the living room. Original text; same beats as Gold's start.
// Cells match the art in art/room.js and art/room1F.js.
(() => {
  const solidGrid = (w, h, blocked) => Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (blocked.has(`${x},${y}`) ? "#" : ".")).join(""));
  const rect = (x0, y0, x1, y1) => { const out = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push(`${x},${y}`); return out; };
  const talk = (...lines) => async (s) => { for (const l of lines) await s.say(typeof l === "function" ? l(s) : l); };

  Game.register("bedroom", {
    room: { art: "room", cols: 8, rows: 6, label: "Home · Your Room" },
    solid: solidGrid(8, 6, new Set([...rect(0, 0, 6, 0), ...rect(2, 1, 5, 1), ...rect(4, 2, 4, 2), ...rect(4, 4, 5, 4), ...rect(0, 4, 0, 5)])),
    warps: [{ x: 7, y: 0, to: "livingroom", tx: 9, ty: 1, dir: 0 }],
    signs: [
      { x: 2, y: 1, script: talk("The PC is off. Nothing to do on it yet.") },
      { x: 3, y: 1, script: talk("An old radio. Only static right now.") },
      { x: 4, y: 2, script: talk((s) => `${s.name} played a game for a while. Time to stop!`) },
      { x: 5, y: 1, script: talk("A shelf full of picture books about buddymon.") },
    ],
  });

  Game.register("livingroom", {
    room: { art: "room1F", cols: 10, rows: 8, label: "Home · Living Room" },
    solid: solidGrid(10, 8, new Set([...rect(0, 0, 8, 0), ...rect(0, 1, 5, 1), ...rect(3, 2, 3, 3), ...rect(5, 3, 6, 4)])),
    warps: [{ x: 9, y: 0, to: "bedroom", tx: 7, ty: 1, dir: 0 }, { x: 6, y: 7, to: "newbark", tx: 5, ty: 9, dir: 0 }, { x: 7, y: 7, to: "newbark", tx: 5, ty: 9, dir: 0 }],
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
