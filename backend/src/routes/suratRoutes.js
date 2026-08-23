const express = require("express");
const router = express.Router();
const {
  ajukanSurat,
  getSemuaSurat,
  updateStatusSurat,
  hapusSurat,
} = require("../controllers/persuratanController");
const { verifyToken } = require("../middleware/authMiddleware");

// Route warga (sudah ada sebelumnya)
router.post("/ajukan", verifyToken, ajukanSurat);

// Route Admin CMS
router.get("/admin", verifyToken, getSemuaSurat);
router.put("/admin/:id/status", verifyToken, updateStatusSurat);
router.delete("/admin/:id", verifyToken, hapusSurat);

module.exports = router;
