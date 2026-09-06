const express = require("express");
const router = express.Router();
const {
  registerWarga,
  loginWarga,
  loginAdmin,
} = require("../controllers/authController");
const { createRateLimiter } = require("../middleware/rateLimitMiddleware");
const { verifyToken, requirePosbankumStaff } = require("../middleware/authMiddleware");
const { renewAdmin, logoutAdmin } = require("../controllers/adminAuthController");
const { loginThrottle, requireTurnstile } = require("../middleware/loginSecurityMiddleware");

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Terlalu banyak percobaan registrasi. Coba lagi nanti.",
});

// Endpoint: POST /api/auth/register
router.post("/register", registerLimiter, registerWarga);

// Endpoint: POST /api/auth/login
router.get("/security-config", (req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  const siteKey = String(process.env.TURNSTILE_SITE_KEY || "").trim();
  if (!siteKey) {
    return res.status(503).json({ success: false, message: "Keamanan login belum dikonfigurasi." });
  }
  return res.json({ success: true, turnstileSiteKey: siteKey });
});

router.post("/login", loginThrottle("warga"), requireTurnstile("login_warga"), loginWarga);

// Endpoint: POST /api/auth/login-admin
router.post("/login-admin", loginThrottle("admin"), requireTurnstile("login_admin"), loginAdmin);
// Renewal memakai token admin yang masih valid; tidak menerima token kedaluwarsa.
// Kedua jenis akun CMS memiliki sesi server yang sama. Middleware ini hanya
// berlaku pada renewal/logout dan tidak memberi petugas akses ke route admin lain.
router.post("/admin/session/renew", verifyToken, requirePosbankumStaff, renewAdmin);
router.post("/admin/session/logout", verifyToken, requirePosbankumStaff, logoutAdmin);

module.exports = router;
