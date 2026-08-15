const supabase = require("../config/supabase");

// 1. GET: Menampilkan Semua Publikasi (Untuk halaman warga/guest)
const getPublikasi = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("publikasi")
      .select("*")
      .order("waktu_kegiatan", { ascending: false }); // Urutkan dari yang terbaru

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error Get Publikasi:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data publikasi." });
  }
};

// 2. POST: Tambah Publikasi Baru (Khusus Admin CMS)
const createPublikasi = async (req, res) => {
  try {
    // Pastikan hanya admin yang bisa menambah
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Akses Ditolak! Hanya Admin." });
    }

    const { judul, deskripsi, gambar_url, waktu_kegiatan } = req.body;
    const admin_id = req.user.id;

    if (!judul || !deskripsi || !gambar_url || !waktu_kegiatan) {
      return res
        .status(400)
        .json({ success: false, message: "Semua kolom wajib diisi!" });
    }

    const { data, error } = await supabase
      .from("publikasi")
      .insert([{ admin_id, judul, deskripsi, gambar_url, waktu_kegiatan }])
      .select();

    if (error) throw error;
    return res
      .status(201)
      .json({
        success: true,
        message: "Publikasi berhasil ditambahkan!",
        data: data[0],
      });
  } catch (error) {
    console.error("Error Create Publikasi:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Gagal menambah publikasi." });
  }
};

// 3. PUT: Edit Publikasi (Khusus Admin CMS)
const updatePublikasi = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Akses Ditolak! Hanya Admin." });
    }

    const { id } = req.params;
    const { judul, deskripsi, gambar_url, waktu_kegiatan } = req.body;

    const { data, error } = await supabase
      .from("publikasi")
      .update({ judul, deskripsi, gambar_url, waktu_kegiatan })
      .eq("id", id)
      .select();

    if (error) throw error;
    return res
      .status(200)
      .json({
        success: true,
        message: "Publikasi berhasil diupdate!",
        data: data[0],
      });
  } catch (error) {
    console.error("Error Update Publikasi:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengupdate publikasi." });
  }
};

// 4. DELETE: Hapus Publikasi (Khusus Admin CMS)
const deletePublikasi = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Akses Ditolak! Hanya Admin." });
    }

    const { id } = req.params;
    const { error } = await supabase.from("publikasi").delete().eq("id", id);

    if (error) throw error;
    return res
      .status(200)
      .json({ success: true, message: "Publikasi berhasil dihapus!" });
  } catch (error) {
    console.error("Error Delete Publikasi:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Gagal menghapus publikasi." });
  }
};

module.exports = {
  getPublikasi,
  createPublikasi,
  updatePublikasi,
  deletePublikasi,
};
