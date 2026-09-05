const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

process.env.NODE_ENV = "production";
process.env.TURNSTILE_SITE_KEY = "site-key-test";
process.env.TURNSTILE_SECRET_KEY = "secret-key-test";
process.env.TURNSTILE_ALLOWED_HOSTNAMES = "ppid-sumoramedesa.id,www.ppid-sumoramedesa.id";
process.env.AUTH_THROTTLE_SECRET = "test-throttle-secret-that-is-longer-than-32-bytes";

const state = new Map();
let now = 1_800_000_000_000;
const fakeSupabase = {
  async rpc(name, params) {
    if (name === "check_login_throttle") {
      const remaining = Math.max(0, ...params.p_keys.map((key) => Math.ceil(((state.get(key)?.blockedUntil || 0) - now) / 1000)));
      return { data: [{ allowed: remaining <= 0, retry_after: remaining }], error: null };
    }
    if (name === "record_login_failure") {
      params.p_keys.forEach((key, index) => {
        const old = state.get(key);
        const fresh = !old || now - old.started >= params.p_block_seconds * 1000;
        const count = fresh ? 1 : old.count + 1;
        state.set(key, { count, started: fresh ? now : old.started,
          blockedUntil: count >= params.p_limits[index] ? now + params.p_block_seconds * 1000 : old?.blockedUntil || 0 });
      });
      return { data: null, error: null };
    }
    if (name === "clear_login_failures") {
      params.p_keys.forEach((key) => state.delete(key));
      return { data: null, error: null };
    }
    return { data: null, error: new Error("unknown rpc") };
  },
};
require.cache[require.resolve("../src/config/supabase")] = { exports: fakeSupabase };
const security = require("../src/services/loginSecurityService");
const { loginThrottle, requireTurnstile } = require("../src/middleware/loginSecurityMiddleware");
const { validateApplication } = require("../src/services/persuratanValidationService");
const nativeFetch = global.fetch;
beforeEach(() => { state.clear(); now = 1_800_000_000_000; });
after(() => { global.fetch = nativeFetch; });

function req(body = {}, ip = "203.0.113.10") { return { body, ip, socket: {} }; }
function res() {
  return { statusCode: 200, headers: {}, body: null,
    set(key, value) { this.headers[key] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; } };
}

test("identifiers are HMACed; account/pair block after 5 failures for 2 minutes", async () => {
  const request = req({ nik: "3515135552450008" });
  const keys = security.buildKeys(request, "warga");
  assert.equal(keys.limits.join(","), "25,5,5");
  assert.ok(keys.all.every((key) => !key.includes(request.body.nik) && !key.includes(request.ip)));
  for (let i = 0; i < 5; i += 1) {
    assert.equal((await security.checkLimit(keys)).allowed, true);
    await security.recordFailure(keys);
  }
  const blocked = await security.checkLimit(keys);
  assert.equal(blocked.allowed, false); assert.equal(blocked.retry_after, 120);
  now += 120_000;
  assert.equal((await security.checkLimit(keys)).allowed, true);
});

test("different accounts share a safer 25-failure IP limit", async () => {
  for (let i = 0; i < 25; i += 1) {
    const keys = security.buildKeys(req({ username: `admin${i}` }), "admin");
    await security.recordFailure(keys);
  }
  const next = security.buildKeys(req({ username: "another" }), "admin");
  assert.equal((await security.checkLimit(next)).allowed, false);
});

test("successful login clears account/pair but not shared IP history", async () => {
  const keys = security.buildKeys(req({ username: "admin.sumorame" }), "admin");
  await security.recordFailure(keys); await security.clearSuccessfulAccount(keys);
  assert.ok(state.has(keys.all[0])); assert.equal(state.has(keys.all[1]), false); assert.equal(state.has(keys.all[2]), false);
});

test("throttle middleware returns 429 with Retry-After and fails closed on RPC error", async () => {
  const request = req({ username: "admin.sumorame" });
  const keys = security.buildKeys(request, "admin");
  for (let i = 0; i < 5; i += 1) await security.recordFailure(keys);
  const response = res(); let passed = false;
  await loginThrottle("admin")(request, response, () => { passed = true; });
  assert.equal(passed, false); assert.equal(response.statusCode, 429); assert.equal(response.headers["Retry-After"], "120");
  const original = fakeSupabase.rpc; fakeSupabase.rpc = async () => ({ data: null, error: new Error("offline") });
  const unavailable = res(); await loginThrottle("admin")(req({ username: "x" }), unavailable, () => {});
  assert.equal(unavailable.statusCode, 503); fakeSupabase.rpc = original;
});

test("Turnstile verifies secret server-side, remote IP, action and hostname", async () => {
  let sent;
  global.fetch = async (url, options) => {
    sent = { url, options, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ success: true, action: "login_admin", hostname: "ppid-sumoramedesa.id" }) };
  };
  const result = await security.verifyTurnstileToken("valid-token", "203.0.113.10", "login_admin");
  assert.equal(result.valid, true); assert.equal(sent.body.secret, "secret-key-test"); assert.equal(sent.body.remoteip, "203.0.113.10");
  assert.match(sent.url, /challenges\.cloudflare\.com/); assert.ok(sent.body.idempotency_key);
});

