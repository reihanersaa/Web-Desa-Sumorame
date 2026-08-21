const supabase = require("../config/supabase");


// ==================================================
// 1. GET SEMUA INFORMASI
// ==================================================
const getInformasi = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("informasi")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Error Get Informasi:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data informasi."
    });
  }
};


// ==================================================
// 2. TAMBAH INFORMASI
// ==================================================
const createInformasi = async (req, res) => {
  try {
    // ================= CEK ADMIN =================
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak! Hanya Admin."
      });
    }

    const {
      judul,
      isi,
      penjelasan
    } = req.body || {};

    const admin_id = req.user.id;


    // ================= VALIDASI =================
    if (!judul || !isi || !penjelasan) {
      return res.status(400).json({
        success: false,
        message: "Judul, isi berita, dan penjelasan berita wajib diisi!"
      });
    }


    // ================= VALIDASI GAMBAR =================
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Gambar informasi wajib dipilih!"
      });
    }


    // ==================================================
    // BUAT NAMA FILE
    // ==================================================
    const fileExtension = req.file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExtension}`;

    const filePath = fileName;


    // ==================================================
    // UPLOAD GAMBAR KE SUPABASE STORAGE
    // ==================================================
    const { error: uploadError } = await supabase.storage
      .from("informasi")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error(
        "Upload Error Tambah Informasi:",
        uploadError
      );

      return res.status(500).json({
        success: false,
        message: "Gagal upload gambar: " + uploadError.message
      });
    }


    // ==================================================
    // AMBIL PUBLIC URL
    // ==================================================
    const { data: publicUrlData } = supabase.storage
      .from("informasi")
      .getPublicUrl(filePath);

    const gambar_url = publicUrlData.publicUrl;


    // ==================================================
    // SIMPAN KE DATABASE
    // ==================================================
    const { data, error } = await supabase
      .from("informasi")
      .insert([
        {
          admin_id: admin_id,
          judul: judul,
          isi: isi,
          penjelasan: penjelasan,
          gambar_url: gambar_url
        }
      ])
      .select();

    if (error) {
      // Jika database gagal, hapus gambar yang sudah ter-upload
      await supabase.storage
        .from("informasi")
        .remove([filePath]);

      throw error;
    }


    return res.status(201).json({
      success: true,
      message: "Informasi berhasil ditambahkan!",
      data: data[0]
    });

  } catch (error) {
    console.error("Error Create Informasi:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal menambah informasi."
    });
  }
};


// ==================================================
// 3. UPDATE INFORMASI
// ==================================================
const updateInformasi = async (req, res) => {
  try {
    console.log("===== UPDATE INFORMASI =====");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);
    console.log("File:", req.file);


    // ================= CEK ADMIN =================
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak! Hanya Admin."
      });
    }


    const { id } = req.params;

    const {
      judul,
      isi,
      penjelasan
    } = req.body || {};


    // ================= VALIDASI =================
    if (!judul || !isi || !penjelasan) {
      return res.status(400).json({
        success: false,
        message: "Judul, isi berita, dan penjelasan berita wajib diisi!"
      });
    }


    // ==================================================
    // AMBIL DATA LAMA
    // ==================================================
    const { data: dataLama, error: getError } = await supabase
      .from("informasi")
      .select("*")
      .eq("id", id)
      .single();


    if (getError || !dataLama) {
      return res.status(404).json({
        success: false,
        message: "Data informasi tidak ditemukan."
      });
    }


    // ==================================================
    // DEFAULT TETAP GUNAKAN GAMBAR LAMA
    // ==================================================
    let gambar_url = dataLama.gambar_url;
    let filePathBaru = null;


    // ==================================================
    // JIKA ADA GAMBAR BARU
    // ==================================================
    if (req.file) {
      const fileExtension = req.file.originalname
        .split(".")
        .pop()
        .toLowerCase();

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExtension}`;

      filePathBaru = fileName;


      // ================= UPLOAD GAMBAR BARU =================
      const { error: uploadError } = await supabase.storage
        .from("informasi")
        .upload(filePathBaru, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });


      if (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Gagal upload gambar: " + uploadError.message
        });
      }


      // ================= PUBLIC URL BARU =================
      const { data: publicUrlData } = supabase.storage
        .from("informasi")
        .getPublicUrl(filePathBaru);

      gambar_url = publicUrlData.publicUrl;
    }


    // ==================================================
    // UPDATE DATABASE
    // ==================================================
    const { data, error } = await supabase
      .from("informasi")
      .update({
        judul: judul,
        isi: isi,
        penjelasan: penjelasan,
        gambar_url: gambar_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();


    if (error) {
      // Jika database gagal update dan ada gambar baru,
      // hapus gambar baru agar tidak menjadi file sampah
      if (filePathBaru) {
        await supabase.storage
          .from("informasi")
          .remove([filePathBaru]);
      }

      return res.status(500).json({
        success: false,
        message: "Gagal update database: " + error.message
      });
    }


    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data informasi tidak ditemukan setelah proses update."
      });
    }


    // ==================================================
    // HAPUS GAMBAR LAMA JIKA GAMBAR DIGANTI
    // ==================================================
    if (req.file && dataLama.gambar_url) {
      const marker = "/storage/v1/object/public/informasi/";

      if (dataLama.gambar_url.includes(marker)) {
        try {
          const url = new URL(dataLama.gambar_url);

          const oldFilePath = decodeURIComponent(
            url.pathname.split(marker)[1]
          );

          if (oldFilePath) {
            const { error: deleteOldImageError } = await supabase.storage
              .from("informasi")
              .remove([oldFilePath]);

            if (deleteOldImageError) {
              console.error(
                "Gagal menghapus gambar lama:",
                deleteOldImageError
              );
            }
          }

        } catch (error) {
          console.error(
            "Gagal membaca URL gambar lama:",
            error
          );
        }
      }
    }


    return res.status(200).json({
      success: true,
      message: "Informasi berhasil diperbarui!",
      data: data[0]
    });

  } catch (error) {
    console.error("Error Update Informasi:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengupdate informasi."
    });
  }
};


