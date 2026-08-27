const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET wajib tersedia di environment backend.");
}

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token Bearer diperlukan.",
    });
  }

  try {
    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ success: false, message: "Token tidak ditemukan." });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kedaluwarsa.",
    });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hak akses tidak mencukupi.",
    });
  }

  return next();
};

const requireAdmin = requireRole("admin");

module.exports = { verifyToken, requireRole, requireAdmin };
