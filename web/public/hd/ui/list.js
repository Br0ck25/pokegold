// Every row of a bordered list menu: [{ label, selected }]
function listItems(state, firstCol, lastCol, firstRow = 1, lastRow = 11) {
  const items = [];
  for (let r = firstRow; r <= lastRow; r++) {
    const label = HD.text(state, r, firstCol, lastCol).replace(/[▶▷]/g, "").trim();
    const cursor = state.tiles[r * 20 + firstCol - 1] === 0xed;
    if (label && !/^[┌─┐│└┘]+$/.test(label)) items.push({ label, selected: cursor });
  }
  return items;
}
