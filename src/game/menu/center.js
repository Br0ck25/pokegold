// The Buddymon Center nurse: heals the whole party and makes this the place you wake up after a whiteout.
Game.nurse = async (s, spot) => {
  await s.say("Welcome to our BUDDYMON CENTER! We heal your BUDDYMON back to perfect health.");
  if ((await s.confirm("Shall we heal your BUDDYMON?")) !== 0) return s.say("We hope to see you again!");
  await s.say("OK, I'll take your BUDDYMON for a few seconds.");
  s.G.state.dialogue = null;
  for (const m of s.G.player.party) healMon(m);
  s.G.player.lastCenter = spot;
  await s.wait(90);
  await s.say("Thank you for waiting. We've restored your BUDDYMON to full health.");
  await s.say("We hope to see you again!");
};
