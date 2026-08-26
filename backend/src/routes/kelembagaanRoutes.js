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


// ==================================================
// KONFIGURASI MULTER
// ==================================================
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024
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
// ROUTE GET
// Untuk Guest / Publik
// ==================================================
router.get("/", getKelembagaan);


// ==================================================
// ROUTE POST
// Untuk Admin
// ==================================================
router.post(
  "/",
  verifyToken,
  requireAdmin,
  upload.single("gambar"),
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
  upload.single("gambar"),
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
