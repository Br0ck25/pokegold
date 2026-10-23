# Backlog: known gaps and small polish items
Keep this current. Add an item the moment you notice a gap; delete it (and say so in the commit) when it is done. Gold file in brackets = where to read first.

## Small polish
- Poison does not hurt you while walking in the overworld (Gold: 1 HP every 4 steps, faints show a message) [engine/events/poisonstep.asm].
- Nothing inflicts freeze yet (no move or effect uses `frz`); add an ice move when a species needs it.
- EMBER PUFF is defined but no species learns it.
- Poison/burn residual and sleep are only unit-tested; no UI test checks the "hurt by poison" message order.
- Battle messages: if "my attack failed" shows up again, get the move and exact text (could not reproduce).
- Credits screen text is still the old ROM-era wording (if it exists in the native engine; check).

## Systems missing vs Gold
- Evolutions (level, stone, happiness, trade) [engine/pokemon/evolve.asm, data/pokemon/evos_attacks.asm].
- PC storage in the Center (boxes already collect overflow catches, but nothing opens them) [engine/pc/bills_pc.asm].
- BuddyGear map screen and phone calls / trainer rematches [engine/pokegear/].
- Overworld status effects (see polish), Repel, bike, Surf and other field moves, HMs.
- Held items, berries as held items, abilities-free but Gold's catch-time items.
- Shops: only TONIC, REMEDY and BUDDY NET exist; more medicine, GREAT NET, etc.
- Day/night encounter tables exist for Route 29 only.
- Mom's "talk to Mom" beat and money keeping; Joey's "important battle" scene; the Tuscany/Tuesday NPC.
- Sound: there is no music or sfx at all.

## World still to build (in Gold's order)
Route 31 -> Violet City (gym, Sprout Tower, Pokecenter, Mart) -> Route 32 -> Ruins of Alph -> Union Cave -> Azalea ... see `maps/` in the old branch.
Also not reachable yet: Route 29's north gate to Route 46, Cherrygrove west road.

## Naming still to do (see CLAUDE.md "World naming")
Evolved forms of the starters and routes' species, other characters, towns beyond Cherrygrove.
