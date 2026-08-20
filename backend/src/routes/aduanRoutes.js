const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { buatAduan, getSemuaAduan } = require("../controllers/aduanController");

// Rute POST untuk warga mengirim aduan (sudah Anda miliki)
router.post("/", verifyToken, buatAduan);

// Rute GET BARU untuk admin menarik semua data aduan
router.get("/", getSemuaAduan);

module.exports = router;