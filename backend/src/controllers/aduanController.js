const supabase = require("../config/supabase");

const buatAduan = async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      nama_pelapor,
      email_pelapor,
      judul_aduan,
      isi_aduan,
      file_bukti_url,
    } = req.body;

    if (!judul_aduan || !isi_aduan) {
      return res
        .status(400)
        .json({ success: false, message: "Judul dan isi aduan wajib diisi!" });
    }

    const { data, error } = await supabase
      .from("aduan")
      .insert([
        {
          user_id,
          nama_pelapor,
          email_pelapor,
          judul_aduan,
          isi_aduan,
          file_bukti_url: file_bukti_url || null,
          status: "pending",
        },
      ])
      .select();

    if (error) throw error;
    return res
      .status(201)
      .json({
        success: true,
        message: "Aduan berhasil dikirim!",
        data: data[0],
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- TAMBAHAN BARU UNTUK ADMIN CMS ---

const getSemuaAduan = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Khusus Admin!" });
    }

    const { data, error } = await supabase
      .from("aduan")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateStatusAduan = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Khusus Admin!" });
    }

    const { id } = req.params;
    const { status } = req.body; // Terima "diproses" atau "selesai"

    const { data, error } = await supabase
      .from("aduan")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) throw error;
    return res
      .status(200)
      .json({
        success: true,
        message: `Status aduan jadi ${status}`,
        data: data[0],
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { buatAduan, getSemuaAduan, updateStatusAduan };
