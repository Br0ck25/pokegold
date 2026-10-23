// Moves. power 0 = status move. effect: { stat, stages, target: "foe" | "self" } changes a stat stage. priority 1 goes first.
const MOVES = {
  tackle: { name: "TACKLE", type: "normal", power: 35, acc: 95, pp: 35 },
  scratch: { name: "SCRATCH", type: "normal", power: 40, acc: 100, pp: 35 },
  quick_strike: { name: "QUICK STRIKE", type: "normal", power: 40, acc: 100, pp: 30, priority: 1 },
  sharp_fang: { name: "SHARP FANG", type: "normal", power: 80, acc: 90, pp: 15 },
  growl: { name: "GROWL", type: "normal", power: 0, acc: 100, pp: 40, effect: { stat: "atk", stages: -1, target: "foe" } },
  leer: { name: "LEER", type: "normal", power: 0, acc: 100, pp: 30, effect: { stat: "def", stages: -1, target: "foe" } },
  tail_wag: { name: "TAIL WAG", type: "normal", power: 0, acc: 100, pp: 30, effect: { stat: "def", stages: -1, target: "foe" } },
  curl_up: { name: "CURL UP", type: "normal", power: 0, acc: 100, pp: 40, effect: { stat: "def", stages: 1, target: "self" } },
  dust_kick: { name: "DUST KICK", type: "ground", power: 0, acc: 100, pp: 15, effect: { stat: "acc", stages: -1, target: "foe" } },
  smoke_puff: { name: "SMOKE PUFF", type: "normal", power: 0, acc: 100, pp: 20, effect: { stat: "acc", stages: -1, target: "foe" } },
  breeze: { name: "BREEZE", type: "flying", power: 40, acc: 100, pp: 35 },
  peck: { name: "PECK", type: "flying", power: 35, acc: 100, pp: 35 },
  spark: { name: "SPARK", type: "fire", power: 40, acc: 100, pp: 25 },
  splash_jet: { name: "SPLASH JET", type: "water", power: 40, acc: 100, pp: 25 },
  leaf_cutter: { name: "LEAF CUTTER", type: "grass", power: 55, acc: 95, pp: 25 },
};
