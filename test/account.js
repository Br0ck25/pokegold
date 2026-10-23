#!/usr/bin/env node
// Accounts are optional: guests keep playing; register keeps the guest's saves; login switches to them from a fresh browser.
// Usage: node test/account.js [baseUrl=http://127.0.0.1:8787]
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:8787";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const call = async (page, path, body) => page.evaluate(async ([p, b]) => {
    const res = await fetch(p, b === undefined ? {} : { method: "POST", body: JSON.stringify(b) });
    return { status: res.status, body: await res.json() };
  }, [path, body]);
  let failed = false;
  const check = (name, ok, got) => { if (!ok) { console.error(`FAIL: ${name}`, JSON.stringify(got)); failed = true; } };

  const a = await (await browser.newContext()).newPage();
  await a.goto(base);
  const guest = await call(a, "/api/me");
  check("guest has no username", guest.body.username === null, guest);
  const name = `t${Date.now() % 1e9}`;
  check("short password rejected", (await call(a, "/api/register", { username: name, password: "123" })).status === 400);
  const reg = await call(a, "/api/register", { username: name, password: "secret1" });
  check("register", reg.status === 200, reg);
  const me = await call(a, "/api/me");
  check("account keeps guest code", me.body.code === guest.body.code && me.body.username === name, me);
  check("duplicate name rejected", (await call(a, "/api/register", { username: name, password: "secret1" })).status === 409);

  const b = await (await browser.newContext()).newPage();
  await b.goto(base);
  check("wrong password rejected", (await call(b, "/api/login", { username: name, password: "nope123" })).status === 401);
  check("login", (await call(b, "/api/login", { username: name, password: "secret1" })).status === 200);
  const other = await call(b, "/api/me");
  check("login on another device reaches the same player", other.body.code === guest.body.code, other);
  await call(b, "/api/logout", {});
  const after = await call(b, "/api/me");
  check("logout gives a fresh guest", after.body.username === null && after.body.code !== guest.body.code, after);

  console.log(failed ? "FAILED" : "OK");
  process.exitCode = failed ? 1 : 0;
  await browser.close();
})();
