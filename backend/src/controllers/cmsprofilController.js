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
        ascending: true
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error("Error Get CMS Profil:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data CMS Profil."
    });
  }
};


// ==================================================
// 2. TAMBAH CMS PROFIL
// ==================================================
const createCmsProfil = async (req, res) => {

  let filePathGambar = null;
  let filePathFotoKades = null;

  try {
    // ================= CEK ADMIN =================
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak! Hanya Admin."
      });
    }

    const {
      judul_hero,
      deskripsi_hero,
      nama_kades, // 🚨 Ditambahkan di sini
      sambutan,
      visi,
      misi
    } = req.body || {};

    const admin_id = req.user.id;

    // ================= VALIDASI =================
    // 🚨 nama_kades ditambahkan di pengecekan ini
    if (!judul_hero || !deskripsi_hero || !nama_kades || !sambutan || !visi || !misi) {
      return res.status(400).json({
        success: false,
        message: "Semua field teks (termasuk nama kades) wajib diisi!"
      });
    }

    // ================= VALIDASI GAMBAR =================
    const files = req.files || {};
    const fileGambar = files['gambar'] ? files['gambar'][0] : null;
    const fileFotoKades = files['foto_kades'] ? files['foto_kades'][0] : null;

    if (!fileGambar) {
      return res.status(400).json({
        success: false,
        message: "Gambar hero wajib dipilih!"
      });
    }

    // ==================================================
    // UPLOAD GAMBAR HERO
    // ==================================================
    const extGambar = fileGambar.originalname.split(".").pop().toLowerCase();
    filePathGambar = `hero_${Date.now()}-${Math.random().toString(36).substring(2)}.${extGambar}`;

    const { error: uploadErrorGambar } = await supabase.storage
      .from("cms-profil")
      .upload(filePathGambar, fileGambar.buffer, {
        contentType: fileGambar.mimetype,
        upsert: false
      });

    if (uploadErrorGambar) throw uploadErrorGambar;

    const { data: publicUrlDataGambar } = supabase.storage
      .from("cms-profil")
      .getPublicUrl(filePathGambar);
      
    const gambar_url = publicUrlDataGambar.publicUrl;

    // ==================================================
    // UPLOAD FOTO KADES (JIKA ADA)
    // ==================================================
    let foto_kades_url = null;
    if (fileFotoKades) {
      const extKades = fileFotoKades.originalname.split(".").pop().toLowerCase();
      filePathFotoKades = `kades_${Date.now()}-${Math.random().toString(36).substring(2)}.${extKades}`;

      const { error: uploadErrorKades } = await supabase.storage
        .from("cms-profil")
        .upload(filePathFotoKades, fileFotoKades.buffer, {
          contentType: fileFotoKades.mimetype,
          upsert: false
        });

      if (uploadErrorKades) throw uploadErrorKades;

      const { data: publicUrlDataKades } = supabase.storage
        .from("cms-profil")
        .getPublicUrl(filePathFotoKades);

      foto_kades_url = publicUrlDataKades.publicUrl;
    }

    // ==================================================
    // SIMPAN KE DATABASE
    // ==================================================
    const { data, error } = await supabase
      .from("cmsprofil")
      .insert([{
          admin_id: admin_id,
          judul_hero: judul_hero.trim(),
          deskripsi_hero: deskripsi_hero.trim(),
          sambutan: sambutan.trim(),
          visi: visi.trim(),
          misi: misi.trim(),
          gambar_url: gambar_url,
          foto_kades_url: foto_kades_url,
          nama_kades: nama_kades.trim() // 🚨 Ditambahkan di sini
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "CMS Profil berhasil ditambahkan!",
      data: data?.[0] || null
    });

  } catch (error) {
    console.error("Error Create CMS Profil:", error);

    // Rollback: Hapus file yang sempat terupload jika database error
    if (filePathGambar) await supabase.storage.from("cms-profil").remove([filePathGambar]);
    if (filePathFotoKades) await supabase.storage.from("cms-profil").remove([filePathFotoKades]);

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal menambah CMS Profil."
    });
  }
};


