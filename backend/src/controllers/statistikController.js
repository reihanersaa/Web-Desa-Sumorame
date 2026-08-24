const supabase = require("../config/supabase");

const ensureAdmin = (req, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ success: false, message: "Akses ditolak. Khusus admin." });
    return false;
  }
  return true;
};

const validateWarga = ({ nik, nama_warga, jenis_kelamin, rt, rw }) => {
  if (!/^\d{16}$/.test(String(nik || ""))) return "NIK harus terdiri dari tepat 16 angka.";
  if (!String(nama_warga || "").trim()) return "Nama warga wajib diisi.";
  if (!["Laki-laki", "Perempuan"].includes(jenis_kelamin)) return "Jenis kelamin tidak valid.";
  if (!/^\d{1,3}$/.test(String(rt || ""))) return "RT harus berupa 1 sampai 3 angka.";
  if (!/^\d{1,3}$/.test(String(rw || ""))) return "RW harus berupa 1 sampai 3 angka.";
  return null;
};

const statistikController = {
  getRingkasanPublik: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("statistik_warga")
        .select("jenis_kelamin, rt, rw");
      if (error) throw error;

      const warga = data || [];
      const lakiLaki = warga.filter((item) => item.jenis_kelamin === "Laki-laki").length;
      const perempuan = warga.filter((item) => item.jenis_kelamin === "Perempuan").length;
      const totalRw = new Set(warga.map((item) => String(item.rw || "").trim()).filter(Boolean)).size;
      const totalRt = new Set(warga.map((item) => `${item.rw || ""}-${item.rt || ""}`).filter((value) => value !== "-")).size;

      return res.status(200).json({
        success: true,
        data: {
          laki_laki: lakiLaki,
          perempuan,
          total_penduduk: warga.length,
          total_rw: totalRw,
          total_rt: totalRt,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  tambahWarga: async (req, res) => {
    if (!ensureAdmin(req, res)) return;
    const payload = {
      nik: String(req.body.nik || "").trim(),
      nama_warga: String(req.body.nama_warga || "").trim(),
      jenis_kelamin: String(req.body.jenis_kelamin || "").trim(),
      rt: String(req.body.rt || "").trim().padStart(2, "0"),
      rw: String(req.body.rw || "").trim().padStart(2, "0"),
    };
    const validationError = validateWarga(payload);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    try {
      const { data, error } = await supabase.from("statistik_warga").insert([payload]).select().single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: "Data warga berhasil ditambahkan.", data });
    } catch (error) {
      const duplicate = error.code === "23505";
      return res.status(duplicate ? 409 : 500).json({ success: false, message: duplicate ? "NIK sudah terdaftar." : error.message });
    }
  },

  getSemuaWarga: async (req, res) => {
    if (!ensureAdmin(req, res)) return;
    try {
      const { data, error } = await supabase
        .from("statistik_warga")
        .select("*")
        .order("rw", { ascending: true })
        .order("rt", { ascending: true })
        .order("nama_warga", { ascending: true });
      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  updateWarga: async (req, res) => {
    if (!ensureAdmin(req, res)) return;
    const payload = {
      nik: String(req.body.nik || "").trim(),
      nama_warga: String(req.body.nama_warga || "").trim(),
      jenis_kelamin: String(req.body.jenis_kelamin || "").trim(),
      rt: String(req.body.rt || "").trim().padStart(2, "0"),
      rw: String(req.body.rw || "").trim().padStart(2, "0"),
      updated_at: new Date().toISOString(),
    };
    const validationError = validateWarga(payload);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    try {
      const { data, error } = await supabase
        .from("statistik_warga")
        .update(payload)
        .eq("id", req.params.id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ success: true, message: "Data warga berhasil diperbarui.", data });
    } catch (error) {
      const duplicate = error.code === "23505";
      return res.status(duplicate ? 409 : 500).json({
        success: false,
        message: duplicate ? "NIK sudah digunakan oleh data warga lain." : error.message,
      });
    }
  },

  hapusWarga: async (req, res) => {
    if (!ensureAdmin(req, res)) return;
    try {
      const { error } = await supabase.from("statistik_warga").delete().eq("id", req.params.id);
      if (error) throw error;
      return res.status(200).json({ success: true, message: "Data warga berhasil dihapus." });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = statistikController;
