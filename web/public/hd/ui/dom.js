// DOM helpers shared by scenes.
function h(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }

// Night-sky backdrop used behind several scenes.
function sky() { return h(`<div class="sky">${Art.sky()}<i class="glow"></i></div>`); }
