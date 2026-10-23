// Violet Gym: Falkner and his bird keepers on a winding floor over a pit. Beating him gives the ZEPHYRBADGE (P.badges) and TM31 MUD SLAP.
// Gold: VioletGym.asm (layout from tools/goldmap.py VioletGym: the blocked cells below the top wall are pits; trainers stand where Gold puts them)
// Not built: badge effects (attack boost, obedience, FLASH), the guide's statue text with winning trainers, Willow's aide phone call after the badge.
(() => {
  const talk = Game.talk;
  const grid = [
    "##########", "..........", "..##..##..", "..........", "..........", "####..####", "##......##", "##..######",
    "##......##", "######..##", "##......##", "####..####", "##.#..#.##", "...#..#...", "##......##", "####..####",
  ];
  const solid = grid;
  const trainer = (cls, name, party, seen, beaten, after, flag) => ({ name, cls, party, seen, beaten, after, flag, sight: 3, money: 20 });

  const falkner = async (s) => {
    const P = s.G.player;
    if (!s.flag("BEAT_FALKNER")) {
      await s.say("I'm FALKNER, the VIOLET BUDDYMON GYM leader! People say you can clip flying-type BUDDYMON's wings with a jolt of electricity... I won't allow such insults to bird BUDDYMON! I'll show you the real power of the magnificent bird BUDDYMON!");
      const result = await Game.battle(s, Game.mkParty([["chirplet", 7, ["tackle", "mud_slap"]], ["swooplet", 9, ["tackle", "mud_slap", "breeze"]]]),
        { trainer: { name: "LEADER FALKNER", money: 9, win: "...Darn! My Dad's cherished bird BUDDYMON... All right. Take this. It's the official BUDDYMON LEAGUE ZEPHYRBADGE." } });
      if (result === "lost") return Game.whiteout(s);
      s.flag("BEAT_FALKNER", true);
      (P.badges ||= []).push("ZEPHYRBADGE");
      await s.say(`${s.name} received ZEPHYRBADGE.`);
    }
    if (!s.flag("GOT_TM31")) {
      await s.say("ZEPHYRBADGE raises the attack power of BUDDYMON. It also enables BUDDYMON to use FLASH, if they have it, anytime. Here--take this too.");
      s.give("tm31"); s.flag("GOT_TM31", true);
      await s.say(`${s.name} received TM31.`);
      await s.say("By using a TM, a BUDDYMON will instantly learn a new move. Think before you act--a TM can be used only once. TM31 contains MUD SLAP. It reduces the enemy's accuracy while it causes damage. In other words, it is both defensive and offensive.");
    } else await s.say("There are BUDDYMON GYMS in cities and towns ahead. You should test your skills at these GYMS. I'm going to train harder to become the greatest bird master!");
  };
  const statue = async (s) => s.say(s.flag("BEAT_FALKNER") ? `VIOLET CITY BUDDYMON GYM. LEADER: FALKNER. WINNING TRAINERS: ${s.name}` : "VIOLET CITY BUDDYMON GYM");

  Game.register("violetgym", {
    room: { art: "violetGym", cols: 10, rows: 16, label: "Violet · Gym" },
    solid,
    warps: [4, 5].map((x) => ({ x, y: 15, to: "violet", tx: 18, ty: 18, dir: 0 })),
    npcs: [
      { id: 1, name: "FALKNER", x: 5, y: 1, dir: 0, script: falkner },
      { id: 2, name: "BIRD_KEEPER", x: 7, y: 6, dir: 2, trainer: trainer("BIRD KEEPER", "ROD", [["chirplet", 7], ["chirplet", 7]], "The keyword is guts! Those here are training night and day to become bird BUDDYMON masters. Come on!", "Gaaah!", "FALKNER's skills are for real! Don't get cocky just because you beat me!", "BEAT_ROD") },
      { id: 3, name: "BIRD_KEEPER", x: 2, y: 10, dir: 3, trainer: trainer("BIRD KEEPER", "ABE", [["spearlet", 9]], "Let me see if you are good enough to face FALKNER!", "This can't be true!", "This is pathetic, losing to some rookie trainer...", "BEAT_ABE") },
      { id: 4, name: "GYM_GUIDE", x: 7, y: 13, dir: 0, script: talk((s) => (s.flag("BEAT_FALKNER") ? "Nice battle! Keep it up, and you'll be the CHAMP in no time at all!" : "Hey! I'm no trainer but I can give some advice! Believe me! If you believe, a championship dream can come true. You believe? Then listen. The grass-type is weak against the flying-type. Keep this in mind.")) },
    ],
    signs: [{ x: 3, y: 13, script: statue }, { x: 6, y: 13, script: statue }],
  });
})();
