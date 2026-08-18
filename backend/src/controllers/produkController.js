const supabase = require("../config/supabase");

const produkController = {
  // 1. [PUBLIK] Warga mengajukan produk
  ajukanProduk: async (req, res) => {
    try {
      const { nama_produk, harga, nama_penjual, kontak_penjual, gambar } =
        req.body;

      // Validasi input sederhana
      if (
        !nama_produk ||
        !harga ||
        !nama_penjual ||
        !kontak_penjual ||
        !gambar
      ) {
        return res.status(400).json({ message: "Semua kolom wajib diisi!" });
      }

      const { data, error } = await supabase.from("produk_unggulan").insert([
        {
          nama_produk,
          harga,
          nama_penjual,
          kontak_penjual,
          gambar,
          status: "pending", // Pastikan masuk sebagai pending
        },
      ]);

      if (error) throw error;
      res.status(201).json({
        message: "Produk berhasil diajukan dan menunggu persetujuan Admin.",
        data,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 2. [PUBLIK] Menampilkan produk di halaman utama (Hanya yang Approved)
  getProdukPublik: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("produk_unggulan")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 3. [ADMIN CMS] Menampilkan semua produk (Tabel CMS)
  getSemuaProdukAdmin: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("produk_unggulan")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 4. [ADMIN CMS] Mengubah status produk (Approve/Reject)
  updateStatusProduk: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // Terima 'approved' atau 'rejected'

      const { data, error } = await supabase
        .from("produk_unggulan")
        .update({ status: status })
        .eq("id", id);

      if (error) throw error;
      res.status(200).json({
        message: `Status produk berhasil diubah menjadi ${status}`,
        data,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // 5. [ADMIN CMS] Menghapus produk
  hapusProduk: async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("produk_unggulan")
        .delete()
        .eq("id", id);

      if (error) throw error;
      res.status(200).json({ message: "Produk berhasil dihapus.", data });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = produkController;
