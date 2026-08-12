const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const jwt = require("jsonwebtoken");

const registerWarga = async (req, res) => {
  try {
    const {
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

    // 1. Validasi Kelengkapan Field
    if (
      !nik ||
      !no_kk ||
      !nama_lengkap ||
      !email ||
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
    if (nik.length !== 16 || no_kk.length !== 16) {
      return res.status(400).json({
        success: false,
        message: "NIK dan Nomor KK harus berjumlah 16 digit.",
      });
    }

    // 4. Cek Pendaftaran Ganda (NIK / Email)
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("nik, email")
      .or(`nik.eq.${nik},email.eq.${email}`)
      .maybeSingle();

    if (existingUser) {
      const field = existingUser.nik === nik ? "NIK" : "Email";
      return res.status(409).json({
        success: false,
        message: `${field} tersebut sudah terdaftar dalam sistem.`,
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
          email,
          no_hp,
          provinsi,
          kabupaten,
          kecamatan,
          kelurahan,
          password: hashedPassword,
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

module.exports = { registerWarga };

const loginWarga = async (req, res) => {
  try {
    const { nik, password } = req.body;

    // 1. Validasi NIK dan password wajib diisi
    if (!nik || !password) {
      return res.status(400).json({
        success: false,
        message: "NIK dan password wajib diisi!",
      });
    }

    // 2. Cari user di database berdasarkan NIK
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("nik", nik)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: "NIK tidak ditemukan atau salah.",
      });
    }

    // 3. Cocokkan password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Password yang Anda masukkan salah.",
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

module.exports = { registerWarga, loginWarga };
