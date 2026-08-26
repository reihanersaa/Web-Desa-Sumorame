const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  getPublikasi,
  createPublikasi,
  updatePublikasi,
  deletePublikasi
} = require("../controllers/publikasiController");

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
// ==================================================
router.get("/", getPublikasi);


// ==================================================
// ROUTE POST
// ==================================================
router.post(
  "/",
  verifyToken,
  requireAdmin,
  upload.single("gambar"),
  createPublikasi
);


// ==================================================
// ROUTE PUT
// ==================================================
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  upload.single("gambar"),
  updatePublikasi
);


// ==================================================
// ROUTE DELETE
// ==================================================
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  deletePublikasi
);


module.exports = router;
