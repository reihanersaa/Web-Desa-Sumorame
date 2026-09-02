const supabase = require("../config/supabase");

// ==================================================
// 1. GET SEMUA CMS PROFIL
// ==================================================
const getCmsProfil = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cmsprofil")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

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
  let filePathGambar = null, filePathFotoKades = null, filePathModal = null;

  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Akses Ditolak! Hanya Admin." });
    }

    const {
      judul_hero,
      deskripsi_hero,
      nama_kades,
      sambutan,
      visi,
      misi,
      peraturan_judul,
      peraturan_isi,
      email_desa,
      no_telp_desa
    } = req.body || {};

    if (!judul_hero || !deskripsi_hero || !nama_kades || !sambutan || !visi || !misi) {
      return res.status(400).json({ success: false, message: "Semua field teks profil wajib diisi!" });
    }

    const files = req.files || {};
    const fileGambar = files["gambar"]?.[0];
    const fileFotoKades = files["foto_kades"]?.[0];
    const fileGambarModal = files["gambar_modal"]?.[0];

    if (!fileGambar) {
      return res.status(400).json({ success: false, message: "Gambar hero wajib dipilih!" });
    }

    // Helper upload file
    const uploadFile = async (file, prefix) => {
      if (!file) return null;
      const ext = file.originalname.split(".").pop().toLowerCase();
      const path = `${prefix}_${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const { error } = await supabase.storage.from("cms-profil").upload(path, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      const { data } = supabase.storage.from("cms-profil").getPublicUrl(path);
      return { url: data.publicUrl, path };
    };

    // Proses Upload
    const uploadHero = await uploadFile(fileGambar, "hero");
    filePathGambar = uploadHero?.path;
    const gambar_url = uploadHero?.url;

    const uploadKades = await uploadFile(fileFotoKades, "kades");
    filePathFotoKades = uploadKades?.path;
    const foto_kades_url = uploadKades?.url;

    const uploadModal = await uploadFile(fileGambarModal, "modal");
    filePathModal = uploadModal?.path;
    const gambar_modal_url = uploadModal?.url;

    // ==================================================
    // SIMPAN KE DATABASE (Hanya 1 kali insert)
    // ==================================================
    const { data, error } = await supabase.from("cmsprofil").insert([
      {
        admin_id: req.user.id,
        judul_hero: judul_hero.trim(),
        deskripsi_hero: deskripsi_hero.trim(),
        nama_kades: nama_kades.trim(),
        sambutan: sambutan.trim(),
        visi: visi.trim(),
        misi: misi.trim(),
        peraturan_judul: peraturan_judul ? peraturan_judul.trim() : null,
        peraturan_isi: peraturan_isi ? peraturan_isi.trim() : null,
        email_desa: email_desa ? email_desa.trim() : null,
        no_telp_desa: no_telp_desa ? no_telp_desa.trim() : null,
        gambar_url,
        foto_kades_url,
        gambar_modal_url
      }
    ]).select();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Data CMS Profil berhasil ditambahkan!",
      data: data?.[0] || null
    });
  } catch (error) {
    // Bersihkan gambar jika terjadi error
    if (filePathGambar) await supabase.storage.from("cms-profil").remove([filePathGambar]);
    if (filePathFotoKades) await supabase.storage.from("cms-profil").remove([filePathFotoKades]);
    if (filePathModal) await supabase.storage.from("cms-profil").remove([filePathModal]);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================================================
// 3. UPDATE CMS PROFIL
// ==================================================
const updateCmsProfil = async (req, res) => {
  let pathsBaru = [];

  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Akses Ditolak! Hanya Admin." });
    }

    const { id } = req.params;
    const {
      judul_hero,
      deskripsi_hero,
      nama_kades,
      sambutan,
      visi,
      misi,
      peraturan_judul,
      peraturan_isi,
      email_desa,
      no_telp_desa
    } = req.body || {};

    if (!id || !judul_hero || !deskripsi_hero || !nama_kades || !sambutan || !visi || !misi) {
      return res.status(400).json({ success: false, message: "Semua field teks profil wajib diisi!" });
    }

    const { data: dataLama, error: getError } = await supabase
      .from("cmsprofil")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (getError) throw getError;
    if (!dataLama) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });

    let { gambar_url, foto_kades_url, gambar_modal_url } = dataLama;
    const files = req.files || {};

    const uploadFile = async (file, prefix) => {
      if (!file) return null;
      const ext = file.originalname.split(".").pop().toLowerCase();
      const path = `${prefix}_${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const { error } = await supabase.storage.from("cms-profil").upload(path, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      pathsBaru.push(path);
      const { data } = supabase.storage.from("cms-profil").getPublicUrl(path);
      return data.publicUrl;
    };

    if (files["gambar"]) gambar_url = await uploadFile(files["gambar"][0], "hero");
    if (files["foto_kades"]) foto_kades_url = await uploadFile(files["foto_kades"][0], "kades");
    if (files["gambar_modal"]) gambar_modal_url = await uploadFile(files["gambar_modal"][0], "modal");

    // ==================================================
    // UPDATE KE DATABASE (Kunci nama_kades tidak ganda, gambar_modal_url ditambahkan)
    // ==================================================
    const { data, error } = await supabase
      .from("cmsprofil")
      .update({
        judul_hero: judul_hero.trim(),
        deskripsi_hero: deskripsi_hero.trim(),
        nama_kades: nama_kades.trim(),
        sambutan: sambutan.trim(),
        visi: visi.trim(),
        misi: misi.trim(),
        peraturan_judul: peraturan_judul ? peraturan_judul.trim() : null,
        peraturan_isi: peraturan_isi ? peraturan_isi.trim() : null,
        email_desa: email_desa ? email_desa.trim() : null,
        no_telp_desa: no_telp_desa ? no_telp_desa.trim() : null,
        gambar_url,
        foto_kades_url,
        gambar_modal_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    const hapusGambarLama = async (urlLama) => {
      const marker = "/storage/v1/object/public/cms-profil/";
      if (urlLama && urlLama.includes(marker)) {
        try {
          const oldFilePath = decodeURIComponent(new URL(urlLama).pathname.split(marker)[1]);
          if (oldFilePath) await supabase.storage.from("cms-profil").remove([oldFilePath]);
        } catch (err) {}
      }
    };

    if (files["gambar"] && dataLama.gambar_url) await hapusGambarLama(dataLama.gambar_url);
    if (files["foto_kades"] && dataLama.foto_kades_url) await hapusGambarLama(dataLama.foto_kades_url);
    if (files["gambar_modal"] && dataLama.gambar_modal_url) await hapusGambarLama(dataLama.gambar_modal_url);

    return res.status(200).json({
      success: true,
      message: "CMS Profil berhasil diperbarui!",
      data: data[0]
    });
  } catch (error) {
    if (pathsBaru.length > 0) await supabase.storage.from("cms-profil").remove(pathsBaru);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================================================
// 4. DELETE CMS PROFIL
// ==================================================
const deleteCmsProfil = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Akses Ditolak! Hanya Admin." });
    }

    const { id } = req.params;
    const { data: dataCmsProfil } = await supabase.from("cmsprofil").select("*").eq("id", id).maybeSingle();
    if (!dataCmsProfil) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });

    const hapusGambar = async (urlGambar) => {
      const marker = "/storage/v1/object/public/cms-profil/";
      if (urlGambar && urlGambar.includes(marker)) {
        try {
          const filePath = decodeURIComponent(new URL(urlGambar).pathname.split(marker)[1]);
          if (filePath) await supabase.storage.from("cms-profil").remove([filePath]);
        } catch (err) {}
      }
    };

    await hapusGambar(dataCmsProfil.gambar_url);
    await hapusGambar(dataCmsProfil.foto_kades_url);
    await hapusGambar(dataCmsProfil.gambar_modal_url);

    const { error: deleteError } = await supabase.from("cmsprofil").delete().eq("id", id);
    if (deleteError) throw deleteError;

    return res.status(200).json({ success: true, message: "Data berhasil dihapus!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCmsProfil,
  createCmsProfil,
  updateCmsProfil,
  deleteCmsProfil
};