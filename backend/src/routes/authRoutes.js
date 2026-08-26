const express = require("express");
const router = express.Router();
const {
  registerWarga,
  loginWarga,
  loginAdmin,
} = require("../controllers/authController");
const { createRateLimiter } = require("../middleware/rateLimitMiddleware");

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Terlalu banyak percobaan registrasi. Coba lagi nanti.",
});

// Endpoint: POST /api/auth/register
router.post("/register", registerLimiter, registerWarga);

// Endpoint: POST /api/auth/login
router.post("/login", loginLimiter, loginWarga);

// Endpoint: POST /api/auth/login-admin
router.post("/login-admin", loginLimiter, loginAdmin);

module.exports = router;
