const supabase = require("../config/supabase");
const { validateApplication } = require("../services/persuratanValidationService");

const ajukanSurat = async (req, res) => {
  try {
    const created_by = req.user.id;
    const { jenis_surat, data_form } = req.body || {};
    if (!jenis_surat || !data_form) {
      return res.status(400).json({ success: false, message: "Data formulir dan jenis surat wajib diisi." });
    }

    const validation = validateApplication({ jenis_surat, data_form, authenticatedNik: req.user.nik });
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const cleanForm = validation.clean;
    const labels = {
      domisili: "Surat Keterangan Domisili",
      kehilangan: "Surat Keterangan Kehilangan",
      tanah: "Surat Keterangan Harga Tanah",
      tidakmampu: "Surat Keterangan Tidak Mampu",
    };
    const applicantName = cleanForm.nama || cleanForm.kepala || "Warga";
    const tanggal_surat = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase.from("surat").insert([{
      created_by,
      judul_surat: `${labels[jenis_surat]} - ${applicantName}`,
      jenis_surat,
      tanggal_surat,
      data_form: cleanForm,
      status: "draft",
    }]).select();

    if (error) throw error;
    return res.status(201).json({ success: true, message: "Surat berhasil diajukan.", data: data[0] });
  } catch (error) {
    console.error("Ajukan surat gagal:", error.code || error.name);
    return res.status(500).json({ success: false, message: "Pengajuan surat gagal diproses. Silakan coba lagi." });
  }
};

// --- TAMBAHAN BARU UNTUK ADMIN CMS ---

const getSemuaSurat = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak! Khusus admin." });
    }

    const { data, error } = await supabase
      .from("surat")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateStatusSurat = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak! Khusus admin." });
    }

    const { id } = req.params;
    const { status } = req.body; // Terima "disetujui" atau "ditolak"

    if (!["draft", "diproses", "disetujui", "ditolak"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status surat tidak valid." });
    }

    const { data, error } = await supabase
      .from("surat")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data?.length) {
      return res.status(404).json({ success: false, message: "Surat tidak ditemukan." });
    }
    return res.status(200).json({
      success: true,
      message: `Surat berhasil ${status}`,
      data: data[0],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// [ADMIN CMS] Hapus data surat
const hapusSurat = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak! Khusus admin." });
    }

    const { id } = req.params;

    const { data, error } = await supabase.from("surat").delete().eq("id", id).select("id");

    if (error) throw error;
    if (!data?.length) {
      return res.status(404).json({ success: false, message: "Surat tidak ditemukan." });
    }
    return res.status(200).json({
      success: true,
      message: "Surat berhasil dihapus.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// WAJIB DI-EXPORT SEMUANYA
module.exports = { ajukanSurat, getSemuaSurat, updateStatusSurat, hapusSurat };
