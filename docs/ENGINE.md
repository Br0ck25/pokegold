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

## Our twist: buddy nets (replace balls 1:1)
Same math and same tiers as balls, renamed: BUDDY NET (Poke Ball), GREAT NET, ULTRA NET, MASTER NET; the special balls become
specials the same way later. A throw is an arc, the net tangles the buddymon, shakes up to 3 times, then holds or tears.

## Phone-first input
Designed for a phone (Pixel 9). Anywhere the player types (name, nickname, account) we open the device keyboard on a real
`<input>`; no on-screen letter grid. Everything else is touch: pad or gestures, big targets.

## Accounts (optional)
Playing never needs one (a guest cookie holds the save). A username + password (PBKDF2 in the Worker, KV `user:<name>`) just points at
the same player code, so registering keeps the guest's progress and logging in elsewhere brings it along. See `web/src/worker.js`.

## Build order (each step playable)
1. Engine core (done): loop, input, grid movement, collision, turn-first, warps, actors, flags, JSON save (`src/game/`).
2. Start-up flow (done): splash, intro, title, menu, Willow's talk, typed name. Scene 1 (done): bedroom, living room, Mom.
3. New Bark Town (done: outdoor map renderer, neighbor, Willow's lab, starter choice + 5 nets).
4. Route 29 (done: grass, Gold's wild table, ledge, item, berry tree, gate) + wild battles with buddy nets (done: fight, pack, switch, run, catch, exp, level-up, whiteout). Still to do there: the catching tutorial and the egg errand that unlocks nets, trainers, status conditions.
5. Cherrygrove, then onward.

Money is BUDS (3000 at the start, as in Gold). Battle code: `src/game/battle/`, data in `src/game/data/`.
Persistence: save = JSON of flags, party, bag, map, position (device + KV through `/api/save`).
