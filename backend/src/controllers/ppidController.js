const supabase = require("../config/supabase");


// ==================================================
// KONFIGURASI BUCKET
// ==================================================
const PPID_BUCKET = "ppid";


// ==================================================
// HELPER - CEK ADMIN
// ==================================================
const cekAdmin = (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Akses Ditolak! Hanya Admin."
    });

    return false;
  }

  return true;
};


// ==================================================
// HELPER - BUAT NAMA FILE
// ==================================================
const buatNamaFile = (originalName) => {
  const extension = originalName
    .split(".")
    .pop()
    .toLowerCase();

  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${extension}`;
};


// ==================================================
// HELPER - AMBIL PATH FILE DARI URL SUPABASE
// ==================================================
const ambilPathStorage = (publicUrl, bucket) => {
  if (!publicUrl) return null;

  try {
    const marker =
      `/storage/v1/object/public/${bucket}/`;

    if (!publicUrl.includes(marker)) {
      return null;
    }

    const url = new URL(publicUrl);

    return decodeURIComponent(
      url.pathname.split(marker)[1]
    );

  } catch (error) {
    console.error(
      "Gagal membaca URL Storage:",
      error
    );

    return null;
  }
};


// ==================================================
// 1. GET STRUKTUR PPID
// GET /api/ppid
// PUBLIC
// ==================================================
const getStrukturPPID = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ppid")
      .select("*")
      .order("created_at", {
        ascending: false
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: data || null
    });

  } catch (error) {
    console.error(
      "Error Get Struktur PPID:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal mengambil struktur PPID."
    });
  }
};


// ==================================================
// 2. UPDATE / SIMPAN STRUKTUR PPID
// PUT /api/ppid/struktur
// ADMIN
// ==================================================
const updateStrukturPPID = async (req, res) => {
  let filePathBaru = null;

  try {

    // ================= CEK ADMIN =================
    if (!cekAdmin(req, res)) return;


    // ================= VALIDASI FILE =================
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Gambar struktur wajib dipilih!"
      });
    }


    // ================= VALIDASI FORMAT =================
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message:
          "Format gambar harus JPG, PNG, atau WEBP."
      });
    }


    // ================= VALIDASI UKURAN =================
    if (req.file.size > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Ukuran gambar maksimal 2 MB."
      });
    }


    // ==================================================
    // AMBIL DATA STRUKTUR LAMA
    // ==================================================
    const {
      data: dataLama,
      error: getError
    } = await supabase
      .from("ppid")
      .select("*")
      .order("created_at", {
        ascending: false
      })
      .limit(1)
      .maybeSingle();


    if (getError) {
      throw getError;
    }


    // ==================================================
    // BUAT PATH FILE BARU
    // Folder: struktur/
    // ==================================================
    filePathBaru =
      `struktur/${buatNamaFile(
        req.file.originalname
      )}`;


    // ==================================================
    // UPLOAD GAMBAR KE BUCKET PPID
    // ==================================================
    const {
      error: uploadError
    } = await supabase.storage
      .from(PPID_BUCKET)
      .upload(
        filePathBaru,
        req.file.buffer,
        {
          contentType: req.file.mimetype,
          upsert: false
        }
      );


    if (uploadError) {
      console.error(
        "Gagal upload struktur PPID:",
        uploadError
      );

      return res.status(500).json({
        success: false,
        message:
          "Gagal upload gambar struktur: " +
          uploadError.message
      });
    }


    // ==================================================
    // AMBIL PUBLIC URL
    // ==================================================
    const {
      data: publicUrlData
    } = supabase.storage
      .from(PPID_BUCKET)
      .getPublicUrl(filePathBaru);


    const struktur =
      publicUrlData.publicUrl;


    let data;
    let databaseError;


    // ==================================================
    // UPDATE JIKA DATA SUDAH ADA
    // ==================================================
    if (dataLama) {
      const result = await supabase
        .from("ppid")
        .update({
          struktur: struktur,
          updated_at:
            new Date().toISOString()
        })
        .eq("id", dataLama.id)
        .select();

      data = result.data;
      databaseError = result.error;
    }


    // ==================================================
    // INSERT JIKA BELUM ADA
    // ==================================================
    else {
      const result = await supabase
        .from("ppid")
        .insert([
          {
            admin_id: req.user.id,
            struktur: struktur
          }
        ])
        .select();

      data = result.data;
      databaseError = result.error;
    }


    // ==================================================
    // JIKA DATABASE GAGAL
    // HAPUS FILE BARU DARI STORAGE
    // ==================================================
    if (databaseError) {
      await supabase.storage
        .from(PPID_BUCKET)
        .remove([
          filePathBaru
        ]);

      throw databaseError;
    }


    // ==================================================
    // HAPUS GAMBAR STRUKTUR LAMA
    // ==================================================
    if (
      dataLama &&
      dataLama.struktur &&
      dataLama.struktur !== struktur
    ) {
      const oldFilePath =
        ambilPathStorage(
          dataLama.struktur,
          PPID_BUCKET
        );


      if (oldFilePath) {
        const {
          error: deleteOldError
        } = await supabase.storage
          .from(PPID_BUCKET)
          .remove([
            oldFilePath
          ]);


        if (deleteOldError) {
          console.error(
            "Gagal menghapus gambar struktur lama:",
            deleteOldError
          );
        }
      }
    }


    return res.status(200).json({
      success: true,
      message:
        "Gambar struktur PPID berhasil diperbarui!",
      data: data?.[0] || null
    });

  } catch (error) {
    console.error(
      "Error Update Struktur PPID:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal memperbarui struktur PPID."
    });
  }
};


// ==================================================
// 3. GET SEMUA PDF PPID
// GET /api/ppid/pdf
// PUBLIC
// ==================================================
const getPDFPPID = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ppid_pdf")
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
      "Error Get PDF PPID:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal mengambil daftar PDF PPID."
    });
  }
};


// ==================================================
// 4. TAMBAH PDF PPID
// POST /api/ppid/pdf
// ADMIN
// ==================================================
const createPDFPPID = async (req, res) => {
  let filePath = null;

  try {

    // ================= CEK ADMIN =================
    if (!cekAdmin(req, res)) return;


    const { judul } = req.body || {};


    // ================= VALIDASI JUDUL =================
    if (!judul || !judul.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nama laporan wajib diisi!"
      });
    }


    // ================= VALIDASI FILE =================
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File PDF wajib dipilih!"
      });
    }


    // ================= VALIDASI FORMAT =================
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "File harus berformat PDF."
      });
    }


    // ================= VALIDASI UKURAN =================
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Ukuran PDF maksimal 10 MB."
      });
    }


    // ==================================================
    // BUAT PATH FILE
    // Folder: pdf/
    // ==================================================
    filePath =
      `pdf/${buatNamaFile(
        req.file.originalname
      )}`;


    // ==================================================
    // UPLOAD PDF KE BUCKET PPID
    // ==================================================
    const {
      error: uploadError
    } = await supabase.storage
      .from(PPID_BUCKET)
      .upload(
        filePath,
        req.file.buffer,
        {
          contentType: req.file.mimetype,
          upsert: false
        }
      );


    if (uploadError) {
      console.error(
        "Gagal upload PDF PPID:",
        uploadError
      );

      return res.status(500).json({
        success: false,
        message:
          "Gagal upload PDF: " +
          uploadError.message
      });
    }


    // ==================================================
    // AMBIL PUBLIC URL PDF
    // ==================================================
    const {
      data: publicUrlData
    } = supabase.storage
      .from(PPID_BUCKET)
      .getPublicUrl(filePath);


    const fileUrl =
      publicUrlData.publicUrl;


    // ==================================================
    // SIMPAN DATA PDF KE DATABASE
    // ==================================================
    const {
      data,
      error
    } = await supabase
      .from("ppid_pdf")
      .insert([
        {
          admin_id: req.user.id,
          judul: judul.trim(),
          file: fileUrl,
          ukuran: req.file.size
        }
      ])
      .select();


    // ==================================================
    // JIKA DATABASE GAGAL
    // HAPUS FILE YANG SUDAH TERUPLOAD
    // ==================================================
    if (error) {
      await supabase.storage
        .from(PPID_BUCKET)
        .remove([
          filePath
        ]);

      throw error;
    }


    return res.status(201).json({
      success: true,
      message:
        "File PDF berhasil ditambahkan!",
      data: data?.[0] || null
    });

  } catch (error) {
    console.error(
      "Error Create PDF PPID:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal menambahkan PDF PPID."
    });
  }
};


// ==================================================
// 5. DELETE PDF PPID
// DELETE /api/ppid/pdf/:id
// ADMIN
// ==================================================
const deletePDFPPID = async (req, res) => {
  try {

    // ================= CEK ADMIN =================
    if (!cekAdmin(req, res)) return;


    const { id } = req.params;


    // ================= VALIDASI ID =================
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID PDF tidak ditemukan."
      });
    }


    // ==================================================
    // AMBIL DATA PDF
    // ==================================================
    const {
      data: dataPDF,
      error: getError
    } = await supabase
      .from("ppid_pdf")
      .select("*")
      .eq("id", id)
      .maybeSingle();


    if (getError) {
      throw getError;
    }


    if (!dataPDF) {
      return res.status(404).json({
        success: false,
        message: "Data PDF tidak ditemukan."
      });
    }


    // ==================================================
    // HAPUS FILE PDF DARI STORAGE
    // ==================================================
    if (dataPDF.file) {
      const filePath =
        ambilPathStorage(
          dataPDF.file,
          PPID_BUCKET
        );


      if (filePath) {
        const {
          error: storageError
        } = await supabase.storage
          .from(PPID_BUCKET)
          .remove([
            filePath
          ]);


        if (storageError) {
          console.error(
            "Gagal menghapus PDF dari Storage:",
            storageError
          );

          return res.status(500).json({
            success: false,
            message:
              "Gagal menghapus file PDF dari Storage."
          });
        }
      }
    }


    // ==================================================
    // HAPUS DATA PDF DARI DATABASE
    // ==================================================
    const {
      error: deleteError
    } = await supabase
      .from("ppid_pdf")
      .delete()
      .eq("id", id);


    if (deleteError) {
      throw deleteError;
    }


    return res.status(200).json({
      success: true,
      message:
        "File PDF berhasil dihapus!"
    });

  } catch (error) {
    console.error(
      "Error Delete PDF PPID:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal menghapus PDF PPID."
    });
  }
};


// ==================================================
// EXPORT CONTROLLER
// ==================================================
module.exports = {
  getStrukturPPID,
  updateStrukturPPID,
  getPDFPPID,
  createPDFPPID,
  deletePDFPPID
};