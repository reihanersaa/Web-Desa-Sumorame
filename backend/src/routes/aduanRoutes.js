const express = require("express");
const router = express.Router();
const {
  buatAduan,
  getSemuaAduan,
  updateStatusAduan,
} = require("../controllers/aduanController");
const { verifyToken } = require("../middleware/authMiddleware");

// Route warga (Wajib login/pakai Token)
router.post("/", verifyToken, buatAduan);

// Route Admin CMS
router.get("/admin", verifyToken, getSemuaAduan);
router.put("/admin/:id/status", verifyToken, updateStatusAduan);

module.exports = router;
