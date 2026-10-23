// Bottom text box fed by state.dialogue (see core/engine.js).
function dialogue(parent, tag) {
  const el = h(`<div class="dlg" hidden>${tag ? `<div class="dlg-tag">${tag}</div>` : ""}<p class="l1"></p><p class="l2"></p><span class="more">▼</span></div>`);
  parent.appendChild(el);
  return {
    el,
    setTag(t) { const tg = el.querySelector(".dlg-tag"); if (tg) tg.textContent = t; },
    update(d) {
      el.hidden = !d;
      if (!d) return;
      // Native engine sends one paragraph (`text`) and lets it wrap; the ROM sends two fixed lines.
      el.querySelector(".l1").textContent = d.text ?? d.lines[0];
      el.querySelector(".l2").textContent = d.text ? "" : d.lines[1];
      el.querySelector(".more").style.visibility = d.more ? "visible" : "hidden";
    },
  };
}

