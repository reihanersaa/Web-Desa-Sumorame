const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 82;
const DEFAULT_IMAGE_BUCKET = "images";

const FORMAT_BY_MIME_TYPE = {
  "image/jpeg": { extension: "jpg", sharpFormat: "jpeg" },
  "image/png": { extension: "png", sharpFormat: "png" },
  "image/webp": { extension: "webp", sharpFormat: "webp" },
};

function compressionError(message, statusCode = 422, code = "IMAGE_PROCESSING_FAILED") {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function getOutputConfiguration(req, inputMimeType) {
  // WebP adalah default. `?format=original` tersedia untuk klien lama.
  if (req.query.format === "original") {
    const original = FORMAT_BY_MIME_TYPE[inputMimeType];
    return { ...original, mimeType: inputMimeType };
  }

  if (req.query.format && req.query.format !== "webp") {
    throw compressionError(
      "Format output tidak didukung. Gunakan 'webp' atau 'original'.",
      400,
      "UNSUPPORTED_OUTPUT_FORMAT",
    );
  }

  return { extension: "webp", sharpFormat: "webp", mimeType: "image/webp" };
}

async function compressImage(req, _res, next) {
  if (!req.file) {
    return next(
      compressionError(
        "File gambar wajib dikirim pada field 'image'.",
        400,
        "IMAGE_REQUIRED",
      ),
    );
  }

  try {
    const image = sharp(req.file.buffer, {
      failOn: "error",
      limitInputPixels: 40_000_000,
    });
    const metadata = await image.metadata();
    const declaredFormat = FORMAT_BY_MIME_TYPE[req.file.mimetype]?.sharpFormat;

    if (!metadata.format || metadata.format !== declaredFormat) {
      throw compressionError(
        "Isi file tidak sesuai dengan tipe gambar yang dikirim atau file rusak.",
        422,
        "INVALID_IMAGE_CONTENT",
      );
    }

    const output = getOutputConfiguration(req, req.file.mimetype);
    const filename = `${uuidv4()}.${output.extension}`;
    const storagePath = `uploads/${filename}`;

    let pipeline = image.rotate().resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    });

    if (output.sharpFormat === "webp") {
      pipeline = pipeline.webp({ quality: WEBP_QUALITY, effort: 4 });
    } else if (output.sharpFormat === "jpeg") {
      pipeline = pipeline.jpeg({ quality: WEBP_QUALITY, mozjpeg: true });
    } else {
      pipeline = pipeline.png({ compressionLevel: 9, quality: WEBP_QUALITY });
    }

    const { data: compressedBuffer, info: result } = await pipeline.toBuffer({
      resolveWithObject: true,
    });

    const beforeKb = Number((req.file.size / 1024).toFixed(2));
    const afterKb = Number((result.size / 1024).toFixed(2));
    const savingPercent = req.file.size
      ? Number((100 - (result.size / req.file.size) * 100).toFixed(2))
      : 0;

    console.info(
      `[image-compression] ${req.file.originalname}: ${beforeKb} KB -> ${afterKb} KB (${savingPercent}% lebih kecil)`,
    );

    req.compressedImage = {
      filename,
      storagePath,
      mimeType: output.mimeType,
      buffer: compressedBuffer,
      width: result.width,
      height: result.height,
      beforeKb,
      afterKb,
      savingPercent,
    };

    return next();
  } catch (error) {
    if (error.statusCode) return next(error);

    console.error("[image-compression] Sharp gagal memproses gambar:", error);
    return next(
      compressionError(
        "Gambar rusak, terlalu besar untuk diproses, atau gagal dikompresi.",
      ),
    );
  }
}

function createStoreCompressedImage(supabaseClient) {
  return async function storeCompressedImage(req, _res, next) {
    if (!req.compressedImage?.buffer) {
      return next(
        compressionError(
          "Hasil kompresi gambar tidak tersedia.",
          500,
          "COMPRESSED_IMAGE_MISSING",
        ),
      );
    }

    try {
      // Lazy load menjaga middleware kompresi tetap dapat diuji tanpa koneksi database.
      const supabase = supabaseClient || require("../config/supabase");
      const bucket = process.env.IMAGE_UPLOAD_BUCKET || DEFAULT_IMAGE_BUCKET;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(req.compressedImage.storagePath, req.compressedImage.buffer, {
          contentType: req.compressedImage.mimeType,
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(req.compressedImage.storagePath);

      if (!data?.publicUrl) {
        throw new Error("Supabase tidak mengembalikan public URL.");
      }

      req.compressedImage.bucket = bucket;
      req.compressedImage.url = data.publicUrl;
      delete req.compressedImage.buffer;
      return next();
    } catch (error) {
      console.error("[image-storage] Gagal mengunggah ke Supabase Storage:", error);
      return next(
        compressionError(
          "Gambar berhasil dikompresi, tetapi gagal disimpan ke Supabase Storage.",
          503,
          "IMAGE_STORAGE_FAILED",
        ),
      );
    }
  };
}

module.exports = {
  compressImage,
  createStoreCompressedImage,
  MAX_WIDTH,
  WEBP_QUALITY,
  DEFAULT_IMAGE_BUCKET,
};
