"use strict";
// One function per redrawn screen. Each builds its DOM once and returns
// { update(state), destroy() }; update runs ~30 times a second with fresh game state.

const Scenes = (() => {
  const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };

  const LABELS = { "CONTINUE": "Continue", "NEW GAME": "New Game", "OPTION": "Options", "MYSTERY GIFT": "Mystery Gift" };
  const SPECIES_ART = { 152: "bramblet", 155: "sparkit", 158: "chomplet" };

  function dialogue(parent, tag) {
    const el = h(`<div class="dlg" hidden>${tag ? `<div class="dlg-tag">${tag}</div>` : ""}<p class="l1"></p><p class="l2"></p><span class="more">▼</span></div>`);
    parent.appendChild(el);
    return {
      el,
      setTag(t) { const tg = el.querySelector(".dlg-tag"); if (tg) tg.textContent = t; },
      update(d) {
        el.hidden = !d;
        if (!d) return;
        el.querySelector(".l1").textContent = d.lines[0];
        el.querySelector(".l2").textContent = d.lines[1];
        el.querySelector(".more").style.visibility = d.more ? "visible" : "hidden";
      },
    };
  }

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

  const sky = () => h(`<div class="sky">${Art.sky()}<i class="glow"></i></div>`);

  return {
    title(root) {
      const el = h(`<div class="scene title">
        <div class="logo">${Art.logo()}</div>
        <div class="trio">
          <div class="mon m1">${Art.bramblet()}</div><div class="mon m2">${Art.sparkit()}</div><div class="mon m3">${Art.chomplet()}</div>
        </div>
        <div class="press">PRESS START</div>
      </div>`);
      el.prepend(sky());
      for (let i = 0; i < 14; i++) {
        const f = h(`<i class="fly" style="left:${(i * 73) % 100}%;top:${48 + ((i * 37) % 40)}%;animation-delay:${(i * 0.7) % 5}s"></i>`);
        el.appendChild(f);
      }
      root.appendChild(el);
      return { update() {} };
    },

    menu(root) {
      const el = h(`<div class="scene menu">
        <div class="logo small">${Art.logo()}</div>
        <ul class="menu-list"></ul>
        <div class="chip" hidden></div>
      </div>`);
      el.prepend(sky());
      root.appendChild(el);
      const list = el.querySelector("ul"), chip = el.querySelector(".chip");
      let last = "";
      return {
        update(state) {
          const items = listItems(state, 2, 14, 1, 10);
          const info = [13, 14, 15, 16, 17].map((r) => HD.text(state, r, 1, 19).replace(/[┌─┐│└┘]/g, "").trim()).filter(Boolean);
          const key = JSON.stringify([items, info]);
          if (key === last) return;
          last = key;
          list.innerHTML = items.map((i) => `<li class="${i.selected ? "sel" : ""}"><b></b>${LABELS[i.label] || i.label}</li>`).join("");
          chip.hidden = !info.length;
          chip.textContent = info.join("  ");
        },
      };
    },

    clock(root) {
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
    },

    prof(root, flags) {
      const el = h(`<div class="scene prof">
        <div class="lab"></div>
        <div class="portrait"></div>
        <div class="creature" hidden></div>
      </div>`);
      el.prepend(h(`<div class="sky warm"></div>`));
      root.appendChild(el);
      const dlg = dialogue(el, "PROF. WILLOW");
      const portrait = el.querySelector(".portrait"), creature = el.querySelector(".creature");
      let who = null, shown = null;
      return {
        update(state) {
          const nextWho = flags.seenNaming ? "hero" : "professor";
          if (nextWho !== who) {
            who = nextWho;
            portrait.innerHTML = Art[who]();
            dlg.setTag(who === "hero" ? (state.name || "YOU") : "PROF. WILLOW");
          }
          dlg.update(state.dialogue);
          const art = SPECIES_ART[state.species] || null;
          if (art !== shown) {
            shown = art;
            creature.hidden = !art;
            creature.innerHTML = art ? Art[art]() : "";
          }
        },
      };
    },

    names(root) {
      const el = h(`<div class="scene names">
        <div class="portrait">${Art.hero()}</div>
        <div class="panel"><h2>What's your name?</h2><ul></ul></div>
      </div>`);
      el.prepend(h(`<div class="sky warm"></div>`));
      root.appendChild(el);
      const ul = el.querySelector("ul");
      let last = "";
      return {
        update(state) {
          const items = listItems(state, 2, 10, 1, 11);
          const key = JSON.stringify(items);
          if (key === last) return;
          last = key;
          ul.innerHTML = items.map((i) => `<li class="${i.selected ? "sel" : ""}">${i.label === "NEW NAME" ? "New name…" : i.label}</li>`).join("");
        },
      };
    },

    naming(root) {
      const el = h(`<div class="scene naming">
        <div class="portrait">${Art.hero()}</div>
        <div class="entry"><h2>Your name?</h2><div class="slots"></div></div>
        <div class="kb"></div>
      </div>`);
      el.prepend(h(`<div class="sky warm"></div>`));
      root.appendChild(el);
      const slots = el.querySelector(".slots"), kb = el.querySelector(".kb");
      let last = "";
      return {
        update(state) {
          const firstCol = Math.min(...HD.cells(state, 8).map((c) => c.col));
          const grid = [8, 10, 12, 14].map((r) => {
            const row = Array(9).fill("");
            for (const { col, ch } of HD.cells(state, r)) {
              const i = Math.round((col - firstCol) / 2);
              if (i >= 0 && i < 9) row[i] = ch;
            }
            return row;
          });
          const bottom = HD.text(state, 16, 1, 19);
          const typed = HD.text(state, 6, 3, 19).replace(/\s+/g, "");
          const cur = state.naming || { col: -1, row: -1, max: 7 };
          const key = JSON.stringify([grid, bottom, typed, cur]);
          if (key === last) return;
          last = key;
          slots.innerHTML = Array.from({ length: cur.max || 7 }, (_, i) =>
            `<span class="${i === typed.length ? "on" : ""}">${typed[i] || ""}</span>`).join("");
          const bottomSel = cur.row === 4 ? (cur.col < 3 ? 0 : cur.col < 6 ? 1 : 2) : -1;
          const lower = /^\s*upper/i.test(bottom) ? "ABC" : "abc";
          kb.innerHTML = grid.map((row, r) => row.map((ch, c) =>
            ch ? `<b class="${cur.row === r && cur.col === c ? "sel" : ""}">${ch}</b>` : `<b class="gap"></b>`).join("")).join("") +
            [lower === "abc" ? "abc" : "ABC", "Delete", "Done"].map((t, i) => `<em class="wide ${bottomSel === i ? "sel" : ""}">${t}</em>`).join("");
        },
      };
    },

    room(root) {
      const el = h(`<div class="scene room">
        <div class="vignette"></div>
        <div class="room-wrap">${Art.room()}<div class="hero"></div></div>
        <div class="loc">Home · Your Room</div>
      </div>`);
      root.appendChild(el);
      const hero = el.querySelector(".hero");
      const dlg = dialogue(el);
      let dir = -1, px = null, py = null, walkUntil = 0;
      const place = (x, y) => {
        hero.style.left = `${((x * 100 + 50 + 20) / 840) * 100}%`;
        hero.style.top = `${((y * 100 + 92 + 20) / 640) * 100}%`;
      };
      return {
        update(state) {
          if (state.dir !== dir) { dir = state.dir; hero.innerHTML = Art.heroSprite(dir); }
          if (state.x !== px || state.y !== py) {
            if (px !== null) walkUntil = performance.now() + 220;
            px = state.x; py = state.y;
            place(px, py);
          }
          hero.classList.toggle("walk", performance.now() < walkUntil);
          dlg.update(state.dialogue);
        },
      };
    },
  };
})();
