const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

// Sesi bergulir: 8 jam sejak renewal terakhir, maksimal 30 hari sejak login.
const IDLE_SECONDS = 8 * 60 * 60;
const MAX_SECONDS = 30 * 24 * 60 * 60;
const ISSUER = "sumorame-api";
const AUDIENCE = "sumorame-admin";

function authError(message = "Sesi admin berakhir. Silakan login kembali.") {
  return Object.assign(new Error(message), { status: 401, code: "ADMIN_SESSION_INVALID" });
}

function credentialTag(passwordHash) {
  return crypto.createHmac("sha256", process.env.JWT_SECRET).update(passwordHash).digest("hex");
}

function publicAdmin(user, username) {
  return { id: user.id, nik: user.nik, nama_lengkap: user.nama_lengkap,
    email: user.email, role: user.role, ...(username ? { username } : {}) };
}

function issueToken(user, session) {
  const exp = Math.floor(new Date(session.expires_at).getTime() / 1000);
  return jwt.sign({ id: user.id, nik: user.nik, role: user.role, sid: session.id,
    type: "admin_access", exp }, process.env.JWT_SECRET,
  { algorithm: "HS256", issuer: ISSUER, audience: AUDIENCE });
}

async function createSession(user) {
  const now = Date.now();
  const session = {
    id: crypto.randomUUID(), user_id: user.id,
    credential_tag: credentialTag(user.password),
    expires_at: new Date(now + IDLE_SECONDS * 1000).toISOString(),
    absolute_expires_at: new Date(now + MAX_SECONDS * 1000).toISOString(),
  };
  const { error } = await supabase.from("admin_sessions").insert(session);
  if (error) throw error;
  return { session, token: issueToken(user, session) };
}

async function validateSession(payload) {
  if (!["admin", "petugas_posbankum"].includes(payload.role) || payload.type !== "admin_access" ||
      payload.iss !== ISSUER || payload.aud !== AUDIENCE ||
      typeof payload.sid !== "string" || !/^[a-f0-9-]{36}$/i.test(payload.sid)) {
    throw authError();
  }
  const { data: session, error } = await supabase.from("admin_sessions")
    .select("id,user_id,expires_at,absolute_expires_at,revoked_at,credential_tag,users!inner(id,nik,nama_lengkap,email,password,role)")
    .eq("id", payload.sid).eq("user_id", payload.id).maybeSingle();
  if (error) throw error; // DB/network failure is NOT an authentication failure.
  const now = Date.now();
  const user = session?.users;
  if (!session || session.revoked_at || !user || user.role !== payload.role ||
      !(Date.parse(session.expires_at) > now) ||
      !(Date.parse(session.absolute_expires_at) > now) ||
      session.credential_tag !== credentialTag(user.password)) {
    throw authError();
  }
  return { session, user };
}

async function renewSession({ session, user }) {
  const now = Date.now();
  const expiresAt = new Date(Math.min(now + IDLE_SECONDS * 1000,
    Date.parse(session.absolute_expires_at))).toISOString();
  // Conditional update prevents a concurrent logout from resurrecting a session.
  const { data, error } = await supabase.from("admin_sessions")
    .update({ expires_at: expiresAt })
    .eq("id", session.id).eq("user_id", user.id).is("revoked_at", null)
    .gt("expires_at", new Date(now).toISOString())
    .gt("absolute_expires_at", new Date(now).toISOString())
    .select("id,expires_at,absolute_expires_at").maybeSingle();
  if (error) throw error;
  if (!data) throw authError();
  return { session: data, token: issueToken(user, data) };
}

async function revokeSession(session) {
  const { error } = await supabase.from("admin_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", session.id).eq("user_id", session.user_id);
  if (error) throw error;
}

module.exports = { createSession, validateSession, renewSession, revokeSession,
  publicAdmin, IDLE_SECONDS, MAX_SECONDS };
