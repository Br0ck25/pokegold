// Cloudflare Worker: serves the game page (embedded by build.js) and stores each player's save in KV.
//
//   GET    /api/save         -> the save JSON, 404 if none
//   PUT    /api/save         -> store the save JSON (max 64 KB)
//   DELETE /api/save
//   GET    /api/me           -> { code, username }   username is null for guests
//   POST   /api/register     -> { username }   {username, password}; the account keeps the guest's saves
//   POST   /api/login        -> { username }   {username, password}; switches to the account's saves
//   POST   /api/logout       -> {}             back to a fresh guest
//
// A player is identified by a random 128-bit code kept in an HttpOnly cookie, so playing needs no account.
// An account is just a username + password that points at one such code, so it works from any device.

const SAVE_MAX = 64 * 1024;
const COOKIE = "player";
const CODE_RE = /^[0-9a-f]{32}$/;
const USER_RE = /^[a-z0-9_]{3,20}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env, url);
    return serveEmbedded(url);
  },
};

async function handleApi(request, env, url) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  let code = CODE_RE.test(cookies[COOKIE] || "") ? cookies[COOKIE] : null;
  const headers = new Headers();

  if (url.pathname === "/api/me") {
    if (!code) code = newCode();
    setCookie(headers, code);
    return json({ code, username: await env.SAVES.get(`acct:${code}`) }, 200, headers);
  }

  if (request.method === "POST" && /^\/api\/(register|login|logout)$/.test(url.pathname)) {
    const action = url.pathname.slice(5);
    if (action === "logout") {
      setCookie(headers, newCode());
      return json({}, 200, headers);
    }
    const body = await request.json().catch(() => ({}));
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!USER_RE.test(username)) return json({ error: "Username: 3-20 letters, numbers or _" }, 400);
    const record = JSON.parse((await env.SAVES.get(`user:${username}`)) || "null");
    if (action === "login") {
      if (!record || !(await passwordOk(password, record))) return json({ error: "Wrong username or password" }, 401);
      setCookie(headers, record.code);
      return json({ username }, 200, headers);
    }
    if (password.length < 6) return json({ error: "Password needs at least 6 characters" }, 400);
    if (record) return json({ error: "That username is taken" }, 409);
    if (code && (await env.SAVES.get(`acct:${code}`))) return json({ error: "Already signed in" }, 409);
    code ||= newCode();
    const salt = newCode();
    await env.SAVES.put(`user:${username}`, JSON.stringify({ salt, hash: await hashPassword(password, salt), code }));
    await env.SAVES.put(`acct:${code}`, username);
    setCookie(headers, code);
    return json({ username }, 200, headers);
  }

  if (url.pathname !== "/api/save") return json({ error: "Not found" }, 404);
  if (!code) return json({ error: "No player; call /api/me first" }, 401);
  const key = `save:${code}`;

  switch (request.method) {
    case "GET": {
      const data = await env.SAVES.get(key);
      if (!data) return json({ error: "No save" }, 404);
      return new Response(data, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
    }
    case "PUT": {
      const data = await request.text();
      if (data.length > SAVE_MAX) return json({ error: "Save too large" }, 413);
      try { JSON.parse(data); } catch { return json({ error: "Bad save" }, 400); }
      await env.SAVES.put(key, data);
      return json({ ok: true });
    }
    case "DELETE":
      await env.SAVES.delete(key);
      return json({ ok: true });
    default:
      return json({ error: "Method not allowed" }, 405);
  }
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 100000 }, key, 256);
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function passwordOk(password, record) {
  return (await hashPassword(password, record.salt)) === record.hash;
}

function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function setCookie(headers, code) {
  headers.append(
    "Set-Cookie",
    `${COOKIE}=${code}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Strict`
  );
}

function parseCookies(header) {
  const out = {};
  for (const part of (header || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

function json(body, status = 200, headers = new Headers()) {
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(body), { status, headers });
}

// --- embedded page ----------------------------------------------------------
// build.js prepends `const EMBEDDED = { "/index.html": "...", ... }` (text files as strings, PNG icons as base64).

const TYPES = {
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/manifest+json",
  png: "image/png",
};

function serveEmbedded(url) {
  const path = url.pathname === "/" ? "/index.html" : url.pathname;
  let body = EMBEDDED[path];
  if (body === undefined) return new Response("Not found", { status: 404 });
  if (path.endsWith(".png")) body = Uint8Array.from(atob(body), (c) => c.charCodeAt(0)); // images are embedded as base64
  return new Response(body, { headers: { "Content-Type": TYPES[path.split(".").pop()], "Cache-Control": "no-cache" } });
}