test("Turnstile rejects missing/oversized token, wrong action, hostname and challenge failure", async () => {
  assert.equal((await security.verifyTurnstileToken("", "ip", "login_admin")).valid, false);
  assert.equal((await security.verifyTurnstileToken("x".repeat(2049), "ip", "login_admin")).valid, false);
  for (const payload of [
    { success: true, action: "login_warga", hostname: "ppid-sumoramedesa.id" },
    { success: true, action: "login_admin", hostname: "evil.example" },
    { success: false, "error-codes": ["timeout-or-duplicate"] },
  ]) {
    global.fetch = async () => ({ ok: true, json: async () => payload });
    assert.equal((await security.verifyTurnstileToken("token", "ip", "login_admin")).valid, false);
  }
});

test("Siteverify retry reuses one idempotency key", async () => {
  const ids = []; let calls = 0;
  global.fetch = async (_, options) => {
    ids.push(JSON.parse(options.body).idempotency_key);
    if (++calls === 1) throw new Error("network");
    return { ok: true, json: async () => ({ success: true, action: "login_warga", hostname: "www.ppid-sumoramedesa.id" }) };
  };
  assert.equal((await security.verifyTurnstileToken("token", "ip", "login_warga")).valid, true);
  assert.equal(calls, 2); assert.equal(ids[0], ids[1]);
});

test("Turnstile middleware strips token and does not reach login on invalid challenge", async () => {
  global.fetch = async () => ({ ok: true, json: async () => ({ success: false }) });
  const request = req({ username: "admin", turnstileToken: "bad" }); const response = res(); let passed = false;
  await requireTurnstile("login_admin")(request, response, () => { passed = true; });
  assert.equal(passed, false); assert.equal(response.statusCode, 400); assert.equal(request.body.turnstileToken, undefined);
});

function validDomisili() {
  return { nik: "3515135552450008", nama: "D'Agus Pratama", kota: "Sidoarjo", tgl: "01-01-2000",
    agama: "Islam", nohp: "081234567890", email: "WARGA@example.com", jk: "Laki-laki", status: "Kawin",
    pekerjaan: "Wiraswasta", alamat: "Jl. Mawar No. 1; RT 02", warga: "Indonesia" };
}

test("persuratan accepts legitimate punctuation but normalizes and validates every field", () => {
  const result = validateApplication({ jenis_surat: "domisili", data_form: validDomisili(), authenticatedNik: "3515135552450008" });
  assert.equal(result.valid, true); assert.equal(result.clean.nama, "D'Agus Pratama");
  assert.equal(result.clean.alamat, "Jl. Mawar No. 1; RT 02"); assert.equal(result.clean.email, "warga@example.com");
});

test("persuratan rejects injection-like markup/comments, extra fields, bad dates and NIK spoofing", () => {
  for (const change of [
    { nama: "<script>alert(1)</script>" }, { alamat: "x' OR 1=1 --" }, { tgl: "31-02-2020" }, { extra: "field" },
  ]) {
    assert.equal(validateApplication({ jenis_surat: "domisili", data_form: { ...validDomisili(), ...change }, authenticatedNik: "3515135552450008" }).valid, false);
  }
  assert.equal(validateApplication({ jenis_surat: "domisili", data_form: validDomisili(), authenticatedNik: "0000000000000000" }).valid, false);
  assert.equal(validateApplication({ jenis_surat: "unknown", data_form: validDomisili(), authenticatedNik: "3515135552450008" }).valid, false);
});

test("frontend wiring sends Turnstile token and does not expose secret", () => {
  const files = ["publik/login.html", "privat/LoginAdmin.html", "publik/js/login.js", "privat/js/LoginAdmin.js", "publik/js/login-security.js"];
  const content = files.map((file) => fs.readFileSync(path.resolve(__dirname, "../../frontend", file), "utf8")).join("\n");
  assert.match(content, /turnstileToken/); assert.match(content, /login_warga/); assert.match(content, /login_admin/);
  assert.doesNotMatch(content, /TURNSTILE_SECRET_KEY|secret-key-test/);
  assert.match(content, /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/);
});

test("migration is RLS-protected and exposes RPC only to service_role", () => {
  const sql = fs.readFileSync(path.resolve(__dirname, "../supabase/migrations/20260905_login_throttle.sql"), "utf8");
  assert.match(sql, /ENABLE ROW LEVEL SECURITY/); assert.match(sql, /SECURITY DEFINER SET search_path = pg_catalog, public/g);
  assert.match(sql, /REVOKE ALL ON TABLE public\.login_throttle FROM PUBLIC, anon, authenticated/);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.check_login_throttle\(text\[\]\) TO service_role/);
});

test("Posbankum migration grants only backend access and replaces only the users.role check", () => {
  const sql = fs.readFileSync(
    path.resolve(__dirname, "../supabase/migrations/20260905_posbankum.sql"),
    "utf8",
  );
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all privileges on table public\.posbankum_pengaduan from anon, authenticated/i);
  assert.match(sql, /grant select, insert, update on table public\.posbankum_pengaduan to service_role/i);
  assert.match(sql, /column_row\.attname = 'role'/i);
  assert.doesNotMatch(sql, /pg_get_constraintdef\(oid\) ilike '%role%'/i);
  assert.match(sql, /check \(role in \('warga', 'admin', 'petugas_posbankum'\)\)/i);
});
