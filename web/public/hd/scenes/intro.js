// Opening cinematic: four 6s acts (sea, meadow, night, finale) timed by CSS from mount.
// The ROM waits INTRO_FRAMES (engine/movie/hd_intro.asm) then moves on, so keep it <= 25s.
Scenes.intro = function (root) {
  const many = (n, make) => Array.from({ length: n }, (_, i) => make(i)).join("");
  const el = h(`<div class="scene intro">
    <div class="act" style="--i:0">${Art.introSea()}
      <div class="swim s1">${Art.chomplet()}</div><div class="swim s2">${Art.chomplet()}</div><div class="swim s3">${Art.chomplet()}</div>
      ${many(14, (i) => `<i class="bub" style="--x:${(i * 71) % 96}cqw;--d:${(i % 5) * 0.7}s;--s:${1.4 + (i % 4)}cqw"></i>`)}
      <p class="cap">Out in the deep blue…</p></div>
    <div class="act" style="--i:1">${Art.introMeadow()}
      <div class="roll"><div>${Art.bramblet()}</div></div>
      <p class="cap">…across the green meadows…</p></div>
    <div class="act" style="--i:2"><div class="nightbg"></div>
      <div class="pop">${Art.sparkit()}</div>
      ${many(18, (i) => `<i class="ember" style="--x:${30 + ((i * 23) % 40)}cqw;--d:${(i % 6) * 0.45}s"></i>`)}
      <p class="cap">…under a golden moon…</p></div>
    <div class="act" style="--i:3"><div class="burst"></div>
      <div class="jump j1">${Art.bramblet()}</div><div class="jump j2">${Art.sparkit()}</div><div class="jump j3">${Art.chomplet()}</div>
      <p class="cap big">…your adventure begins!</p></div>
    <div class="skip">Press any button to skip</div>
  </div>`);
  el.querySelector(".nightbg").appendChild(h(`<div class="sky">${Art.sky()}</div>`));
  root.appendChild(el);
  return { update() {} };
};
