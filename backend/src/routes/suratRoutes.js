const express = require("express");
const router = express.Router();
const {
  ajukanSurat,
  getSemuaSurat,
  updateStatusSurat,
} = require("../controllers/persuratanController");
const { verifyToken } = require("../middleware/authMiddleware");

// Route warga (sudah ada sebelumnya)
router.post("/ajukan", verifyToken, ajukanSurat);

// Route Admin CMS (TAMBAHKAN INI JIKA BELUM ADA)
router.get("/admin", verifyToken, getSemuaSurat);
router.put("/admin/:id/status", verifyToken, updateStatusSurat);

module.exports = router;
