const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // 1. Ambil tiket dari header request (Postman/Frontend)
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Anda harus login terlebih dahulu!",
    });
  }

  try {
    // 2. Format standar tiket itu "Bearer tokennya_disini", jadi kita pisahkan dan ambil tokennya aja
    const token = authHeader.split(" ")[1];

    // 3. Cek apakah tiketnya asli menggunakan kata sandi rahasia di .env
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Kalau asli, simpan data warganya (id, role) lalu persilakan masuk (next)
    req.user = verified;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Tiket/Token tidak valid atau sudah kadaluarsa!",
    });
  }
};

module.exports = { verifyToken };
