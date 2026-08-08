const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");

const registerWarga = async (req, res) => {
  try {
    const {
      nik,
      no_kk,
      nama,
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
    if (!nik || !no_kk || !nama || !email || !password || !confirm_password) {
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
      .from("warga")
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
      .from("warga")
      .insert([
        {
          nik,
          no_kk,
          nama,
          email,
          no_hp,
          provinsi,
          kabupaten,
          kecamatan,
          kelurahan,
          password: hashedPassword,
        },
      ])
      .select("id, nik, nama, email")
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
