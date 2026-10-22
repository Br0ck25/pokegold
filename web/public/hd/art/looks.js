// Who is who: looks for Art.person. NPC keys are SPRITE_* names (see constants/sprite_constants.asm).
Art.looks = {
  HERO: { hat: "#c9322a", hair: "#3a2418", top: "#ffb62e", legs: "#1f3a8a" },
  MOM: { hair: "#6b3d1e", bun: true, dress: true, top: "#ff8fa3", apron: "#fff6dc", legs: "#f4c397" },
  TEACHER: { hair: "#8a5a2b", glasses: true, dress: true, top: "#7ab6ff", legs: "#f4c397" },
  FISHER: { hat: "#ffd25a", hair: "#7a5a2a", top: "#3fae62", legs: "#6b4a2a" },
  RIVAL: { hair: "#c9322a", top: "#3a3f52", legs: "#2a2f45" },
  ELM: { hair: "#6b4a2a", glasses: true, dress: true, top: "#ffffff", legs: "#6b4a2a" },
  SCIENTIST: { hair: "#3a6fb0", glasses: true, dress: true, top: "#ffffff", legs: "#6b4a2a" },
  BUG_CATCHER: { hat: "#6fd382", hair: "#6b4a2a", top: "#ffb62e", legs: "#3a6fb0" },
  COOLTRAINER_F: { hair: "#d9604c", dress: true, top: "#ff6b5e", legs: "#f4c397" },
  OTHER: { hair: "#555a6e", top: "#9aa4c8", legs: "#5a5f7a" }, // anyone without a look yet
};
Art.heroSprite = (dir) => Art.person(dir, Art.looks.HERO);
