const express = require("express");
const router = express.Router();
const multer = require("multer");

// Simpan sementara di RAM sebelum diteruskan ke Supabase Storage.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 2 },
  fileFilter(req, file, callback) {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Lampiran harus JPG, PNG, atau PDF maksimal 2 MB."));
    }
    return callback(null, true);
  },
});

const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { buatAduan, getSemuaAduan, tanggapiAduan, hapusAduan } = require('../controllers/aduanController');

// 1. Rute POST (Warga) -> HARUS ADA upload.single("file_bukti")
router.post("/", verifyToken, upload.single("file_bukti"), buatAduan);

// 2. Rute GET (Admin)
router.get("/", verifyToken, requireAdmin, getSemuaAduan);

// 3. Rute PUT (Admin Tanggapan) -> HARUS ADA upload.fields(...)
router.put("/:id", verifyToken, requireAdmin, upload.fields([
  { name: 'lampiran_gambar', maxCount: 1 },
  { name: 'lampiran_file', maxCount: 1 }
]), tanggapiAduan);

router.delete('/:id', verifyToken, requireAdmin, hapusAduan);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError || error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Lampiran aduan gagal diproses.",
    });
  }
  return next();
});

module.exports = router;
