// A wild battle, scripted like Gold's: intro, command menu (Fight / Pack / Buddymon / Run), turn order by priority then speed,
// catching with buddy nets, experience. Game.battle(s, foeMon) -> "won" | "lost" | "ran" | "caught". Run it inside a script.
Game.battle = async (s, foeMon) => {
  const P = s.G.player, state = s.G.state;
  const fresh = () => ({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 });
  const side = (mon, label) => ({ mon, label, stats: statsFor(mon), stages: fresh() });
  const alive = () => P.party.filter((m) => m.hp > 0);
  const speed = (x) => x.stats.spe * stageMult(x.stages.spe);
  const fought = new Set();
  const them = side(foeMon, `Wild ${SPECIES[foeMon.species].name}`);
  let me = side(alive()[0], alive()[0].nick), ended = null, tries = 0;

  const info = (x) => ({ species: x.mon.species, name: x.mon.nick, level: x.mon.level, hp: x.mon.hp, max: x.stats.hp });
  const refresh = () => { state.battle.foe = info(them); state.battle.me = info(me); };
  const partyMenu = async (forced) => {
    for (;;) {
      const i = await s.menu(P.party.map((m) => `${m.nick}  Lv${m.level}  ${m.hp}/${statsFor(m).hp}`), 1, "party");
      if (i < 0 && !forced) return -1;
      if (i < 0) continue;
      if (P.party[i].hp <= 0) { await s.msg(`${P.party[i].nick} has no energy left to battle!`); continue; }
      if (P.party[i] === me.mon) { await s.msg(`${me.mon.nick} is already out!`); continue; }
      return i;
    }
  };
  const sendOut = async (mon) => { me = side(mon, mon.nick); fought.add(mon); refresh(); await s.msg(`Go! ${mon.nick}!`); };

  const choose = async () => {
    for (;;) {
      const c = await s.menu(["FIGHT", "PACK", "BUDDYMON", "RUN"], 2, "cmd");
      if (c === 0) {
        const m = me.mon.moves, i = await s.menu(m.map((x) => `${MOVES[x.id].name}  ${x.pp}/${MOVES[x.id].pp}`), 2, "moves");
        if (i < 0) continue;
        if (m[i].pp <= 0) { await s.msg("No PP left for this move!"); continue; }
        return { type: "fight", slot: m[i] };
      }
      if (c === 1) {
        const ids = Object.keys(P.bag).filter((k) => P.bag[k] > 0 && ITEMS[k]);
        if (!ids.length) { await s.msg("Your PACK is empty!"); continue; }
        const i = await s.menu([...ids.map((k) => `${ITEMS[k].name} x${P.bag[k]}`), "CANCEL"], 1, "pack");
        if (i < 0 || i >= ids.length) continue;
        return { type: "item", id: ids[i] };
      }
      if (c === 2) { const i = await partyMenu(false); if (i >= 0) return { type: "switch", mon: P.party[i] }; continue; }
      if (c === 3) return { type: "run" };
    }
  };

  // A hit may have fainted someone: experience for a win, a forced switch or defeat for a loss.
  const settle = async () => {
    if (them.mon.hp <= 0) {
      await s.msg(`${them.label} fainted!`);
      await awardExp(s, P.party, fought, them.mon, true);
      ended = "won";
    } else if (me.mon.hp <= 0) {
      await s.msg(`${me.mon.nick} fainted!`);
      if (!alive().length) return (ended = "lost");
      await sendOut(P.party[await partyMenu(true)]);
    }
    return !!ended;
  };
  const attack = async (a, d, slot) => { await useMove(s, a, d, slot, refresh); return settle(); };
  const foeSlot = () => { const u = them.mon.moves.filter((m) => m.pp > 0); return u.length ? u[rand(u.length)] : { id: "tackle", pp: 1 }; };

  const useNet = async (id) => {
    P.bag[id]--;
    await s.msg(`${P.name} threw a ${ITEMS[id].name}!`);
    const rate = catchRate(them.mon, them.stats.hp, ITEMS[id].net), { caught, shakes } = throwNet(rate);
    state.battle.net = { shakes, caught };
    await s.wait(40 + 30 * shakes);
    state.battle.net = null;
    if (!caught) return s.msg(["Oh no! It broke free!", "Aww! It appeared to be caught!", "Aargh! Almost had it!", "Shoot! It was so close too!"][shakes]);
    await s.msg(`Gotcha! ${them.label.replace("Wild ", "")} was caught!`);
    const mon = them.mon;
    if ((await s.confirm(`Give a nickname to ${mon.nick}?`)) === 0) mon.nick = await s.prompt(`Nickname for ${mon.nick}?`, 10);
    (P.party.length < 6 ? P.party : (P.box ||= [])).push(mon);
    ended = "caught";
  };

  state.screen = "battle";
  state.battle = { foe: null, me: null, menu: null, net: null };
  refresh();
  await s.msg(`${them.label} appeared!`, Math.max(Game.msgMs, 600));
  await sendOut(me.mon);

  while (!ended) {
    const act = await choose();
    if (act.type === "fight") {
      const mp = MOVES[act.slot.id].priority || 0, fs = foeSlot(), fp = MOVES[fs.id].priority || 0;
      const meFirst = mp !== fp ? mp > fp : speed(me) !== speed(them) ? speed(me) > speed(them) : rand(2) === 0;
      if (meFirst) { if (await attack(me, them, act.slot)) break; if (await attack(them, me, fs)) break; }
      else { if (await attack(them, me, fs)) break; if (await attack(me, them, act.slot)) break; }
    } else {
      if (act.type === "switch") { await s.msg(`Come back, ${me.mon.nick}!`); await sendOut(act.mon); }
      else if (act.type === "item" && ITEMS[act.id].net) await useNet(act.id);
      else if (act.type === "item") {
        const max = me.stats.hp;
        if (me.mon.hp >= max) { await s.msg("It won't have any effect."); continue; }
        P.bag[act.id]--;
        me.mon.hp = Math.min(max, me.mon.hp + ITEMS[act.id].heal);
        refresh();
        await s.msg(`${me.mon.nick} regained health!`);
      } else if (act.type === "run") {
        tries++;
        if (speed(me) >= speed(them) || rand(256) < Math.floor((speed(me) * 128) / speed(them)) + 30 * tries) { await s.msg("Got away safely!"); ended = "ran"; break; }
        await s.msg("Can't escape!");
      }
      if (ended) break;
      if (await attack(them, me, foeSlot())) break;
    }
  }
  state.screen = null; state.battle = null; state.dialogue = null;
  return ended;
};
