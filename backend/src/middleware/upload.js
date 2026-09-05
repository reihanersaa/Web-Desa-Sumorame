const multer = require("multer");

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter(_req, file, callback) {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      const error = new Error(
        "Tipe file tidak didukung. Gunakan gambar JPG, PNG, atau WebP.",
      );
      error.statusCode = 415;
      error.code = "UNSUPPORTED_IMAGE_TYPE";
      return callback(error);
    }

    return callback(null, true);
  },
});

module.exports = {
  uploadImage,
  MAX_UPLOAD_BYTES,
  ALLOWED_IMAGE_TYPES,
};
