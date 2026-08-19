const supabase = require("../config/supabase");

const buatAduan = async (req, res) => {
  try {
    const user_id = req.user.id; // Diambil otomatis dari token login warga
    const {
      nama_pelapor,
      email_pelapor,
      judul_aduan,
      isi_aduan,
      file_bukti_url,
    } = req.body;

    if (!judul_aduan || !isi_aduan) {
      return res.status(400).json({
        success: false,
        message: "Judul dan isi aduan wajib diisi!",
      });
    }

    const { data, error } = await supabase
      .from("aduan")
      .insert([
        {
          user_id: user_id,
          nama_pelapor: nama_pelapor,
          email_pelapor: email_pelapor,
          judul_aduan: judul_aduan,
          isi_aduan: isi_aduan,
          file_bukti_url: file_bukti_url || null,
          status: "pending",
        },
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Aduan berhasil dikirim!",
      data: data[0],
    });
  } catch (error) {
    console.error("Error Aduan:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat mengirim aduan.",
    });
  }
};

module.exports = { buatAduan };