// ==================================================
// 3. UPDATE CMS PROFIL
// ==================================================
const updateCmsProfil = async (req, res) => {

  let filePathGambarBaru = null;
  let filePathFotoKadesBaru = null;

  try {
    // ================= CEK ADMIN =================
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Akses Ditolak! Hanya Admin." });
    }

    const { id } = req.params;
    const { judul_hero, deskripsi_hero, nama_kades, sambutan, visi, misi } = req.body || {};

    if (!id) return res.status(400).json({ success: false, message: "ID tidak ditemukan." });
    
    // 🚨 nama_kades ditambahkan di validasi ini
    if (!judul_hero || !deskripsi_hero || !nama_kades || !sambutan || !visi || !misi) {
      return res.status(400).json({ success: false, message: "Semua field teks wajib diisi!" });
    }

    // ================= AMBIL DATA LAMA =================
    const { data: dataLama, error: getError } = await supabase
      .from("cmsprofil")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (getError) throw getError;
    if (!dataLama) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });

    let gambar_url = dataLama.gambar_url;
    let foto_kades_url = dataLama.foto_kades_url;

    // ================= TANGKAP FILE =================
    const files = req.files || {};
    const fileGambar = files['gambar'] ? files['gambar'][0] : null;
    const fileFotoKades = files['foto_kades'] ? files['foto_kades'][0] : null;

    // ================= UPLOAD GAMBAR BARU (JIKA ADA) =================
    if (fileGambar) {
      const ext = fileGambar.originalname.split(".").pop().toLowerCase();
      filePathGambarBaru = `hero_${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("cms-profil").upload(filePathGambarBaru, fileGambar.buffer, { contentType: fileGambar.mimetype, upsert: false });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("cms-profil").getPublicUrl(filePathGambarBaru);
      gambar_url = publicUrlData.publicUrl;
    }

    // ================= UPLOAD FOTO KADES BARU (JIKA ADA) =================
    if (fileFotoKades) {
      const ext = fileFotoKades.originalname.split(".").pop().toLowerCase();
      filePathFotoKadesBaru = `kades_${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("cms-profil").upload(filePathFotoKadesBaru, fileFotoKades.buffer, { contentType: fileFotoKades.mimetype, upsert: false });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("cms-profil").getPublicUrl(filePathFotoKadesBaru);
      foto_kades_url = publicUrlData.publicUrl;
    }

    // ================= UPDATE DATABASE =================
    const { data, error } = await supabase
      .from("cmsprofil")
      .update({
        judul_hero: judul_hero.trim(),
        deskripsi_hero: deskripsi_hero.trim(),
        sambutan: sambutan.trim(),
        visi: visi.trim(),
        misi: misi.trim(),
        gambar_url: gambar_url,
        foto_kades_url: foto_kades_url,
        nama_kades: nama_kades.trim(),
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();

    if (error) {
      // Rollback jika update DB gagal
      if (filePathGambarBaru) await supabase.storage.from("cms-profil").remove([filePathGambarBaru]);
      if (filePathFotoKadesBaru) await supabase.storage.from("cms-profil").remove([filePathFotoKadesBaru]);
      throw error;
    }

    // ================= FUNGSI HAPUS GAMBAR LAMA =================
    const hapusGambarLama = async (urlLama) => {
      const marker = "/storage/v1/object/public/cms-profil/";
      if (urlLama && urlLama.includes(marker)) {
        try {
          const url = new URL(urlLama);
          const oldFilePath = decodeURIComponent(url.pathname.split(marker)[1]);
          if (oldFilePath) {
            await supabase.storage.from("cms-profil").remove([oldFilePath]);
          }
        } catch (err) {
          console.error("Gagal menghapus gambar lama:", err);
        }
      }
    };

    // Eksekusi hapus jika tergantikan
    if (fileGambar && dataLama.gambar_url) await hapusGambarLama(dataLama.gambar_url);
    if (fileFotoKades && dataLama.foto_kades_url) await hapusGambarLama(dataLama.foto_kades_url);

    return res.status(200).json({
      success: true,
      message: "CMS Profil berhasil diperbarui!",
      data: data[0]
    });

  } catch (error) {
    console.error("Error Update CMS Profil:", error);
    return res.status(500).json({ success: false, message: error.message || "Gagal mengupdate CMS Profil." });
  }
};


// ==================================================
// 4. DELETE CMS PROFIL
// ==================================================
const deleteCmsProfil = async (req, res) => {
  try {
    // ================= CEK ADMIN =================
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Akses Ditolak! Hanya Admin." });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "ID tidak ditemukan." });

    // ================= AMBIL DATA CMS PROFIL =================
    const { data: dataCmsProfil, error: getError } = await supabase
      .from("cmsprofil")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (getError) throw getError;
    if (!dataCmsProfil) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });

    // ================= FUNGSI HAPUS STORAGE =================
    const hapusGambar = async (urlGambar) => {
      const marker = "/storage/v1/object/public/cms-profil/";
      if (urlGambar && urlGambar.includes(marker)) {
        try {
          const url = new URL(urlGambar);
          const filePath = decodeURIComponent(url.pathname.split(marker)[1]);
          if (filePath) await supabase.storage.from("cms-profil").remove([filePath]);
        } catch (err) {
          console.error("Gagal hapus gambar dari storage:", err);
        }
      }
    };

    // Hapus kedua file jika ada
    await hapusGambar(dataCmsProfil.gambar_url);
    await hapusGambar(dataCmsProfil.foto_kades_url);

    // ================= HAPUS DATA DATABASE =================
    const { error: deleteError } = await supabase
      .from("cmsprofil")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return res.status(200).json({
      success: true,
      message: "CMS Profil berhasil dihapus!"
    });

  } catch (error) {
    console.error("Error Delete CMS Profil:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Gagal menghapus CMS Profil."
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