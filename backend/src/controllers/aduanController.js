const supabase = require("../config/supabase");
const crypto = require("crypto");

const extensionByMime = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

function createUploadPath(prefix, file) {
  const extension = extensionByMime[file.mimetype];
  if (!extension) throw new Error("Format lampiran tidak didukung.");
  return `${prefix}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

function getAduanStoragePath(value) {
  if (!value) return null;
  const raw = String(value);
  const marker = "/storage/v1/object/public/bukti_aduan/";
  if (!raw.includes(marker)) return raw;

  try {
    return decodeURIComponent(new URL(raw).pathname.split(marker)[1] || "");
  } catch (error) {
    return null;
  }
}

async function createPrivateUrl(value) {
  const path = getAduanStoragePath(value);
  if (!path) return { url: null, path: null };

  const { data, error } = await supabase.storage
    .from("bukti_aduan")
    .createSignedUrl(path, 60 * 60);

  if (error) {
    console.error("Gagal membuat signed URL aduan:", error.message);
    return { url: null, path };
  }

  return { url: data.signedUrl, path };
}

// 1. Fungsi POST Warga
// 1. Fungsi POST Warga
const buatAduan = async (req, res) => {
  try {
    const user_id = req.user.id; 
    
    const no_wa_input = String(req.body.no_wa || "").trim();
    const judul_aduan = String(req.body.judul_aduan || "").trim();
    const isi_aduan = String(req.body.isi_aduan || "").trim();
    
    const fileBukti = req.file; 

    if (!judul_aduan || !isi_aduan) {
      return res
        .status(400)
        .json({ success: false, message: "Judul dan isi aduan wajib diisi!" });
    }

    if (judul_aduan.length > 200 || isi_aduan.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Judul maksimal 200 karakter dan isi aduan maksimal 5.000 karakter.",
      });
    }

    const { data: warga, error: wargaError } = await supabase
      .from("users")
      .select("nama_lengkap, email, no_hp")
      .eq("id", user_id)
      .maybeSingle();

    if (wargaError) throw wargaError;
    if (!warga) {
      return res.status(401).json({ success: false, message: "Akun warga tidak ditemukan." });
    }

    const no_wa = no_wa_input || String(warga.no_hp || "").trim();
    if (no_wa && !/^\+?\d{9,15}$/.test(no_wa)) {
      return res.status(400).json({
        success: false,
        message: "Nomor WhatsApp harus terdiri dari 9 sampai 15 angka.",
      });
    }

    let file_bukti_url = null;

    if (fileBukti) {
      const fileName = createUploadPath("aduan", fileBukti);
      const { error: uploadError } = await supabase.storage
        .from("bukti_aduan") 
        .upload(fileName, fileBukti.buffer, { contentType: fileBukti.mimetype });

      if (uploadError) throw uploadError;

      // Simpan path, bukan URL publik. Admin menerima signed URL saat membaca aduan.
      file_bukti_url = fileName;
    }

    const { data, error } = await supabase
      .from("aduan")
      .insert([
        {
          user_id: user_id,
          nama_pelapor: warga.nama_lengkap,
          email_pelapor: warga.email,
          no_wa,
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

    const signedData = await Promise.all((data || []).map(async (item) => {
      const [bukti, gambar, lampiran] = await Promise.all([
        createPrivateUrl(item.file_bukti_url),
        createPrivateUrl(item.lampiran_gambar_url),
        createPrivateUrl(item.lampiran_file_url),
      ]);

      return {
        ...item,
        file_bukti_url: bukti.url,
        file_bukti_is_pdf: Boolean(bukti.path?.toLowerCase().endsWith(".pdf")),
        lampiran_gambar_url: gambar.url,
        lampiran_file_url: lampiran.url,
      };
    }));

    return res.status(200).json({
      success: true,
      data: signedData,
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

    if (!String(tanggapan_admin || "").trim() || !/^\d{4}-\d{2}-\d{2}$/.test(String(tanggal_tanggapan || ""))) {
      return res.status(400).json({
        success: false,
        message: "Tanggapan dan tanggal dengan format YYYY-MM-DD wajib diisi.",
      });
    }

    if (!["Diproses", "Selesai"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status aduan tidak valid." });
    }
    
    const files = req.files || {};
    let gambarUrl = null;
    let fileUrl = null;

    if (files.lampiran_gambar && files.lampiran_gambar[0]) {
      const fileGbr = files.lampiran_gambar[0];
      const fileNameGbr = createUploadPath("tanggapan-gambar", fileGbr);
      
      const { error: errGbr } = await supabase.storage.from("bukti_aduan").upload(fileNameGbr, fileGbr.buffer, { contentType: fileGbr.mimetype });
      
      if (errGbr) throw errGbr;
      gambarUrl = fileNameGbr;
    }

    if (files.lampiran_file && files.lampiran_file[0]) {
      const fileDoc = files.lampiran_file[0];
      const fileNameDoc = createUploadPath("tanggapan-file", fileDoc);
      
      const { error: errDoc } = await supabase.storage.from("bukti_aduan").upload(fileNameDoc, fileDoc.buffer, { contentType: fileDoc.mimetype });
      
      if (errDoc) throw errDoc;
      fileUrl = fileNameDoc;
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

    const { data: existing, error: readError } = await supabase
      .from("aduan")
      .select("file_bukti_url, lampiran_gambar_url, lampiran_file_url")
      .eq("id", id)
      .maybeSingle();

    if (readError) throw readError;
    if (!existing) {
      return res.status(404).json({ success: false, message: "Data aduan tidak ditemukan." });
    }

    const { data, error } = await supabase
      .from("aduan")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;

    const storagePaths = [
      existing.file_bukti_url,
      existing.lampiran_gambar_url,
      existing.lampiran_file_url,
    ]
      .map(getAduanStoragePath)
      .filter(Boolean);

    if (storagePaths.length) {
      const { error: storageError } = await supabase.storage
        .from("bukti_aduan")
        .remove(storagePaths);
      if (storageError) console.error("Gagal menghapus lampiran aduan:", storageError.message);
    }

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
