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
- Evolutions: level evolutions are in (`menu`-less, battle/evolve.js). Levels, base stats, catch rates and base exp were checked against Gold's `evos_attacks.asm` and `base_stats/*.asm`. Still missing: stones, happiness, trade, and evolve-time move learning; evolved forms' learnsets are ours (Gold's moves mostly do not exist yet) [data/pokemon/evos_attacks.asm].
- Evolved forms (FLUTTERBY, BRAMBLEAF, THORNKING, RAIDER, OUTLAW, CHOMPJAW, GATORMAW, SWOOPLET, SKYHAWK, GNAWLER, SCOUTAT, WEBSPINNER, OWLSAGE) use the procedural placeholder art; draw them.
- PC: BUDDYBOX storage is in (menu/pc.js). Missing: the player's own PC (item storage), PROF. ASPEN's BUDDYDEX rating PC, MOVE BUDDYMON between boxes, box names, nets refused when the box is full is done but the turn is still spent [engine/pokemon/bills_pc.asm, engine/events/pokecenter_pc.asm].
- BuddyGear phone calls / trainer rematches / radio [engine/pokegear/] (the MAP screen is in: art/townmap.js, we only draw what is built).
- Overworld status effects (see polish), Repel, bike, Surf and other field moves, HMs.
- Held items, berries as held items, abilities-free but Gold's catch-time items.
- Shops: only TONIC, REMEDY and BUDDY NET exist; more medicine, GREAT NET, etc.
- Day/night encounter tables exist for Route 29 only.
- Bank of Mom is in (lib/mom.js: get/save/change, a quarter of prizes while saving) but not her phone calls.
- Sound: there is no music or sfx at all.

## World still to build (in Gold's order)
Route 31 -> Violet City (gym, Sprout Tower, Pokecenter, Mart) -> Route 32 -> Ruins of Alph -> Union Cave -> Azalea ... see `maps/` in the old branch.
Also not reachable yet: Route 29's north gate to Route 46, Cherrygrove west road.

## Naming still to do (see CLAUDE.md "World naming")
Evolved forms of the starters and routes' species, other characters, towns beyond Cherrygrove.

## Added with Route 31 / Violet City (still to do there)
- Sprout Tower (3 floors, sages, Elder Li's FLASH) [maps/SproutTower1F-3F.asm]; Violet's door is shut with a message.
- Route 32 (south) and Route 36 (west) are shut with messages. Dark Cave (entrance level) is in without wild buddymon (Gold's table has species we lack), FLASH darkness, ROCK SMASH, Blackthorn and Route 46 exits (shut).
- Violet hidden HYPER TONIC (needs Cut at (36,19)); PP UP and RARE CANDY need Surf (they stand in place, unreachable).
- Kyle's house (trade system), the Center aide's EGG (eggs), nickname house bird, Center 2F (Communication Center).
- Route 31: the sleepy man's MAIL quest (needs Mail), Wade's phone number and rematches (needs BuddyGear phone), Mom's worried call.
- Badges do nothing yet (Gold: ZEPHYRBADGE boosts attack, obeys up to level 20ish, enables FLASH); trainer card shows only the count.
- FALKNER's prize money and class money values are guesses (read data/trainers/attributes.asm).
- Kanto-style nickname: nothing.
- Maps built before tools/goldmap.py (New Bark, Route 29, Route 30, Mr. Buddymon's house; Cherrygrove is already redone) use our own layouts, not Gold's real shapes: redo them from the tool when we revisit.
- Spearlet/Spearhawk, Stinglet (no Kakuna/Beedrill line), Vinebud/Vinewhip (Victreebel needs a LEAF STONE) are partial species lines.
- Wild encounters: Gold's 5-step cooldown on map entry is in; Repel, cleanse tag, music effects and roaming beasts are not. Cooldown is not reset after a battle (check Gold's reloadmap).
- Cherrygrove: the Mystic Water fisher is on an island that needs Surf (his TIDE CHARM is unreachable until then).

## From the Gold audit (all scenes now follow Gold's real maps)
- Interiors without bespoke art (bedroom, marts, gates, Mr. Buddymon's house, Route 29 gate) are drawn generically from the collision (art/roomGrid.js): props like
  the Mr. Buddymon desk, gate counters and mart shelves are plain; hand-draw them when we polish.
- Bedroom: Gold shows the console, dolls and poster only once placed with the decoration system (not built), so the room has none (the player asked for no dolls).
- The berry house (Route 30), Route 27/36/32/46, Sprout Tower: closed with a message.
- Hidden items behind Cut/Surf (Violet HYPER TONIC etc.) are placed but unreachable; reach.js skips signs marked `needs`.
- Wild tables are only checked by hand against data/wild/johto_grass.asm; a generator like terrain.js would stop drift.

## Added with landscape / gender / animations
- Landscape: only battle has a wide-screen layout; world, menus and panels just scale (check them in test/out/landscape-*.png when you touch them).
- Move animations are simplified shapes, not Gold's frame-by-frame sprites; every move has one, new moves need an `anim`.
- Girl hero: sprite and portrait only (no other girl-specific text yet; Crystal also changes a few lines).
- `wrangler.toml` name is still `buddymon-gold` (renaming it would create a new Worker/URL); change it when the user wants a new URL.

## Gold text we still skip (test/text-allow.json is the exact allowance; it may only go down)
- Willow's lab: TOGEPI egg / EVERSTONE / MASTER BALL / S.S. TICKET scenes (need eggs, held items, Rising Badge, the Elite Four). Violet Center: the aide who gives the egg.
- Route 31 MAIL quest (needs Mail + holding items), Mr. Buddymon's RED SCALE trade, Academy stickers, nickname-house bird, New Bark's Mr. Chrono, Elm's house food signs.
- Phone-number asking after trainer fights (needs the BuddyGear phone).

## Gold-ness checks we do not have yet
- `tools/goldtext.py` knows Gold's trainer parties; `trainer` objects in our maps are still typed by hand (compare them in test/gold.js when we next touch trainers).
- Rival's later fights, Gold's trainer prize money (class money table), and NPC palettes (Gold's PAL_NPC_*: we vary clothes per person from their id instead).
- "Cutscene bodies": cutscene portraits are busts; Gold shows full sprites in scenes (nothing to do unless it looks wrong).
- Surfing encounters: Gold adds 0-4 to the table level only on water (ChooseWildEncounter); add it with Surf.
