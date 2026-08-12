const express = require("express");
const router = express.Router();
const { buatAduan } = require("../controllers/aduanController");
const { verifyToken } = require("../middleware/authMiddleware");

// Endpoint: POST /api/aduan (Wajib login/pakai Token)
router.post("/", verifyToken, buatAduan);

module.exports = router;
