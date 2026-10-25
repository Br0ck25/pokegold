// Bank of Mom, from Gold's engine/events/mom.asm: the first talk after the egg errand asks whether she should save your money, later talks
// let you GET / SAVE money or CHANGE the saving. While she saves, a quarter of every trainer prize goes to her (Game.momCut).
// Gold: engine/events/mom.asm, engine/battle/core.asm (prize split), data/text/common_1.asm (_Mom* texts)
Game.momCut = (P, prize) => (P.mom && P.mom.saving ? Math.min(Math.floor(prize / 4), 999999 - P.mom.money) : 0);

Game.bankOfMom = async (s) => {
  const P = s.G.player, m = (P.mom ||= { active: false, saving: false, money: 0 });
  const pages = async (list) => { for (const p of list) await s.say(p); };
  const amount = async (label) => { const n = parseInt(await s.prompt(label, 6), 10); return Number.isFinite(n) && n > 0 ? n : 0; };
  if (!m.active) {
    m.active = true;
    await pages(["Wow, that's a cute BUDDYMON.", "Where did you get it?", "…", "So, you're leaving on an adventure…", "OK! I'll help too.", "But what can I do for you?",
      "I know! I'll save money for you.", "On a long journey, money's important.", "Do you want me to save your money?"]);
    if ((await s.ask()) === 0) { m.saving = true; await pages(["OK, I'll take care of your money.", "……………"]); }
    return pages(["Be careful.", "BUDDYMON are your friends. You need to work as a team.", "Now, go on!"]);
  }
  await pages(["Hi! Welcome home! You're trying very hard, I see.", "I've kept your room tidy.", "Or is this about your money?"]);
  if ((await s.ask()) !== 0) return s.say("Just do what you can.");
  await s.say("What do you want to do?");
  const pick = await s.choose(["GET", "SAVE", "CHANGE", "CANCEL"], { c0: 0, r0: 4, cancel: 3 });
  if (pick === 0) {
    const n = await amount("How much do you want to take?");
    if (!n) return s.say("Just do what you can.");
    if (n > m.money) return s.say("You haven't saved that much.");
    if (P.money + n > 999999) return s.say("You can't take that much.");
    m.money -= n; P.money += n;
    return s.say(`${s.name}, don't give up!`);
  }
  if (pick === 1) {
    const n = await amount("How much do you want to save?");
    if (!n) return s.say("Just do what you can.");
    if (n > P.money) return s.say("You don't have that much.");
    if (m.money + n > 999999) return s.say("You can't save that much.");
    m.money += n; P.money -= n;
    return s.say("Your money's safe here! Get going!");
  }
  if (pick === 2) {
    await s.say("Do you want to save some money?");
    m.saving = (await s.ask()) === 0;
    return s.say(m.saving ? "OK, I'll save your money. Trust me!" : "Just do what you can.");
  }
  return s.say("Just do what you can.");
};
