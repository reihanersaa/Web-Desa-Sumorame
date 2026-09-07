const crypto = require("node:crypto");
const supabase = require("../config/supabase");

const BUCKET = "posbankum-bukti";
const PROBLEM_TYPES = [
  "Perselisihan antarwarga", "Utang-piutang", "Perjanjian", "Pertanahan",
  "Waris", "Keluarga", "Perkawinan", "Ketenagakerjaan",
  "Perlindungan konsumen", "Administrasi kependudukan",
  "Perlindungan perempuan & anak", "Dugaan tindak pidana",
  "Perselisihan usaha", "Lain-lain",
];
const EFFORT_TYPES = [
  "Belum pernah", "Musyawarah keluarga", "Mediasi RT/RW",
  "Mediasi Pemerintah Desa", "Pengaduan ke instansi lain",
  "Pengaduan ke Kepolisian", "Upaya hukum lainnya",
];
const IDENTIFICATION_TYPES = [
  "Dapat diupayakan musyawarah/mediasi desa",
  "Memerlukan konsultasi hukum lebih lanjut",
  "Memerlukan rujukan ke FH UMAHA/LBH Maarif",
  "Memerlukan rujukan ke instansi/lembaga berwenang",
  "Memerlukan tindakan segera (potensi keselamatan/tindak pidana)",
  "Lain-lain",
];
const FOLLOW_UP_TYPES = [
  "Konsultasi awal", "Musyawarah", "Mediasi para pihak",
  "Penjadwalan pertemuan", "Koordinasi dengan Pemerintah Desa",
  "Koordinasi dengan FH UMAHA/LBH Maarif", "Rujukan ke instansi lain",
  "Perkara selesai", "Masih dalam proses",
];
const FINAL_STATUSES = [
  "Selesai melalui musyawarah", "Selesai melalui mediasi",
  "Dirujuk ke FH UMAHA/LBH Maarif", "Dirujuk ke instansi berwenang",
  "Masih dalam proses", "Tidak dapat dilanjutkan",
];
const WORKFLOW_STATUSES = [
  "Menunggu", "Identifikasi", "Mediasi", "Koordinasi", "Dirujuk",
  "Selesai", "Tidak dapat dilanjutkan",
];
const SERVICE_TYPES = ["non_litigasi", "litigasi"];

