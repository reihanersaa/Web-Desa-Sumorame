const express = require("express");
const router = express.Router();
const multer = require("multer");
const { buatAduan } = require("../controllers/aduanController");
const { verifyToken } = require("../middleware/authMiddleware");

// Setup multer untuk menyimpan file di RAM sementara sebelum dilempar ke Supabase
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint: POST /api/aduan (Wajib login + upload file)
router.post("/", verifyToken, upload.single("file_bukti"), buatAduan);

module.exports = router;
