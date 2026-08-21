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

const { verifyToken } = require("../middleware/authMiddleware");


// ==================================================
// STORAGE MULTER
// ==================================================
const storage = multer.memoryStorage();


// ==================================================
// UPLOAD GAMBAR STRUKTUR
// Maksimal 2 MB
// ==================================================
const uploadStruktur = multer({
  storage: storage,

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
// UPLOAD PDF
// Maksimal 10 MB
// ==================================================
const uploadPDF = multer({
  storage: storage,

  limits: {
    fileSize: 10 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(
        new Error("File harus berformat PDF.")
      );
    }

    cb(null, true);
  }
});


// ==================================================
// GET STRUKTUR PPID
// GET /api/ppid
// PUBLIC
// ==================================================
router.get(
  "/",
  getStrukturPPID
);


// ==================================================
// UPDATE STRUKTUR PPID
// PUT /api/ppid/struktur
// ADMIN
// ==================================================
router.put(
  "/struktur",
  verifyToken,
  uploadStruktur.single("struktur"),
  updateStrukturPPID
);


// ==================================================
// GET DAFTAR PDF
// GET /api/ppid/pdf
// PUBLIC
// ==================================================
router.get(
  "/pdf",
  getPDFPPID
);


// ==================================================
// TAMBAH PDF
// POST /api/ppid/pdf
// ADMIN
// ==================================================
router.post(
  "/pdf",
  verifyToken,
  uploadPDF.single("file_pdf"),
  createPDFPPID
);


// ==================================================
// HAPUS PDF
// DELETE /api/ppid/pdf/:id
// ADMIN
// ==================================================
router.delete(
  "/pdf/:id",
  verifyToken,
  deletePDFPPID
);


// ==================================================
// ERROR HANDLER MULTER
// ==================================================
router.use((err, req, res, next) => {
  console.error("PPID Route Error:", err);

  if (err instanceof multer.MulterError) {

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ukuran file melebihi batas maksimal."
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Field upload file tidak sesuai."
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

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