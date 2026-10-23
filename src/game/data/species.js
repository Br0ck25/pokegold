// Species: types, base stats (hp, atk, def, spe, spa, spd), catch rate, base experience, growth curve, learnset by level.
// Art is looked up by key in Art (art/<key>.js). Add evolutions here when the line is built.
const SPECIES = {
  bramblet: { name: "BRAMBLET", types: ["grass"], base: [45, 49, 65, 45, 49, 65], catchRate: 45, exp: 64, growth: "slow", moves: { 1: ["tackle", "growl"], 8: ["leaf_cutter"] } },
  sparkit: { name: "SPARKIT", types: ["fire"], base: [39, 52, 43, 65, 60, 50], catchRate: 45, exp: 65, growth: "slow", moves: { 1: ["tackle", "leer"], 6: ["smoke_puff"], 12: ["spark"] } },
  chomplet: { name: "CHOMPLET", types: ["water"], base: [50, 65, 64, 43, 44, 48], catchRate: 45, exp: 66, growth: "slow", moves: { 1: ["scratch", "leer"], 13: ["splash_jet"] } },
  chirplet: { name: "CHIRPLET", types: ["normal", "flying"], base: [40, 45, 40, 56, 35, 35], catchRate: 255, exp: 55, growth: "slow", moves: { 1: ["tackle"], 5: ["dust_kick"], 9: ["breeze"], 13: ["quick_strike"] } },
  nibblet: { name: "NIBBLET", types: ["normal"], base: [30, 56, 35, 72, 25, 35], catchRate: 255, exp: 57, growth: "fast", moves: { 1: ["tackle", "tail_wag"], 7: ["quick_strike"], 13: ["sharp_fang"] } },
  peekat: { name: "PEEKAT", types: ["normal"], base: [35, 46, 34, 20, 35, 45], catchRate: 255, exp: 57, growth: "fast", moves: { 1: ["scratch"], 7: ["curl_up"], 12: ["quick_strike"] } },
  hootling: { name: "HOOTLING", types: ["normal", "flying"], base: [60, 30, 30, 50, 36, 56], catchRate: 255, exp: 58, growth: "fast", moves: { 1: ["tackle", "growl"], 11: ["peck"] } },
};
