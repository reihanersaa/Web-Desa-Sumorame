const supabase = require("../config/supabase");


// ==================================================
// 1. GET SEMUA CMS PROFIL
// ==================================================
const getCmsProfil = async (req, res) => {
  try {

    const { data, error } = await supabase
      .from("cmsprofil")
      .select("*")
      .order("created_at", {
        ascending: false
      });


    if (error) {
      throw error;
    }


    return res.status(200).json({
      success: true,
      data: data || []
    });


  } catch (error) {

    console.error(
      "Error Get CMS Profil:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal mengambil data CMS Profil."
    });
  }
};


// ==================================================
// 2. TAMBAH CMS PROFIL
// ==================================================
const createCmsProfil = async (req, res) => {

  let filePath = null;

  try {

    // ================= CEK ADMIN =================
    if (
      !req.user ||
      req.user.role !== "admin"
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Akses Ditolak! Hanya Admin."
      });
    }


    const {
      judul_hero,
      deskripsi_hero,
      sambutan,
      visi,
      misi
    } = req.body || {};


    const admin_id =
      req.user.id;


    // ================= VALIDASI =================
    if (
      !judul_hero ||
      !deskripsi_hero ||
      !sambutan ||
      !visi ||
      !misi
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Judul hero, deskripsi hero, sambutan, visi, dan misi wajib diisi!"
      });
    }


    // ================= VALIDASI GAMBAR =================
    if (!req.file) {

      return res.status(400).json({
        success: false,
        message:
          "Gambar hero wajib dipilih!"
      });
    }


    // ==================================================
    // BUAT NAMA FILE
    // ==================================================
    const fileExtension =
      req.file.originalname
        .split(".")
        .pop()
        .toLowerCase();


    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExtension}`;


    filePath = fileName;


    // ==================================================
    // UPLOAD GAMBAR KE STORAGE
    // ==================================================
    const {
      error: uploadError
    } = await supabase.storage
      .from("cms-profil")
      .upload(
        filePath,
        req.file.buffer,
        {
          contentType:
            req.file.mimetype,

          upsert: false
        }
      );


    if (uploadError) {

      console.error(
        "Upload Error Tambah CMS Profil:",
        uploadError
      );


      return res.status(500).json({
        success: false,
        message:
          "Gagal upload gambar: " +
          uploadError.message
      });
    }


    // ==================================================
    // AMBIL PUBLIC URL
    // ==================================================
    const {
      data: publicUrlData
    } = supabase.storage
      .from("cms-profil")
      .getPublicUrl(filePath);


    const gambar_url =
      publicUrlData.publicUrl;


    // ==================================================
    // SIMPAN KE DATABASE
    // ==================================================
    const {
      data,
      error
    } = await supabase
      .from("cmsprofil")
      .insert([
        {
          admin_id:
            admin_id,

          judul_hero:
            judul_hero.trim(),

          deskripsi_hero:
            deskripsi_hero.trim(),

          sambutan:
            sambutan.trim(),

          visi:
            visi.trim(),

          misi:
            misi.trim(),

          gambar_url:
            gambar_url
        }
      ])
      .select();


    // ==================================================
    // JIKA DATABASE GAGAL
    // ==================================================
    if (error) {

      await supabase.storage
        .from("cms-profil")
        .remove([
          filePath
        ]);


      throw error;
    }


    return res.status(201).json({
      success: true,
      message:
        "CMS Profil berhasil ditambahkan!",
      data:
        data?.[0] || null
    });


  } catch (error) {

    console.error(
      "Error Create CMS Profil:",
      error
    );


    // Jika terjadi error setelah file terupload,
    // bersihkan file
    if (filePath) {

      try {

        await supabase.storage
          .from("cms-profil")
          .remove([
            filePath
          ]);

      } catch (hapusError) {

        console.error(
          "Gagal membersihkan file:",
          hapusError
        );
      }
    }


    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal menambah CMS Profil."
    });
  }
};


// ==================================================
// 3. UPDATE CMS PROFIL
// ==================================================
const updateCmsProfil = async (req, res) => {

  let filePathBaru = null;

  try {

    console.log(
      "===== UPDATE CMS PROFIL ====="
    );

    console.log(
      "Content-Type:",
      req.headers["content-type"]
    );

    console.log(
      "Body:",
      req.body
    );

    console.log(
      "File:",
      req.file
    );


    // ================= CEK ADMIN =================
    if (
      !req.user ||
      req.user.role !== "admin"
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Akses Ditolak! Hanya Admin."
      });
    }


    const { id } =
      req.params;


    const {
      judul_hero,
      deskripsi_hero,
      sambutan,
      visi,
      misi
    } = req.body || {};


    // ================= VALIDASI ID =================
    if (!id) {

      return res.status(400).json({
        success: false,
        message:
          "ID CMS Profil tidak ditemukan."
      });
    }


    // ================= VALIDASI FIELD =================
    if (
      !judul_hero ||
      !deskripsi_hero ||
      !sambutan ||
      !visi ||
      !misi
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Judul hero, deskripsi hero, sambutan, visi, dan misi wajib diisi!"
      });
    }


    // ==================================================
    // AMBIL DATA LAMA
    // ==================================================
    const {
      data: dataLama,
      error: getError
    } = await supabase
      .from("cmsprofil")
      .select("*")
      .eq("id", id)
      .maybeSingle();


    if (getError) {
      throw getError;
    }


    if (!dataLama) {

      return res.status(404).json({
        success: false,
        message:
          "Data CMS Profil tidak ditemukan."
      });
    }


    // ==================================================
    // DEFAULT GAMBAR LAMA
    // ==================================================
    let gambar_url =
      dataLama.gambar_url;


    // ==================================================
    // JIKA ADA GAMBAR BARU
    // ==================================================
    if (req.file) {

      const fileExtension =
        req.file.originalname
          .split(".")
          .pop()
          .toLowerCase();


      const fileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExtension}`;


      filePathBaru =
        fileName;


      // ==================================================
      // UPLOAD GAMBAR BARU
      // ==================================================
      const {
        error: uploadError
      } = await supabase.storage
        .from("cms-profil")
        .upload(
          filePathBaru,
          req.file.buffer,
          {
            contentType:
              req.file.mimetype,

            upsert: false
          }
        );


      if (uploadError) {

        return res.status(500).json({
          success: false,
          message:
            "Gagal upload gambar: " +
            uploadError.message
        });
      }


      // ==================================================
      // AMBIL PUBLIC URL BARU
      // ==================================================
      const {
        data: publicUrlData
      } = supabase.storage
        .from("cms-profil")
        .getPublicUrl(
          filePathBaru
        );


      gambar_url =
        publicUrlData.publicUrl;
    }


    // ==================================================
    // UPDATE DATABASE
    // ==================================================
    const {
      data,
      error
    } = await supabase
      .from("cmsprofil")
      .update({

        judul_hero:
          judul_hero.trim(),

        deskripsi_hero:
          deskripsi_hero.trim(),

        sambutan:
          sambutan.trim(),

        visi:
          visi.trim(),

        misi:
          misi.trim(),

        gambar_url:
          gambar_url,

        updated_at:
          new Date().toISOString()

      })
      .eq("id", id)
      .select();


    // ==================================================
    // JIKA DATABASE GAGAL
    // ==================================================
    if (error) {

      if (filePathBaru) {

        await supabase.storage
          .from("cms-profil")
          .remove([
            filePathBaru
          ]);
      }


      throw error;
    }


    if (
      !data ||
      data.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Data CMS Profil tidak ditemukan setelah proses update."
      });
    }


    // ==================================================
    // HAPUS GAMBAR LAMA
    // ==================================================
    if (
      req.file &&
      dataLama.gambar_url
    ) {

      const marker =
        "/storage/v1/object/public/cms-profil/";


      if (
        dataLama.gambar_url.includes(
          marker
        )
      ) {

        try {

          const url =
            new URL(
              dataLama.gambar_url
            );


          const oldFilePath =
            decodeURIComponent(
              url.pathname
                .split(marker)[1]
            );


          if (oldFilePath) {

            const {
              error: deleteOldImageError
            } = await supabase.storage
              .from("cms-profil")
              .remove([
                oldFilePath
              ]);


            if (
              deleteOldImageError
            ) {

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
      message:
        "CMS Profil berhasil diperbarui!",
      data:
        data[0]
    });


  } catch (error) {

    console.error(
      "Error Update CMS Profil:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal mengupdate CMS Profil."
    });
  }
};


