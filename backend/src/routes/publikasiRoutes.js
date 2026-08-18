const express = require("express");
const router = express.Router();
const {
  getPublikasi,
  createPublikasi,
  updatePublikasi,
  deletePublikasi,
} = require("../controllers/publikasiController");
const { verifyToken } = require("../middleware/authMiddleware");

// Route untuk Guest (tanpa token)
router.get("/", getPublikasi);

// Routes untuk Admin CMS (wajib pakai token)
router.post("/", verifyToken, createPublikasi);
router.put("/:id", verifyToken, updatePublikasi);
router.delete("/:id", verifyToken, deletePublikasi);

module.exports = router;
