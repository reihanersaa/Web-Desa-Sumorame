const jwt = require("jsonwebtoken");
const { validateSession } = require("../services/adminSessionService");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET wajib tersedia di environment backend.");
}

const verifyToken = async (req, res, next) => {
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
    const verified = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    if (["admin", "petugas_posbankum"].includes(verified.role)) {
      req.adminSession = await validateSession(verified);
    }
    req.user = verified;
    return next();
  } catch (error) {
    if (!(error instanceof jwt.JsonWebTokenError) && error.status !== 401) {
      console.error("Admin session validation unavailable:", error.code || error.name);
      return res.status(503).json({ success: false,
        message: "Validasi sesi sementara tidak tersedia. Silakan coba lagi." });
    }
    return res.status(401).json({
      success: false,
      code: "SESSION_INVALID",
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
const requirePosbankumStaff = requireRole("admin", "petugas_posbankum");

module.exports = { verifyToken, requireRole, requireAdmin, requirePosbankumStaff };
