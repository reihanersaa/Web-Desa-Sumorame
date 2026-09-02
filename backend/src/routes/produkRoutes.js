const express = require("express");
const multer = require("multer");

const router = express.Router();

const produkController = require("../controllers/produkController");

const {
  verifyToken,
  requireRole,
  requireAdmin,
} = require("../middleware/authMiddleware");

const {
  verifyUploadSignatures,
} = require("../middleware/uploadSecurityMiddleware");


// ==================================================
// KONFIGURASI MULTER PRODUK
// ==================================================
const uploadProduk = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },

  fileFilter(req, file, callback) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error(
          "Gambar produk harus JPG, PNG, atau WebP maksimal 2 MB."
        )
      );
    }

    return callback(null, true);
  },
});


// ==================================================
// ROUTES PUBLIK
// ==================================================

// Tampilkan semua produk approved.
router.get(
  "/publik/produk",
  produkController.getProdukPublik
);


// Tampilkan maksimal 5 produk pilihan admin.
router.get(
  "/publik/produk/unggulan",
  produkController.getProdukUnggulanBeranda
);


// Ambil Top 3 produk berdasarkan jumlah dilihat.
router.get(
  "/publik/produk/top",
  produkController.getTop3Produk
);


// Tambah jumlah view saat detail produk dibuka.
router.post(
  "/publik/produk/:id/view",
  produkController.tambahViewProduk
);


// ==================================================
// PENGAJUAN PRODUK OLEH WARGA
// ==================================================
router.post(
  "/publik/produk",
  verifyToken,
  requireRole("warga"),
  uploadProduk.single("gambar"),
  verifyUploadSignatures,
  produkController.ajukanProduk
);


// ==================================================
// TAMBAH PRODUK OLEH ADMIN
// ==================================================
router.post(
  "/admin/produk",
  verifyToken,
  requireAdmin,
  uploadProduk.single("gambar"),
  verifyUploadSignatures,
  produkController.ajukanProduk
);


// ==================================================
// ROUTES ADMIN CMS
// ==================================================

// Ambil semua produk.
router.get(
  "/admin/produk",
  verifyToken,
  requireAdmin,
  produkController.getSemuaProdukAdmin
);


// Pilih maksimal 5 produk untuk beranda.
router.put(
  "/admin/produk/unggulan",
  verifyToken,
  requireAdmin,
  produkController.updateProdukUnggulanBeranda
);


// Ubah status produk.
router.put(
  "/admin/produk/:id/status",
  verifyToken,
  requireAdmin,
  produkController.updateStatusProduk
);


// Edit data produk.
router.put(
  "/admin/produk/:id",
  verifyToken,
  requireAdmin,
  uploadProduk.single("gambar"),
  verifyUploadSignatures,
  produkController.updateProduk
);


// Hapus produk.
router.delete(
  "/admin/produk/:id",
  verifyToken,
  requireAdmin,
  produkController.hapusProduk
);


// ==================================================
// ERROR HANDLER MULTER / UPLOAD
// ==================================================
router.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Gambar produk gagal diproses.",
    });
  }

  return next();
});


module.exports = router;