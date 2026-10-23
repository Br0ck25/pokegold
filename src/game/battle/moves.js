// Using a move in battle: accuracy, damage, stat changes and their messages. `att` and `def` are battle sides:
// { mon, stats, stages, label } where label is how the game names them in text ("Wild PIDGEY", "BRAMBLET").
const STAT_NAMES = { atk: "ATTACK", def: "DEFENSE", spa: "SP. ATK", spd: "SP. DEF", spe: "SPEED", acc: "ACCURACY", eva: "EVASION" };

async function useMove(s, att, def, slot, refresh, fx) {
  const mv = MOVES[slot.id];
  slot.pp--;
  await s.msg(`${att.label} used ${mv.name}!`);
  const acc = Math.min(255, Math.floor((mv.acc * 255 / 100) * accMult(att.stages.acc - def.stages.eva)));
  if (rand(256) >= acc) return s.msg(`${att.label}'s attack missed!`);
  if (mv.power) {
    fx("hit"); await s.wait(34);
    const { damage, crit, mult } = damageOf(att, def, mv);
    if (mult === 0) return s.msg(`It doesn't affect ${def.label}...`);
    def.mon.hp = Math.max(0, def.mon.hp - damage);
    refresh();
    await s.wait(24);
    if (crit) await s.msg("A critical hit!");
    if (mult > 1) await s.msg("It's super effective!");
    else if (mult < 1) await s.msg("It's not very effective...");
  }
  const e = mv.effect;
  if (e) {
    if (!mv.power) { fx(e.stages > 0 ? "up" : "down"); await s.wait(34); }
    const t = e.target === "self" ? att : def, now = t.stages[e.stat], next = Math.max(-6, Math.min(6, now + e.stages));
    if (next === now) return s.msg(`Nothing happened!`);
    t.stages[e.stat] = next;
    await s.msg(`${t.label}'s ${STAT_NAMES[e.stat]} ${e.stages > 0 ? "rose" : "fell"}!`);
  }
}
