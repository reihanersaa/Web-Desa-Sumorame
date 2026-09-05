const SCHEMAS = Object.freeze({
  domisili: ["nik", "nama", "kota", "tgl", "agama", "nohp", "email", "jk", "status", "pekerjaan", "alamat", "warga"],
  kehilangan: ["nik", "nama", "nohp", "email", "umur", "pekerjaan", "alamat", "catatan"],
  tanah: ["nik", "nama", "nohp", "email", "umur", "pekerjaan", "alamat", "catatan"],
  tidakmampu: ["nik", "nokk", "nama", "tgl", "agama", "nohp", "email", "jk", "status", "pekerjaan", "alamat", "dusun", "kepala", "tempat", "tgl_kepala", "jk_kepala", "status_kepala", "agama_kepala", "kerja"],
});

const ENUMS = Object.freeze({
  kota: ["Surabaya", "Sidoarjo", "Malang"],
  agama: ["Islam", "Kristen", "Hindu", "Budha"],
  agama_kepala: ["Islam", "Kristen"],
  jk: ["Laki-laki", "Perempuan"],
  jk_kepala: ["Laki-laki", "Perempuan"],
  status: ["Belum Kawin", "Kawin"],
  status_kepala: ["Kawin", "Belum"],
});

const LONG_FIELDS = new Set(["alamat", "catatan"]);
const NAME_FIELDS = new Set(["nama", "kepala"]);

function validDate(value) {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) return false;
  const [day, month, year] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return year >= 1900 && year <= new Date().getUTCFullYear() &&
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function normalizeText(value, max) {
  if (typeof value !== "string") return null;
  const normalized = value.normalize("NFC").trim();
  if (!normalized || normalized.length > max ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/u.test(normalized) ||
      /--|\/\*|\*\//.test(normalized)) return null;
  return normalized;
}

function validateField(key, raw) {
  const value = normalizeText(raw, LONG_FIELDS.has(key) ? 1000 : 160);
  if (value === null) return null;
  if (key === "nik" || key === "nokk") return /^\d{16}$/.test(value) ? value : null;
  if (key === "nohp") return /^\d{9,15}$/.test(value) ? value : null;
  if (key === "email") return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value.toLowerCase() : null;
  if (key === "umur") return /^(?:[1-9]|[1-9]\d|1[01]\d|120)$/.test(value) ? value : null;
  if (key === "tgl" || key === "tgl_kepala") return validDate(value) ? value : null;
  if (ENUMS[key]) return ENUMS[key].includes(value) ? value : null;
  if (NAME_FIELDS.has(key) && !/^[\p{L}\p{M} .,'-]{2,100}$/u.test(value)) return null;
  return value;
}

function validateApplication({ jenis_surat, data_form, authenticatedNik }) {
  if (typeof jenis_surat !== "string" || !SCHEMAS[jenis_surat]) {
    return { valid: false, message: "Jenis surat tidak valid." };
  }
  if (!data_form || typeof data_form !== "object" || Array.isArray(data_form) || Object.getPrototypeOf(data_form) !== Object.prototype) {
    return { valid: false, message: "Format data formulir tidak valid." };
  }
  const expected = SCHEMAS[jenis_surat];
  const keys = Object.keys(data_form);
  if (keys.length !== expected.length || keys.some((key) => !expected.includes(key))) {
    return { valid: false, message: "Kolom formulir tidak sesuai dengan jenis surat." };
  }
  const clean = {};
  for (const key of expected) {
    const value = validateField(key, data_form[key]);
    if (value === null) return { valid: false, message: `Nilai kolom ${key} tidak valid.` };
    clean[key] = value;
  }
  if (clean.nik !== String(authenticatedNik || "")) {
    return { valid: false, message: "NIK formulir harus sama dengan akun warga yang sedang login." };
  }
  return { valid: true, clean };
}

module.exports = { validateApplication };
