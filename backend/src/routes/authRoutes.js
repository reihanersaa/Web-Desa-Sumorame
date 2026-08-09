const express = require("express");
const router = express.Router();
const { registerWarga, loginWarga } = require("../controllers/authController");

// Endpoint: POST /api/auth/register
router.post("/register", registerWarga);

// Endpoint: POST /api/auth/login
router.post("/login", loginWarga);

module.exports = router;
