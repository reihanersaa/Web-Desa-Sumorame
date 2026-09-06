// Run from backend: node --test tests/*.test.js
// No production credentials, real accounts, or external network used.
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
process.env.JWT_SECRET = "test-only-not-a-production-secret";
process.env.NODE_ENV = "test";
process.env.TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
process.env.TURNSTILE_ALLOWED_HOSTNAMES = "localhost";
process.env.AUTH_THROTTLE_SECRET = "test-only-throttle-secret-at-least-32-bytes";

let tables;
let databaseError;
let rpcCalls;
const userId = "11111111-1111-4111-8111-111111111111";
const admin = { id: userId, nik: "1234567890123456", role: "admin", email: "test@example.invalid",
  nama_lengkap: "Petugas Uji", password: bcrypt.hashSync("password-test", 4) };

// Supabase query double: executes all eq/is/gt filters, including revoke races.
const fakeSupabase = {
  async rpc(name) {
    rpcCalls.push(name);
    if (name === "check_login_throttle") return { data: [{ allowed: true, retry_after: 0 }], error: null };
    return { data: null, error: null };
  },
  from(table) {
    let mode = "read", body, single = false;
    const filters = [];
    const q = {
      select() { return q; },
      insert(value) { mode = "insert"; body = value; return q; },
      update(value) { mode = "update"; body = value; return q; },
      eq(key, value) { filters.push(r => r[key] === value); return q; },
      is(key, value) { filters.push(r => (r[key] ?? null) === value); return q; },
      gt(key, value) { filters.push(r => r[key] > value); return q; },
      maybeSingle() { single = true; return q; },
      then(resolve, reject) {
        try {
          if (databaseError) return Promise.resolve({ data: null, error: databaseError }).then(resolve, reject);
          const records = tables[table];
          if (!records) throw Error(`Unexpected table access: ${table}`);
          if (mode === "insert") records.push(...(Array.isArray(body) ? body : [body]).map(r => ({ ...r })));
          const found = records.filter(r => filters.every(f => f(r)));
          if (mode === "update") found.forEach(r => Object.assign(r, body));
          const joined = found.map(r => ({ ...r, users: tables.users.find(u => u.id === r.user_id) }));
          return Promise.resolve({ data: single ? (joined[0] || null) : joined, error: null }).then(resolve, reject);
        } catch (e) { return Promise.reject(e).then(resolve, reject); }
      },
    };
    return q;
  },
};

require.cache[require.resolve("../src/config/supabase")] = { exports: fakeSupabase };
const nativeFetch = global.fetch;
global.fetch = (url, options) => String(url).includes("challenges.cloudflare.com/turnstile/v0/siteverify")
  ? Promise.resolve({ ok: true, json: async () => ({ success: true, hostname: "localhost", action: "test" }) })
  : nativeFetch(url, options);
const service = require("../src/services/adminSessionService");
const controllers = require("../src/controllers/adminAuthController");
const { verifyToken, requireAdmin, requirePosbankumStaff } = require("../src/middleware/authMiddleware");
const realNow = Date.now;
beforeEach(() => {
  Date.now = realNow;
  databaseError = null;
  rpcCalls = [];
  tables = { users: [{ ...admin }], admin_accounts: [{ username: "admin.sumorame", user_id: userId }], admin_sessions: [] };
});

function response() {
  return { statusCode: 200, headers: {}, body: null,
    status(code) { this.statusCode = code; return this; },
    set(k,v) { this.headers[k] = v; return this; },
    json(body) { this.body = body; return this; } };
}

async function authenticate(token) {
  const req = { header: () => token ? `Bearer ${token}` : undefined };
  const res = response();
  let passed = false;
  await verifyToken(req, res, () => { passed = true; });
  return { req, res, passed };
}

