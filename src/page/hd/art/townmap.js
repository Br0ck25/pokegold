// The MAP CARD's map of Johto, as far as the game goes: towns as little squares joined by routes, a blinking dot where you are (viewBox 200 x 130).
// Art.townMap(mapKey) draws it; Art.townMapPlace(mapKey) names the place. Places not built yet are drawn dim with a "?".
Art.townMap = (() => {
  const PLACES = {
    NEWBARK: { name: "NEW BARK TOWN", x: 172, y: 96, keys: /^(newbark|bedroom|livingroom|willow|neighbor)/ },
    ROUTE29: { name: "ROUTE 29", x: 148, y: 96, keys: /^(route29|gate29)/, route: true },
    CHERRYGROVE: { name: "CHERRYGROVE CITY", x: 120, y: 96, keys: /^(cherrygrove|cg)/ },
    ROUTE30: { name: "ROUTE 30", x: 120, y: 76, keys: /^(route30|mrbuddy)/, route: true },
    ROUTE31: { name: "ROUTE 31", x: 100, y: 56, keys: /^(route31|gate31|darkcave)/, route: true },
    VIOLET: { name: "VIOLET CITY", x: 76, y: 56, keys: /^(violet|vmart|vcenter|vnickname|academy)/ },
    SPROUT: { name: "SPROUT TOWER", x: 76, y: 30, keys: /^sprout/, later: true },
    AZALEA: { name: "AZALEA TOWN", x: 50, y: 96, keys: /^azalea/, later: true },
    GOLDENROD: { name: "GOLDENROD CITY", x: 50, y: 70, keys: /^goldenrod/, later: true },
  };
  const LINKS = [["NEWBARK", "ROUTE29"], ["ROUTE29", "CHERRYGROVE"], ["CHERRYGROVE", "ROUTE30"], ["ROUTE30", "ROUTE31"], ["ROUTE31", "VIOLET"], ["VIOLET", "SPROUT"], ["VIOLET", "GOLDENROD"], ["CHERRYGROVE", "AZALEA"]];
  const find = (key) => Object.keys(PLACES).find((k) => PLACES[k].keys.test(key));
  Art.townMapPlace = (key) => (PLACES[find(key)] || {}).name;
  return (key) => {
    const at = find(key);
    const links = LINKS.map(([a, b]) => `<path d="M${PLACES[a].x} ${PLACES[a].y} L${PLACES[b].x} ${PLACES[b].y}" stroke="${PLACES[a].later || PLACES[b].later ? "#b8a98c" : "#f2d9a0"}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${PLACES[a].later || PLACES[b].later ? "3 6" : "none"}"/>`).join("");
    const dots = Object.entries(PLACES).map(([id, p]) => p.route
      ? `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#f2d9a0"/>`
      : `<rect x="${p.x - 7}" y="${p.y - 7}" width="14" height="14" rx="3" fill="${p.later ? "#8a8070" : "#e0523c"}" stroke="${INK}" stroke-width="2"/>${p.later ? `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="10" fill="#fff" font-family="Fredoka,sans-serif">?</text>` : ""}`).join("");
    const label = (p) => `<text x="${p.x}" y="${p.y + 20}" text-anchor="middle" font-size="7" font-weight="700" fill="${INK}" font-family="Fredoka,sans-serif">${p.name.replace(" TOWN", "").replace(" CITY", "")}</text>`;
    const here = at ? `<g><circle cx="${PLACES[at].x}" cy="${PLACES[at].y}" r="9" fill="none" stroke="#ffc93c" stroke-width="3"><animate attributeName="r" values="7;13;7" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;.3;1" dur="1.2s" repeatCount="indefinite"/></circle><circle cx="${PLACES[at].x}" cy="${PLACES[at].y}" r="4" fill="#ffc93c" stroke="${INK}" stroke-width="2"/></g>` : "";
    return `<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><rect width="200" height="130" rx="10" fill="#4fb6d9"/><path d="M14 20 L112 14 L190 40 L196 112 L120 122 L30 116 L8 70Z" fill="#8fd36f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>${links}${dots}${Object.values(PLACES).filter((p) => !p.route).map(label).join("")}${here}</svg>`;
  };
})();
