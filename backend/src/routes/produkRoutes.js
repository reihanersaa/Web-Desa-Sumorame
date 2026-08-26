const express = require("express");
const multer = require("multer");
const router = express.Router();
const produkController = require("../controllers/produkController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

const uploadProduk = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Gambar produk harus JPG, PNG, atau WebP maksimal 2 MB."));
    }
    return callback(null, true);
  },
});

// --- ROUTES UNTUK PUBLIK (WARGA) ---
// Tampilkan produk approved di website
router.get("/publik/produk", produkController.getProdukPublik);
router.get("/publik/produk/unggulan", produkController.getProdukUnggulanBeranda);

// Endpoint untuk ambil Top 3 (Taruh DI ATAS route /publik/produk/:id/view agar tidak bentrok)
router.get("/publik/produk/top", produkController.getTop3Produk);

// Endpoint saat tombol Detail diklik FE (nambah angka view)
router.post("/publik/produk/:id/view", produkController.tambahViewProduk);

// Warga submit produk baru (bisa dipasang verifyToken jika warga wajib login dahulu)
router.post("/publik/produk", uploadProduk.single("gambar"), produkController.ajukanProduk);

// --- ROUTES UNTUK PRIVAT (ADMIN CMS) ---
// Ambil semua data produk untuk tabel CMS (Wajib Token Admin)
router.get("/admin/produk", verifyToken, requireAdmin, produkController.getSemuaProdukAdmin);
router.put(
  "/admin/produk/unggulan",
  verifyToken,
  requireAdmin,
  produkController.updateProdukUnggulanBeranda,
);

// Admin ubah status (Approve/Reject) (Wajib Token Admin)
router.put(
  "/admin/produk/:id/status",
  verifyToken,
  requireAdmin,
  produkController.updateStatusProduk,
);

// Admin memperbaiki data produk (Wajib Token Admin)
router.put(
  "/admin/produk/:id",
  verifyToken,
  requireAdmin,
  uploadProduk.single("gambar"),
  produkController.updateProduk,
);

// Admin hapus produk (Wajib Token Admin)
router.delete("/admin/produk/:id", verifyToken, requireAdmin, produkController.hapusProduk);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError || error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Gambar produk gagal diproses.",
    });
  }
  return next();
});

module.exports = router;
