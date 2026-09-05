const express = require("express");
const multer = require("multer");
const { verifyToken, requirePosbankumStaff } = require("../middleware/authMiddleware");
const { verifyUploadSignatures } = require("../middleware/uploadSecurityMiddleware");
const { createRateLimiter } = require("../middleware/rateLimitMiddleware");
const controller = require("../controllers/posbankumController");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10, fields: 80 },
  fileFilter(_req, file, callback) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.mimetype)) return callback(new Error("Dokumen harus berupa JPG, PNG, WebP, atau PDF."));
    return callback(null, true);
  },
});
const submitLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5,
  message: "Batas pengiriman tercapai. Silakan coba kembali satu jam lagi." });

router.post("/", submitLimiter, upload.array("documents", 10), verifyUploadSignatures, controller.submitComplaint);
router.get("/admin", verifyToken, requirePosbankumStaff, controller.listComplaints);
router.get("/admin/:id", verifyToken, requirePosbankumStaff, controller.detailComplaint);
router.put("/admin/:id", verifyToken, requirePosbankumStaff, controller.updateHandling);

router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ success: false, message: error.code === "LIMIT_FILE_SIZE"
      ? "Setiap dokumen maksimal berukuran 5 MB." : `Upload dokumen tidak valid: ${error.message}` });
  }
  if (error?.message?.startsWith("Dokumen harus")) return res.status(415).json({ success: false, message: error.message });
  return next(error);
});

module.exports = router;
