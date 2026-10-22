// Art for a species id (as the game numbers them): hand-drawn where we have it, procedural otherwise.
Art.speciesArt = {
  152: "bramblet", 155: "sparkit", 158: "chomplet", // CHIKORITA, CYNDAQUIL, TOTODILE slots
  16: "chirplet", 19: "nibblet", 161: "peekat", 163: "hootling", // PIDGEY, RATTATA, SENTRET, HOOTHOOT slots (Route 29)
};
Art.creature = (id) => (Art.speciesArt[id] ? Art[Art.speciesArt[id]]() : Art.critter(id));
