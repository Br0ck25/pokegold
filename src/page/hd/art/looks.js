// Who is who: looks for Art.person. NPC keys are SPRITE_* names (see constants/sprite_constants.asm).
Art.looks = {
  HERO: { hat: "#c9322a", hair: "#3a2418", top: "#ffb62e", legs: "#1f3a8a" },
  MOM: { hair: "#6b3d1e", bun: true, dress: true, top: "#ff8fa3", apron: "#fff6dc", legs: "#f4c397" },
  TEACHER: { hair: "#8a5a2b", glasses: true, dress: true, top: "#7ab6ff", legs: "#f4c397" },
  FISHER: { hat: "#ffd25a", hair: "#7a5a2a", top: "#3fae62", legs: "#6b4a2a" },
  RIVAL: { hair: "#c9322a", top: "#3a3f52", legs: "#2a2f45" },
  WILLOW: { hair: "#6b4a2a", glasses: true, dress: true, top: "#ffffff", legs: "#6b4a2a" },
  SCIENTIST: { hair: "#3a6fb0", glasses: true, dress: true, top: "#ffffff", legs: "#6b4a2a" },
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
  OTHER: { hair: "#555a6e", top: "#9aa4c8", legs: "#5a5f7a" }, // anyone without a look yet
};
Art.heroSprite = (dir) => Art.person(dir, Art.looks.HERO);
