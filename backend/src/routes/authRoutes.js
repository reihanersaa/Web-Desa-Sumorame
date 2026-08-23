const express = require("express");
const router = express.Router();
const {
  registerWarga,
  loginWarga,
  loginAdmin,
} = require("../controllers/authController");

// Endpoint: POST /api/auth/register
router.post("/register", registerWarga);

// Endpoint: POST /api/auth/login
router.post("/login", loginWarga);

// Endpoint: POST /api/auth/login-admin
router.post("/login-admin", loginAdmin);

module.exports = router;
