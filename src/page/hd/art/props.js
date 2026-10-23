// Map objects that aren't people (viewBox 60 x 80, same box as Art.person). Keys are the names maps give their objects.
Art.props = {
  // A buddy net bundle: a round woven pouch with a knot on top (stands in for a Poke Ball on the lab table).
  BUDDY_NET: () => `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="64" rx="16" ry="5" fill="#000" opacity=".25"/>
<g stroke="${INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"><circle cx="30" cy="50" r="15" fill="#f2d9a0"/>
<path d="M17 44 Q30 52 43 44 M16 54 Q30 62 44 54 M24 36 Q28 50 24 64 M36 36 Q32 50 36 64" fill="none" stroke-width="2"/>
<path d="M24 36 Q30 28 36 36 Z" fill="#3a8fd9"/><circle cx="30" cy="30" r="4" fill="#ffc93c"/></g></svg>`,
};

// The net thrown in a catch (viewBox 100 x 100): a woven round net with a drawstring.
Art.net = () => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
<path d="M10 40 Q50 -6 90 40 Q82 86 50 92 Q18 86 10 40Z" fill="rgba(242,217,160,.55)"/>
<path d="M18 30 Q50 52 82 30 M12 48 Q50 70 88 48 M20 66 Q50 84 80 66 M34 14 Q40 52 36 88 M50 8 Q54 52 50 92 M66 14 Q60 52 64 88" fill="none" stroke-width="2"/>
<circle cx="50" cy="8" r="6" fill="#3a8fd9"/></g></svg>`;

Art.props.NOTEBOOK = () => `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><g stroke="${INK}" stroke-width="3" stroke-linejoin="round"><rect x="12" y="36" width="36" height="26" rx="3" fill="#fff6dc" transform="rotate(-6 30 49)"/><path d="M18 44 H42 M18 50 H38" stroke-width="2" stroke-linecap="round"/></g></svg>`;
Art.props.SACK = () => `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="62" rx="15" ry="5" fill="#000" opacity=".25"/>
<g stroke="${INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"><path d="M16 60 Q10 44 22 34 L38 34 Q50 44 44 60 Z" fill="#c9965a"/>
<path d="M22 34 Q30 26 38 34 Z" fill="#b07a42"/><path d="M24 32 L36 32" stroke="#ffc93c" stroke-width="3"/><path d="M26 46 H34" stroke-width="2.4"/></g></svg>`;

Art.props.FRUIT_TREE = () => `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="70" rx="20" ry="6" fill="#000" opacity=".22"/>
<g stroke="${INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"><rect x="25" y="46" width="10" height="24" rx="3" fill="#9a6a3a"/>
<circle cx="30" cy="30" r="24" fill="#2f9b4a"/><circle cx="20" cy="20" r="8" fill="#4fc467" stroke="none"/>
<circle cx="22" cy="34" r="4.5" fill="#ff6b5e" stroke-width="2"/><circle cx="38" cy="26" r="4.5" fill="#ff6b5e" stroke-width="2"/><circle cx="34" cy="40" r="4.5" fill="#ff6b5e" stroke-width="2"/></g></svg>`;
