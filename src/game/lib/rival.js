// Your rival: his starter counters yours (original pairing), and his name stays "???" until you give it to the officer in Willow's lab.
Game.rivalSpecies = (P) => ({ bramblet: "bandit", bandit: "chomplet", chomplet: "bramblet" })[P.party[0] ? P.party[0].species : "bramblet"];
Game.rivalName = (P) => P.rival || "???";
