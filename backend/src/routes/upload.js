const express = require("express");
const multer = require("multer");
const { uploadImage } = require("../middleware/upload");
const {
  compressImage,
  createStoreCompressedImage,
} = require("../middleware/compress");

function createUploadRouter(supabaseClient) {
  const router = express.Router();
  const storeCompressedImage = createStoreCompressedImage(supabaseClient);

  router.post(
    "/",
    uploadImage.single("image"),
    compressImage,
    storeCompressedImage,
    (req, res) => {

      return res.status(201).json({
        success: true,
        message: "Gambar berhasil dikompresi dan disimpan ke Supabase Storage.",
        data: {
          url: req.compressedImage.url,
          bucket: req.compressedImage.bucket,
          path: req.compressedImage.storagePath,
          filename: req.compressedImage.filename,
          mimeType: req.compressedImage.mimeType,
          width: req.compressedImage.width,
          height: req.compressedImage.height,
          size: {
            beforeKb: req.compressedImage.beforeKb,
            afterKb: req.compressedImage.afterKb,
            savingPercent: req.compressedImage.savingPercent,
          },
        },
      });
    },
  );

  router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        code: error.code,
        message: "Ukuran gambar melebihi batas maksimal 10 MB.",
      });
    }

    return res.status(400).json({
      success: false,
      code: error.code,
      message: `Upload tidak valid: ${error.message}`,
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code || "UPLOAD_FAILED",
      message: error.message,
    });
  }

  return next(error);
  });

  return router;
}

module.exports = createUploadRouter();
module.exports.createUploadRouter = createUploadRouter;
