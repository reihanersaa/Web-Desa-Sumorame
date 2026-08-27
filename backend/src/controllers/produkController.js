const supabase = require("../config/supabase");
const crypto = require("crypto");

const PRODUCT_BUCKET = "produk";

const extensionByMime = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function uploadGambarProduk(file) {
  if (!file) return null;

  const extension = extensionByMime[file.mimetype];
  if (!extension) throw new Error("Format gambar produk tidak didukung.");

  const filePath = `produk/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(filePath);
  return { publicUrl: data.publicUrl, filePath };
}

function getProductStoragePath(publicUrl) {
  if (!publicUrl || !String(publicUrl).startsWith("http")) return null;
  const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;
  const markerIndex = String(publicUrl).indexOf(marker);
  return markerIndex === -1
    ? null
    : decodeURIComponent(String(publicUrl).slice(markerIndex + marker.length));
}

async function removeProductImage(publicUrl) {
  const filePath = getProductStoragePath(publicUrl);
  if (!filePath) return;
  const { error } = await supabase.storage.from(PRODUCT_BUCKET).remove([filePath]);
  if (error) console.error("Gagal menghapus gambar produk:", error.message);
}

const produkController = {
  // 1. [PUBLIK] Warga mengajukan produk (UPDATE: Tambah Deskripsi)
  ajukanProduk: async (req, res) => {
    try {
      // Tambahkan 'deskripsi' di tangkapan body
      const {
        nik: submittedNik,
        nama_produk,
        deskripsi,
        harga,
        nama_penjual,
        kontak_penjual,
      } = req.body || {};

      const nik = String(req.user?.nik || "");
      if (!/^\d{16}$/.test(nik)) {
        return res.status(400).json({
          success: false,
          message: "NIK pada akun warga tidak valid.",
        });
      }

      if (submittedNik && String(submittedNik) !== nik) {
        return res.status(403).json({
          success: false,
          message: "NIK pengajuan harus sama dengan akun warga yang sedang login.",
        });
      }

      if (
        !nama_produk ||
        !harga ||
        !nama_penjual ||
        !kontak_penjual ||
        !req.file
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Kolom wajib belum diisi!" });
      }

      const hargaProduk = Number(harga);
      if (!Number.isFinite(hargaProduk) || hargaProduk <= 0) {
        return res.status(400).json({
          success: false,
          message: "Harga produk harus lebih dari 0.",
        });
      }

      const uploadedImage = await uploadGambarProduk(req.file);

      const { data, error } = await supabase
        .from("produk_unggulan")
        .insert([
          {
            nik,
            nama_produk,
            deskripsi,
            harga: hargaProduk,
            nama_penjual,
            kontak_penjual,
            gambar: uploadedImage.publicUrl,
            status: "pending",
          },
        ])
        .select();

      if (error) {
        await removeProductImage(uploadedImage.publicUrl);
        throw error;
      }
      return res
        .status(201)
        .json({
          success: true,
          message: "Produk berhasil diajukan.",
          data: data[0],
        });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- 2 FUNGSI BARU UNTUK FRONTEND ---

  // [PUBLIK] Ambil maksimal 5 produk pilihan admin untuk halaman utama
  getProdukUnggulanBeranda: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("produk_unggulan")
        .select("*")
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("featured_order", { ascending: true })
        .limit(5);

      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // [PUBLIK] Ambil 3 Produk Teratas berdasarkan view
  getTop3Produk: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("produk_unggulan")
        .select("*")
        .eq("status", "approved")
        .order("dilihat", { ascending: false }) // Urutkan view terbanyak
        .limit(3); // Batasi 3 data

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // [PUBLIK] Tambah angka view saat tombol "Detail" diklik
  tambahViewProduk: async (req, res) => {
    try {
      const { id } = req.params;

      // Ambil data view saat ini lewat fungsi RPC (Remote Procedure Call) atau cara manual (baca lalu tambah 1)
      // Cara manual sederhana:
      const { data: produk, error: readError } = await supabase
        .from("produk_unggulan")
        .select("dilihat")
        .eq("id", id)
        .single();

      if (readError || !produk) {
        return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
      }

      const { data, error } = await supabase
        .from("produk_unggulan")
        .update({ dilihat: (produk.dilihat || 0) + 1 })
        .eq("id", id)
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, data: data[0] });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 2. [PUBLIK] Menampilkan produk yang sudah APPROVED di Laman Utama
  getProdukPublik: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("produk_unggulan")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error("Error Get Produk Publik:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 3. [ADMIN CMS] Menampilkan SEMUA produk (Pending, Approved, Rejected) untuk Tabel CMS
  getSemuaProdukAdmin: async (req, res) => {
    try {
      // Cek Role Admin
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Akses Ditolak! Khusus Admin." });
      }

      const { data, error } = await supabase
        .from("produk_unggulan")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error("Error Get Produk Admin:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // [ADMIN CMS] Tentukan maksimal 5 produk yang tampil di halaman utama
  updateProdukUnggulanBeranda: async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Akses Ditolak! Khusus Admin." });
      }

      const ids = Array.isArray(req.body.product_ids)
        ? [...new Set(req.body.product_ids.map(String))]
        : [];

      if (ids.length > 5) {
        return res.status(400).json({ success: false, message: "Produk unggulan maksimal 5 item." });
      }

      if (ids.length) {
        const { data: approved, error: validationError } = await supabase
          .from("produk_unggulan")
          .select("id")
          .in("id", ids)
          .eq("status", "approved");
        if (validationError) throw validationError;
        if ((approved || []).length !== ids.length) {
          return res.status(400).json({ success: false, message: "Semua produk pilihan harus berstatus disetujui." });
        }
      }

      const { error: clearError } = await supabase
        .from("produk_unggulan")
        .update({ is_featured: false, featured_order: null })
        .eq("is_featured", true);
      if (clearError) throw clearError;

      for (let index = 0; index < ids.length; index += 1) {
        const { error } = await supabase
          .from("produk_unggulan")
          .update({ is_featured: true, featured_order: index + 1 })
          .eq("id", ids[index]);
        if (error) throw error;
      }

      return res.status(200).json({ success: true, message: "Produk unggulan beranda berhasil diperbarui." });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 4. [ADMIN CMS] Ubah Status Produk (Approve / Reject)
  updateStatusProduk: async (req, res) => {
    try {
      // Cek Role Admin
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Akses Ditolak! Khusus Admin." });
      }

      const { id } = req.params;
      const { status } = req.body; // Terima 'approved' atau 'rejected'

      if (!status || !["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status tidak valid! Gunakan 'approved' atau 'rejected'.",
        });
      }

      const updateData = status === "approved"
        ? { status }
        : { status, is_featured: false, featured_order: null };

      const { data, error } = await supabase
        .from("produk_unggulan")
        .update(updateData)
        .eq("id", id)
        .select(); // Tambahkan .select() agar mengembalikan data yang di-update

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: `Status produk berhasil diubah menjadi ${status}`,
        data: data[0],
      });
    } catch (error) {
      console.error("Error Update Status Produk:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // [ADMIN CMS] Perbaiki isi data produk tanpa mengubah statusnya
  updateProduk: async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Akses Ditolak! Khusus Admin.",
        });
      }

      const { id } = req.params;
      const {
        nik,
        nama_produk,
        deskripsi,
        harga,
        nama_penjual,
        kontak_penjual,
      } = req.body;

      if (!/^\d{16}$/.test(String(nik || ""))) {
        return res.status(400).json({
          success: false,
          message: "NIK harus terdiri dari tepat 16 angka.",
        });
      }

      if (!nama_produk || !nama_penjual || !kontak_penjual || !deskripsi) {
        return res.status(400).json({
          success: false,
          message: "Kolom data produk wajib dilengkapi.",
        });
      }

      if (!/^\d{9,15}$/.test(String(kontak_penjual))) {
        return res.status(400).json({
          success: false,
          message: "Nomor HP harus terdiri dari 9 sampai 15 angka.",
        });
      }

      const hargaProduk = Number(harga);
      if (!Number.isFinite(hargaProduk) || hargaProduk <= 0) {
        return res.status(400).json({
          success: false,
          message: "Harga produk harus lebih dari 0.",
        });
      }

      const updateData = {
        nik: String(nik),
        nama_produk: String(nama_produk).trim(),
        deskripsi: String(deskripsi).trim(),
        harga: hargaProduk,
        nama_penjual: String(nama_penjual).trim(),
        kontak_penjual: String(kontak_penjual),
      };

      const { data: existingProduct, error: existingError } = await supabase
        .from("produk_unggulan")
        .select("gambar")
        .eq("id", id)
        .single();

      if (existingError || !existingProduct) {
        return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
      }

      const uploadedImage = await uploadGambarProduk(req.file);
      if (uploadedImage) updateData.gambar = uploadedImage.publicUrl;

      const { data, error } = await supabase
        .from("produk_unggulan")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (uploadedImage) await removeProductImage(uploadedImage.publicUrl);
        throw error;
      }

      if (uploadedImage) await removeProductImage(existingProduct.gambar);

      return res.status(200).json({
        success: true,
        message: "Data produk berhasil diperbarui.",
        data,
      });
    } catch (error) {
      console.error("Error Update Produk:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // 5. [ADMIN CMS] Hapus Produk
  hapusProduk: async (req, res) => {
    try {
      // Cek Role Admin
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Akses Ditolak! Khusus Admin." });
      }

      const { id } = req.params;

      const { data: existingProduct } = await supabase
        .from("produk_unggulan")
        .select("gambar")
        .eq("id", id)
        .maybeSingle();

      const { error } = await supabase
        .from("produk_unggulan")
        .delete()
        .eq("id", id);

      if (error) throw error;

      if (existingProduct?.gambar) await removeProductImage(existingProduct.gambar);

      return res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus.",
      });
    } catch (error) {
      console.error("Error Hapus Produk:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = produkController;
