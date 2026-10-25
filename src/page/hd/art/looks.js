// Who is who: looks for Art.person. NPC keys are SPRITE_* names (see constants/sprite_constants.asm).
Art.looks = {
  HERO: { hat: "#c9322a", hair: "#3a2418", top: "#ffb62e", legs: "#1f3a8a" },
  HEROINE: { hair: "#7a3a1e", pigtails: true, dress: true, top: "#ff8fc0", legs: "#f4c397" },
  MOM: { hair: "#6b3d1e", bun: true, dress: true, top: "#ff8fa3", apron: "#fff6dc", legs: "#f4c397" },
  TEACHER: { hair: "#8a5a2b", glasses: true, dress: true, top: "#7ab6ff", legs: "#f4c397" },
  FISHER: { hat: "#ffd25a", hair: "#7a5a2a", top: "#3fae62", legs: "#6b4a2a" },
  RIVAL: { hair: "#c9322a", top: "#3a3f52", legs: "#2a2f45" },
  WILLOW: { hair: "#c8cfe0", bun: true, glasses: true, dress: true, top: "#ffffff", legs: "#6b4a2a" },
  SCIENTIST: { hair: "#3a6fb0", glasses: true, top: "#ffffff", legs: "#6b4a2a" },
  BUG_CATCHER: { hat: "#6fd382", hair: "#6b4a2a", top: "#ffb62e", legs: "#3a6fb0" },
  COOLTRAINER_F: { hair: "#d9604c", dress: true, top: "#ff6b5e", legs: "#f4c397" },
  NURSE: { hair: "#ff9fb0", bun: true, dress: true, top: "#ffd1dc", apron: "#ffffff", legs: "#f4c397" },
  CLERK: { hair: "#4a3a2a", dress: true, top: "#46a0e0", legs: "#2a3a6a" },
  GENTLEMAN: { hair: "#c9c9d6", dress: true, top: "#3a3f52", legs: "#2a2f45" },
  YOUNGSTER: { hat: "#4aa3e8", hair: "#3a2418", top: "#ffb62e", legs: "#6b4a2a" },
  COOLTRAINER_M: { hair: "#3a2418", top: "#e8e8f0", legs: "#2a2f45" },
  GRAMPS: { hair: "#e8e8ee", dress: true, top: "#8a6a3a", legs: "#5a4a2a" },
  POKEFAN_M: { hat: "#e8943a", hair: "#6b4a2a", top: "#5aa860", legs: "#4a4a6a" },
  LASS: { hair: "#7a4a2a", dress: true, top: "#ffa0d0", legs: "#f4c397" },
  OFFICER: { hat: "#2a3a8a", hair: "#3a2418", top: "#3a56b0", legs: "#2a3a6a" },
  ASPEN: { hair: "#c8c8d4", dress: true, top: "#f4f7ff", legs: "#7a5a3a" },
  FALKNER: { hair: "#4a7be0", top: "#e8f0ff", legs: "#2a2f45" },
  BIRD_KEEPER: { hair: "#8a5a2b", hat: "#a5d6ff", top: "#7ab6ff", legs: "#2a3a6a" },
  GYM_GUIDE: { hat: "#ff6b5e", hair: "#3a2418", top: "#fff6dc", legs: "#6b4a2a" },
  SUPER_NERD: { hair: "#3a2418", glasses: true, top: "#c9c9d6", legs: "#3a3f52" },
  GRANNY: { hair: "#e6e6ee", bun: true, dress: true, top: "#b58ad9", legs: "#f4c397" },
  GAMEBOY_KID: { hat: "#ffd25a", hair: "#3a2418", top: "#3fae62", legs: "#1f3a8a" },
  OTHER: { hair: "#555a6e", top: "#9aa4c8", legs: "#5a5f7a" }, // anyone without a look yet
};
Art.heroLook = () => (Game.player.gender === 1 ? Art.looks.HEROINE : Art.looks.HERO);
Art.heroSprite = (dir) => Art.person(dir, Art.heroLook());

// Everyone of a generic kind (YOUNGSTER, TEACHER, ...) gets their own clothes and hair, chosen from the person's id and map so they stay the same every visit;
// story characters (Mom, Willow, the rival, gym leaders, officers...) keep their one look.
const SET = {
  hair: ["#3a2418", "#6b3d1e", "#8a5a2b", "#c9a062", "#d9604c", "#2b2b3a", "#e8e8ee", "#a8452a"],
  top: ["#ffb62e", "#4aa3e8", "#6fd382", "#ff8fa3", "#b58ad9", "#ff7a3c", "#e8e8f0", "#3fae62", "#e04a5a", "#7ab6ff"],
  legs: ["#1f3a8a", "#3a3f52", "#6b4a2a", "#2a5a3a", "#5a3a6a", "#7a2a2a", "#2a2f45"],
  hat: ["#4aa3e8", "#ffd25a", "#6fd382", "#e04a5a", "#ff8a3a", "#b58ad9"],
  skin: ["#f4c397", "#e9b184", "#d99a6c", "#c98b5b", "#f8d2ae"],
};
const GENERIC = new Set(["YOUNGSTER", "BUG_CATCHER", "LASS", "COOLTRAINER_M", "COOLTRAINER_F", "TEACHER", "FISHER", "GRAMPS", "GRANNY", "POKEFAN_M", "SUPER_NERD", "BIRD_KEEPER", "GENTLEMAN", "GAMEBOY_KID", "CLERK", "SCIENTIST", "OTHER"]);
Art.look = (name, id = 0, mapKey = "") => {
  const base = Art.looks[name] || Art.looks.OTHER;
  if (!GENERIC.has(name)) return base;
  let n = 7;
  for (const c of `${mapKey}:${id}:${name}`) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  const pick = (list, k) => list[(n >>> k) % list.length];
  const o = { ...base, hair: pick(SET.hair, 0), top: pick(SET.top, 3), legs: pick(SET.legs, 6), skin: pick(SET.skin, 9) };
  if (base.hat) o.hat = pick(SET.hat, 12);
  if (name === "YOUNGSTER" || name === "BUG_CATCHER") o.hat = (n >>> 4) % 3 ? pick(SET.hat, 12) : undefined; // some go bareheaded
  return o;
};
