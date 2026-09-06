const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const jwt = require("jsonwebtoken");
const loginSecurity = require("../services/loginSecurityService");
const DUMMY_PASSWORD_HASH = "$2b$10$.96DZxHVZzYUMOeP4b6ZmeD6BgQZjEyIvF8dj6PahLz.8SsPE5JaW";

async function rejectLogin(req, res, message) {
  try {
    if (req.loginSecurity?.keys) await loginSecurity.recordFailure(req.loginSecurity.keys);
  } catch (error) {
    console.error("Failed login could not be recorded:", error.code || error.name);
    return res.status(503).json({ success: false, message: "Perlindungan login sementara tidak tersedia. Silakan coba lagi." });
  }
  return res.status(401).json({ success: false, message });
}

const registerWarga = async (req, res) => {
  try {
    let {
      nik,
      no_kk,
      nama_lengkap,
      email,
      no_hp,
      provinsi,
      kabupaten,
      kecamatan,
      kelurahan,
      password,
      confirm_password,
    } = req.body;

    nik = String(nik || "").trim();
    no_kk = String(no_kk || "").trim();
    no_hp = String(no_hp || "").trim();
    nama_lengkap = String(nama_lengkap || "").trim();

    // 1. Validasi Kelengkapan Field
    if (
      !nik ||
      !no_kk ||
      !nama_lengkap ||
      !email ||
      !no_hp ||
      !password ||
      !confirm_password
    ) {
      return res.status(400).json({
        success: false,
        message: "Mohon lengkapi seluruh field yang wajib diisi.",
      });
    }

    // 2. Validasi Kesamaan Password
    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "Konfirmasi password tidak cocok dengan password.",
      });
    }

    // 3. Validasi Panjang NIK & KK (Must 16 Digits)
    if (!/^\d{16}$/.test(String(nik)) || !/^\d{16}$/.test(String(no_kk))) {
      return res.status(400).json({
        success: false,
        message: "NIK dan Nomor KK harus berjumlah 16 digit.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid.",
      });
    }

    if (!/^\d{9,15}$/.test(String(no_hp))) {
      return res.status(400).json({
        success: false,
        message: "Nomor HP harus terdiri dari 9 sampai 15 angka.",
      });
    }

    const passwordBytes = Buffer.byteLength(String(password), "utf8");
    if (passwordBytes < 8 || passwordBytes > 72) {
      return res.status(400).json({
        success: false,
        message: "Password harus berukuran 8 sampai 72 byte.",
      });
    }

    // 4. Cek Pendaftaran Ganda (NIK / Email)
    const { data: existingNik, error: nikCheckError } = await supabase
      .from("users")
      .select("nik")
      .eq("nik", nik)
      .maybeSingle();
    if (nikCheckError) throw nikCheckError;

    if (existingNik) {
      return res.status(409).json({
        success: false,
        message: "NIK atau email tersebut sudah terdaftar dalam sistem.",
      });
    }

    const { data: existingEmail, error: emailCheckError } = await supabase
      .from("users")
      .select("email")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (emailCheckError) throw emailCheckError;

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "NIK atau email tersebut sudah terdaftar dalam sistem.",
      });
    }

    // 5. Enkripsi Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Insert Data ke Supabase
    const { data, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          nik,
          no_kk,
          nama_lengkap,
          email: normalizedEmail,
          no_hp,
          provinsi,
          kabupaten,
          kecamatan,
          kelurahan,
          password: hashedPassword,
          role: "warga",
        },
      ])
      .select("id, nik, nama_lengkap, email")
      .single();

    if (insertError) throw insertError;

    return res.status(201).json({
      success: true,
      message: "Registrasi akun warga berhasil!",
      data,
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal pada server.",
    });
  }
};

//logika login warga

const loginWarga = async (req, res) => {
  try {
    const nik = String(req.body.nik || "").trim();
    const password = req.body.password;

    // 1. Validasi NIK dan password wajib diisi
    if (!/^\d{16}$/.test(nik) || typeof password !== "string" || !password || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "NIK harus 16 angka dan password wajib diisi (maksimal 72 byte).",
      });
    }

    // 2. Cari user di database berdasarkan NIK
    const { data: user, error } = await supabase
      .from("users")
      .select("id, nik, nama_lengkap, email, password, role")
      .eq("nik", nik)
      .maybeSingle();

    if (error) throw error;
    const isPasswordMatch = await bcrypt.compare(password, user?.password || DUMMY_PASSWORD_HASH);
    if (!user || !isPasswordMatch) {
      return rejectLogin(req, res, "NIK atau password salah.");
    }

    if (user.role !== "warga") {
      if (req.loginSecurity?.keys) await loginSecurity.clearSuccessfulAccount(req.loginSecurity.keys);
      return res.status(403).json({
        success: false,
        message: "Gunakan halaman login admin untuk akun ini.",
      });
    }

    // 4. Buat Token JWT (Mencakup ID, NIK, dan Role)
    const token = jwt.sign(
      {
        id: user.id,
        nik: user.nik,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    if (req.loginSecurity?.keys) await loginSecurity.clearSuccessfulAccount(req.loginSecurity.keys);

    // 5. Kirim balasan beserta role (warga / admin)
    return res.status(200).json({
      success: true,
      message: "Login berhasil!",
      token: token,
      data: {
        id: user.id,
        nik: user.nik,
        nama_lengkap: user.nama_lengkap,
        role: user.role, // Frontend akan baca ini: 'warga' atau 'admin'
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal pada server.",
    });
  }
};

// Login admin memakai username dan sesi server terpisah.
const { loginAdmin } = require("./adminAuthController");
module.exports = { registerWarga, loginWarga, loginAdmin };
