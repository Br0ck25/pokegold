// Menu boxes (Start menu, Yes/No) read from the tilemap, drawn as HD panels over a scene.
// Anchored by where the game put them: boxes ending above the dialogue sit just over it, the rest stay at the top.
function popups(parent) {
  const el = h(`<div class="popups"></div>`);
  parent.appendChild(el);
  let last = "";
  return {
    update(boxes) {
      const key = JSON.stringify(boxes);
      if (key === last) return;
      last = key;
      el.innerHTML = boxes.map((b) => {
        const low = b.r0 >= 5 && b.r1 <= 12, right = b.c0 >= 7;
        return `<ul class="popup ${low ? "low" : "top"} ${right ? "right" : "left"}">${b.rows.map((r) =>
          `<li class="${r.selected ? "sel" : ""}">${r.text}</li>`).join("")}</ul>`;
      }).join("");
    },
  };
}
