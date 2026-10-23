// "Brock Family Presents" studio splash (~5.5s, driven by CSS timing from mount).
Scenes.splash = function (root) {
  const word = (text, cls) => [...text].map((c, i) =>
    c === " " ? `<i class="sp"></i>` : `<span class="${cls}" style="--i:${i}">${c}</span>`).join("");
  const el = h(`<div class="scene splash">
    <div class="rays"></div>
    <div class="crest">${Art.badger()}<i class="shine"></i></div>
    <div class="name">${word("BROCK FAMILY", "ltr")}</div>
    <div class="presents">${word("PRESENTS", "pl")}</div>
    ${Array.from({ length: 10 }, (_, i) => `<i class="spark" style="--i:${i}"></i>`).join("")}
  </div>`);
  root.appendChild(el);
  return { update() {} };
};