test("username normalized, existing password reused, session expires in 8h", async () => {
  const res = response();
  await controllers.loginAdmin({ body: { username: " ADMIN.SUMORAME ", password: "password-test" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.username, "admin.sumorame");
  assert.equal(res.body.data.password, undefined);
  assert.equal(tables.users[0].password, admin.password);
  const claims = jwt.verify(res.body.token, process.env.JWT_SECRET);
  assert.equal(claims.exp - claims.iat, 8 * 3600);
  assert.equal(claims.type, "admin_access");
  assert.equal(tables.admin_sessions.length, 1);
  assert.equal(res.headers["Cache-Control"], "no-store");
  assert.equal((await authenticate(res.body.token)).passed, true);
});

test("NIK-only login, malformed input and wrong passwords rejected", async () => {
  for (const body of [{ nik: admin.nik, password: "password-test" }, { username: {}, password: "x" },
    { username: "admin.sumorame", password: "x".repeat(73) }]) {
    const res = response(); await controllers.loginAdmin({ body }, res); assert.equal(res.statusCode, 400);
  }
  for (const username of ["unknown", "admin.sumorame"]) {
    const res = response();
    const request = {
      body: { username, password: "wrong" },
      loginSecurity: { keys: { all: ["ip:key", "account:key", "pair:key"], limits: [25, 5, 5] } },
    };
    await controllers.loginAdmin(request, res);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, "Username atau password admin salah.");
  }
  assert.equal(rpcCalls.filter((name) => name === "record_login_failure").length, 2);
  assert.equal(tables.admin_sessions.length, 0);
});

test("warga cannot use admin login even if an account mapping exists", async () => {
  tables.users[0].role = "warga";
  const res = response();
  await controllers.loginAdmin({ body: { username: "admin.sumorame", password: "password-test" } }, res);
  assert.equal(res.statusCode, 401);
});

test("active session renews without password; hard 30-day cap applies", async () => {
  const start = realNow();
  const created = await service.createSession(admin);
  Date.now = () => start + 7 * 3600 * 1000;
  try {
    const validated = await service.validateSession(jwt.verify(created.token, process.env.JWT_SECRET));
    const renewed = await service.renewSession(validated);
    const claims = jwt.verify(renewed.token, process.env.JWT_SECRET);
    assert.ok(claims.exp * 1000 > start + 14 * 3600 * 1000);
    assert.equal(claims.sid, validated.session.id);
    // Simulate an otherwise valid session near its hard deadline.
    const nearCap = start + (30 * 24 - 1) * 3600 * 1000;
    Date.now = () => nearCap;
    tables.admin_sessions[0].expires_at = tables.admin_sessions[0].absolute_expires_at;
    const next = await service.renewSession({ session: tables.admin_sessions[0], user: admin });
    assert.equal(next.session.expires_at, created.session.absolute_expires_at);
    Date.now = () => start + 31 * 24 * 3600 * 1000;
    await assert.rejects(() => service.renewSession({ session: tables.admin_sessions[0], user: admin }), { status: 401 });
  } finally { Date.now = realNow; }
});

test("expired JWT, tampered token, absent token and legacy admin JWT are rejected", async () => {
  const legacy = jwt.sign({ id: userId, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "2h" });
  const expired = jwt.sign({ id: userId, role: "admin", exp: 1 }, process.env.JWT_SECRET);
  for (const token of [null, "tampered.invalid.token", legacy, expired]) {
    const result = await authenticate(token);
    assert.equal(result.passed, false); assert.equal(result.res.statusCode, 401);
  }
});

test("logout revokes all tokens for that session; racing renewal cannot resurrect it", async () => {
  const created = await service.createSession(admin);
  const active = await authenticate(created.token);
  const validated = active.req.adminSession;
  const res = response(); await controllers.logoutAdmin(active.req, res);
  assert.equal(res.statusCode, 200);
  assert.equal((await authenticate(created.token)).res.statusCode, 401);
  await assert.rejects(() => service.renewSession(validated), { status: 401 });
});

test("password change and role downgrade invalidate existing sessions", async () => {
  const created = await service.createSession(admin);
  tables.users[0].password = bcrypt.hashSync("new-password", 4);
  assert.equal((await authenticate(created.token)).res.statusCode, 401);
  tables.users[0].password = admin.password;
  tables.users[0].role = "warga";
  assert.equal((await authenticate(created.token)).res.statusCode, 401);
});

test("DB outage fails closed with 503, not an invalid-session 401", async () => {
  const created = await service.createSession(admin);
  databaseError = { code: "TEST_DB_UNAVAILABLE" };
  const failed = await authenticate(created.token);
  assert.equal(failed.res.statusCode, 503); assert.equal(failed.passed, false);
  const res = response();
  await controllers.loginAdmin({ body: { username: "admin.sumorame", password: "password-test" } }, res);
  assert.equal(res.statusCode, 503);
});

test("warga JWT contract unchanged; cannot pass admin role check", async () => {
  const token = jwt.sign({ id: userId, role: "warga", nik: admin.nik }, process.env.JWT_SECRET, { expiresIn: "1d" });
  databaseError = { code: "TEST_DB_UNAVAILABLE" }; // Warga validation does not query admin tables.
  const result = await authenticate(token);
  assert.equal(result.passed, true);
  requireAdmin(result.req, result.res, () => assert.fail("warga reached admin"));
  assert.equal(result.res.statusCode, 403);
});

test("petugas Posbankum gets a valid CMS session without receiving full admin access", async () => {
  tables.users[0].role = "petugas_posbankum";
  const loginResponse = response();
  await controllers.loginAdmin({
    body: { username: "admin.sumorame", password: "password-test" },
  }, loginResponse);
  assert.equal(loginResponse.statusCode, 200);
  assert.equal(loginResponse.body.data.role, "petugas_posbankum");

  const authenticated = await authenticate(loginResponse.body.token);
  assert.equal(authenticated.passed, true);

  let staffPassed = false;
  requirePosbankumStaff(authenticated.req, authenticated.res, () => { staffPassed = true; });
  assert.equal(staffPassed, true);

  const adminResponse = response();
  requireAdmin(authenticated.req, adminResponse, () => assert.fail("petugas reached full admin route"));
  assert.equal(adminResponse.statusCode, 403);
});

test("HTTP routes: login, renewal, logout and revoked JWT round trip", async (t) => {
  const app = require("../index");
  const server = require("node:http").createServer(app);
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  assert.equal((await fetch(`${base}/health`)).status, 200);
  const login = await fetch(`${base}/auth/login-admin`, { method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin.sumorame", password: "password-test", turnstileToken: "XXXX.DUMMY.TOKEN.XXXX" }) });
  assert.equal(login.status, 200);
  const original = await login.json();
  const renewed = await fetch(`${base}/auth/admin/session/renew`, { method: "POST",
    headers: { Authorization: `Bearer ${original.token}` } });
  assert.equal(renewed.status, 200);
  const next = await renewed.json();
  const logout = await fetch(`${base}/auth/admin/session/logout`, { method: "POST",
    headers: { Authorization: `Bearer ${next.token}` } });
  assert.equal(logout.status, 200);
  const replay = await fetch(`${base}/auth/admin/session/renew`, { method: "POST",
    headers: { Authorization: `Bearer ${original.token}` } });
  assert.equal(replay.status, 401);
  assert.equal((await fetch(`${base}/auth/admin/session/renew`, { method: "POST" })).status, 401);
  const warga = jwt.sign({ id: userId, role: "warga" }, process.env.JWT_SECRET, { expiresIn: "1d" });
  assert.equal((await fetch(`${base}/auth/admin/session/renew`, { method: "POST",
    headers: { Authorization: `Bearer ${warga}` } })).status, 403);

  // Akun Posbankum memakai mekanisme sesi yang sama, tetapi otorisasinya tetap terbatas.
  tables.users[0].role = "petugas_posbankum";
  const staffLogin = await fetch(`${base}/auth/login-admin`, { method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin.sumorame", password: "password-test", turnstileToken: "XXXX.DUMMY.TOKEN.XXXX" }) });
  assert.equal(staffLogin.status, 200);
  const staffOriginal = await staffLogin.json();
  const staffRenew = await fetch(`${base}/auth/admin/session/renew`, { method: "POST",
    headers: { Authorization: `Bearer ${staffOriginal.token}` } });
  assert.equal(staffRenew.status, 200);
  const staffNext = await staffRenew.json();
  const staffLogout = await fetch(`${base}/auth/admin/session/logout`, { method: "POST",
    headers: { Authorization: `Bearer ${staffNext.token}` } });
  assert.equal(staffLogout.status, 200);
});
