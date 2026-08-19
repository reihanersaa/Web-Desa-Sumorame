const supabase = require("../config/supabase");

const produkController = {
  // 1. [WARGA / PUBLIK] Ajukan Produk UMKM Baru
  ajukanProduk: async (req, res) => {
    try {
      const { nama_produk, harga, nama_penjual, kontak_penjual, gambar } =
        req.body;

      // Validasi input
      if (
        !nama_produk ||
        !harga ||
        !nama_penjual ||
        !kontak_penjual ||
        !gambar
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Semua kolom (nama produk, harga, nama penjual, kontak, gambar) wajib diisi!",
        });
      }

      const { data, error } = await supabase
        .from("produk_unggulan")
        .insert([
          {
            nama_produk,
            harga,
            nama_penjual,
            kontak_penjual,
            gambar,
            status: "pending", // Otomatis pending
          },
        ])
        .select(); // Tambahkan .select() agar mengembalikan data yang baru dibuat

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: "Produk berhasil diajukan dan menunggu persetujuan Admin.",
        data: data[0],
      });
    } catch (error) {
      console.error("Error Ajukan Produk:", error.message);
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