function parseArray(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function clean(value, max = 5000) {
  return String(value || "").trim().slice(0, max);
}

function selected(value, allowed) {
  return [...new Set(parseArray(value).map((item) => clean(item, 120)))].filter((item) => allowed.includes(item));
}

function validationError(message) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

function extensionFor(file) {
  return ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" })[file.mimetype];
}

function normalizeArea(body) {
  const dusun = clean(body.dusun, 100).toUpperCase();
  const rawRt = clean(body.rt, 3);
  const rawRw = clean(body.rw, 3);
  const hasAnyPart = Boolean(dusun || rawRt || rawRw);
  if (!hasAnyPart) return null;
  if (!dusun || !/^\d{1,3}$/.test(rawRt) || !/^\d{1,3}$/.test(rawRw)) {
    throw validationError("Lengkapi dusun, RT, dan RW dengan benar.");
  }
  return { dusun, rt: rawRt.padStart(2, "0"), rw: rawRw.padStart(2, "0") };
}

function referenceInput(body) {
  const nama_lengkap = clean(body.nama_lengkap, 150);
  const nik = clean(body.nik, 16);
  const area = normalizeArea(body);
  if (!nama_lengkap || !/^\d{16}$/.test(nik) || !area) {
    throw validationError("Nama, NIK 16 digit, dusun, RT, dan RW wajib diisi dengan benar.");
  }
  return { nama_lengkap, nik, ...area };
}

function referenceRegister(nik) {
  return `KLBH-${crypto.createHash("sha256").update(nik).digest("hex").slice(0, 16).toUpperCase()}`;
}

async function linkedUserId(nik) {
  const { data, error } = await supabase.from("users").select("id").eq("nik", nik).maybeSingle();
  if (error) throw error;
  return data?.id || null;
}

async function removeUploaded(paths) {
  if (!paths.length) return;
  await supabase.storage.from(BUCKET).remove(paths).catch(() => undefined);
}

async function submitComplaint(req, res) {
  const uploadedPaths = [];
  try {
    const required = ["nama_lengkap", "nik", "tempat_lahir", "tanggal_lahir", "jenis_kelamin",
      "no_hp", "pekerjaan", "status_dalam_permasalahan", "uraian",
      "waktu_kejadian", "tempat_kejadian", "harapan_pengadu"];
    if (required.some((field) => !clean(req.body[field]))) throw validationError("Lengkapi seluruh data pengadu yang wajib diisi.");
    const nik = clean(req.body.nik, 16);
    if (!/^\d{16}$/.test(nik)) throw validationError("NIK harus terdiri dari 16 angka.");
    if (nik !== String(req.user.nik || "")) {
      return res.status(403).json({ success: false, message: "NIK pengadu harus sama dengan akun warga yang sedang login." });
    }
    if (!/^\+?\d{9,15}$/.test(clean(req.body.no_hp, 16))) throw validationError("Nomor HP/WhatsApp harus terdiri dari 9 sampai 15 angka.");
    if (!['Laki-laki', 'Perempuan'].includes(req.body.jenis_kelamin)) throw validationError("Jenis kelamin tidak valid.");
    if (String(req.body.persetujuan_data) !== "true") throw validationError("Persetujuan penggunaan data wajib diberikan sebelum mengirim formulir.");
    if (!SERVICE_TYPES.includes(req.body.jenis_layanan)) throw validationError("Pilih jenis layanan yang diajukan.");

    const area = normalizeArea(req.body);
    const alamat = clean(req.body.alamat, 1000) || (area ? `${area.dusun} RT ${area.rt} RW ${area.rw}` : "");
    if (!alamat) throw validationError("Lengkapi alamat atau data dusun, RT, dan RW.");

    if (req.body.jenis_layanan === "litigasi") {
      const { data: eligible, error: eligibilityError } = await supabase.from("posbankum_pengaduan")
        .select("id").eq("tipe_data", "warga_rujukan").eq("nik", nik).maybeSingle();
      if (eligibilityError) throw eligibilityError;
      if (!eligible) {
        return res.status(403).json({ success: false,
          message: "NIK belum terdaftar sebagai penerima layanan litigasi/Kartu LBH. Anda tetap dapat memilih konsultasi non-litigasi." });
      }
    }

    const jenisPermasalahan = selected(req.body.jenis_permasalahan, PROBLEM_TYPES);
    if (!jenisPermasalahan.length) throw validationError("Pilih minimal satu jenis permasalahan.");
    if (jenisPermasalahan.includes("Lain-lain") && !clean(req.body.jenis_lainnya, 200)) throw validationError("Jelaskan jenis permasalahan lainnya.");

    const files = req.files || [];
    for (const file of files) {
      const storagePath = `pengaduan/${new Date().getFullYear()}/${crypto.randomUUID()}.${extensionFor(file)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file.buffer, {
        contentType: file.mimetype, cacheControl: "3600", upsert: false,
      });
      if (error) throw error;
      uploadedPaths.push(storagePath);
    }

    const payload = {
      tipe_data: "pengaduan",
      user_id: req.user.id,
      jenis_layanan: req.body.jenis_layanan,
      nama_lengkap: clean(req.body.nama_lengkap, 150), nik,
      tempat_lahir: clean(req.body.tempat_lahir, 100), tanggal_lahir: req.body.tanggal_lahir,
      jenis_kelamin: req.body.jenis_kelamin, alamat,
      dusun: area?.dusun || null, rt: area?.rt || null, rw: area?.rw || null,
      no_hp: clean(req.body.no_hp, 16), pekerjaan: clean(req.body.pekerjaan, 150),
      status_dalam_permasalahan: clean(req.body.status_dalam_permasalahan, 300),
      pihak_terkait: { nama: clean(req.body.pihak_nama, 150), alamat: clean(req.body.pihak_alamat, 1000),
        no_hp: clean(req.body.pihak_no_hp, 16), hubungan: clean(req.body.pihak_hubungan, 200) },
      jenis_permasalahan: jenisPermasalahan, jenis_lainnya: clean(req.body.jenis_lainnya, 200) || null,
      uraian: clean(req.body.uraian, 10000), waktu_kejadian: clean(req.body.waktu_kejadian, 300),
      tempat_kejadian: clean(req.body.tempat_kejadian, 2000),
      upaya_dilakukan: selected(req.body.upaya_dilakukan, EFFORT_TYPES), hasil_upaya: clean(req.body.hasil_upaya, 5000) || null,
      jenis_dokumen: parseArray(req.body.jenis_dokumen).map((v) => clean(v, 120)).filter(Boolean).slice(0, 20),
      dokumen: files.map((file, index) => ({ path: uploadedPaths[index], name: clean(file.originalname, 200),
        mimeType: file.mimetype, size: file.size })),
      harapan_pengadu: clean(req.body.harapan_pengadu, 5000), persetujuan_data: true,
    };
    const { data, error } = await supabase.from("posbankum_pengaduan").insert(payload)
      .select("id,nomor_register,tanggal_pengaduan,status").single();
    if (error) throw error;
    return res.status(201).json({ success: true, message: "Pengaduan berhasil diterima secara rahasia.", data });
  } catch (error) {
    await removeUploaded(uploadedPaths);
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Posbankum submit error:", error.message);
    return res.status(500).json({ success: false, message: "Pengaduan belum dapat disimpan. Silakan coba kembali." });
  }
}

async function listComplaints(req, res) {
  try {
    let query = supabase.from("posbankum_pengaduan")
      .select("id,nomor_register,nama_lengkap,tanggal_pengaduan,jenis_permasalahan,status")
      .eq("tipe_data", "pengaduan")
      .order("tanggal_pengaduan", { ascending: false }).limit(500);
    if (req.query.status && WORKFLOW_STATUSES.includes(req.query.status)) query = query.eq("status", req.query.status);
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, confidentiality: "Rahasia", data });
  } catch (error) {
    console.error("Posbankum list error:", error.message);
    return res.status(500).json({ success: false, message: "Data pengaduan belum dapat dimuat." });
  }
}

async function detailComplaint(req, res) {
  try {
    const { data, error } = await supabase.from("posbankum_pengaduan").select("*")
      .eq("tipe_data", "pengaduan").eq("id", req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: "Pengaduan tidak ditemukan." });
    data.dokumen = await Promise.all((data.dokumen || []).map(async (doc) => {
      const { data: signed, error: signedError } = await supabase.storage.from(BUCKET).createSignedUrl(doc.path, 900);
      return { ...doc, url: signedError ? null : signed.signedUrl };
    }));
    return res.json({ success: true, confidentiality: "Rahasia", data });
  } catch (error) {
    console.error("Posbankum detail error:", error.message);
    return res.status(500).json({ success: false, message: "Detail pengaduan belum dapat dimuat." });
  }
}

async function updateHandling(req, res) {
  try {
    const status = clean(req.body.status, 50);
    const statusAkhir = clean(req.body.status_akhir, 100);
    if (!WORKFLOW_STATUSES.includes(status)) throw validationError("Status penanganan tidak valid.");
    if (statusAkhir && !FINAL_STATUSES.includes(statusAkhir)) throw validationError("Status akhir tidak valid.");
    const payload = {
      status,
      kategori_identifikasi: selected(req.body.kategori_identifikasi, IDENTIFICATION_TYPES),
      kategori_lainnya: clean(req.body.kategori_lainnya, 300) || null,
      catatan_petugas: clean(req.body.catatan_petugas, 10000) || null,
      tindak_lanjut: selected(req.body.tindak_lanjut, FOLLOW_UP_TYPES),
      tanggal_tindak_lanjut: req.body.tanggal_tindak_lanjut || null,
      petugas_penanggung_jawab: clean(req.body.petugas_penanggung_jawab, 150) || null,
      hasil_penanganan: clean(req.body.hasil_penanganan, 10000) || null,
      status_akhir: statusAkhir || null,
      updated_by: req.user.id,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("posbankum_pengaduan").update(payload)
      .eq("tipe_data", "pengaduan").eq("id", req.params.id)
      .select("id,nomor_register,status,status_akhir,updated_at").maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: "Pengaduan tidak ditemukan." });
    return res.json({ success: true, message: "Penanganan Posbankum berhasil disimpan.", data });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Posbankum update error:", error.message);
    return res.status(500).json({ success: false, message: "Penanganan belum dapat disimpan." });
  }
}

async function listReferenceResidents(_req, res) {
  try {
    const { data, error } = await supabase.from("posbankum_pengaduan")
      .select("id,nomor_register,nama_lengkap,nik,dusun,rt,rw,sumber_data,user_id,updated_at")
      .eq("tipe_data", "warga_rujukan")
      .order("nama_lengkap", { ascending: true })
      .limit(1000);
    if (error) throw error;
    return res.json({ success: true, confidentiality: "Rahasia", data });
  } catch (error) {
    console.error("Posbankum reference list error:", error.message);
    return res.status(500).json({ success: false, message: "Data Kartu LBH belum dapat dimuat." });
  }
}

async function createReferenceResident(req, res) {
  try {
    const input = referenceInput(req.body);
    const { data: existing, error: existingError } = await supabase.from("posbankum_pengaduan")
      .select("id").eq("tipe_data", "warga_rujukan").eq("nik", input.nik).maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      return res.status(409).json({ success: false, message: "NIK sudah terdaftar pada Data Kartu LBH." });
    }

    const payload = {
      tipe_data: "warga_rujukan",
      user_id: await linkedUserId(input.nik),
      nomor_register: referenceRegister(input.nik),
      nama_lengkap: input.nama_lengkap,
      nik: input.nik,
      alamat: `${input.dusun} RT ${input.rt} RW ${input.rw}`,
      dusun: input.dusun,
      rt: input.rt,
      rw: input.rw,
      sumber_data: clean(req.body.sumber_data, 150) || "Input CMS Posbankum",
      status_dalam_permasalahan: "Data rujukan calon penerima Kartu LBH",
      jenis_permasalahan: ["Data rujukan Kartu LBH"],
      jenis_layanan: "litigasi",
      status: "Identifikasi",
      updated_by: req.user.id,
    };
    const { data, error } = await supabase.from("posbankum_pengaduan").insert(payload)
      .select("id,nomor_register,nama_lengkap,nik,dusun,rt,rw,sumber_data,user_id,updated_at").single();
    if (error) throw error;
    return res.status(201).json({ success: true, message: "Data Kartu LBH berhasil ditambahkan.", data });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Posbankum reference create error:", error.message);
    return res.status(500).json({ success: false, message: "Data Kartu LBH belum dapat ditambahkan." });
  }
}

async function updateReferenceResident(req, res) {
  try {
    const input = referenceInput(req.body);
    const { data: duplicate, error: duplicateError } = await supabase.from("posbankum_pengaduan")
      .select("id").eq("tipe_data", "warga_rujukan").eq("nik", input.nik)
      .neq("id", req.params.id).maybeSingle();
    if (duplicateError) throw duplicateError;
    if (duplicate) {
      return res.status(409).json({ success: false, message: "NIK sudah digunakan oleh data Kartu LBH lain." });
    }

    const payload = {
      user_id: await linkedUserId(input.nik),
      nama_lengkap: input.nama_lengkap,
      nik: input.nik,
      alamat: `${input.dusun} RT ${input.rt} RW ${input.rw}`,
      dusun: input.dusun,
      rt: input.rt,
      rw: input.rw,
      sumber_data: clean(req.body.sumber_data, 150) || "Input CMS Posbankum",
      updated_by: req.user.id,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("posbankum_pengaduan").update(payload)
      .eq("tipe_data", "warga_rujukan").eq("id", req.params.id)
      .select("id,nomor_register,nama_lengkap,nik,dusun,rt,rw,sumber_data,user_id,updated_at").maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: "Data Kartu LBH tidak ditemukan." });
    return res.json({ success: true, message: "Data Kartu LBH berhasil diperbarui.", data });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Posbankum reference update error:", error.message);
    return res.status(500).json({ success: false, message: "Data Kartu LBH belum dapat diperbarui." });
  }
}

module.exports = { submitComplaint, listComplaints, detailComplaint, updateHandling,
  listReferenceResidents, createReferenceResident, updateReferenceResident,
  PROBLEM_TYPES, EFFORT_TYPES, IDENTIFICATION_TYPES, FOLLOW_UP_TYPES, FINAL_STATUSES, WORKFLOW_STATUSES };
