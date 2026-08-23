const supabase = require("../config/supabase");

// 1. Fungsi POST Warga
// 1. Fungsi POST Warga
const buatAduan = async (req, res) => {
  try {
    const user_id = req.user.id; 
    
    // 🚨 1. Tambahkan no_wa saat menangkap req.body
    const { 
      nama_pelapor, 
      email_pelapor, 
      no_wa, 
      judul_aduan, 
      isi_aduan 
    } = req.body; 
    
    const fileBukti = req.file; 

    if (!judul_aduan || !isi_aduan) {
      return res
        .status(400)
        .json({ success: false, message: "Judul dan isi aduan wajib diisi!" });
    }

    let file_bukti_url = null;

    if (fileBukti) {
      const fileName = `aduan_${Date.now()}_${fileBukti.originalname.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from("bukti_aduan") 
        .upload(fileName, fileBukti.buffer, { contentType: fileBukti.mimetype });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("bukti_aduan")
        .getPublicUrl(fileName);

      file_bukti_url = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("aduan")
      .insert([
        {
          user_id: user_id,
          nama_pelapor: nama_pelapor,
          email_pelapor: email_pelapor,
          no_wa: no_wa, // 🚨 2. Pastikan no_wa ikut disimpan ke database Supabase
          judul_aduan: judul_aduan,
          isi_aduan: isi_aduan,
          file_bukti_url: file_bukti_url, 
          status: "Menunggu", 
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Fungsi GET Admin
const getSemuaAduan = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("aduan")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data, 
    });
  } catch (error) {
    console.error("Error Get Aduan:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data aduan.",
    });
  }
};

// 3. Fungsi PUT Admin (Tanggapan)
const tanggapiAduan = async (req, res) => {
  try {
    const { id } = req.params; 
    const { tanggapan_admin, tanggal_tanggapan, status } = req.body;
    
    const files = req.files || {};
    let gambarUrl = null;
    let fileUrl = null;

    if (files.lampiran_gambar && files.lampiran_gambar[0]) {
      const fileGbr = files.lampiran_gambar[0];
      const fileNameGbr = `tanggapan_img_${Date.now()}_${fileGbr.originalname.replace(/\s+/g, '_')}`;
      
      const { error: errGbr } = await supabase.storage.from("bukti_aduan").upload(fileNameGbr, fileGbr.buffer, { contentType: fileGbr.mimetype });
      
      if (!errGbr) {
        const { data } = supabase.storage.from("bukti_aduan").getPublicUrl(fileNameGbr);
        gambarUrl = data.publicUrl;
      }
    }

    if (files.lampiran_file && files.lampiran_file[0]) {
      const fileDoc = files.lampiran_file[0];
      const fileNameDoc = `tanggapan_doc_${Date.now()}_${fileDoc.originalname.replace(/\s+/g, '_')}`;
      
      const { error: errDoc } = await supabase.storage.from("bukti_aduan").upload(fileNameDoc, fileDoc.buffer, { contentType: fileDoc.mimetype });
      
      if (!errDoc) {
        const { data } = supabase.storage.from("bukti_aduan").getPublicUrl(fileNameDoc);
        fileUrl = data.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from("aduan")
      .update({
        status: status,
        tanggapan_admin: tanggapan_admin,
        tanggal_tanggapan: tanggal_tanggapan,
        ...(gambarUrl && { lampiran_gambar_url: gambarUrl }),
        ...(fileUrl && { lampiran_file_url: fileUrl })
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Tanggapan berhasil disimpan!",
      data: data[0],
    });

  } catch (error) {
    console.error("Error Tanggapi Aduan:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses tanggapan.",
    });
  }
};

// 4. Fungsi DELETE Admin
const hapusAduan = async (req, res) => {
  try {
    const { id } = req.params;

    // Hapus data dari tabel aduan di Supabase berdasarkan ID
    const { data, error } = await supabase
      .from("aduan")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Data aduan berhasil dihapus!",
      data: data,
    });
  } catch (error) {
    console.error("Error Hapus Aduan:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus data aduan.",
    });
  }
};

module.exports = { buatAduan, getSemuaAduan, tanggapiAduan, hapusAduan };
