// Violet City's interiors: Mart, Buddymon Center, the talk house and Earl's Academy.
// Gold: VioletMart.asm, VioletPokecenter1F.asm, VioletNicknameSpeechHouse.asm, EarlsPokemonAcademy.asm (read before editing: object positions, texts)
// Not built: the Center aide's EGG (needs eggs), Kyle's trade house (needs trades), the nickname house's bird, Center 2F.
(() => {
  const talk = Game.talk;

  // --- Mart: same room as Cherrygrove's
  const clerk = async (s) => { await Game.shop(s, ["tonic", "remedy", "buddy_net"]); };
  Game.indoor("vmart", "VioletMart", {
    art: "roomGrid", theme: "lab", label: "Violet · Mart",
    npcs: [
      { id: 1, name: "CLERK", x: 1, y: 3, dir: 3, faces: false, script: clerk },
      { id: 2, name: "GRANNY", x: 7, y: 6, dir: 2, wander: "horizontal", script: talk("When you first catch a BUDDYMON, it may be weak. But it will eventually grow to be strong. It's important to treat BUDDYMON with love.") },
      { id: 3, name: "COOLTRAINER_M", x: 5, y: 2, dir: 0, wander: "spin", script: talk("BUDDYMON can hold items like TONIC and REMEDY. But they don't appear to know how to use manmade items.") },
    ],
  });

  // --- Center: nurse (3,1), PC tile (9,1), the aide's EGG (4,3) is not built, stairs (0,7) shut
  const nurse = (s) => Game.nurse(s, { map: "vcenter", x: 3, y: 6, dir: 1 });
  Game.indoor("vcenter", "VioletPokecenter1F", {
    art: "pokecenter", label: "Violet · Buddymon Center", tiles: { P: Game.pc },
    closed: { POKECENTER_2F: "The COMMUNICATION CENTER upstairs is not open yet." },
    npcs: [
      { id: 1, name: "NURSE", x: 3, y: 1, dir: 0, faces: false, script: nurse },
      { id: 2, name: "SUPER_NERD", x: 7, y: 6, dir: 2, wander: "horizontal", script: talk("A guy named BILL made the BUDDYMON PC storage system.") },
      { id: 3, name: "GENTLEMAN", x: 1, y: 4, dir: 0, wander: "spin", script: talk("It was around three years ago. TEAM ROCKET was up to no good with BUDDYMON. But justice prevailed--a young kid broke 'em up.") },
      { id: 4, name: "YOUNGSTER", x: 8, y: 1, dir: 0, script: talk("BUDDYMON are smart. They won't obey a trainer they don't respect. Without the right GYM BADGES, they will just do as they please.") },
    ],
  });

  // --- Talk house (8 x 8 living room art)
  Game.indoor("vnickname", "VioletNicknameSpeechHouse", {
    art: "neighborHouse", label: "Violet · Nickname House",
    npcs: [
      { id: 1, name: "TEACHER", x: 2, y: 3, dir: 3, script: talk("She uses the names of her favorite things to eat. For the nicknames she gives to her BUDDYMON, I mean.") },
      { id: 2, name: "LASS", x: 6, y: 4, dir: 1, script: talk("I call my CHIRPLET STRAWBERRY!") },
    ],
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
  Game.indoor("academy", "EarlsPokemonAcademy", {
    art: "academy", label: "Violet · Earl's Academy",
    npcs: [
      { id: 1, name: "FISHER", x: 4, y: 2, dir: 0, showIf: "EARL_IN_ACADEMY", script: earlLesson },
      { id: 2, name: "YOUNGSTER", x: 2, y: 5, dir: 1, script: talk("I'm taking notes of the teacher's lecture. I'd better copy the stuff on the blackboard too.") },
      { id: 3, name: "GAMEBOY_KID", x: 3, y: 11, dir: 0, script: talk("I traded my best BUDDYMON to the guy beside me.") },
      { id: 4, name: "GAMEBOY_KID", x: 4, y: 11, dir: 2, script: talk("Huh? The BUDDYMON I just got is holding something!") },
      { id: 6, name: "NOTEBOOK", x: 2, y: 4, dir: 0, faces: false, script: notebook },
      { id: 5, name: "YOUNGSTER", x: 4, y: 7, dir: 1, script: talk("A BUDDYMON holding a BERRY will heal itself in battle. Many other items can be held by BUDDYMON... It sure is tough taking notes...") },
    ],
    signs: [
      { x: 0, y: 1, script: talk("A shelf of BUDDYMON books and magazines.") }, { x: 1, y: 1, script: talk("A shelf of BUDDYMON books and magazines.") },
      { x: 3, y: 0, script: blackboard }, { x: 4, y: 0, script: blackboard },
    ],
  });
})();
