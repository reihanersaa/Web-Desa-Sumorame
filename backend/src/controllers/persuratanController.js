const supabase = require("../config/supabase");

const ajukanSurat = async (req, res) => {
  try {
    // 1. Tangkap data dari frontend
    const { user_id, jenis_surat, data_form } = req.body;

    // 2. Validasi input dasar
    if (!user_id || !jenis_surat || !data_form) {
      return res.status(400).json({
        success: false,
        message:
          "Data tidak lengkap. user_id, jenis_surat, dan data_form wajib diisi.",
      });
    }

    // 3. Masukkan ke database Supabase
    const { data, error } = await supabase
      .from("persuratan")
      .insert([
        {
          user_id: user_id,
          jenis_surat: jenis_surat, // contoh: "SKTM" atau "DOMISILI"
          data_form: data_form, // Ini "kardus" yang berisi detail spesifik formnya
          status: "pending", // Otomatis pending saat baru diajukan
        },
      ])
      .select();

    if (error) throw error;

    // 4. Beri respon sukses ke Frontend
    return res.status(201).json({
      success: true,
      message: "Surat berhasil diajukan dan sedang diproses.",
      data: data,
    });
  } catch (error) {
    console.error("Error Pengajuan Surat:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

module.exports = { ajukanSurat };
