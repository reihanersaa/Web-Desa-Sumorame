const express = require("express");
const router = express.Router();
const multer = require("multer");

// Inisialisasi multer (menyimpan file di memory/RAM sementara sebelum dilempar ke Supabase)
const upload = multer({ storage: multer.memoryStorage() });

const { verifyToken } = require("../middleware/authMiddleware");
const { buatAduan, getSemuaAduan, tanggapiAduan } = require("../controllers/aduanController");

// 1. Rute POST (Warga) -> HARUS ADA upload.single("file_bukti")
router.post("/", verifyToken, upload.single("file_bukti"), buatAduan);

// 2. Rute GET (Admin)
router.get("/", getSemuaAduan);

// 3. Rute PUT (Admin Tanggapan) -> HARUS ADA upload.fields(...)
router.put("/:id", upload.fields([
  { name: 'lampiran_gambar', maxCount: 1 },
  { name: 'lampiran_file', maxCount: 1 }
]), tanggapiAduan);

module.exports = router;