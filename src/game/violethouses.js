// Violet City's interiors: Mart, Buddymon Center, the talk house and Earl's Academy.
// Gold: VioletMart.asm, VioletPokecenter1F.asm, VioletNicknameSpeechHouse.asm, EarlsPokemonAcademy.asm (read before editing: object positions, texts)
// Not built: the Center aide's EGG (needs eggs), Kyle's trade house (needs trades), the nickname house's bird, Center 2F.
(() => {
  const rect = (x0, y0, x1, y1) => { const o = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.push(`${x},${y}`); return o; };
  const grid = (w, h, blocked) => Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (blocked.has(`${x},${y}`) ? "#" : ".")).join(""));
  const talk = Game.talk;
  const out = (xs, y, tx, ty) => xs.map((x) => ({ x, y, to: "violet", tx, ty, dir: 0 }));

  // --- Mart: same room as Cherrygrove's (clerk (1,3) behind the counter (0..2,4))
  const clerk = async (s) => { await Game.shop(s, ["tonic", "remedy", "buddy_net"]); };
  Game.register("vmart", {
    room: { art: "cherrygroveMart", cols: 12, rows: 8, label: "Violet · Mart" },
    solid: grid(12, 8, new Set([...rect(0, 0, 11, 0), ...rect(3, 1, 11, 1), ...rect(0, 4, 2, 4)])),
    warps: out([2, 3], 7, 9, 18),
    npcs: [
      { id: 1, name: "CLERK", x: 1, y: 3, dir: 3, faces: false, script: clerk },
      { id: 2, name: "GRANNY", x: 7, y: 6, dir: 2, wander: "horizontal", script: talk("When you first catch a BUDDYMON, it may be weak. But it will eventually grow to be strong. It's important to treat BUDDYMON with love.") },
      { id: 3, name: "COOLTRAINER_M", x: 5, y: 2, dir: 0, wander: "spin", script: talk("BUDDYMON can hold items like TONIC and REMEDY. But they don't appear to know how to use manmade items.") },
    ],
    signs: [0, 1, 2].map((x) => ({ x, y: 4, script: clerk })),
  });

  // --- Center: nurse (3,1), PC (9,1)
  const nurse = (s) => Game.nurse(s, { map: "vcenter", x: 3, y: 6, dir: 1 });
  Game.register("vcenter", {
    room: { art: "pokecenter", cols: 10, rows: 8, label: "Violet · Buddymon Center" },
    solid: grid(10, 8, new Set([...rect(0, 0, 9, 0), ...rect(0, 1, 2, 1), ...rect(5, 1, 5, 1), ...rect(9, 1, 9, 1), ...rect(0, 2, 5, 2), ...rect(7, 5, 8, 5), ...rect(7, 7, 8, 7)])),
    warps: out([3, 4], 7, 31, 26),
    npcs: [
      { id: 1, name: "NURSE", x: 3, y: 1, dir: 0, faces: false, script: nurse },
      { id: 2, name: "SUPER_NERD", x: 7, y: 6, dir: 2, wander: "horizontal", script: talk("A guy named BILL made the BUDDYMON PC storage system.") },
      { id: 3, name: "GENTLEMAN", x: 1, y: 4, dir: 0, wander: "spin", script: talk("It was around three years ago. TEAM ROCKET was up to no good with BUDDYMON. But justice prevailed--a young kid broke 'em up.") },
      { id: 4, name: "YOUNGSTER", x: 8, y: 1, dir: 0, script: talk("BUDDYMON are smart. They won't obey a trainer they don't respect. Without the right GYM BADGES, they will just do as they please.") },
    ],
    signs: [...[0, 1, 2, 3, 4, 5].map((x) => ({ x, y: 2, script: nurse })), { x: 9, y: 1, script: Game.pc }],
  });

  // --- Talk house (8 x 8 living room art)
  Game.register("vnickname", {
    room: { art: "neighborHouse", cols: 8, rows: 8, label: "Violet · Nickname House" },
    solid: grid(8, 8, new Set([...rect(0, 0, 7, 0), ...rect(0, 1, 2, 1), ...rect(7, 1, 7, 1), ...rect(3, 3, 4, 4), ...rect(0, 6, 0, 7), ...rect(7, 6, 7, 7)])),
    warps: out([3, 4], 7, 3, 16),
    npcs: [
      { id: 1, name: "TEACHER", x: 2, y: 3, dir: 3, script: talk("She uses the names of her favorite things to eat. For the nicknames she gives to her BUDDYMON, I mean.") },
      { id: 2, name: "LASS", x: 6, y: 4, dir: 1, script: talk("I call my CHIRPLET STRAWBERRY!") },
    ],
    signs: [0, 1].map((x) => ({ x, y: 1, script: talk("A shelf of BUDDYMON books and magazines.") })),
  });

  // --- Earl's Academy (8 x 16): Earl (4,2) hidden until he walks you here; blackboard (3..4,0); notebook on the desk at (2,4)
  const earlLesson = async (s) => {
    await s.say("EARL, I am! Wonderful are BUDDYMON, yes! Teach you I will to be a better trainer! What you want to know? Want to be a winner is you?");
    const more = async () => {
      await s.say("So, want to know how to raise BUDDYMON well?");
      if ((await s.ask()) !== 0) return s.say("Oh! Smart student you are! Nothing more do I teach! Good to BUDDYMON you must be!");
      await s.say("Fine! Teach you, I will! If BUDDYMON come out in battle even briefly, some EXP. points it gets. At top of list put weak BUDDYMON. Switch in battle quick! This way, weak BUDDYMON strong become!");
    };
    if ((await s.ask()) === 0) {
      await s.say("Good! Teach you, I will! In battle, BUDDYMON top on list jump out first! Change order in list, make battle easy, maybe! More from me you want to hear?");
      if ((await s.ask()) !== 0) return s.say("Oh! Smart student you are! Nothing more do I teach! Good to BUDDYMON you must be!");
    }
    await more();
  };
  const blackboard = async (s) => {
    const topics = {
      PSN: "If poisoned, a BUDDYMON steadily loses HP. Poison lingers after the battle, and HP is lost as you walk. To cure it, use a REMEDY.",
      PAR: "Paralysis reduces speed and may prevent movement. It remains after battle, so use a REMEDY.",
      SLP: "If asleep, your BUDDYMON can't make a move. A sleeping BUDDYMON doesn't wake up after battle. Wake it up with a REMEDY.",
      BRN: "A burn steadily consumes HP. It also reduces attack power. A burn lingers after battle. Use a REMEDY as the cure.",
      FRZ: "If your BUDDYMON is frozen, it can't do a thing. It remains frozen after battle. Thaw it out with a REMEDY.",
    };
    await s.say("The blackboard describes BUDDYMON status changes in battle.");
    for (;;) {
      const i = await s.choose([...Object.keys(topics), "QUIT"], { c0: 6, r0: 3, cancel: 5 });
      if (i < 0 || i >= 5) return;
      await s.say(Object.values(topics)[i]);
    }
  };
  const notebook = async (s) => {
    const pages = [
      "It's this kid's notebook... Catch BUDDYMON using BUDDY NETS. Up to six can be in your party. Keep reading?",
      "Before throwing a BUDDY NET, weaken the target first. A poisoned or burned BUDDYMON is easier to catch. Keep reading?",
      "Some moves may cause confusion. Confusion may make a BUDDYMON attack itself. Leaving battle clears up any confusion. Keep reading?",
    ];
    for (const p of pages) { await s.say(p); if ((await s.ask()) !== 0) return; }
    await s.say("People who catch and use BUDDYMON in battle are BUDDYMON trainers. They are expected to visit BUDDYMON GYMS and defeat other trainers. The next page is... Blank! Boy: E-he-he... I haven't written anymore...");
  };
  Game.register("academy", {
    room: { art: "academy", cols: 8, rows: 16, label: "Violet · Earl's Academy" },
    solid: grid(8, 16, new Set([...rect(0, 0, 7, 0), ...rect(0, 1, 1, 1), ...rect(2, 4, 5, 4), ...rect(2, 6, 5, 6), ...rect(2, 8, 5, 8), ...rect(2, 10, 5, 10), ...rect(3, 0, 4, 0)])),
    warps: out([3, 4], 15, 30, 18),
    npcs: [
      { id: 1, name: "FISHER", x: 4, y: 2, dir: 0, showIf: "EARL_IN_ACADEMY", script: earlLesson },
      { id: 2, name: "YOUNGSTER", x: 2, y: 5, dir: 1, script: talk("I'm taking notes of the teacher's lecture. I'd better copy the stuff on the blackboard too.") },
      { id: 3, name: "GAMEBOY_KID", x: 3, y: 11, dir: 0, script: talk("I traded my best BUDDYMON to the guy beside me.") },
      { id: 4, name: "GAMEBOY_KID", x: 4, y: 11, dir: 2, script: talk("Huh? The BUDDYMON I just got is holding something!") },
      { id: 5, name: "YOUNGSTER", x: 4, y: 7, dir: 1, script: talk("A BUDDYMON holding a BERRY will heal itself in battle. Many other items can be held by BUDDYMON... It sure is tough taking notes...") },
    ],
    signs: [
      { x: 0, y: 1, script: talk("A shelf of BUDDYMON books and magazines.") }, { x: 1, y: 1, script: talk("A shelf of BUDDYMON books and magazines.") },
      { x: 3, y: 0, script: blackboard }, { x: 4, y: 0, script: blackboard }, { x: 2, y: 4, script: notebook },
    ],
  });
})();
