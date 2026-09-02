const express = require("express");
const router = express.Router();
const multer = require("multer");

// Simpan sementara di RAM sebelum diteruskan ke Supabase Storage.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 2 },
  fileFilter(req, file, callback) {
    const allowedByField = {
      file_bukti: ["image/jpeg", "image/png", "application/pdf"],
      lampiran_gambar: ["image/jpeg", "image/png"],
      lampiran_file: ["application/pdf"],
    };
    const allowedTypes = allowedByField[file.fieldname] || [];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Jenis lampiran tidak sesuai dengan kolom upload atau melebihi 2 MB."));
    }
    return callback(null, true);
  },
});

const { verifyToken, requireRole, requireAdmin } = require("../middleware/authMiddleware");
const { verifyUploadSignatures } = require("../middleware/uploadSecurityMiddleware");
const { buatAduan, getAduanSaya, getSemuaAduan, tanggapiAduan, hapusAduan } = require('../controllers/aduanController');

// 1. Rute POST (Warga) -> HARUS ADA upload.single("file_bukti")
router.post("/", verifyToken, requireRole("warga"), upload.single("file_bukti"), verifyUploadSignatures, buatAduan);

// Riwayat hanya untuk pemilik akun yang sedang login.
router.get("/saya", verifyToken, requireRole("warga"), getAduanSaya);

// 2. Rute GET (Admin)
router.get("/", verifyToken, requireAdmin, getSemuaAduan);

// 3. Rute PUT (Admin Tanggapan) -> HARUS ADA upload.fields(...)
router.put("/:id", verifyToken, requireAdmin, upload.fields([
  { name: 'lampiran_gambar', maxCount: 1 },
  { name: 'lampiran_file', maxCount: 1 }
]), verifyUploadSignatures, tanggapiAduan);

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
