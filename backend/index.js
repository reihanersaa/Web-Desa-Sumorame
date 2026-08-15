require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const suratRoutes = require("./src/routes/suratRoutes");
const aduanRoutes = require("./src/routes/aduanRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/aduan", aduanRoutes);
app.use("/api/surat", suratRoutes);

// Root Check
app.get("/", (req, res) => {
  res.json({ message: "API Service Desa Sumorame Active" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
