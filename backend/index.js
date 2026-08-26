require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const suratRoutes = require("./src/routes/suratRoutes");
const aduanRoutes = require("./src/routes/aduanRoutes");
const produkRoutes = require("./src/routes/produkRoutes");
const publikasiRoutes = require("./src/routes/publikasiRoutes");
const kelembagaanRoutes = require("./src/routes/kelembagaanRoutes");
const informasiRoutes = require("./src/routes/informasiRoutes");
const ppidRoutes = require("./src/routes/ppidRoutes");
const cmsprofilRoutes = require("./src/routes/cmsprofilRoutes");
const statistikRoutes = require("./src/routes/statistikRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel meneruskan IP pengunjung lewat proxy. Diperlukan untuk rate limit.
app.set("trust proxy", 1);

const productionFrontend = "https://web-desa-sumorame.vercel.app";
const allowedOrigins = (
  process.env.FRONTEND_URLS ||
  `${productionFrontend},http://localhost:3000,http://127.0.0.1:5500,http://localhost:5500`
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      // Request tanpa Origin berasal dari server, health check, atau REST client.
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }

      return callback(new Error("Origin tidak diizinkan oleh CORS."));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "3mb" }));
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  });
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/aduan", aduanRoutes);
app.use("/api/surat", suratRoutes);
app.use("/api", produkRoutes);
app.use("/api/publikasi", publikasiRoutes);
app.use("/api/kelembagaan", kelembagaanRoutes);
app.use("/api/informasi", informasiRoutes);
app.use("/api/ppid", ppidRoutes);
app.use("/api/cmsprofil", cmsprofilRoutes);
app.use("/api/statistik", statistikRoutes);

// Health checks
app.get("/", (req, res) => {
  res.json({ message: "API Service Desa Sumorame Active" });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API Desa Sumorame aktif." });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." });
});

app.use((error, req, res, next) => {
  if (error?.message === "Origin tidak diizinkan oleh CORS.") {
    return res.status(403).json({ success: false, message: error.message });
  }

  console.error("Unhandled API Error:", error);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal pada server.",
  });
});

// Vercel mengimpor `app`; server lokal hanya dijalankan lewat `npm start`.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
