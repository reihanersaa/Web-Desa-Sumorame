const supabase = require("../config/supabase");

const produkController = {
  // 1. [PUBLIK] Warga mengajukan produk (UPDATE: Tambah Deskripsi)
  ajukanProduk: async (req, res) => {
    try {
      // Tambahkan 'deskripsi' di tangkapan body
      const {
        nama_produk,
        deskripsi,
        harga,
        nama_penjual,
        kontak_penjual,
        gambar,
      } = req.body;

      if (
        !nama_produk ||
        !harga ||
        !nama_penjual ||
        !kontak_penjual ||
        !gambar
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Kolom wajib belum diisi!" });
      }

      const { data, error } = await supabase
        .from("produk_unggulan")
        .insert([
          {
            nama_produk,
            deskripsi,
            harga,
            nama_penjual,
            kontak_penjual,
            gambar,
            status: "pending",
          },
        ])
        .select();

      if (error) throw error;
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

      const { data, error } = await supabase
        .from("produk_unggulan")
        .update({ status: status })
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

      const { error } = await supabase
        .from("produk_unggulan")
        .delete()
        .eq("id", id);

      if (error) throw error;

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
