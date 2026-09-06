const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const sessions = require("../services/adminSessionService");
const loginSecurity = require("../services/loginSecurityService");
const DUMMY_PASSWORD_HASH =
  "$2b$10$.96DZxHVZzYUMOeP4b6ZmeD6BgQZjEyIvF8dj6PahLz.8SsPE5JaW";

async function rejectLogin(req, res) {
  try {
    if (req.loginSecurity?.keys)
      await loginSecurity.recordFailure(req.loginSecurity.keys);
  } catch (error) {
    return serverError(res, error);
  }
  return res
    .status(401)
    .json({ success: false, message: "Username atau password admin salah." });
}

function sendSession(res, status, result, user, username) {
  res.set("Cache-Control", "no-store");
  return res
    .status(status)
    .json({
      success: true,
      token: result.token,
      expires_at: result.session.expires_at,
      absolute_expires_at: result.session.absolute_expires_at,
      data: sessions.publicAdmin(user, username),
    });
}

function serverError(res, error) {
  if (error.status === 401) {
    return res
      .status(401)
      .json({ success: false, code: error.code, message: error.message });
  }
  console.error(
    "Admin authentication failed:",
    error.code || error.name || "database error",
  );
  return res
    .status(503)
    .json({
      success: false,
      message:
        "Layanan autentikasi sementara tidak tersedia. Coba lagi; sesi tidak dihapus.",
    });
}

async function loginAdmin(req, res) {
  try {
    const username =
      typeof req.body?.username === "string"
        ? req.body.username.trim().toLowerCase()
        : "";
    const password = req.body?.password;
    if (
      !/^[a-z0-9][a-z0-9._-]{2,39}$/.test(username) ||
      typeof password !== "string" ||
      !password ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Isi username (3–40 karakter: huruf, angka, titik, garis bawah atau tanda hubung) dan password.",
        });
    }
    const { data: account, error } = await supabase
      .from("admin_accounts")
      .select("username,users!inner(id,nik,nama_lengkap,email,password,role)")
      .eq("username", username)
      .maybeSingle();
    if (error) throw error;
    const user = account?.users;

    // Tetap lakukan satu perbandingan bcrypt meskipun username tidak ditemukan.
    // Ini mengurangi perbedaan waktu respons yang dapat dipakai untuk menebak akun.
    const isPasswordMatch = await bcrypt.compare(
      password,
      user?.password || DUMMY_PASSWORD_HASH,
    );
    const allowedRoles = ["admin", "petugas_posbankum"];

    if (
      !user ||
      !allowedRoles.includes(user.role) ||
      !isPasswordMatch
    ) {
      return rejectLogin(req, res);
    }
    const result = await sessions.createSession(user);
    if (req.loginSecurity?.keys)
      await loginSecurity.clearSuccessfulAccount(req.loginSecurity.keys);
    return sendSession(res, 200, result, user, account.username);
  } catch (error) {
    return serverError(res, error);
  }
}

async function renewAdmin(req, res) {
  try {
    const result = await sessions.renewSession(req.adminSession);
    return sendSession(res, 200, result, req.adminSession.user);
  } catch (error) {
    return serverError(res, error);
  }
}

async function logoutAdmin(req, res) {
  try {
    await sessions.revokeSession(req.adminSession.session);
    res.set("Cache-Control", "no-store");
    return res.json({ success: true, message: "Sesi admin telah dicabut." });
  } catch (error) {
    return serverError(res, error);
  }
}

module.exports = { loginAdmin, renewAdmin, logoutAdmin };
