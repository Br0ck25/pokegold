// New Bark Town: four buildings (your house, the neighbor's, Willow's lab and Willow's house), a pond, and the road west to Route 29.
// Gold: NewBarkTown.asm (read before editing: object positions, connections, terrain; note what we change on purpose)
// Same beats as Gold's town: a teacher who stops you leaving without a buddymon, a villager who paces, and a rival lurking by the lab.
// 20 x 18 cells (Gold's shape).
(() => {
  const talk = Game.talk;
  const hasMon = (s) => s.flag("GOT_STARTER");

  // Gold's scenes (NewBarkTown.asm). Without a buddymon the teacher runs left to you (4 or 5 steps, from (6,8)), you follow her back 4 or 5 steps right.
  const teacherStops = (row) => async (s) => {
    if (hasMon(s)) return;
    const t = 1;
    s.turn(t, 2);
    await s.say("Wait, " + s.name + "!");
    s.turn("player", 3);
    await s.move(t, row === 8 ? [2, 2, 2, 2] : [2, 2, 2, 2, 2], row === 8 ? 2 : 0);
    if (row === 9) s.turn("player", 1);
    await s.say("What do you think you're doing?");
    await s.follow(t, row === 8 ? [3, 3, 3, 3] : [3, 3, 3, 3, 3]);
    s.turn(t, 2);
    await s.say("It's dangerous to go out without a BUDDYMON! Wild BUDDYMON jump out of the grass on the way to the next town.");
  };

  // The rival lurks beside the lab at (3,2); you can only talk to him from (2,2). He turns on you, you are pushed back and then shoved out.
  const rival = async (s) => {
    await s.say("<...> So this is the famous WILLOW BUDDYMON LAB...");
    s.turn(3, 2);
    await s.say("...What are you staring at?");
    await s.move("player", [0], 1); // a step back, still facing him
    await s.wait(5);
    s.turn(3, 0);
    await s.wait(5);
    await s.move("player", [0], 1); // the shove
    await s.move(3, [3]);
    s.hide(3);
  };

  Game.outdoor("newbark", "NewBarkTown", {
    label: "New Bark Town",
    style: { "6,3": { roof: "#5aa860", wall: "#eaf3ff", label: "LAB" }, "13,5": { roof: "#d9604c" }, "3,11": { roof: "#3a8fd9" }, "11,13": { roof: "#9a6ad9" } },
    closed: { Route27: "ROUTE 27 is across the water. You'd need SURF." },
    npcs: [
      {
        id: 1, name: "TEACHER", x: 6, y: 8, dir: 0, wander: "spin",
        script: async (s) => { await s.say(hasMon(s) ? "Oh! Your BUDDYMON is adorable! I wish I had one!" : "Wow, your BUDDYGEAR is impressive! Did your mom get it for you?"); },
      },
      { id: 2, name: "FISHER", x: 12, y: 9, dir: 0, wander: "vertical", script: talk((s) => `Yo, ${s.name}! I hear PROF. WILLOW discovered some new BUDDYMON.`) },
      { id: 3, name: "RIVAL", x: 3, y: 2, dir: 3, hideIf: "RIVAL_NEWBARK_GONE", script: rival },
    ],
    signs: [
      { x: 8, y: 8, script: talk("NEW BARK TOWN. The town where the winds of a new beginning blow.") },
      { x: 11, y: 5, script: talk((s) => `${s.name}'s house`) },
      { x: 3, y: 3, script: talk("WILLOW BUDDYMON LAB") },
      { x: 9, y: 13, script: talk("WILLOW'S HOUSE") },
    ],
    coords: [8, 9].map((y) => ({ x: 1, y, script: teacherStops(y) })),
  });
})();
