const supabase = require("../config/supabase");

const ajukanSurat = async (req, res) => {
  try {
    // 1. Ambil ID dari token Satpam (verifyToken), BUKAN dari req.body!
    const created_by = req.user.id;

    // 2. Tangkap data dari frontend
    const { judul_surat, jenis_surat, data_form } = req.body;

    // 3. Validasi input dasar
    if (!judul_surat || !jenis_surat || !data_form) {
      return res.status(400).json({
        success: false,
        message:
          "Data tidak lengkap. judul_surat, jenis_surat, dan data_form wajib diisi.",
      });
    }

    // 4. Generate tanggal hari ini otomatis (format YYYY-MM-DD)
    const tanggal_surat = new Date().toISOString().split("T")[0];

    // 5. Masukkan ke database Supabase
    const { data, error } = await supabase
      .from("surat") // Disesuaikan dengan ERD
      .insert([
        {
          created_by: created_by, // Disesuaikan dengan ERD
          judul_surat: judul_surat,
          jenis_surat: jenis_surat, // contoh: "SKTM" atau "DOMISILI"
          tanggal_surat: tanggal_surat, // Wajib ada sesuai ERD
          data_form: data_form, // Bentuknya JSON object
          status: "draft", // Otomatis draft saat baru diajukan
        },
      ])
      .select();

    if (error) throw error;

    // 6. Beri respon sukses ke Frontend
    return res.status(201).json({
      success: true,
      message: "Surat berhasil diajukan dan sedang diproses.",
      data: data[0],
    });
  } catch (error) {
    console.error("Error Pengajuan Surat:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat mengajukan surat.",
    });
  }
};

module.exports = { ajukanSurat };
