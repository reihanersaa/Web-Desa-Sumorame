const supabase = require("../config/supabase");


// ==================================================
// 1. GET SEMUA KELEMBAGAAN
// ==================================================
const getKelembagaan = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("kelembagaan")
      .select("*")
      .order("nama", { ascending: true });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Error Get Kelembagaan:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data kelembagaan."
    });
  }
};


// ==================================================
// 2. TAMBAH KELEMBAGAAN
// ==================================================
const createKelembagaan = async (req, res) => {
  try {
    // ================= CEK ADMIN =================
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak! Hanya Admin."
      });
    }

    const {
      nama,
      pengertian,
      tugas,
      tujuan
    } = req.body || {};

    const admin_id = req.user.id;


    // ================= VALIDASI =================
    if (!nama || !pengertian || !tugas || !tujuan) {
      return res.status(400).json({
        success: false,
        message: "Nama, pengertian, tugas, dan tujuan wajib diisi!"
      });
    }


    // ================= VALIDASI GAMBAR =================
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Gambar kelembagaan wajib dipilih!"
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
      .from("kelembagaan")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error(
        "Upload Error Tambah Kelembagaan:",
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
      .from("kelembagaan")
      .getPublicUrl(filePath);

    const gambar_url = publicUrlData.publicUrl;


    // ==================================================
    // SIMPAN KE DATABASE
    // ==================================================
    const { data, error } = await supabase
      .from("kelembagaan")
      .insert([
        {
          admin_id: admin_id,
          nama: nama,
          pengertian: pengertian,
          tugas: tugas,
          tujuan: tujuan,
          gambar_url: gambar_url
        }
      ])
      .select();

    if (error) {
      // Kalau insert database gagal, hapus gambar yang tadi sudah di-upload
      await supabase.storage
        .from("kelembagaan")
        .remove([filePath]);

      throw error;
    }


    return res.status(201).json({
      success: true,
      message: "Kelembagaan berhasil ditambahkan!",
      data: data[0]
    });

  } catch (error) {
    console.error("Error Create Kelembagaan:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal menambah kelembagaan."
    });
  }
};


// ==================================================
// 3. UPDATE KELEMBAGAAN
// ==================================================
const updateKelembagaan = async (req, res) => {
  try {
    console.log("===== UPDATE KELEMBAGAAN =====");
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
      nama,
      pengertian,
      tugas,
      tujuan
    } = req.body || {};


    // ================= VALIDASI =================
    if (!nama || !pengertian || !tugas || !tujuan) {
      return res.status(400).json({
        success: false,
        message: "Nama, pengertian, tugas, dan tujuan wajib diisi!"
      });
    }


    // ==================================================
    // AMBIL DATA LAMA
    // ==================================================
    const { data: dataLama, error: getError } = await supabase
      .from("kelembagaan")
      .select("*")
      .eq("id", id)
      .single();


    if (getError || !dataLama) {
      return res.status(404).json({
        success: false,
        message: "Data kelembagaan tidak ditemukan."
      });
    }


    if (!dataLama) {
      return res.status(404).json({
        success: false,
        message: "Data kelembagaan tidak ditemukan."
      });
    }


    // ==================================================
    // DEFAULT GUNAKAN GAMBAR LAMA
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


      // ================= UPLOAD =================
      const { error: uploadError } = await supabase.storage
        .from("kelembagaan")
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


      // ================= PUBLIC URL =================
      const { data: publicUrlData } = supabase.storage
        .from("kelembagaan")
        .getPublicUrl(filePathBaru);

      gambar_url = publicUrlData.publicUrl;
    }


    // ==================================================
    // UPDATE DATABASE
    // ==================================================
    const { data, error } = await supabase
      .from("kelembagaan")
      .update({
        nama: nama,
        pengertian: pengertian,
        tugas: tugas,
        tujuan: tujuan,
        gambar_url: gambar_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();


    if (error) {
      // Kalau database gagal update dan sudah upload gambar baru,
      // hapus gambar baru tersebut agar tidak menjadi file sampah.
      if (filePathBaru) {
        await supabase.storage
          .from("kelembagaan")
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
        message: "Data kelembagaan tidak ditemukan setelah proses update."
      });
    }


    // ==================================================
    // HAPUS GAMBAR LAMA JIKA DIGANTI
    // ==================================================
    if (req.file && dataLama.gambar_url) {
      const marker = "/storage/v1/object/public/kelembagaan/";

      if (dataLama.gambar_url.includes(marker)) {
        try {
          const url = new URL(dataLama.gambar_url);

          const oldFilePath = decodeURIComponent(
            url.pathname.split(marker)[1]
          );

          if (oldFilePath) {
            const { error: deleteOldImageError } = await supabase.storage
              .from("kelembagaan")
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
      message: "Kelembagaan berhasil diperbarui!",
      data: data[0]
    });

  } catch (error) {
    console.error("Error Update Kelembagaan:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengupdate kelembagaan."
    });
  }
};


// ==================================================
// 4. DELETE KELEMBAGAAN
// ==================================================
const deleteKelembagaan = async (req, res) => {
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
    // AMBIL DATA KELEMBAGAAN
    // ==================================================
    const { data: dataKelembagaan, error: getError } = await supabase
      .from("kelembagaan")
      .select("*")
      .eq("id", id)
      .single();


    if (getError || !dataKelembagaan) {
      return res.status(404).json({
        success: false,
        message: "Data kelembagaan tidak ditemukan."
      });
    }


    // ==================================================
    // HAPUS GAMBAR DARI STORAGE
    // ==================================================
    const gambarUrl = dataKelembagaan.gambar_url;

    if (
      gambarUrl &&
      gambarUrl.includes("/storage/v1/object/public/kelembagaan/")
    ) {
      try {
        const marker = "/storage/v1/object/public/kelembagaan/";

        const url = new URL(gambarUrl);

        const filePath = decodeURIComponent(
          url.pathname.split(marker)[1]
        );


        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("kelembagaan")
            .remove([filePath]);


          if (storageError) {
            console.error(
              "Gagal menghapus gambar kelembagaan dari Storage:",
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
          "Error membaca URL gambar kelembagaan:",
          storageParseError
        );
      }
    }


    // ==================================================
    // HAPUS DATA DATABASE
    // ==================================================
    const { error: deleteError } = await supabase
      .from("kelembagaan")
      .delete()
      .eq("id", id);


    if (deleteError) {
      throw deleteError;
    }


    return res.status(200).json({
      success: true,
      message: "Kelembagaan berhasil dihapus!"
    });

  } catch (error) {
    console.error("Error Delete Kelembagaan:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal menghapus kelembagaan."
    });
  }
};


// ==================================================
// EXPORT CONTROLLER
// ==================================================
module.exports = {
  getKelembagaan,
  createKelembagaan,
  updateKelembagaan,
  deleteKelembagaan
};