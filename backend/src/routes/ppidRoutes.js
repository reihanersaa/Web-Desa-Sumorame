const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  getStrukturPPID,
  updateStrukturPPID,
  getPDFPPID,
  createPDFPPID,
  deletePDFPPID
} = require("../controllers/ppidController");

const {
  verifyToken,
  requireAdmin
} = require("../middleware/authMiddleware");


// ==================================================
// STORAGE MULTER
// Memory Storage
// ==================================================
const storage = multer.memoryStorage();


// ==================================================
// MULTER GAMBAR STRUKTUR PPID
// Maksimal 2 MB
//
// Format:
// JPG
// JPEG
// PNG
// WEBP
// ==================================================
const uploadStruktur = multer({
  storage,

  limits: {
    fileSize: 2 * 1024 * 1024
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
// MULTER PDF PPID
// Maksimal 4 MB agar tetap di bawah batas payload Vercel 4,5 MB.
// Format PDF
// ==================================================
const uploadPDF = multer({
  storage,

  limits: {
    fileSize: 4 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(
        new Error(
          "File harus berformat PDF."
        )
      );
    }

    cb(null, true);
  }
});


// ==================================================
// GET STRUKTUR PPID
//
// GET /api/ppid
//
// PUBLIC
// Tidak membutuhkan token
// ==================================================
router.get(
  "/",
  getStrukturPPID
);


// ==================================================
// UPDATE STRUKTUR PPID
//
// PUT /api/ppid/struktur
//
// ADMIN
//
// FormData:
// struktur = file gambar
// ==================================================
router.put(
  "/struktur",
  verifyToken,
  requireAdmin,
  uploadStruktur.single("struktur"),
  updateStrukturPPID
);


// ==================================================
// GET SEMUA PDF PPID
//
// GET /api/ppid/pdf
//
// PUBLIC
// Tidak membutuhkan token
// ==================================================
router.get(
  "/pdf",
  getPDFPPID
);


// ==================================================
// TAMBAH PDF PPID
//
// POST /api/ppid/pdf
//
// ADMIN
//
// FormData:
// judul    = nama laporan
// file_pdf = file PDF
// ==================================================
router.post(
  "/pdf",
  verifyToken,
  requireAdmin,
  uploadPDF.single("file_pdf"),
  createPDFPPID
);


// ==================================================
// HAPUS PDF PPID
//
// DELETE /api/ppid/pdf/:id
//
// ADMIN
// ==================================================
router.delete(
  "/pdf/:id",
  verifyToken,
  requireAdmin,
  deletePDFPPID
);


// ==================================================
// ERROR HANDLER MULTER
// ==================================================
router.use((err, req, res, next) => {
  console.error(
    "PPID Route Error:",
    err
  );


  // ==================================================
  // ERROR DARI MULTER
  // ==================================================
  if (err instanceof multer.MulterError) {

    // ================= FILE TERLALU BESAR =================
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "Ukuran file melebihi batas maksimal."
      });
    }


    // ================= FIELD FILE SALAH =================
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message:
          "Field upload file tidak sesuai."
      });
    }


    // ================= MULTER ERROR LAIN =================
    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Terjadi kesalahan upload file."
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
        "Terjadi kesalahan pada proses upload PPID."
    });
  }


  next();
});


module.exports = router;