// ==================================================
// 4. DELETE CMS PROFIL
// ==================================================
const deleteCmsProfil = async (req, res) => {

  try {

    // ================= CEK ADMIN =================
    if (
      !req.user ||
      req.user.role !== "admin"
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Akses Ditolak! Hanya Admin."
      });
    }


    const { id } =
      req.params;


    if (!id) {

      return res.status(400).json({
        success: false,
        message:
          "ID CMS Profil tidak ditemukan."
      });
    }


    // ==================================================
    // AMBIL DATA CMS PROFIL
    // ==================================================
    const {
      data: dataCmsProfil,
      error: getError
    } = await supabase
      .from("cmsprofil")
      .select("*")
      .eq("id", id)
      .maybeSingle();


    if (getError) {
      throw getError;
    }


    if (!dataCmsProfil) {

      return res.status(404).json({
        success: false,
        message:
          "Data CMS Profil tidak ditemukan."
      });
    }


    // ==================================================
    // HAPUS GAMBAR DARI STORAGE
    // ==================================================
    const gambarUrl =
      dataCmsProfil.gambar_url;


    if (
      gambarUrl &&
      gambarUrl.includes(
        "/storage/v1/object/public/cms-profil/"
      )
    ) {

      try {

        const marker =
          "/storage/v1/object/public/cms-profil/";


        const url =
          new URL(
            gambarUrl
          );


        const filePath =
          decodeURIComponent(
            url.pathname
              .split(marker)[1]
          );


        if (filePath) {

          const {
            error: storageError
          } = await supabase.storage
            .from("cms-profil")
            .remove([
              filePath
            ]);


          if (storageError) {

            console.error(
              "Gagal menghapus gambar CMS Profil dari Storage:",
              storageError
            );


            return res.status(500).json({
              success: false,
              message:
                "Gagal menghapus gambar dari Storage."
            });
          }
        }


      } catch (
        storageParseError
      ) {

        console.error(
          "Error membaca URL gambar CMS Profil:",
          storageParseError
        );
      }
    }


    // ==================================================
    // HAPUS DATA DATABASE
    // ==================================================
    const {
      error: deleteError
    } = await supabase
      .from("cmsprofil")
      .delete()
      .eq("id", id);


    if (deleteError) {
      throw deleteError;
    }


    return res.status(200).json({
      success: true,
      message:
        "CMS Profil berhasil dihapus!"
    });


  } catch (error) {

    console.error(
      "Error Delete CMS Profil:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal menghapus CMS Profil."
    });
  }
};


// ==================================================
// EXPORT CONTROLLER
// ==================================================
module.exports = {
  getCmsProfil,
  createCmsProfil,
  updateCmsProfil,
  deleteCmsProfil
};