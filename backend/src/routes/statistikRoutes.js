const express = require("express");
const statistikController = require("../controllers/statistikController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/publik", statistikController.getRingkasanPublik);
router.get("/", verifyToken, requireAdmin, statistikController.getSemuaWarga);
router.post("/", verifyToken, requireAdmin, statistikController.tambahWarga);
router.put("/:id", verifyToken, requireAdmin, statistikController.updateWarga);
router.delete("/:id", verifyToken, requireAdmin, statistikController.hapusWarga);

module.exports = router;