// ==================================================
// 4. DELETE INFORMASI
// ==================================================
const deleteInformasi = async (req, res) => {
  try {
    // ================= CEK ADMIN =================
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak! Hanya Admin."
      });
    }


    const { id } = req.params;


    // ==================================================
    // AMBIL DATA INFORMASI
    // ==================================================
    const { data: dataInformasi, error: getError } = await supabase
      .from("informasi")
      .select("*")
      .eq("id", id)
      .single();


    if (getError || !dataInformasi) {
      return res.status(404).json({
        success: false,
        message: "Data informasi tidak ditemukan."
      });
    }


    // ==================================================
    // HAPUS GAMBAR DARI SUPABASE STORAGE
    // ==================================================
    const gambarUrl = dataInformasi.gambar_url;

    if (
      gambarUrl &&
      gambarUrl.includes("/storage/v1/object/public/informasi/")
    ) {
      try {
        const marker =
          "/storage/v1/object/public/informasi/";

        const url =
          new URL(gambarUrl);

        const filePath =
          decodeURIComponent(
            url.pathname.split(marker)[1]
          );


        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("informasi")
            .remove([filePath]);


          if (storageError) {
            console.error(
              "Gagal menghapus gambar informasi dari Storage:",
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
          "Error membaca URL gambar informasi:",
          storageParseError
        );
      }
    }


    // ==================================================
    // HAPUS DATA DATABASE
    // ==================================================
    const { error: deleteError } = await supabase
      .from("informasi")
      .delete()
      .eq("id", id);


    if (deleteError) {
      throw deleteError;
    }


    return res.status(200).json({
      success: true,
      message: "Informasi berhasil dihapus!"
    });

  } catch (error) {
    console.error("Error Delete Informasi:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal menghapus informasi."
    });
  }
};


// ==================================================
// EXPORT CONTROLLER
// ==================================================
module.exports = {
  getInformasi,
  createInformasi,
  updateInformasi,
  deleteInformasi
};