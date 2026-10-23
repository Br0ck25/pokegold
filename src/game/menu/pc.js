// The Center's PC, as in Gold's bills_pc.asm: 14 boxes of 20. WITHDRAW / DEPOSIT / CHANGE BOX / SEE YA, and per buddymon WITHDRAW / STATS / RELEASE.
// Gold's rules: you cannot deposit your last buddymon (or the last one that can still battle), the party holds 6, a full box refuses deposits.
// Catches go to the current box when the party is full (Game.boxAdd). Item storage (the player's own PC) is in docs/TODO.md.
const BOXES = 14, PER_BOX = 20;
Game.boxCount = (P) => P.boxes.reduce((n, b) => n + b.length, 0);
Game.boxAdd = (P, mon) => { const b = P.boxes[P.curBox]; if (b.length >= PER_BOX) return null; b.push(mon); return `BOX ${P.curBox + 1}`; };
Game.boxFull = (P) => P.boxes[P.curBox].length >= PER_BOX;

Game.pc = async (s) => {
  const P = s.G.player;
  await s.say(`${s.name} turned on the PC.`);
  await s.say("BUDDYBOX PC accessed. BUDDYMON Storage System opened.");
  const monRows = (list) => list.map((m) => { const max = statsFor(m).hp; return { label: m.nick, g: m.gender, sub: `Lv ${m.level}${m.status ? "  " + STATUS_TAG[m.status] : ""}`, right: `${m.hp}/${max}`, bar: m.hp / max, art: m.species, dim: m.hp <= 0 }; });
  const opts = (n) => ({ c0: 8, r0: 4, cancel: n - 1 });
  const withdraw = async () => {
    let at = 0;
    for (;;) {
      const box = P.boxes[P.curBox];
      if (!box.length) return s.say("There are no BUDDYMON in this BOX.");
      const r = await s.panel({ title: `BOX ${P.curBox + 1}  ${box.length}/${PER_BOX}`, rows: monRows(box), hint: "Choose a BUDDYMON." }, Math.min(at, box.length - 1));
      if (r.key === "B") return;
      if (r.key !== "A") continue;
      at = r.i;
      const m = box[at], pick = await s.choose(["WITHDRAW", "STATS", "RELEASE", "CANCEL"], opts(4));
      if (pick === 0) {
        if (P.party.length >= 6) { await s.say("The party's full!"); continue; }
        box.splice(at, 1); P.party.push(m);
        await s.say(`Got ${m.nick}.`);
      } else if (pick === 1) await Game.statsCard(s, m);
      else if (pick === 2 && (await s.confirm("Release BUDDYMON?")) === 0) {
        box.splice(at, 1);
        await s.say(`Released BUDDYMON. Bye, ${m.nick}!`);
      }
    }
  };
  const deposit = async () => {
    let at = 0;
    for (;;) {
      const r = await s.panel({ title: "DEPOSIT", rows: monRows(P.party), hint: "Choose a BUDDYMON." }, Math.min(at, P.party.length - 1));
      if (r.key === "B") return;
      if (r.key !== "A") continue;
      at = r.i;
      const m = P.party[at], pick = await s.choose(["DEPOSIT", "STATS", "CANCEL"], opts(3));
      if (pick === 1) await Game.statsCard(s, m);
      else if (pick === 0) {
        if (P.party.length === 1) { await s.say("It's your last BUDDYMON!"); continue; }
        if (!P.party.some((o) => o !== m && o.hp > 0)) { await s.say("No more usable BUDDYMON!"); continue; }
        if (Game.boxFull(P)) { await s.say("The BOX is full."); continue; }
        P.party.splice(at, 1); Game.boxAdd(P, m);
        await s.say(`Stored ${m.nick}.`);
        at = 0;
      }
    }
  };
  const changeBox = async () => {
    const r = await s.panel({ title: "CHANGE BOX", rows: P.boxes.map((b, n) => ({ label: `BOX ${n + 1}`, right: `${b.length}/${PER_BOX}`, sub: n === P.curBox ? "current" : "" })), hint: "Which BOX?" }, P.curBox);
    if (r.key === "A") P.curBox = r.i;
  };
  for (;;) {
    const c = await s.choose(["WITHDRAW", "DEPOSIT", "CHANGE BOX", "SEE YA!"], opts(4));
    if (c === 0) await withdraw();
    else if (c === 1) await deposit();
    else if (c === 2) await changeBox();
    else break;
  }
  await s.say("Link closed...");
};
