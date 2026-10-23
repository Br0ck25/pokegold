// Title screen: logo, the three starters and "PRESS START".
Scenes.title = function (root) {
  const el = h(`<div class="scene title">
    <div class="logo">${Art.logo()}</div>
    <div class="trio">
      <div class="mon m1">${Art.bramblet()}</div><div class="mon m2">${Art.sparkit()}</div><div class="mon m3">${Art.chomplet()}</div>
    </div>
    <div class="press">PRESS START</div>
  </div>`);
  el.prepend(sky());
  for (let i = 0; i < 14; i++) {
    const f = h(`<i class="fly" style="left:${(i * 73) % 100}%;top:${48 + ((i * 37) % 40)}%;animation-delay:${(i * 0.7) % 5}s"></i>`);
    el.appendChild(f);
  }
  root.appendChild(el);
  return { update() {} };
};
