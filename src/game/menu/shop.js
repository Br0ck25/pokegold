// Marts: Game.shop(s, stock) where stock is a list of item keys. BUY / SELL / QUIT like Gold's clerk, quantity picked with left/right.
Game.shop = async (s, stock) => {
  const P = s.G.player, money = () => `${P.money} ${Game.CURRENCY}`;
  // How many? Left/right change it, A confirms, B cancels. Returns 0 for cancel.
  const howMany = async (key, unit, max) => {
    let q = 1;
    for (;;) {
      const r = await s.panel({ title: `${ITEMS[key].name}`, lines: [`You have ${money()}`], rows: [{ label: `x ${q}`, right: `${unit * q} ${Game.CURRENCY}` }], hint: "Left / right to change" });
      if (r.key === "B") return 0;
      if (r.key === "L") q = q > 1 ? q - 1 : max;
      else if (r.key === "R") q = q < max ? q + 1 : 1;
      else return q;
    }
  };
  const buy = async () => {
    for (;;) {
      const r = await s.panel({ title: "BUY", lines: [`You have ${money()}`], rows: stock.map((k) => ({ label: ITEMS[k].name, right: `${ITEMS[k].price} ${Game.CURRENCY}` })) });
      if (r.key === "B") return;
      const key = stock[r.i], price = ITEMS[key].price, max = Math.min(99, Math.floor(P.money / price));
      if (!max) { await s.say("You don't have enough money."); continue; }
      const q = await howMany(key, price, max);
      if (!q) continue;
      if ((await s.confirm(`${ITEMS[key].name} x${q} will be ${price * q} ${Game.CURRENCY}. Okay?`)) !== 0) continue;
      P.money -= price * q;
      s.give(key, q);
      await s.say("Here you are! Thank you!");
    }
  };
  const sell = async () => {
    for (;;) {
      const keys = Object.keys(P.bag).filter((k) => P.bag[k] > 0 && ITEMS[k] && ITEMS[k].price);
      if (!keys.length) { await s.say("You don't have anything to sell."); return; }
      const r = await s.panel({ title: "SELL", lines: [`You have ${money()}`], rows: keys.map((k) => ({ label: ITEMS[k].name, sub: `x${P.bag[k]}`, right: `${ITEMS[k].price >> 1} ${Game.CURRENCY}` })) });
      if (r.key === "B") return;
      const key = keys[r.i], unit = ITEMS[key].price >> 1, q = await howMany(key, unit, P.bag[key]);
      if (!q) continue;
      if ((await s.confirm(`I can pay ${unit * q} ${Game.CURRENCY}. Is that okay?`)) !== 0) continue;
      P.bag[key] -= q;
      P.money += unit * q;
      await s.say(`${s.name} sold the ${ITEMS[key].name}.`);
    }
  };
  await s.say("Welcome! How may I help you?");
  for (;;) {
    const c = await s.choose(["BUY", "SELL", "QUIT"], { c0: 13, r0: 5, cancel: 2 });
    s.G.state.dialogue = null;
    if (c === 0) await buy();
    else if (c === 1) await sell();
    else break;
    s.G.state.panel = null;
  }
  s.G.state.panel = null;
  await s.say("Please come again!");
};
