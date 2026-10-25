#!/bin/bash
# Audit every built map's Gold text against the file that registers it (see tools/goldtext.py --audit). Usage: tools/audit-text.sh [GoldName]
cd "$(dirname "$0")/.."
maps=${1:-$(python3 -c "
import importlib.util,sys
sys.argv=['x']
s=importlib.util.spec_from_file_location('g','tools/gen-terrain.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(' '.join(m.BUILT))" 2>/dev/null | tail -1)}
for g in $maps; do
  files=$(grep -l "\"$g\"" src/game/*.js | tr '\n' ' ')
  printf "%-34s" "$g"; python3 tools/goldtext.py "$g" --audit $files src/game/lib/*.js | tail -1 | sed "s/^$g: //"
done
