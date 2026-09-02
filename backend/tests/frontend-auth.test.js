const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const adminSource = fs.readFileSync(path.join(__dirname, "../../frontend/privat/js/api-config.js"), "utf8");
const publicSource = fs.readFileSync(path.join(__dirname, "../../frontend/publik/js/auth-ui.js"), "utf8");
const KEY = "sumorame_admin_session";
const baseTime = Date.UTC(2026, 8, 2, 9);

function token(role = "admin", options = {}) {
  const payload = { id: "test-admin", sid: "test-session", role, type: "admin_access",
    iat: baseTime / 1000, exp: baseTime / 1000 + 8 * 3600, ...options };
  return `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;
}
function stored(accessToken) { return JSON.stringify({ token: accessToken, data: { nama_lengkap: "Test" } }); }
function json(body, status = 200) { return new Response(JSON.stringify(body), { status }); }

function browser(initial = {}) {
  const state = new Map(Object.entries(initial));
  const ids = new Map();
  const events = new Map();
  const windowEvents = new Map();
  let time = baseTime;
  function element() {
    return { style: {}, children: [],
      setAttribute() {},
      appendChild(child) { this.children.push(child); if (child.id) ids.set(child.id, child); },
      append(...children) { children.forEach(c => this.appendChild(c)); },
      replaceChildren(...children) { this.children = []; this.append(...children); },
      remove() { ids.delete(this.id); },
      addEventListener() {},
    };
  }
  const ctx = {
    console, URL, Request, Response, Headers, AbortController,
    Date: class extends Date { static now() { return time; } },
    atob: s => Buffer.from(s, "base64").toString("binary"),
    localStorage: {
      getItem: key => state.get(key) ?? null,
      setItem: (key, value) => state.set(key, String(value)),
      removeItem: key => state.delete(key),
    },
    location: { hostname: "desa.example", origin: "https://desa.example", pathname: "/admin/DashboardAdmin",
      href: "https://desa.example/admin/DashboardAdmin", replace(url) { this.redirect = url; },
      assign(url) { this.redirect = url; } },
    document: { readyState: "loading", visibilityState: "visible", body: element(),
      createElement: element, createTextNode: text => ({ textContent: text }),
      getElementById: id => ids.get(id) || null,
      addEventListener(name, cb) { const list = events.get(name) || []; list.push(cb); events.set(name, list); },
    },
    addEventListener(name, cb) { windowEvents.set(name, cb); },
    setTimeout, clearTimeout, setInterval: () => 1,
    fetch: async (...args) => ctx.network(...args),
    network: async () => json({ success: true }),
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  return { ctx, state, ids,
    loadAdmin: () => vm.runInContext(adminSource, ctx),
    loadPublic: () => vm.runInContext(publicSource, ctx),
    advance(ms) { time += ms; },
    event(name, detail = {}) { for (const fn of events.get(name) || []) fn(detail); },
    storageEvent() { windowEvents.get("storage")?.({ key: KEY }); },
  };
}

test("opening public page as admin does not delete CMS token", () => {
  const t = token(); const b = browser({ token: t, [KEY]: stored(t) });
  b.loadPublic();
  assert.equal(b.ctx.AuthSession.get(), null);
  assert.equal(b.state.get("token"), t);
  assert.ok(b.state.has(KEY));
});

test("warga session migration and logout preserve separate admin session", () => {
  const t = token(); const warga = token("warga");
  const b = browser({ token: warga, [KEY]: stored(t), user_nama: "Warga" });
  b.loadPublic();
  assert.equal(b.ctx.AuthSession.get().token, warga);
  assert.equal(b.state.get("warga_token"), warga);
  assert.equal(b.state.has("token"), false);
  b.ctx.AuthSession.logout();
  assert.equal(b.state.has("warga_token"), false);
  assert.ok(b.state.has(KEY));
});

test("admin compatibility alias preserves a preexisting warga login", () => {
  const t = token(); const warga = token("warga");
  const b = browser({ token: warga, [KEY]: stored(t) });
  b.loadAdmin();
  assert.equal(b.state.get("token"), t);
  assert.equal(b.state.get("warga_token"), warga);
});

test("guest does not get CMS access; old admin tokens require one new login", () => {
  for (const state of [{}, { token: token("warga") }, { token: token() }]) {
    const b = browser(state); b.loadAdmin();
    assert.equal(b.ctx.location.redirect, "/admin/LoginAdmin");
  }
});

test("authenticated fetch replaces captured stale token without touching feature files", async () => {
  const t = token(); const b = browser({ [KEY]: stored(t) });
  const captured = [];
  b.ctx.network = async (input, options) => { captured.push(options); return json({ success: true }); };
  b.loadAdmin();
  await b.ctx.fetch(`${b.ctx.API_BASE_URL}/admin/produk`, { headers: { Authorization: "Bearer old-at-page-load" } });
  assert.equal(captured[0].headers.get("Authorization"), `Bearer ${t}`);
  assert.equal(captured.length, 1);
});

test("requests without auth and third-party requests are not rewritten", async () => {
  const t = token(); const b = browser({ [KEY]: stored(t) }); const received = [];
  b.ctx.network = async (...args) => { received.push(args); return json({}); };
  b.loadAdmin();
  await b.ctx.fetch("https://third-party.example/api/test", { headers: { Authorization: "External key" } });
  await b.ctx.fetch(`${b.ctx.API_BASE_URL}/publik/produk`);
  assert.equal(received[0][1].headers.Authorization, "External key");
  assert.equal(received[1][1], undefined);
});

test("concurrent renewal is single-flight and updates all legacy aliases", async () => {
  const t = token(); const b = browser({ [KEY]: stored(t) });
  const renewed = token("admin", { iat: baseTime / 1000 + 660, exp: baseTime / 1000 + 8 * 3600 + 660 });
  let calls = 0;
  b.ctx.network = async () => { calls++; return json({ success: true, token: renewed, data: { nama_lengkap: "Test" } }); };
  b.loadAdmin(); b.advance(11 * 60000);
  await Promise.all([b.ctx.AdminSession.renew(), b.ctx.AdminSession.renew(), b.ctx.AdminSession.renew()]);
  assert.equal(calls, 1);
  assert.equal(b.state.get("token"), renewed);
  assert.equal(b.ctx.AdminSession.get().token, renewed);
});

test("offline/503 renewal preserves login and form rather than redirecting", async () => {
  for (const mode of ["offline", "503"]) {
    const t = token(); const b = browser({ [KEY]: stored(t) });
    b.ctx.network = async () => { if (mode === "offline") throw new Error("offline"); return json({}, 503); };
    b.loadAdmin(); b.advance(11 * 60000); await b.ctx.AdminSession.renew();
    assert.ok(b.state.has(KEY)); assert.equal(b.ctx.location.redirect, undefined);
    assert.ok(b.ids.has("admin-session-notice"));
  }
});

test("API 403 does not clear session, but 401 does; POST is never replayed", async () => {
  for (const status of [401, 403]) {
    const t = token(); const b = browser({ [KEY]: stored(t) }); let calls = 0;
    b.ctx.network = async () => { calls++; return json({}, status); };
    b.loadAdmin();
    await b.ctx.fetch(`${b.ctx.API_BASE_URL}/informasi`, { method: "POST", headers: { Authorization: `Bearer ${t}` }, body: "test" });
    assert.equal(calls, 1);
    assert.equal(b.state.has(KEY), status !== 401);
    assert.equal(b.ctx.location.redirect, undefined);
  }
});

test("expired token cannot renew and no request leaves browser", async () => {
  const b = browser({ [KEY]: stored(token()) }); let calls = 0;
  b.ctx.network = async () => { calls++; return json({}); };
  b.loadAdmin(); b.advance(9 * 3600 * 1000);
  const res = await b.ctx.fetch(`${b.ctx.API_BASE_URL}/aduan`, { headers: { Authorization: "Bearer stale" } });
  assert.equal(res.status, 401); assert.equal(calls, 0);
});

test("hidden or inactive tabs do not keep renewing indefinitely", async () => {
  const b = browser({ [KEY]: stored(token()) }); let calls = 0;
  b.ctx.network = async () => { calls++; return json({}); };
  b.loadAdmin(); b.advance(11 * 60000); b.ctx.document.visibilityState = "hidden";
  await b.ctx.AdminSession.renew();
  b.ctx.document.visibilityState = "visible"; b.advance(25 * 60000);
  await b.ctx.AdminSession.renew();
  assert.equal(calls, 0);
});

test("delayed renewal after logout cannot resurrect browser session", async () => {
  const b = browser({ [KEY]: stored(token()) }); let finish;
  b.ctx.network = () => new Promise(resolve => { finish = resolve; });
  b.loadAdmin(); b.advance(11 * 60000);
  const renewing = b.ctx.AdminSession.renew();
  b.state.delete(KEY);
  finish(json({ success: true, token: token("admin", { exp: baseTime / 1000 + 9 * 3600 }), data: {} }));
  await renewing;
  assert.equal(b.state.has(KEY), false);
});

test("server-confirmed admin logout preserves warga token; offline logout warns", async () => {
  for (const status of [200, 503]) {
    const warga = token("warga");
    const b = browser({ [KEY]: stored(token()), warga_token: warga });
    b.ctx.network = async () => json({}, status);
    b.loadAdmin(); await b.ctx.AdminSession.logout();
    assert.equal(b.state.get("warga_token"), warga);
    assert.equal(b.state.has(KEY), status !== 200);
    assert.equal(b.ctx.location.redirect, status === 200 ? "/admin/LoginAdmin" : undefined);
  }
});

test("public return URL rejects protocol-relative/backslash redirect tricks", () => {
  const b = browser(); b.loadPublic();
  for (const input of ["//evil.example", "/\\evil.example", "/\nevil.example"]) {
    b.ctx.AuthSession.requireLogin(input);
    assert.equal(b.state.get("redirectAfterLogin"), "/");
  }
  b.ctx.AuthSession.requireLogin("/Aduan");
  assert.equal(b.state.get("redirectAfterLogin"), "/Aduan");
});

test("delayed 401 for an older token cannot delete newer login", async () => {
  const b = browser({ [KEY]: stored(token()) }); let finish;
  b.ctx.network = () => new Promise(resolve => { finish = resolve; });
  b.loadAdmin();
  const request = b.ctx.fetch(`${b.ctx.API_BASE_URL}/ppid`, { headers: { Authorization: "Bearer old" } });
  await new Promise(resolve => setImmediate(resolve));
  const next = token("admin", { sid: "different-session", exp: baseTime / 1000 + 9 * 3600 });
  b.ctx.AdminSession.saveLogin({ token: next, data: {} });
  finish(json({}, 401)); await request;
  assert.equal(b.ctx.AdminSession.get().token, next);
});

test("multipart body and Request options survive auth header replacement", async () => {
  const b = browser({ [KEY]: stored(token()) }); let captured;
  b.ctx.network = async (...args) => { captured = args; return json({}); };
  b.loadAdmin();
  const form = new FormData(); form.append("judul", "test");
  const original = new Request(`${b.ctx.API_BASE_URL}/informasi`, { method: "POST", body: form,
    headers: { Authorization: "Bearer captured-token", "X-Test": "keep" } });
  await b.ctx.fetch(original);
  assert.equal(captured[0], original);
  assert.equal(captured[1].headers.get("X-Test"), "keep");
  assert.match(captured[1].headers.get("Content-Type"), /^multipart\/form-data; boundary=/);
  assert.equal(captured[1].headers.get("Authorization"), `Bearer ${token()}`);
});
