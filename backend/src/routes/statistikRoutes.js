const express = require("express");
const statistikController = require("../controllers/statistikController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/publik", statistikController.getRingkasanPublik);
router.get("/", verifyToken, statistikController.getSemuaWarga);
router.post("/", verifyToken, statistikController.tambahWarga);
router.put("/:id", verifyToken, statistikController.updateWarga);
router.delete("/:id", verifyToken, statistikController.hapusWarga);

module.exports = router;
