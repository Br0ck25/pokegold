// A full-height list screen over the current scene (state.panel, see game/menu/verbs.js): title, optional big picture, tabs,
// text lines, selectable rows (with optional HP bar and little picture) and a Back button. Rows and Back answer taps through Game.pick.
function panelLayer(parent) {
  const el = h(`<div class="panel-ui" hidden></div>`);
  parent.appendChild(el);
  let last = "";
  el.addEventListener("pointerdown", (e) => {
    const row = e.target.closest("[data-i]");
    if (row) Game.pick(+row.dataset.i);
    else if (e.target.closest(".pn-back")) Game.pick(-1);
  });
  const row = (r, n, sel) => `<li data-i="${n}" class="${n === sel ? "sel" : ""} ${r.dim ? "dim" : ""}">
    ${r.art ? `<span class="pn-art">${Art.creature(r.art)}</span>` : ""}
    <span class="pn-main"><b>${esc(r.label)}${genderTag(r.g)}</b>${r.sub ? `<small>${esc(r.sub)}</small>` : ""}${r.bar !== undefined ? `<i class="pn-bar"><i data-level="${r.bar > 0.5 ? "ok" : r.bar > 0.2 ? "warn" : "low"}" style="width:${Math.round(r.bar * 100)}%"></i></i>` : ""}</span>
    ${r.right ? `<em>${esc(r.right)}</em>` : ""}</li>`;
  return {
    update(p) {
      const key = JSON.stringify(p);
      if (key === last) return;
      last = key;
      el.hidden = !p;
      if (!p) { el.innerHTML = ""; return; }
      el.innerHTML = `<h2>${esc(p.title)}${genderTag(p.g)}</h2>
        ${p.art ? `<div class="pn-hero">${Art.creature(p.art)}</div>` : ""}
        ${p.tabs ? `<div class="pn-tabs">${p.tabs.map((t) => `<span class="${t.sel ? "sel" : ""}">${t.label}</span>`).join("")}</div>` : ""}
        ${(p.lines || []).map((l) => `<p class="pn-line">${l}</p>`).join("")}
        <ul>${p.rows.map((r, n) => row(r, n, p.sel)).join("")}</ul>
        ${p.hint ? `<p class="pn-hint">${p.hint}</p>` : ""}
        <button class="pn-back">Back</button>`;
      const selected = el.querySelector("li.sel");
      if (selected) selected.scrollIntoView({ block: "nearest" });
    },
  };
}
