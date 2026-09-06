const crypto = require("node:crypto");
const supabase = require("../config/supabase");

const BLOCK_SECONDS = 120;
const ACCOUNT_LIMIT = 5;
const IP_LIMIT = 25;
const ALLOWED_HOSTNAMES = new Set(
  String(process.env.TURNSTILE_ALLOWED_HOSTNAMES || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

function hmac(value) {
  const secret = process.env.AUTH_THROTTLE_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    const error = new Error("AUTH_THROTTLE_SECRET belum dikonfigurasi dengan aman.");
    error.code = "SECURITY_CONFIG_INVALID";
    throw error;
  }
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function getClientIp(req) {
  const value = String(req.ip || req.socket?.remoteAddress || "unknown").trim();
  return value.slice(0, 80);
}

function normalizeIdentifier(type, body) {
  return type === "admin"
    ? String(body?.username || "").trim().toLowerCase().slice(0, 80)
    : String(body?.nik || "").trim().slice(0, 80);
}

function buildKeys(req, type) {
  const ipHash = hmac(`ip:${getClientIp(req)}`);
  const accountHash = hmac(`${type}:${normalizeIdentifier(type, req.body)}`);
  return {
    all: [`ip:${ipHash}`, `account:${accountHash}`, `pair:${ipHash}:${accountHash}`],
    limits: [IP_LIMIT, ACCOUNT_LIMIT, ACCOUNT_LIMIT],
    resetOnSuccess: [`account:${accountHash}`, `pair:${ipHash}:${accountHash}`],
  };
}

async function rpc(name, params) {
  const { data, error } = await supabase.rpc(name, params);
  if (error) {
    const wrapped = new Error("Penyimpanan pembatas login tidak tersedia.");
    wrapped.code = "LOGIN_THROTTLE_UNAVAILABLE";
    throw wrapped;
  }
  return Array.isArray(data) ? data[0] : data;
}

async function checkLimit(keys) {
  return rpc("check_login_throttle", { p_keys: keys.all });
}

async function recordFailure(keys) {
  return rpc("record_login_failure", {
    p_keys: keys.all,
    p_limits: keys.limits,
    p_block_seconds: BLOCK_SECONDS,
  });
}

async function clearSuccessfulAccount(keys) {
  await rpc("clear_login_failures", { p_keys: keys.resetOnSuccess });
}

function isTestSecret() {
  return process.env.NODE_ENV !== "production" &&
    /^\d+x0{30,}AA$/.test(String(process.env.TURNSTILE_SECRET_KEY || ""));
}

async function verifyTurnstileToken(token, remoteip, expectedAction) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !process.env.TURNSTILE_SITE_KEY || !ALLOWED_HOSTNAMES.size) {
    const error = new Error("Turnstile belum dikonfigurasi.");
    error.code = "SECURITY_CONFIG_INVALID";
    throw error;
  }
  if (typeof token !== "string" || token.length < 1 || token.length > 2048) {
    return { valid: false, reason: "missing-or-invalid-token" };
  }

  const idempotencyKey = crypto.randomUUID();
  let result;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    try {
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token, remoteip, idempotency_key: idempotencyKey }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Siteverify HTTP ${response.status}`);
      result = await response.json();
      break;
    } catch (error) {
      if (attempt === 1) {
        const wrapped = new Error("Verifikasi Turnstile tidak tersedia.");
        wrapped.code = "TURNSTILE_UNAVAILABLE";
        throw wrapped;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  if (!result?.success) return { valid: false, reason: "challenge-failed" };
  // Cloudflare test keys return fixed action/hostname values. Only relax these checks outside production.
  if (!isTestSecret()) {
    if (result.action !== expectedAction) return { valid: false, reason: "action-mismatch" };
    if (!ALLOWED_HOSTNAMES.has(String(result.hostname || "").toLowerCase())) {
      return { valid: false, reason: "hostname-mismatch" };
    }
  }
  return { valid: true };
}

module.exports = {
  BLOCK_SECONDS,
  ACCOUNT_LIMIT,
  IP_LIMIT,
  getClientIp,
  buildKeys,
  checkLimit,
  recordFailure,
  clearSuccessfulAccount,
  verifyTurnstileToken,
};
