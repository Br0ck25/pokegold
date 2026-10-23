// List boxes (Start menu, Yes/No, submenus) drawn over a scene from state.boxes; tap a row to answer.
// b.pos "low" puts a box just over the message box, "top" at the top of the screen.
function popups(parent) {
  const el = h(`<div class="popups"></div>`);
  parent.appendChild(el);
  el.addEventListener("pointerdown", (e) => { const li = e.target.closest("li"); if (li) Game.pick(+li.dataset.i); }); // tap a row
  let last = "";
  return {
    update(boxes) {
      const key = JSON.stringify(boxes);
      if (key === last) return;
      last = key;
      el.innerHTML = boxes.map((b) => {
        const low = b.pos === "low", right = b.c0 >= 7;
        return `<ul class="popup ${low ? "low" : "top"} ${right ? "right" : "left"}">${b.rows.map((r, n) =>
          `<li data-i="${n}" class="${r.selected ? "sel" : ""}">${esc(r.text)}</li>`).join("")}</ul>`;
      }).join("");
    },
  };
}
