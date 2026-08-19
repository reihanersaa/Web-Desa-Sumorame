const supabase = require("../config/supabase");

const buatAduan = async (req, res) => {
  try {
    const user_id = req.user.id; // Diambil otomatis dari token login warga[cite: 19]
    const {
      nama_pelapor,
      email_pelapor,
      judul_aduan,
      isi_aduan,
    } = req.body; // file_bukti_url dihapus dari sini karena bentuknya masih file fisik[cite: 19]
    
    const fileBukti = req.file; // File yang ditangkap oleh multer

    if (!judul_aduan || !isi_aduan) {
      return res.status(400).json({
        success: false,
        message: "Judul dan isi aduan wajib diisi!",
      });
    }

    let file_bukti_url = null;

    // 1. Jika warga melampirkan file, upload ke Supabase Storage terlebih dahulu
    if (fileBukti) {
      // Buat nama file unik (menghindari nama kembar)
      const fileName = `aduan_${Date.now()}_${fileBukti.originalname.replace(/\s+/g, '_')}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("bukti_aduan") // Pastikan kamu sudah membuat bucket bernama 'bukti_aduan' di Supabase
        .upload(fileName, fileBukti.buffer, { contentType: fileBukti.mimetype });

      if (uploadError) throw uploadError;

      // Dapatkan URL publik dari file yang baru saja diupload
      const { data: publicUrlData } = supabase.storage
        .from("bukti_aduan")
        .getPublicUrl(fileName);
        
      file_bukti_url = publicUrlData.publicUrl;
    }

    // 2. Simpan semua data (termasuk URL file) ke database Supabase
    const { data, error } = await supabase
      .from("aduan")
      .insert([
        {
          user_id: user_id,
          nama_pelapor: nama_pelapor,
          email_pelapor: email_pelapor,
          judul_aduan: judul_aduan,
          isi_aduan: isi_aduan,
          file_bukti_url: file_bukti_url, // Masukkan URL yang didapat dari proses di atas
          status: "Menunggu", // Diubah ke "Menunggu" agar sesuai dengan UI Frontend admin
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