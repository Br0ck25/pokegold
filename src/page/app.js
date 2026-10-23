// Page shell: tiny helpers, the optional account dialog, and the Play button that starts the game (game/start.js).
const $ = (id) => document.getElementById(id);
const setStatus = (text) => ($("status").textContent = text);
const api = (path, options = {}) => fetch(path, { credentials: "same-origin", ...options });

async function ensurePlayer() {
  const res = await api("/api/me");
  if (!res.ok) throw new Error("Could not reach the save server");
  return res.json();
}

$("play").addEventListener("click", async () => {
  $("play").disabled = true;
  try {
    await ensurePlayer();
  } catch (err) {
    setStatus("Playing offline (progress is saved on this device only)");
  }
  $("start").hidden = true;
  $("pad").hidden = false;
  setStatus("Playing");
  Game.boot($("hd"));
});

// Optional account: a username + password that points at the same cloud player as the guest cookie.
const acct = { dlg: $("account"), msg: $("acct-msg") };
async function showAccount() {
  const me = await (await api("/api/me")).json();
  $("account-form").hidden = !!me.username;
  $("account-in").hidden = !me.username;
  $("account-note").textContent = me.username ? `Signed in as ${me.username}. Your game follows you to any device.` : "Optional. Make one to keep your game on any device.";
  acct.msg.textContent = "";
}
async function submitAccount(action) {
  const res = await api(`/api/${action}`, { method: "POST", body: JSON.stringify({ username: $("acct-user").value, password: $("acct-pass").value }) });
  const body = await res.json();
  if (!res.ok) { acct.msg.textContent = body.error; return; }
  $("acct-pass").value = "";
  await showAccount();
  acct.msg.textContent = action === "login" ? "Signed in. Reload to load your saved game." : "Account created.";
}
$("account-btn").addEventListener("click", async () => { await showAccount(); acct.dlg.showModal(); });
$("acct-login").addEventListener("click", () => submitAccount("login"));
$("acct-register").addEventListener("click", () => submitAccount("register"));
$("acct-logout").addEventListener("click", async () => { await api("/api/logout", { method: "POST" }); await showAccount(); acct.msg.textContent = "Signed out. Reload to start as a guest."; });
