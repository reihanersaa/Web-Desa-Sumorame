const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  getInformasi,
  createInformasi,
  updateInformasi,
  deleteInformasi
} = require("../controllers/informasiController");

const { verifyToken } = require("../middleware/authMiddleware");


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
// Publik / Guest
// ==================================================
router.get(
  "/",
  getInformasi
);


// ==================================================
// ROUTE POST
// Admin
// ==================================================
router.post(
  "/",
  verifyToken,
  upload.single("gambar"),
  createInformasi
);


// ==================================================
// ROUTE PUT
// Admin
// ==================================================
router.put(
  "/:id",
  verifyToken,
  upload.single("gambar"),
  updateInformasi
);


// ==================================================
// ROUTE DELETE
// Admin
// ==================================================
router.delete(
  "/:id",
  verifyToken,
  deleteInformasi
);


module.exports = router;