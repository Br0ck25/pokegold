# Native engine: how Gold does it, and what we copy

We are replacing the ROM with our own JS engine, scene by scene. Rule: read how Gold does a thing in the asm
(path below) before writing ours. Layouts, story, names and art are original; the rules and feel stay Gold's.

## Overworld (engine/overworld/player_movement.asm)
- Grid of 16px cells ("steps"). One step = 16 frames at 60 fps (~0.27s); bike = 2x. Input is read once per step.
- Tapping a direction you are not facing only turns you (`.CheckTurning`); walking happens when you already face it.
- `.TryStep`: blocked by land permissions (tile collision), then by NPCs. Blocked = bump sound, no move.
- Ledges are one-way jumps (`.TryJump`); water needs Surf; ice slides until blocked.
- Warps (`.CheckWarp`): stepping onto a door cell, or walking off an "edge warp" cell, triggers the warp event.
- After a finished step the game checks, in order: coord events, wild encounter (grass/water cells), trainer sight lines.

## Map data (maps/*.asm, `def_*_events` macros in macros/scripts/maps.asm)
Each map has: size, warp events (x, y -> map, warp#), coord events (x, y, scene -> script), bg events (x, y, kind -> script;
READ = face it and press A, UP/DOWN/LEFT/RIGHT = only from that side, IFSET = visible when a flag is set), object events
(x, y, sprite, movement type, radius, hour window, trainer or script, flag that hides it), scene scripts (a per-map state
number that decides which script runs on entry) and map callbacks (run on load: set tiles/objects from flags).
Ours: one JSON/JS module per map with the same fields.

## Scripts and flags (engine/overworld/scripting.asm)
A script is a list of commands: opentext/writetext/closetext, yesorno, checkevent/setevent/clearevent (named boolean flags),
iftrue/iffalse, applymovement (list of steps for one actor), turnobject, showemote, playmusic, pause, warp, giveitem,
givepoke, loadwildmon/startbattle, special (named hooks). Ours: async JS functions on a small `s` API with the same verbs
(`await s.say(...)`, `s.flag("GOT_STARTER")`, `await s.move(actor, "left", 2)`), so story stays data-like and testable.

## Wild encounters (engine/overworld/wildmons.asm, data/wild/*.asm)
- After each step on grass/water: roll a byte against the map's rate for the time of day (morning/day/night, water separate);
  repel/music/cleanse-tag adjust the rate. Rate 0 = none.
- Species table = 7 slots with fixed probabilities 30/30/20/10/5/4/1 %; level = slot level + 0..4 bumped at 35/30/20/10/5 %
  (land only). Tables are per map and per time of day. Roaming and swarm species override.

## Text and menus
- Dialogue box shows two lines at a time, A to advance, `para` clears, `prompt` waits. Our HD box already does this; we simply
  stop having a width limit. Yes/No is a small popup. Start menu: BUDDYDEX, BUDDYMON, PACK, BUDDYGEAR, name card, SAVE, OPTION, EXIT.

## Battle (engine/battle/core.asm, effect_commands.asm)
- Turn order: priority move first, else higher Speed (ties random). Each side picks fight/pack/switch/run.
- Damage: ((2*L/5+2) * Power * Atk/Def)/50 + 2, x STAB 1.5, x type chart, x critical (by move/focus), then variation 85-100%
  (`BattleCommand_DamageVariation`). Accuracy checks use accuracy/evasion stage multipliers (data/battle/accuracy_multipliers.asm).
- Status: sleep/freeze/burn/poison/paralysis/confusion plus volatile substatuses. Experience on faint, split among participants;
  level-up learns moves and may evolve after battle. Run: speed-based odds.
- Catching (`PokeBallEffect` in engine/items/item_effects.asm):
  `rate = ((3*maxHP - 2*HP) * catchRate * ballMult) / (3*maxHP)`, plus 10 if asleep/frozen, 5 if other status (cap 255);
  catch if a random byte <= rate; otherwise the ball wobbles 0-3 times by how close the roll was (data/battle/wobble_probabilities.asm).
  Master ball always catches. Party full sends the catch to the box.

## Our twist: nets (replaces balls)
Same math, different dress: BUDDY NET (x1), FINE NET (x1.5), STRONG NET (x2), ULTRA NET (x3), plus special nets (Dive net for water,
Night net after dark, Quick net on the first turn). A throw is an arc across the screen, the buddymon is tangled, the net shakes up to
3 times, then holds or tears. Weakening and status still help. Nets are found/bought like balls; the item data is ours.

## Build order (each step playable, old ROM path deleted when its scene is replaced)
1. Engine core: loop, input (existing pad/gestures), grid movement, collision, turn-first, bump, warps, actors, flags, save.
   It emits the same `state` shape the HD scenes already read (x, y, dir, objects, dialogue, boxes), so room/world/dialogue/popups are reused.
2. Scene 1: your room + living room (original layouts, same beats: radio, PC, Mom, Pokegear-equivalent).
3. New Bark Town + Willow's lab + starter choice. 4. Route 29 + wild encounters + battle with nets. 5. Cherrygrove, then onward.
Persistence: save = JSON of flags, party, bag, map, position in KV (replaces the SRAM blob).
