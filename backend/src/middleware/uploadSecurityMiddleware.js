const signatures = {
  "image/jpeg": (buffer) =>
    buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  "image/png": (buffer) =>
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": (buffer) =>
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP",
  "application/pdf": (buffer) =>
    buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-",
};

function getUploadedFiles(req) {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === "object") {
    return Object.values(req.files).flat();
  }
  return [];
}

function verifyUploadSignatures(req, res, next) {
  const invalidFile = getUploadedFiles(req).find((file) => {
    const validator = signatures[file.mimetype];
    return !validator || !Buffer.isBuffer(file.buffer) || !validator(file.buffer);
  });

  if (invalidFile) {
    return res.status(400).json({
      success: false,
      message: `Isi file ${invalidFile.originalname || "upload"} tidak sesuai dengan formatnya.`,
    });
  }

  return next();
}

module.exports = { verifyUploadSignatures };
