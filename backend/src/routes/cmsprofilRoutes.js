const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  getCmsProfil,
  createCmsProfil,
  updateCmsProfil,
  deleteCmsProfil
} = require("../controllers/cmsprofilController");

const {
  verifyToken
} = require("../middleware/authMiddleware");


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
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Format gambar harus JPG, JPEG, PNG, atau WEBP."
        )
      );
    }

    cb(null, true);
  }
});


// ==================================================
// GET CMS PROFIL
// GET /api/cmsprofil
// PUBLIC
// ==================================================
router.get(
  "/",
  getCmsProfil
);


// ==================================================
// TAMBAH CMS PROFIL
// POST /api/cmsprofil
// ADMIN
// ==================================================
// 🚨 Menerima 2 file sekaligus: 'gambar' dan 'foto_kades'
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: 'gambar', maxCount: 1 },
    { name: 'foto_kades', maxCount: 1 },
    { name: 'gambar_modal', maxCount: 1 }
  ]),
  createCmsProfil
);


// ==================================================
// UPDATE CMS PROFIL
// PUT /api/cmsprofil/:id
// ADMIN
// ==================================================
// 🚨 Menerima 2 file sekaligus: 'gambar' dan 'foto_kades'
router.put(
  "/:id",
  verifyToken,
  upload.fields([
    { name: 'gambar', maxCount: 1 },
    { name: 'foto_kades', maxCount: 1 },
    { name: 'gambar_modal', maxCount: 1 }
  ]),
  updateCmsProfil
);


// ==================================================
// DELETE CMS PROFIL
// DELETE /api/cmsprofil/:id
// ADMIN
// ==================================================
router.delete(
  "/:id",
  verifyToken,
  deleteCmsProfil
);


// ==================================================
// ERROR HANDLER MULTER
// ==================================================
router.use((err, req, res, next) => {

  console.error(
    "CMS Profil Route Error:",
    err
  );

  // ==================================================
  // ERROR DARI MULTER
  // ==================================================
  if (
    err instanceof
    multer.MulterError
  ) {

    // File terlalu besar
    if (
      err.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Ukuran gambar maksimal 2 MB."
      });
    }

    // Nama field file salah
    if (
      err.code ===
      "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Nama field upload gambar tidak sesuai."
      });
    }

    return res.status(400).json({
      success: false,
      message:
        err.message
    });
  }

  // ==================================================
  // ERROR FILE FILTER
  // ==================================================
  if (err) {
    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Terjadi kesalahan saat upload gambar."
    });
  }

  next();
});

module.exports = router;