// Map objects that aren't people (viewBox 60 x 80, same box as Art.person). Keys are the names maps give their objects.
Art.props = {
  // A buddy net bundle: a round woven pouch with a knot on top (stands in for a Poke Ball on the lab table).
  BUDDY_NET: () => `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="64" rx="16" ry="5" fill="#000" opacity=".25"/>
<g stroke="${INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"><circle cx="30" cy="50" r="15" fill="#f2d9a0"/>
<path d="M17 44 Q30 52 43 44 M16 54 Q30 62 44 54 M24 36 Q28 50 24 64 M36 36 Q32 50 36 64" fill="none" stroke-width="2"/>
<path d="M24 36 Q30 28 36 36 Z" fill="#3a8fd9"/><circle cx="30" cy="30" r="4" fill="#ffc93c"/></g></svg>`,
};
