// Art for a species key ("bramblet"): hand-drawn where we have art/<key>.js, otherwise a seeded placeholder (art/critter.js).
Art.creature = (key) => (Art[key] ? Art[key]() : Art.critter(key.length));
