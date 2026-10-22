Scenes.clock = function (root) {
  const el = h(`<div class="scene clock">
    <div class="card time" hidden><span class="cap">Time</span><b class="big"></b><span class="sub"></span></div>
    <div class="choice" hidden><button data-v="YES">Yes</button><button data-v="NO">No</button></div>
  </div>`);
  el.prepend(sky());
  el.querySelector(".sky").classList.add("dim");
  root.appendChild(el);
  const dlg = dialogue(el);
  const card = el.querySelector(".time"), choice = el.querySelector(".choice");
  return {
    update(state) {
      dlg.update(state.dialogue);
      let hours = null, minutes = null, day = null;
      for (const row of state.rows) {
        let m;
        if ((m = row.match(/(\d+)\s*o'clock/))) hours = m[1];
        if ((m = row.match(/(\d+)\s*min/))) minutes = m[1];
        if ((m = row.match(/(SUN|MON|TUES|WEDNES|THURS|FRI|SATUR)DAY/))) day = m[0];
      }
      const showCard = hours !== null || minutes !== null;
      card.hidden = !showCard;
      if (showCard) {
        card.querySelector(".big").textContent = minutes !== null ? minutes : hours;
        card.querySelector(".sub").textContent = minutes !== null ? "minutes" : "o'clock";
        card.querySelector(".cap").textContent = day ? day[0] + day.slice(1).toLowerCase() : "Time";
      }
      const yes = state.rows.findIndex((r) => /(^|\s)YES\b/.test(r.replace(/[▶▷]/g, "")));
      choice.hidden = yes < 0;
      if (yes >= 0) {
        const cursorOnYes = state.tiles[yes * 20 + 15] === 0xed || /▶\s*YES/.test(state.rows[yes]);
        choice.children[0].classList.toggle("sel", cursorOnYes);
        choice.children[1].classList.toggle("sel", !cursorOnYes);
      }
    },
  };
};
