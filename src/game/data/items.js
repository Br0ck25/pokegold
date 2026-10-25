// Items. net: catch multiplier of a buddy net; heal: HP restored; price in BUDS (selling gives half).
const ITEMS = {
  buddy_net: { name: "BUDDY NET", net: 1, pocket: "nets", price: 200 },
  tonic: { name: "TONIC", heal: 20, pocket: "items", price: 300 },
  remedy: { name: "REMEDY", cure: true, pocket: "items", price: 250 },
  rare_candy: { name: "RARE CANDY", levelup: true, pocket: "items", price: 4800 },
  pp_up: { name: "PP UP", ppup: true, pocket: "items", price: 9800 },
  hyper_tonic: { name: "HYPER TONIC", heal: 200, pocket: "items", price: 1200 },
  tm31: { name: "TM31 MUD SLAP", tm: "mud_slap", pocket: "items" },
  tide_charm: { name: "TIDE CHARM", pocket: "items" },
  mystery_egg: { name: "MYSTERY EGG", pocket: "key" },
  pink_bow: { name: "PINK BOW", pocket: "items", price: 0 }, // held item: strengthens normal moves (not used in battle yet)
  elixir: { name: "ELIXIR", pocket: "items", price: 0 }, // found only; restoring PP from the pack is not built yet
  berry: { name: "SWEET BERRY", heal: 10, pocket: "items", price: 100 },
};
