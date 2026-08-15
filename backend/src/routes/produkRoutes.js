const express = require("express");
const router = express.Router();
const produkController = require("../controllers/produkController");

// --- ROUTES UNTUK PUBLIK (WARGA) ---
// Endpoint untuk menampilkan produk yang sudah di-approve di website publik
router.get("/publik/produk", produkController.getProdukPublik);

// Endpoint untuk warga submit produk baru
router.post("/publik/produk", produkController.ajukanProduk);

// --- ROUTES UNTUK PRIVAT (ADMIN CMS) ---
// Endpoint untuk mengambil semua data produk untuk tabel CMS
router.get("/admin/produk", produkController.getSemuaProdukAdmin);

// Endpoint untuk admin mengubah status (Approve/Reject)
router.put("/admin/produk/:id/status", produkController.updateStatusProduk);

// Endpoint untuk admin menghapus produk
router.delete("/admin/produk/:id", produkController.hapusProduk);

module.exports = router;
