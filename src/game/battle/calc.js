// Battle maths, the same formulas Gold uses (docs/ENGINE.md). All pure functions.
const rand = (n) => Math.floor(Math.random() * n); // 0..n-1

const growthExp = (kind, n) => (kind === "fast" ? Math.floor((4 * n ** 3) / 5) : Math.floor((6 * n ** 3) / 5 - 15 * n ** 2 + 100 * n - 140)); // medium fast / medium slow
const levelFor = (kind, exp) => { let l = 1; while (l < 100 && growthExp(kind, l + 1) <= exp) l++; return l; };

const statOf = (base, dv, level, isHp) => Math.floor(((base + dv) * 2 * level) / 100) + (isHp ? level + 10 : 5);
// stats object { hp, atk, def, spe, spa, spd } for a mon ({ species, level, dv })
const statsFor = (mon) => {
  const b = SPECIES[mon.species].base, dv = mon.dv, names = ["hp", "atk", "def", "spe", "spa", "spd"];
  const dvs = [((dv.atk & 1) << 3) | ((dv.def & 1) << 2) | ((dv.spe & 1) << 1) | (dv.spa & 1), dv.atk, dv.def, dv.spe, dv.spa, dv.spa];
  return Object.fromEntries(names.map((n, i) => [n, statOf(b[i], dvs[i], mon.level, i === 0)]));
};

const stageMult = (s) => (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));
// acc/evasion use the 3/3.. table of Gold (data/battle/accuracy_multipliers.asm), here the usual 3+s / 3
const accMult = (s) => (s >= 0 ? (3 + s) / 3 : 3 / (3 - s));

// Damage of one hit. att/def: { mon, stats, stages }. Returns { damage, crit, mult }.
const damageOf = (att, def, move) => {
  const special = SPECIAL_TYPES.has(move.type);
  const A = (special ? att.stats.spa : att.stats.atk) * stageMult(att.stages[special ? "spa" : "atk"]) * (att.mon.status === "brn" && !special ? 0.5 : 1);
  const D = (special ? def.stats.spd : def.stats.def) * stageMult(def.stages[special ? "spd" : "def"]);
  const crit = rand(256) < 17;
  let dmg = Math.floor((Math.floor((2 * att.mon.level) / 5 + 2) * move.power * Math.floor(A)) / Math.max(1, Math.floor(D)) / 50);
  if (crit) dmg *= 2;
  dmg = Math.min(dmg, 997) + 2;
  const types = SPECIES[att.mon.species].types;
  if (types.includes(move.type)) dmg = Math.floor(dmg * 1.5); // same-type bonus
  const mult = typeMultiplier(move.type, SPECIES[def.mon.species].types);
  dmg = Math.floor(dmg * mult);
  if (mult > 0) dmg = Math.max(1, Math.floor((dmg * (217 + rand(39))) / 255)); // 85-100% spread
  return { damage: dmg, crit, mult };
};

const STATUS_TAG = { slp: "SLP", psn: "PSN", brn: "BRN", par: "PAR", frz: "FRZ" };
// Full restore (Center, whiteout, rival aftermath): HP, PP and status.
const healMon = (m) => { m.hp = statsFor(m).hp; m.status = null; m.sleep = 0; for (const mv of m.moves) mv.pp = MOVES[mv.id].pp; };
const expGain = (foe, wild = true) => Math.floor(((SPECIES[foe.species].exp * foe.level) / 7) * (wild ? 1 : 1.5));

// Catch chance, as in PokeBallEffect: ((3*max - 2*hp) * rate * net) / (3*max), + status bonus, capped at 255.
const catchRate = (foe, maxHp, net) => {
  let r = Math.floor(((3 * maxHp - 2 * foe.hp) * SPECIES[foe.species].catchRate * net) / (3 * maxHp));
  r = Math.max(1, r) + (foe.status === "slp" || foe.status === "frz" ? 10 : foe.status ? 5 : 0);
  return Math.min(255, r);
};
// chance (out of 255) that the net keeps shaking for a final catch rate (data/battle/wobble_probabilities.asm)
const WOBBLE = [[1, 63], [2, 75], [3, 84], [4, 90], [5, 95], [7, 103], [10, 113], [15, 126], [20, 134], [30, 149], [40, 160], [50, 169], [60, 177], [80, 191], [100, 201], [120, 211], [140, 220], [160, 227], [180, 234], [200, 240], [220, 246], [240, 251], [254, 253], [255, 255]];
// -> { caught, shakes } for one throw
const throwNet = (rate) => {
  if (rand(256) <= rate) return { caught: true, shakes: 3 };
  const p = (WOBBLE.find(([r]) => r >= rate) || [0, 255])[1];
  let shakes = 0;
  while (shakes < 3 && rand(256) < p) shakes++;
  return { caught: false, shakes };
};

// Which period of the day the device clock is in (Gold: morning 4-10, day 10-18, night otherwise).
const timeOfDay = () => { const h = new Date().getHours(); return h >= 4 && h < 10 ? "morn" : h < 18 && h >= 10 ? "day" : "nite"; };

const rollGender = (species) => (Math.random() < SPECIES[species].female ? "F" : "M");
const genderMark = (mon) => (mon.gender === "F" ? "♀" : "♂");

// A fresh buddymon of `species` at `level`: random individual values, full HP, the last four moves it would know.
const makeMon = (species, level) => {
  const dv = { atk: rand(16), def: rand(16), spe: rand(16), spa: rand(16) };
  const sp = SPECIES[species], learned = [];
  for (const [lv, list] of Object.entries(sp.moves)) if (+lv <= level) learned.push(...list);
  const moves = learned.slice(-4).map((id) => ({ id, pp: MOVES[id].pp }));
  const mon = { species, nick: sp.name, gender: rollGender(species), level, dv, exp: growthExp(sp.growth, level), moves, status: null };
  mon.hp = statsFor(mon).hp;
  return mon;
};
