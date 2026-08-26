const express = require("express");
const router = express.Router();
const {
  ajukanSurat,
  getSemuaSurat,
  updateStatusSurat,
  hapusSurat,
} = require("../controllers/persuratanController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// Route warga (sudah ada sebelumnya)
router.post("/ajukan", verifyToken, ajukanSurat);

// Route Admin CMS
router.get("/admin", verifyToken, requireAdmin, getSemuaSurat);
router.put("/admin/:id/status", verifyToken, requireAdmin, updateStatusSurat);
router.delete("/admin/:id", verifyToken, requireAdmin, hapusSurat);

module.exports = router;
