// Using a move in battle: accuracy, damage, stat changes and their messages. `att` and `def` are battle sides:
// { mon, stats, stages, label } where label is how the game names them in text ("Wild PIDGEY", "BRAMBLET").
const STAT_NAMES = { atk: "ATTACK", def: "DEFENSE", spa: "SP. ATK", spd: "SP. DEF", spe: "SPEED", acc: "ACCURACY", eva: "EVASION" };

const STATUS_MSG = { slp: "fell asleep!", psn: "was poisoned!", brn: "was burned!", par: "is paralyzed! It may be unable to move!", frz: "was frozen solid!" };
const STATUS_IMMUNE = { psn: ["poison", "steel"], brn: ["fire"], frz: ["ice"] };

// Gold's rules: asleep 1-7 turns, frozen thaws 10% a turn, paralysis stops you 1 time in 4. Returns false when the turn is lost.
async function canAct(s, att, refresh) {
  const m = att.mon;
  if (m.status === "slp") {
    m.sleep = (m.sleep || 1) - 1;
    if (m.sleep > 0) { await s.msg(`${att.label} is fast asleep!`); return false; }
    m.status = null; refresh();
    await s.msg(`${att.label} woke up!`); return false;
  }
  if (m.status === "frz") {
    if (rand(256) >= 25) { await s.msg(`${att.label} is frozen solid!`); return false; }
    m.status = null; refresh(); await s.msg(`${att.label} thawed out!`);
  }
  if (m.status === "par" && rand(4) === 0) { await s.msg(`${att.label} is fully paralyzed!`); return false; }
  return true;
}

// Poison and burn hurt 1/8 of max HP after the afflicted side moves.
async function residual(s, att, refresh) {
  const m = att.mon;
  if ((m.status !== "psn" && m.status !== "brn") || m.hp <= 0) return;
  m.hp = Math.max(0, m.hp - Math.max(1, Math.floor(statsFor(m).hp / 8)));
  refresh();
  await s.msg(`${att.label} is hurt by ${m.status === "psn" ? "poison" : "its burn"}!`);
}

async function inflict(s, def, st, loud, refresh) {
  const m = def.mon;
  if (m.status || SPECIES[m.species].types.some((t) => (STATUS_IMMUNE[st.kind] || []).includes(t))) return loud ? s.msg("But it failed!") : undefined;
  if (rand(100) >= st.chance) return;
  m.status = st.kind;
  if (st.kind === "slp") m.sleep = 1 + rand(7); // 1-7 turns
  refresh();
  await s.msg(`${def.label} ${STATUS_MSG[st.kind]}`);
}

async function useMove(s, att, def, slot, refresh, fx) {
  const mv = MOVES[slot.id];
  slot.pp--;
  await s.msg(`${att.label} used ${mv.name}!`);
  const acc = Math.min(255, Math.floor((mv.acc * 255 / 100) * accMult(att.stages.acc - def.stages.eva)));
  if (rand(256) >= acc) return s.msg(`${att.label}'s attack missed!`);
  if (mv.power) {
    fx("move"); await s.wait(34);
    const { damage, crit, mult } = damageOf(att, def, mv);
    if (mult === 0) return s.msg(`It doesn't affect ${def.label}...`);
    def.mon.hp = Math.max(0, def.mon.hp - damage);
    refresh();
    await s.wait(24);
    if (crit) await s.msg("A critical hit!");
    if (mult > 1) await s.msg("It's super effective!");
    else if (mult < 1) await s.msg("It's not very effective...");
    if (mv.status && def.mon.hp > 0) await inflict(s, def, mv.status, false, refresh);
  } else if (mv.status) { fx("move"); await s.wait(34); await inflict(s, def, mv.status, true, refresh); }
  const e = mv.effect;
  if (e) {
    if (!mv.power) { fx("move"); await s.wait(34); fx(e.stages > 0 ? "up" : "down"); await s.wait(24); }
    const t = e.target === "self" ? att : def, now = t.stages[e.stat], next = Math.max(-6, Math.min(6, now + e.stages));
    if (next === now) return s.msg(`Nothing happened!`);
    t.stages[e.stat] = next;
    await s.msg(`${t.label}'s ${STAT_NAMES[e.stat]} ${e.stages > 0 ? "rose" : "fell"}!`);
  }
}
