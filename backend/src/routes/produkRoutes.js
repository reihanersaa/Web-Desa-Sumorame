const express = require("express");
const router = express.Router();
const produkController = require("../controllers/produkController");
const { verifyToken } = require("../middleware/authMiddleware");

// --- ROUTES UNTUK PUBLIK (WARGA) ---
// Tampilkan produk approved di website
router.get("/publik/produk", produkController.getProdukPublik);

// Warga submit produk baru (bisa dipasang verifyToken jika warga wajib login dahulu)
router.post("/publik/produk", produkController.ajukanProduk);

// --- ROUTES UNTUK PRIVAT (ADMIN CMS) ---
// Ambil semua data produk untuk tabel CMS (Wajib Token Admin)
router.get("/admin/produk", verifyToken, produkController.getSemuaProdukAdmin);

// Admin ubah status (Approve/Reject) (Wajib Token Admin)
router.put(
  "/admin/produk/:id/status",
  verifyToken,
  produkController.updateStatusProduk,
);

// Admin hapus produk (Wajib Token Admin)
router.delete("/admin/produk/:id", verifyToken, produkController.hapusProduk);

module.exports = router;
