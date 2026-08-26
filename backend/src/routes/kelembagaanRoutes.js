const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  getKelembagaan,
  createKelembagaan,
  updateKelembagaan,
  deleteKelembagaan
} = require("../controllers/kelembagaanController");

const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");
const { verifyUploadSignatures } = require("../middleware/uploadSecurityMiddleware");


// ==================================================
// KONFIGURASI MULTER
// ==================================================
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 2 * 1024 * 1024 // Maksimal 2 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Format gambar harus JPG, JPEG, atau PNG.")
      );
    }

    cb(null, true);
  }
});


// ==================================================
// MIDDLEWARE UPLOAD GAMBAR
// ==================================================
const uploadGambar = (req, res, next) => {

  upload.single("gambar")(req, res, (err) => {

    // ==================================================
    // ERROR KHUSUS MULTER
    // ==================================================
    if (err instanceof multer.MulterError) {

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Ukuran gambar terlalu besar. Maksimal 2 MB."
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message
      });

    }


    // ==================================================
    // ERROR FILE FILTER / ERROR LAIN
    // ==================================================
    if (err) {
      return res.status(400).json({
        success: false,
        message:
          err.message ||
          "Terjadi kesalahan saat upload gambar."
      });
    }


    // ==================================================
    // LANJUT KE CONTROLLER
    // ==================================================
    next();

  });

};


// ==================================================
// ROUTE GET
// Untuk Guest / Publik
// ==================================================
router.get(
  "/",
  getKelembagaan
);


// ==================================================
// ROUTE POST
// Untuk Admin
// ==================================================
router.post(
  "/",
  verifyToken,
  requireAdmin,
  uploadGambar,
  verifyUploadSignatures,
  createKelembagaan
);


// ==================================================
// ROUTE PUT
// Untuk Admin
// ==================================================
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  uploadGambar,
  verifyUploadSignatures,
  updateKelembagaan
);


// ==================================================
// ROUTE DELETE
// Untuk Admin
// ==================================================
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  deleteKelembagaan
);


module.exports = router;
