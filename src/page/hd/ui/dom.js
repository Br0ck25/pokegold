// DOM helpers shared by scenes.
function h(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }

// Night-sky backdrop used behind several scenes.
function sky() { return h(`<div class="sky">${Art.sky()}<i class="glow"></i></div>`); }

// Escape text that came from the player (nicknames) before it goes into markup.
function esc(t) { return String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
const genderTag = (g) => (g === "F" ? '<span class="gender f">♀</span>' : g === "M" ? '<span class="gender m">♂</span>' : "");
