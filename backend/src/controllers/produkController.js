const supabase = require("../config/supabase");
const crypto = require("crypto");

const PRODUCT_BUCKET = "produk";
const LEGACY_PRODUCT_BUCKET = "produk-images";

const extensionByMime = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};


// ==================================================
// UPLOAD GAMBAR PRODUK
// ==================================================
async function uploadGambarProduk(file) {
  if (!file) return null;

  const extension = extensionByMime[file.mimetype];

  if (!extension) {
    throw new Error("Format gambar produk tidak didukung.");
  }

  const filePath = `produk/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(PRODUCT_BUCKET)
    .getPublicUrl(filePath);

  return {
    publicUrl: data.publicUrl,
    filePath,
  };
}


// ==================================================
// AMBIL PATH GAMBAR DARI PUBLIC URL
// ==================================================
function getProductStoragePath(publicUrl) {
  if (!publicUrl || !String(publicUrl).startsWith("http")) {
    return null;
  }

  const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;
  const markerIndex = String(publicUrl).indexOf(marker);

  return markerIndex === -1
    ? null
    : decodeURIComponent(
        String(publicUrl).slice(markerIndex + marker.length)
      );
}


// ==================================================
// HAPUS GAMBAR PRODUK
// ==================================================
async function removeProductImage(publicUrl) {
  const filePath = getProductStoragePath(publicUrl);

  if (!filePath) return;

  const { error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error(
      "Gagal menghapus gambar produk:",
      error.message
    );
  }
}


// ==================================================
// CANDIDATE URL GAMBAR
// Mendukung bucket baru dan bucket lama
// ==================================================
function getProductImageCandidates(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) return [];

  if (/^https?:\/\//i.test(rawValue)) {
    const candidates = [rawValue];

    if (rawValue.includes(`/object/public/${PRODUCT_BUCKET}/`)) {
      candidates.push(
        rawValue.replace(
          `/object/public/${PRODUCT_BUCKET}/`,
          `/object/public/${LEGACY_PRODUCT_BUCKET}/`
        )
      );
    } else if (
      rawValue.includes(`/object/public/${LEGACY_PRODUCT_BUCKET}/`)
    ) {
      candidates.push(
        rawValue.replace(
          `/object/public/${LEGACY_PRODUCT_BUCKET}/`,
          `/object/public/${PRODUCT_BUCKET}/`
        )
      );
    }

    return [...new Set(candidates)];
  }

  const normalized = rawValue.replace(/^\/+/, "");

  const legacyPath = normalized.startsWith(
    `${LEGACY_PRODUCT_BUCKET}/`
  )
    ? normalized.slice(LEGACY_PRODUCT_BUCKET.length + 1)
    : normalized;

  const currentPath = normalized.startsWith(
    `${PRODUCT_BUCKET}/`
  )
    ? normalized.slice(PRODUCT_BUCKET.length + 1)
    : normalized;

  const currentUrl = supabase.storage
    .from(PRODUCT_BUCKET)
    .getPublicUrl(currentPath)
    .data.publicUrl;

  const legacyUrl = supabase.storage
    .from(LEGACY_PRODUCT_BUCKET)
    .getPublicUrl(legacyPath)
    .data.publicUrl;

  return [...new Set(
    [currentUrl, legacyUrl].filter(Boolean)
  )];
}


// ==================================================
// SERIALIZE PRODUK
// ==================================================
function serializeProduct(item) {
  if (!item) return item;

  const candidates = getProductImageCandidates(
    item.gambar_url || item.gambar
  );

  return {
    ...item,
    gambar: candidates[0] || "",
    gambar_url: candidates[0] || "",
    gambar_alternatif: candidates.slice(1),
  };
}


// ==================================================
// CONTROLLER PRODUK
// ==================================================
const produkController = {

  // ==================================================
  // 1. AJUKAN / TAMBAH PRODUK
  // Warga maupun admin
  // ==================================================
  ajukanProduk: async (req, res) => {
    let uploadedImage = null;

    try {
      const {
        nama_produk,
        deskripsi,
        harga,
        nama_penjual: submittedSellerName,
        kontak_penjual: submittedContact,
      } = req.body || {};

      const isAdmin = req.user?.role === "admin";

      let nama_penjual = String(
        submittedSellerName || ""
      ).trim();

      let kontak_penjual = String(
        submittedContact || ""
      ).trim();

      let user_id = null;


      // ==============================================
      // JIKA PENGAJU ADALAH WARGA
      // ==============================================
      if (!isAdmin) {
        if (!req.user?.id) {
          return res.status(401).json({
            success: false,
            message: "Pengguna belum login.",
          });
        }

        const { data: warga, error: wargaError } =
          await supabase
            .from("users")
            .select("id, nama_lengkap, no_hp")
            .eq("id", req.user.id)
            .maybeSingle();

        if (wargaError) {
          throw wargaError;
        }

        if (!warga) {
          return res.status(401).json({
            success: false,
            message: "Akun warga tidak ditemukan.",
          });
        }

        user_id = warga.id;

        nama_penjual = String(
          warga.nama_lengkap || ""
        ).trim();

        kontak_penjual =
          kontak_penjual ||
          String(warga.no_hp || "").trim();
      }


      // ==============================================
      // VALIDASI INPUT WAJIB
      // ==============================================
      if (
        !nama_produk ||
        !harga ||
        !nama_penjual ||
        !kontak_penjual ||
        !req.file
      ) {
        return res.status(400).json({
          success: false,
          message: "Kolom wajib belum diisi!",
        });
      }


      // ==============================================
      // VALIDASI NOMOR WHATSAPP
      // ==============================================
      if (!/^\d{9,15}$/.test(kontak_penjual)) {
        return res.status(400).json({
          success: false,
          message:
            "Nomor WhatsApp harus terdiri dari 9 sampai 15 angka.",
        });
      }


      // ==============================================
      // VALIDASI HARGA
      // ==============================================
      const hargaProduk = Number(harga);

      if (
        !Number.isFinite(hargaProduk) ||
        hargaProduk <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Harga produk harus lebih dari 0.",
        });
      }


      // ==============================================
      // UPLOAD GAMBAR
      // ==============================================
      uploadedImage =
        await uploadGambarProduk(req.file);


      // ==============================================
      // INSERT DATABASE
      // ==============================================
      const { data, error } = await supabase
        .from("produk_unggulan")
        .insert([
          {
            user_id,
            nama_produk: String(nama_produk).trim(),
            deskripsi: String(deskripsi || "").trim(),
            harga: hargaProduk,
            nama_penjual,
            kontak_penjual,
            gambar: uploadedImage.publicUrl,
            status: "pending",
          },
        ])
        .select()
        .single();


      if (error) {
        if (uploadedImage) {
          await removeProductImage(
            uploadedImage.publicUrl
          );
        }

        throw error;
      }


      return res.status(201).json({
        success: true,
        message: "Produk berhasil diajukan.",
        data: serializeProduct(data),
      });

    } catch (error) {
      console.error(
        "Error Ajukan Produk:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },


  // ==================================================
  // 2. GET PRODUK UNGGULAN BERANDA
  // Maksimal 5 produk pilihan admin
  // ==================================================
  getProdukUnggulanBeranda: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("produk_unggulan")
        .select("*")
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("featured_order", {
          ascending: true,
        })
        .limit(5);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: (data || []).map(
          serializeProduct
        ),
      });

    } catch (error) {
      console.error(
        "Error Get Produk Unggulan:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },


  // ==================================================
  // 3. GET TOP 3 PRODUK
  // Berdasarkan jumlah dilihat
  // ==================================================
  getTop3Produk: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("produk_unggulan")
        .select("*")
        .eq("status", "approved")
        .order("dilihat", {
          ascending: false,
        })
        .limit(3);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: (data || []).map(
          serializeProduct
        ),
      });

    } catch (error) {
      console.error(
        "Error Get Top 3 Produk:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },


  // ==================================================
  // 4. TAMBAH JUMLAH VIEW PRODUK
  // ==================================================
  tambahViewProduk: async (req, res) => {
    try {
      const { id } = req.params;

      const {
        data: produk,
        error: readError,
      } = await supabase
        .from("produk_unggulan")
        .select("dilihat")
        .eq("id", id)
        .maybeSingle();

      if (readError) {
        throw readError;
      }

      if (!produk) {
        return res.status(404).json({
          success: false,
          message: "Produk tidak ditemukan.",
        });
      }


      const { data, error } = await supabase
        .from("produk_unggulan")
        .update({
          dilihat:
            Number(produk.dilihat || 0) + 1,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;


      return res.status(200).json({
        success: true,
        data: serializeProduct(data),
      });

    } catch (error) {
      console.error(
        "Error Tambah View Produk:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },


  // ==================================================
  // 5. GET PRODUK PUBLIK
  // Hanya produk approved
  // ==================================================
  getProdukPublik: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("produk_unggulan")
        .select("*")
        .eq("status", "approved")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;


      return res.status(200).json({
        success: true,
        data: (data || []).map(
          serializeProduct
        ),
      });

    } catch (error) {
      console.error(
        "Error Get Produk Publik:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },


  // ==================================================
  // 6. GET SEMUA PRODUK ADMIN
  // Pending, Approved, Rejected
  // ==================================================
  getSemuaProdukAdmin: async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message:
            "Akses Ditolak! Khusus Admin.",
        });
      }


      const { data, error } = await supabase
        .from("produk_unggulan")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;


      return res.status(200).json({
        success: true,
        data: (data || []).map(
          serializeProduct
        ),
      });

    } catch (error) {
      console.error(
        "Error Get Produk Admin:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },


  // ==================================================
  // 7. UPDATE PILIHAN PRODUK BERANDA
  // Maksimal 5 produk
  // ==================================================
  updateProdukUnggulanBeranda: async (
    req,
    res
  ) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message:
            "Akses Ditolak! Khusus Admin.",
        });
      }


      const ids = Array.isArray(
        req.body?.product_ids
      )
        ? [
            ...new Set(
              req.body.product_ids.map(String)
            ),
          ]
        : [];


      // ==============================================
      // MAKSIMAL 5 PRODUK
      // ==============================================
      if (ids.length > 5) {
        return res.status(400).json({
          success: false,
          message:
            "Produk unggulan maksimal 5 item.",
        });
      }


      // ==============================================
      // CEK SEMUA PRODUK HARUS APPROVED
      // ==============================================
      if (ids.length) {
        const {
          data: approved,
          error: validationError,
        } = await supabase
          .from("produk_unggulan")
          .select("id")
          .in("id", ids)
          .eq("status", "approved");

        if (validationError) {
          throw validationError;
        }

        if (
          (approved || []).length !==
          ids.length
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Semua produk pilihan harus berstatus disetujui.",
          });
        }
      }


      // ==============================================
      // RESET FEATURED LAMA
      // ==============================================
      const { error: clearError } =
        await supabase
          .from("produk_unggulan")
          .update({
            is_featured: false,
            featured_order: null,
          })
          .eq("is_featured", true);

      if (clearError) {
        throw clearError;
      }


      // ==============================================
      // SET FEATURED BARU
      // ==============================================
      for (
        let index = 0;
        index < ids.length;
        index += 1
      ) {
        const { error } = await supabase
          .from("produk_unggulan")
          .update({
            is_featured: true,
            featured_order: index + 1,
          })
          .eq("id", ids[index]);

        if (error) {
          throw error;
        }
      }


      return res.status(200).json({
        success: true,
        message:
          "Produk unggulan beranda berhasil diperbarui.",
      });

    } catch (error) {
      console.error(
        "Error Update Produk Unggulan:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },


  // ==================================================
  // 8. UPDATE STATUS PRODUK
  // ==================================================
  updateStatusProduk: async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message:
            "Akses Ditolak! Khusus Admin.",
        });
      }


      const { id } = req.params;
      const { status } = req.body || {};


      const validStatus = [
        "pending",
        "approved",
        "rejected",
      ];


      if (
        !status ||
        !validStatus.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Status tidak valid. Gunakan pending, approved, atau rejected.",
        });
      }


      // Jika status bukan approved,
      // produk otomatis dihapus dari featured.
      const updateData =
        status === "approved"
          ? {
              status,
            }
          : {
              status,
              is_featured: false,
              featured_order: null,
            };


      const { data, error } = await supabase
        .from("produk_unggulan")
        .update(updateData)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;


      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Produk tidak ditemukan.",
        });
      }


      return res.status(200).json({
        success: true,
        message:
          `Status produk berhasil diubah menjadi ${status}.`,
        data: serializeProduct(data),
      });

    } catch (error) {
      console.error(
        "Error Update Status Produk:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },


  // ==================================================
  // 9. UPDATE DATA PRODUK
  // Tidak mengubah status
  // ==================================================
  updateProduk: async (req, res) => {
    let uploadedImage = null;

    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message:
            "Akses Ditolak! Khusus Admin.",
        });
      }


      const { id } = req.params;

      const {
        nama_produk,
        deskripsi,
        harga,
        nama_penjual,
        kontak_penjual,
      } = req.body || {};


      // ==============================================
      // VALIDASI DATA WAJIB
      // ==============================================
      if (
        !nama_produk ||
        !nama_penjual ||
        !kontak_penjual ||
        !deskripsi
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Kolom data produk wajib dilengkapi.",
        });
      }


      // ==============================================
      // VALIDASI NOMOR HP
      // ==============================================
      const kontak = String(
        kontak_penjual
      ).trim();

      if (!/^\d{9,15}$/.test(kontak)) {
        return res.status(400).json({
          success: false,
          message:
            "Nomor HP harus terdiri dari 9 sampai 15 angka.",
        });
      }


      // ==============================================
      // VALIDASI HARGA
      // ==============================================
      const hargaProduk = Number(harga);

      if (
        !Number.isFinite(hargaProduk) ||
        hargaProduk <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Harga produk harus lebih dari 0.",
        });
      }


      // ==============================================
      // CEK PRODUK
      // ==============================================
      const {
        data: existingProduct,
        error: existingError,
      } = await supabase
        .from("produk_unggulan")
        .select("id, gambar")
        .eq("id", id)
        .maybeSingle();


      if (existingError) {
        throw existingError;
      }


      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message:
            "Produk tidak ditemukan.",
        });
      }


      // ==============================================
      // DATA UPDATE
      // ==============================================
      const updateData = {
        nama_produk:
          String(nama_produk).trim(),

        deskripsi:
          String(deskripsi).trim(),

        harga:
          hargaProduk,

        nama_penjual:
          String(nama_penjual).trim(),

        kontak_penjual:
          kontak,
      };


      // ==============================================
      // JIKA ADA GAMBAR BARU
      // ==============================================
      if (req.file) {
        uploadedImage =
          await uploadGambarProduk(req.file);

        updateData.gambar =
          uploadedImage.publicUrl;
      }


      // ==============================================
      // UPDATE DATABASE
      // ==============================================
      const { data, error } = await supabase
        .from("produk_unggulan")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();


      if (error) {
        if (uploadedImage) {
          await removeProductImage(
            uploadedImage.publicUrl
          );
        }

        throw error;
      }


      // ==============================================
      // HAPUS GAMBAR LAMA
      // ==============================================
      if (
        uploadedImage &&
        existingProduct.gambar &&
        existingProduct.gambar !==
          uploadedImage.publicUrl
      ) {
        await removeProductImage(
          existingProduct.gambar
        );
      }


      return res.status(200).json({
        success: true,
        message:
          "Data produk berhasil diperbarui.",
        data: serializeProduct(data),
      });

    } catch (error) {
      console.error(
        "Error Update Produk:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },


  // ==================================================
  // 10. HAPUS PRODUK
  // ==================================================
  hapusProduk: async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message:
            "Akses Ditolak! Khusus Admin.",
        });
      }


      const { id } = req.params;


      // ==============================================
      // AMBIL GAMBAR PRODUK
      // ==============================================
      const {
        data: existingProduct,
        error: existingError,
      } = await supabase
        .from("produk_unggulan")
        .select("id, gambar")
        .eq("id", id)
        .maybeSingle();


      if (existingError) {
        throw existingError;
      }


      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Produk tidak ditemukan.",
        });
      }


      // ==============================================
      // DELETE DATABASE
      // ==============================================
      const { error } = await supabase
        .from("produk_unggulan")
        .delete()
        .eq("id", id);


      if (error) {
        throw error;
      }


      // ==============================================
      // DELETE GAMBAR STORAGE
      // ==============================================
      if (existingProduct.gambar) {
        await removeProductImage(
          existingProduct.gambar
        );
      }


      return res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus.",
      });

    } catch (error) {
      console.error(
        "Error Hapus Produk:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

};


module.exports = produkController;