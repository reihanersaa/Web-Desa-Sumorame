require("dotenv").config();
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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Gambar produk dikirim sebagai data URL. Base64 menambah ukuran sekitar 33%,
// jadi sediakan ruang yang cukup untuk batas file 2 MB di frontend.
app.use(express.json({ limit: "3mb" }));

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
// Root Check
app.get("/", (req, res) => {
  res.json({ message: "API Service Desa Sumorame Active" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
