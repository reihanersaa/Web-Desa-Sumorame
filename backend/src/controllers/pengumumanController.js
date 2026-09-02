const { randomUUID } = require("node:crypto");
const supabase = require("../config/supabase");

const TABLE = "pengumuman_beranda";
const BUCKET = "cms-profil";
const fields = "id,judul,gambar_url,created_at";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function unavailable(res) {
  return res.status(503).json({ success: false, message: "Pengumuman belum dapat diproses. Pastikan migration pengumuman sudah dijalankan, lalu coba lagi." });
}

async function list(req, res) {
  res.set("Cache-Control", "no-store");
  try {
    const { data, error } = await supabase.from(TABLE).select(fields)
      .order("created_at", { ascending: true }).order("id", { ascending: true });
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (_) { return unavailable(res); }
}

async function create(req, res) {
  if (req.user?.role !== "admin") return res.status(403).json({ success: false, message: "Hanya admin yang dapat mengelola pengumuman." });
  const title = req.body?.judul;
  if (typeof title !== "string" || !title.trim() || title.trim().length > 120 || !req.file) {
    return res.status(400).json({ success: false, message: "Judul (1–120 karakter) dan gambar wajib diisi." });
  }
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[req.file.mimetype];
  if (!ext) return res.status(400).json({ success: false, message: "Gunakan gambar JPG, PNG, atau WEBP." });
  const path = `pengumuman/${randomUUID()}.${ext}`;
  let uploaded = false;
  try {
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (uploadError) throw uploadError;
    uploaded = true;
    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const { data, error } = await supabase.from(TABLE).insert({
      judul: title.trim(), gambar_url: publicData.publicUrl, storage_path: path,
    }).select(fields).single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (_) {
    if (uploaded) {
      try { await supabase.storage.from(BUCKET).remove([path]); } catch (_) { /* No user data is exposed. */ }
    }
    return unavailable(res);
  }
}

async function remove(req, res) {
  if (req.user?.role !== "admin") return res.status(403).json({ success: false, message: "Hanya admin yang dapat mengelola pengumuman." });
  if (!uuid.test(req.params.id)) return res.status(400).json({ success: false, message: "ID pengumuman tidak valid." });
  try {
    const { data, error } = await supabase.from(TABLE).delete().eq("id", req.params.id).select("id,storage_path").maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: "Pengumuman tidak ditemukan." });
    // Only delete files owned by this module. Migrated images may still be used by CMS Profil.
    let warning;
    if (/^pengumuman\/[0-9a-f-]+\.(jpg|png|webp)$/.test(data.storage_path || "")) {
      try {
        const result = await supabase.storage.from(BUCKET).remove([data.storage_path]);
        if (result.error) throw result.error;
      } catch (_) { warning = "Pengumuman dihapus dari website, tetapi berkas Storage belum terhapus. Pengelola dapat membersihkannya nanti."; }
    }
    return res.json({ success: true, message: "Pengumuman dihapus.", ...(warning ? { warning } : {}) });
  } catch (_) { return unavailable(res); }
}

// Fail closed on cleanup: never remove a migrated image still used by the popup.
async function isReferencedAnnouncementImage(url) {
  if (!url) return false;
  try {
    const { data, error } = await supabase.from(TABLE).select("id").eq("gambar_url", url).limit(1);
    return Boolean(error || data?.length);
  } catch (_) { return true; }
}

module.exports = { list, create, remove, isReferencedAnnouncementImage };
