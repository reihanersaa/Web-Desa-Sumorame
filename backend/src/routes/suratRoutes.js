const express = require("express");
const router = express.Router();
const { ajukanSurat } = require("../controllers/persuratanController");
const { verifyToken } = require("../middleware/authMiddleware");

// Perhatikan urutannya: Jalur -> Satpam (verifyToken) -> Proses (ajukanSurat)
router.post("/ajukan", verifyToken, ajukanSurat);

module.exports = router;
