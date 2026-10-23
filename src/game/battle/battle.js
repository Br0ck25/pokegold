// A battle, scripted like Gold's: intro, command menu (Fight / Pack / Buddymon / Run), turn order by priority then speed,
// catching with buddy nets (wild only), experience. Game.battle(s, foe, opts) -> "won" | "lost" | "ran" | "caught". Run it inside a script.
// opts.tutorial = { lines } is Gold's catching lesson: a scripted fight then net, the foe never attacks and nothing is kept.
// foe is a mon (wild) or, with opts.trainer = { name, money, win }, a list of mons: no nets, no running, prize money on a win.
Game.battle = async (s, foeMon, opts = {}) => {
  const trainer = opts.trainer, foes = [].concat(foeMon);
  foeMon = foes[0];
  const P = s.G.player, state = s.G.state;
  const fresh = () => ({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 });
  const side = (mon, label) => ({ mon, label, stats: statsFor(mon), stages: fresh() });
  const alive = () => P.party.filter((m) => m.hp > 0);
  const speed = (x) => x.stats.spe * stageMult(x.stages.spe) * (x.mon.status === "par" ? 0.25 : 1);
  const fought = new Set(), leveled = new Set();
  const foeLabel = (mon) => (trainer ? `${trainer.name}'s ${SPECIES[mon.species].name}` : `Wild ${SPECIES[mon.species].name}`);
  let them = side(foeMon, foeLabel(foeMon));
  let me = side(alive()[0], alive()[0].nick), ended = null, tries = 0;

  const info = (x) => ({ species: x.mon.species, name: x.mon.nick, gender: x.mon.gender, level: x.mon.level, hp: x.mon.hp, max: statsFor(x.mon).hp, xp: xpBar(x.mon), exp: xpText(x.mon), status: x.mon.status });
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

  const lesson = opts.tutorial ? [{ type: "fight", slot: null }, { type: "item", id: "buddy_net" }] : null;
  const choose = async () => {
    if (lesson) {
      const step = lesson.shift();
      await s.say(opts.tutorial.lines[step.type === "fight" ? 0 : 1]);
      if (step.type === "fight") step.slot = me.mon.moves[0];
      return step;
    }
    for (;;) {
      const c = await s.menu(["FIGHT", "PACK", "BUDDYMON", "RUN"], 2, "cmd");
      if (c === 0) {
        const m = me.mon.moves, i = await s.menu(m.map((x) => `${MOVES[x.id].name}  ${x.pp}/${maxPP(x)}`), 2, "moves");
        if (i < 0) continue;
        if (m[i].pp <= 0) { await s.msg("No PP left for this move!"); continue; }
        return { type: "fight", slot: m[i] };
      }
      if (c === 1) {
        const ids = Object.keys(P.bag).filter((k) => P.bag[k] > 0 && ITEMS[k] && (ITEMS[k].net || ITEMS[k].heal || ITEMS[k].cure));
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
      await awardExp(s, P.party, fought, them.mon, !trainer, refresh, leveled);
      const next = foes[foes.indexOf(them.mon) + 1];
      if (!next) ended = "won";
      else {
        them = side(next, foeLabel(next));
        fought.clear(); fought.add(me.mon);
        refresh();
        await s.msg(`${trainer.name} sent out ${SPECIES[next.species].name}!`);
      }
    } else if (me.mon.hp <= 0) {
      await s.msg(`${me.mon.nick} fainted!`);
      if (!alive().length) return (ended = "lost");
      await sendOut(P.party[await partyMenu(true)]);
    }
    return !!ended;
  };
  let fxN = 0; // each move bumps this so the screen plays one animation per use: who attacks, the move's type, and hit / up / down
  const attack = async (a, d, slot) => {
    if (!(await canAct(s, a, refresh))) return settle();
    await useMove(s, a, d, slot, refresh, (kind) => (state.battle.fx = { n: ++fxN, who: a === me ? "me" : "foe", type: MOVES[slot.id].type, anim: MOVES[slot.id].anim, hurts: !!MOVES[slot.id].power, kind }));
    await residual(s, a, refresh);
    return settle();
  };
  const foeSlot = () => { const u = them.mon.moves.filter((m) => m.pp > 0); return u.length ? u[rand(u.length)] : { id: "tackle", pp: 1 }; };

  const useNet = async (id) => {
    if (!opts.tutorial && P.party.length >= 6 && Game.boxFull(P)) return s.msg("The BOX is full! Can't use that now!"); // Gold's BallBoxFullText
    if (!opts.tutorial) P.bag[id]--;
    await s.msg(`${opts.tutorial ? "DUDE" : P.name} threw a ${ITEMS[id].name}!`);
    const rate = catchRate(them.mon, them.stats.hp, ITEMS[id].net), { caught, shakes } = opts.tutorial ? { caught: true, shakes: 3 } : throwNet(rate);
    state.battle.net = { shakes, caught };
    await s.wait(40 + 30 * shakes);
    state.battle.net = null;
    if (!caught) return s.msg(["Oh no! It broke free!", "Aww! It appeared to be caught!", "Aargh! Almost had it!", "Shoot! It was so close too!"][shakes]);
    await s.msg(`Gotcha! ${them.label.replace("Wild ", "")} was caught!`);
    if (opts.tutorial) return (ended = "caught");
    const mon = them.mon;
    if ((await s.confirm(`Give a nickname to ${mon.nick}?`)) === 0) mon.nick = await s.prompt(`Nickname for ${mon.nick}?`, 10);
    if (P.party.length < 6) P.party.push(mon);
    else await s.msg(`${mon.nick} was sent to BUDDYBOX PC (${Game.boxAdd(P, mon)}).`);
    dex[mon.species] = "caught";
    ended = "caught";
  };

  const dex = (P.dex ||= {});
  for (const f of foes) dex[f.species] ||= "seen";
  state.screen = "battle";
  state.battle = { foe: null, me: null, menu: null, net: null, fx: null };
  refresh();
  if (trainer) {
    await s.msg(`${trainer.name} wants to battle!`, Math.max(Game.msgMs, 900));
    await s.msg(`${trainer.name} sent out ${SPECIES[foeMon.species].name}!`);
  } else await s.msg(`${them.label} appeared!`, Math.max(Game.msgMs, 600));
  await sendOut(me.mon);

  while (!ended) {
    const act = await choose();
    if (act.type === "fight") {
      const mp = MOVES[act.slot.id].priority || 0, fs = foeSlot(), fp = MOVES[fs.id].priority || 0;
      const meFirst = mp !== fp ? mp > fp : speed(me) !== speed(them) ? speed(me) > speed(them) : rand(2) === 0;
      if (opts.tutorial) { if (await attack(me, them, act.slot)) break; continue; }
      if (meFirst) { if (await attack(me, them, act.slot)) break; if (await attack(them, me, fs)) break; }
      else { if (await attack(them, me, fs)) break; if (await attack(me, them, act.slot)) break; }
    } else {
      if (act.type === "switch") { await s.msg(`Come back, ${me.mon.nick}!`); await sendOut(act.mon); }
      else if (act.type === "item" && ITEMS[act.id].net && trainer) await s.msg("The trainer blocked the net! Don't be a thief!");
      else if (act.type === "item" && ITEMS[act.id].net) await useNet(act.id);
      else if (act.type === "item" && !ITEMS[act.id].cure) {
        const max = me.stats.hp;
        if (me.mon.hp >= max) { await s.msg("It won't have any effect."); continue; }
        P.bag[act.id]--;
        me.mon.hp = Math.min(max, me.mon.hp + ITEMS[act.id].heal);
        refresh();
        await s.msg(`${me.mon.nick} regained health!`);
      } else if (act.type === "item" && ITEMS[act.id].cure) {
        if (!me.mon.status) { await s.msg("It won't have any effect."); continue; }
        P.bag[act.id]--; me.mon.status = null; me.mon.sleep = 0; refresh();
        await s.msg(`${me.mon.nick} was cured!`);
      } else if (act.type === "run") {
        if (trainer) { await s.msg("No! There's no running from a trainer battle!"); continue; }
        tries++;
        if (speed(me) >= speed(them) || rand(256) < Math.floor((speed(me) * 128) / speed(them)) + 30 * tries) { await s.msg("Got away safely!"); ended = "ran"; break; }
        await s.msg("Can't escape!");
      }
      if (ended) break;
      if (opts.tutorial) continue;
      if (await attack(them, me, foeSlot())) break;
    }
  }
  if (trainer && ended === "won") {
    if (trainer.win) await s.say(trainer.win);
    const prize = (trainer.money || 20) * foes[foes.length - 1].level;
    P.money += prize;
    await s.say(`${P.name} got ${prize} ${Game.CURRENCY} for winning!`);
  }
  state.screen = null; state.battle = null; state.dialogue = null;
  if (ended !== "lost") for (const m of P.party) if (leveled.has(m)) await Game.evolve(s, m);
  return ended;
};
