// Species: types, base stats (hp, atk, def, spe, spa, spd), catch rate, base experience, growth curve, learnset by level, female (chance 0-1 of a female; 1 = always).
// Art is looked up by key in Art (art/<key>.js). Add evolutions here when the line is built.
const SPECIES = {
  bramblet: { name: "BRAMBLET", female: 0.125, types: ["grass"], base: [45, 49, 65, 45, 49, 65], catchRate: 45, exp: 64, growth: "slow", moves: { 1: ["tackle", "growl"], 8: ["leaf_cutter"] } },
  bandit: { name: "BANDIT", female: 1, types: ["dark"], base: [45, 55, 45, 60, 50, 50], catchRate: 45, exp: 64, growth: "slow", moves: { 1: ["scratch", "growl"], 9: ["night_nip"], 15: ["quick_strike"], 12: ["static_zap"] } },
  chomplet: { name: "CHOMPLET", female: 0.125, types: ["water"], base: [50, 65, 64, 43, 44, 48], catchRate: 45, exp: 66, growth: "slow", moves: { 1: ["scratch", "leer"], 13: ["splash_jet"] } },
  chirplet: { name: "CHIRPLET", female: 0.5, types: ["normal", "flying"], base: [40, 45, 40, 56, 35, 35], catchRate: 255, exp: 55, growth: "slow", moves: { 1: ["tackle"], 5: ["dust_kick"], 9: ["breeze"], 13: ["quick_strike"] } },
  nibblet: { name: "NIBBLET", female: 0.5, types: ["normal"], base: [30, 56, 35, 72, 25, 35], catchRate: 255, exp: 57, growth: "fast", moves: { 1: ["tackle", "tail_wag"], 7: ["quick_strike"], 13: ["sharp_fang"] } },
  peekat: { name: "PEEKAT", female: 0.5, types: ["normal"], base: [35, 46, 34, 20, 35, 45], catchRate: 255, exp: 57, growth: "fast", moves: { 1: ["scratch"], 7: ["curl_up"], 12: ["quick_strike"] } },
  grublet: { name: "GRUBLET", female: 0.5, types: ["bug"], base: [45, 30, 35, 45, 20, 20], catchRate: 255, exp: 53, growth: "fast", moves: { 1: ["tackle", "string_shot"], 4: ["venom_dart"] } },
  cocoonet: { name: "COCOONET", female: 0.5, types: ["bug"], base: [50, 20, 55, 30, 25, 25], catchRate: 120, exp: 72, growth: "fast", moves: { 1: ["harden"], 7: ["tackle"] } },
  spinlet: { name: "SPINLET", female: 0.5, types: ["bug", "poison"], base: [40, 60, 40, 30, 40, 40], catchRate: 255, exp: 95, growth: "fast", moves: { 1: ["tackle", "string_shot"] } },
  hootling: { name: "HOOTLING", female: 0.5, types: ["normal", "flying"], base: [60, 30, 30, 50, 36, 56], catchRate: 255, exp: 58, growth: "fast", moves: { 1: ["tackle", "growl"], 11: ["peck"], 14: ["lull_song"] } },
};
