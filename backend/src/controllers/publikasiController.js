const supabase = require("../config/supabase");


// ==================================================
// 1. GET SEMUA PUBLIKASI
// ==================================================
const getPublikasi = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("publikasi")
      .select("*")
      .order("waktu_kegiatan", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Error Get Publikasi:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data publikasi."
    });
  }
};


// ==================================================
// 2. TAMBAH PUBLIKASI
// ==================================================
const createPublikasi = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak! Hanya Admin."
      });
    }

    const { judul, deskripsi, waktu_kegiatan } = req.body;
    const admin_id = req.user.id;

    if (!judul || !deskripsi || !waktu_kegiatan) {
      return res.status(400).json({
        success: false,
        message: "Judul, deskripsi, dan tanggal wajib diisi!"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Gambar kegiatan wajib dipilih!"
      });
    }

    const fileExtension = req.file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`;

    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("publikasi")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error("Upload Error Tambah:", uploadError);

      return res.status(500).json({
        success: false,
        message: "Gagal upload gambar: " + uploadError.message
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from("publikasi")
      .getPublicUrl(filePath);

    const gambar_url = publicUrlData.publicUrl;

    const { data, error } = await supabase
      .from("publikasi")
      .insert([
        {
          admin_id: admin_id,
          judul: judul,
          deskripsi: deskripsi,
          gambar_url: gambar_url,
          waktu_kegiatan: waktu_kegiatan
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Publikasi berhasil ditambahkan!",
      data: data[0]
    });

  } catch (error) {
    console.error("Error Create Publikasi:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal menambah publikasi."
    });
  }
};


// ==================================================
// 3. UPDATE PUBLIKASI
// ==================================================
const updatePublikasi = async (req, res) => {
  try {
    console.log("===== UPDATE PUBLIKASI =====");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak! Hanya Admin."
      });
    }

    const { id } = req.params;

    const {
      judul,
      deskripsi,
      waktu_kegiatan
    } = req.body || {};

    if (!judul || !deskripsi || !waktu_kegiatan) {
      return res.status(400).json({
        success: false,
        message: "Judul, deskripsi, dan tanggal wajib diisi!"
      });
    }

    // ================= AMBIL DATA LAMA =================
    const { data: dataLama, error: getError } = await supabase
      .from("publikasi")
      .select("*")
      .eq("id", id)
      .single();

    console.log("Data Lama:", dataLama);
    console.log("Get Error:", getError);

    if (getError) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data lama: " + getError.message
      });
    }

    if (!dataLama) {
      return res.status(404).json({
        success: false,
        message: "Data publikasi tidak ditemukan."
      });
    }

    // Default tetap memakai gambar lama
    let gambar_url = dataLama.gambar_url;

    // ================= JIKA ADA GAMBAR BARU =================
    if (req.file) {
      const fileExtension = req.file.originalname
        .split(".")
        .pop()
        .toLowerCase();

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExtension}`;

      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("publikasi")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      console.log("Upload Error Edit:", uploadError);

      if (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Gagal upload gambar: " + uploadError.message
        });
      }

      const { data: publicUrlData } = supabase.storage
        .from("publikasi")
        .getPublicUrl(filePath);

      gambar_url = publicUrlData.publicUrl;
    }

    // ================= UPDATE DATABASE =================
    const { data, error } = await supabase
      .from("publikasi")
      .update({
        judul: judul,
        deskripsi: deskripsi,
        gambar_url: gambar_url,
        waktu_kegiatan: waktu_kegiatan
      })
      .eq("id", id)
      .select();

    console.log("Update Data:", data);
    console.log("Update Error:", error);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Gagal update database: " + error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data publikasi tidak ditemukan setelah proses update."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Publikasi berhasil diperbarui!",
      data: data[0]
    });

  } catch (error) {
    console.error("Error Update Publikasi:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengupdate publikasi."
    });
  }
};


// ==================================================
// 4. DELETE PUBLIKASI
// ==================================================
const deletePublikasi = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak! Hanya Admin."
      });
    }

    const { id } = req.params;

    // ==================================================
    // AMBIL DATA PUBLIKASI TERLEBIH DAHULU
    // ==================================================
    const { data: dataPublikasi, error: getError } = await supabase
      .from("publikasi")
      .select("*")
      .eq("id", id)
      .single();

    if (getError || !dataPublikasi) {
      return res.status(404).json({
        success: false,
        message: "Data publikasi tidak ditemukan."
      });
    }

    // ==================================================
    // HAPUS GAMBAR DARI SUPABASE STORAGE
    // ==================================================
    const gambarUrl = dataPublikasi.gambar_url;

    if (gambarUrl && gambarUrl.includes("/storage/v1/object/public/publikasi/")) {
      try {
        const marker = "/storage/v1/object/public/publikasi/";
        const url = new URL(gambarUrl);
        const filePath = decodeURIComponent(
          url.pathname.split(marker)[1]
        );

        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("publikasi")
            .remove([filePath]);

          if (storageError) {
            console.error(
              "Gagal menghapus gambar dari Storage:",
              storageError
            );

            return res.status(500).json({
              success: false,
              message: "Gagal menghapus gambar dari Storage."
            });
          }
        }

      } catch (storageParseError) {
        console.error(
          "Error membaca URL gambar:",
          storageParseError
        );
      }
    }

    // ==================================================
    // HAPUS DATA DARI DATABASE
    // ==================================================
    const { error: deleteError } = await supabase
      .from("publikasi")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({
      success: true,
      message: "Publikasi berhasil dihapus!"
    });

  } catch (error) {
    console.error("Error Delete Publikasi:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal menghapus publikasi."
    });
  }
};


module.exports = {
  getPublikasi,
  createPublikasi,
  updatePublikasi,
  deletePublikasi
};