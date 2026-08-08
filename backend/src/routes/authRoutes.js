const express = require("express");
const router = express.Router();
const { registerWarga } = require("../controllers/authController");

// Endpoint: POST /api/auth/register
router.post("/register", registerWarga);

module.exports = router;
