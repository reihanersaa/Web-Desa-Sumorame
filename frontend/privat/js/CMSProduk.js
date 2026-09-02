const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  // ==================================================
  // ELEMENT
  // ==================================================
  const tbody = document.getElementById("produkTableBody");
  const form = document.getElementById("formProduk");
  const modal = document.getElementById("modalProduk");
  const modalBox = document.getElementById("modalProdukBox");
  const modalUnggulan = document.getElementById("modalUnggulan");
  const modalUnggulanBox = document.getElementById("modalUnggulanBox");
  const daftarPilihanUnggulan = document.getElementById("daftarPilihanUnggulan");
  const searchProdukUnggulan = document.getElementById("searchProdukUnggulan");
  const tableInfo = document.getElementById("tableInfo");

  const modalView = document.getElementById("modalView");
  const modalViewBox = document.getElementById("modalBox");

  const token = localStorage.getItem("token");
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

  // ==================================================
  // DATA
  // ==================================================
  let products = [];
  let featuredSelection = new Set();
  let editingProductId = null;

  // ==================================================
  // ESCAPE HTML
  // ==================================================
  const escapeHTML = (value = "") => {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
  };

  // ==================================================
  // FORMAT RUPIAH
  // ==================================================
  const rupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  // ==================================================
  // REQUEST API
  // ==================================================
  const request = async (path, options = {}) => {
    const isFormData = options.body instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(body.message || "Permintaan gagal diproses.");
    }

    return body;
  };

  // ==================================================
  // SWEETALERT LOADING + AUTO REFRESH
  // ==================================================
  const reloadWithLoading = (message = "Perubahan berhasil disimpan.") => {
    Swal.fire({
      title: "Berhasil",
      text: `${message} Memuat ulang halaman...`,
      icon: "success",
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: 1200,
      timerProgressBar: true,

      didOpen: () => {
        Swal.showLoading();
      },
    }).then(() => {
      window.location.reload();
    });
  };

  // ==================================================
  // BADGE STATUS
  // ==================================================
  const badge = (status) => {
    const style = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };

    const label = {
      pending: "Menunggu",
      approved: "Disetujui",
      rejected: "Ditolak",
    };

    return `
      <span class="${style[status] || style.pending} px-2 py-1 rounded-full text-xs font-bold">
        ${label[status] || escapeHTML(status)}
      </span>
    `;
  };

  // ==================================================
  // RENDER TABLE
  // ==================================================
  const render = () => {
    if (!products.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-gray-500">
            Belum ada pengajuan produk.
          </td>
        </tr>
      `;

      if (tableInfo) {
        tableInfo.textContent = "Showing 0 to 0 of 0 entries";
      }

      return;
    }

    tbody.innerHTML = products.map((item, index) => `
      <tr data-id="${item.id}" class="hover:bg-blue-50 hover:scale-[1.01] transition-all duration-200">

        <td class="px-4 py-3 text-center border">
          ${index + 1}
        </td>

        <td class="px-4 py-3 font-semibold text-center border">
          ${escapeHTML(item.nama_penjual || "")}
        </td>

        <td class="px-4 py-3 text-center border">
          ${escapeHTML(item.kontak_penjual || "")}
        </td>

        <td class="px-4 py-3 font-semibold text-center border">
          ${escapeHTML(item.nama_produk || "")}

          ${
            item.is_featured
              ? `<span class="block mt-1 text-[10px] text-green-700">★ Tampil di beranda</span>`
              : ""
          }
        </td>

        <td class="px-4 py-3 text-green-600 font-bold text-center border">
          ${rupiah(item.harga)}
        </td>

        <td class="px-4 py-3 text-center border">
          ${badge(item.status)}
        </td>

        <td class="px-4 py-3 text-center border">
          <div class="inline-flex gap-1">

            <button
              data-action="view"
              class="bg-purple-500 hover:bg-purple-600 text-white p-1.5 rounded transition"
              title="Detail"
            >
              <span class="material-symbols-outlined text-sm">visibility</span>
            </button>

            <button
              data-action="edit"
              class="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded transition"
              title="Edit Data"
            >
              <span class="material-symbols-outlined text-sm">edit_document</span>
            </button>

            <button
              data-action="status"
              class="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded transition"
              title="Ubah Status"
            >
              <span class="material-symbols-outlined text-sm">edit</span>
            </button>

            <button
              data-action="delete"
              class="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition"
              title="Hapus"
            >
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>

          </div>
        </td>

      </tr>
    `).join("");

    if (tableInfo) {
      tableInfo.textContent = `Showing 1 to ${products.length} of ${products.length} entries`;
    }
  };

  // ==================================================
  // LOAD PRODUK
  // ==================================================
  const load = async () => {
    if (!token) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-yellow-700">
            Sesi admin tidak ditemukan. Mengarahkan ke halaman login...
          </td>
        </tr>
      `;

      if (window.Swal) {
        await Swal.fire(
          "Sesi admin diperlukan",
          "Silakan login kembali.",
          "warning"
        );
      }

      window.location.href = "/admin/LoginAdmin";
      return;
    }

    try {
      const result = await request("/admin/produk");
      products = Array.isArray(result.data) ? result.data : [];
      render();
    } catch (error) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-red-600">
            ${escapeHTML(error.message)}
          </td>
        </tr>
      `;

      if (tableInfo) {
        tableInfo.textContent = "Showing 0 to 0 of 0 entries";
      }
    }
  };

  // ==================================================
  // MODAL TAMBAH / EDIT
  // ==================================================
  const showForm = (open, item = null) => {
    if (open) {
      editingProductId = item ? String(item.id) : null;

      form.reset();

      document.getElementById("modalProdukTitle").textContent =
        item ? "Edit Produk" : "Tambah Produk";

      document.getElementById("btnSimpanProduk").textContent =
        item ? "Simpan Perubahan" : "Simpan";

      const fileInput = document.getElementById("inputFotoProduk");
      const preview = document.getElementById("previewFotoProduk");

      // Saat tambah wajib gambar, saat edit tidak wajib mengganti gambar.
      fileInput.required = !item;

      if (item) {
        document.getElementById("namaProduk").value = item.nama_produk || "";
        document.getElementById("namaPenjual").value = item.nama_penjual || "";
        document.getElementById("hargaProduk").value = item.harga || "";
        document.getElementById("noHpPenjual").value = item.kontak_penjual || "";
        document.getElementById("emailPenjual").value = item.email_penjual || "";
        document.getElementById("alamatPenjual").value = item.deskripsi || "";

        preview.src = item.gambar || "";
        preview.classList.toggle("hidden", !item.gambar);
      } else {
        preview.src = "";
        preview.classList.add("hidden");
      }

      modal.classList.remove("hidden");

      requestAnimationFrame(() => {
        modal.classList.remove("opacity-0");
        modalBox.classList.remove("scale-90", "opacity-0");
      });

      return;
    }

    modal.classList.add("opacity-0");
    modalBox.classList.add("scale-90", "opacity-0");

    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);
  };

  // ==================================================
  // MODAL VIEW PRODUK
  // ==================================================
  const showView = (open, item = null) => {
    if (open && item) {
      const gambar = document.getElementById("viewGambarProduk");

      document.getElementById("viewNamaPenjual").textContent =
        item.nama_penjual || "";

      document.getElementById("viewNamaProduk").textContent =
        item.nama_produk || "";

      document.getElementById("viewNoHp").textContent =
        item.kontak_penjual || "";

      document.getElementById("viewEmail").textContent =
        item.email_penjual || "";

      document.getElementById("viewAlamat").textContent =
        item.deskripsi || "";

      if (item.gambar) {
        gambar.src = item.gambar;
        gambar.classList.remove("hidden");
      } else {
        gambar.src = "";
        gambar.classList.add("hidden");
      }

      modalView.classList.remove("hidden");

      requestAnimationFrame(() => {
        modalView.classList.remove("opacity-0");
        modalViewBox.classList.remove("scale-90", "opacity-0");
      });

      return;
    }

    modalView.classList.add("opacity-0");
    modalViewBox.classList.add("scale-90", "opacity-0");

    setTimeout(() => {
      modalView.classList.add("hidden");
    }, 300);
  };

  // ==================================================
  // MODAL PILIH PRODUK UNGGULAN
  // ==================================================
  const showUnggulan = (open) => {
    if (open) {
      featuredSelection = new Set(
        products
          .filter((item) => item.is_featured)
          .map((item) => String(item.id))
      );

      searchProdukUnggulan.value = "";
      renderPilihanUnggulan();

      modalUnggulan.classList.remove("hidden");

      requestAnimationFrame(() => {
        modalUnggulan.classList.remove("opacity-0");
        modalUnggulanBox.classList.remove("scale-90", "opacity-0");
      });

      return;
    }

    modalUnggulan.classList.add("opacity-0");
    modalUnggulanBox.classList.add("scale-90", "opacity-0");

    setTimeout(() => {
      modalUnggulan.classList.add("hidden");
    }, 300);
  };

  // ==================================================
  // JUMLAH PRODUK UNGGULAN
  // ==================================================
  const updateJumlahPilihan = () => {
    const element = document.getElementById("jumlahPilihanUnggulan");

    if (!element) return;

    element.textContent = `${featuredSelection.size} dari 5 produk dipilih`;
  };

  // ==================================================
  // RENDER PRODUK UNGGULAN
  // ==================================================
  const renderPilihanUnggulan = () => {
    const keyword = (searchProdukUnggulan.value || "")
      .trim()
      .toLocaleLowerCase("id");

    const approvedProducts = products.filter((item) => {
      if (item.status !== "approved") return false;

      const searchable = [
        item.nama_produk,
        item.nama_penjual,
        item.harga,
        item.kontak_penjual,
        item.email_penjual,
      ]
        .map((value) => String(value || "").toLocaleLowerCase("id"))
        .join(" ");

      return !keyword || searchable.includes(keyword);
    });

    if (!approvedProducts.length) {
      daftarPilihanUnggulan.innerHTML = `
        <p class="sm:col-span-2 py-8 text-center text-gray-500">
          ${
            keyword
              ? "Produk tidak ditemukan."
              : "Belum ada produk yang berstatus disetujui."
          }
        </p>
      `;

      updateJumlahPilihan();
      return;
    }

    daftarPilihanUnggulan.innerHTML = approvedProducts
      .sort((a, b) => (a.featured_order || 99) - (b.featured_order || 99))
      .map((item) => `
        <label class="flex items-center gap-3 border rounded-xl p-3 cursor-pointer hover:border-green-400 hover:bg-green-50 transition">

          <input
            type="checkbox"
            name="produk_unggulan"
            value="${item.id}"
            ${featuredSelection.has(String(item.id)) ? "checked" : ""}
            class="w-5 h-5 accent-green-600"
          >

          <img
            src="${escapeHTML(item.gambar || "")}"
            alt="Gambar ${escapeHTML(item.nama_produk || "")}"
            class="w-14 h-14 rounded-lg object-cover bg-gray-100"
          >

          <span class="min-w-0">
            <strong class="block truncate">
              ${escapeHTML(item.nama_produk || "")}
            </strong>

            <small class="text-gray-500">
              ${escapeHTML(item.nama_penjual || "")} · ${rupiah(item.harga)}
            </small>
          </span>

        </label>
      `)
      .join("");

    updateJumlahPilihan();
  };

  // ==================================================
  // BUTTON MODAL TAMBAH
  // ==================================================
  document.getElementById("btnTambahProduk")?.addEventListener("click", () => showForm(true));
  document.getElementById("btnCloseModal")?.addEventListener("click", () => showForm(false));
  document.getElementById("btnBatal")?.addEventListener("click", () => showForm(false));

  // ==================================================
  // BUTTON MODAL VIEW
  // ==================================================
  document.getElementById("closeModal")?.addEventListener("click", () => showView(false));
  document.getElementById("btnCloseView")?.addEventListener("click", () => showView(false));

  // ==================================================
  // BUTTON MODAL PRODUK UNGGULAN
  // ==================================================
  document.getElementById("btnPilihUnggulan")?.addEventListener("click", () => showUnggulan(true));
  document.getElementById("btnCloseUnggulan")?.addEventListener("click", () => showUnggulan(false));
  document.getElementById("btnBatalUnggulan")?.addEventListener("click", () => showUnggulan(false));

  // ==================================================
  // SEARCH PRODUK UNGGULAN
  // ==================================================
  searchProdukUnggulan?.addEventListener("input", renderPilihanUnggulan);

  // ==================================================
  // CHECKBOX PRODUK UNGGULAN
  // ==================================================
  daftarPilihanUnggulan?.addEventListener("change", (event) => {
    const checkbox = event.target.closest('input[name="produk_unggulan"]');

    if (!checkbox) return;

    const id = String(checkbox.value);

    if (checkbox.checked && featuredSelection.size >= 5) {
      checkbox.checked = false;

      Swal.fire(
        "Maksimal 5 produk",
        "Batalkan salah satu pilihan sebelum memilih produk lain.",
        "warning"
      );

      return;
    }

    if (checkbox.checked) {
      featuredSelection.add(id);
    } else {
      featuredSelection.delete(id);
    }

    updateJumlahPilihan();
  });

  // ==================================================
  // SIMPAN PRODUK UNGGULAN
  // ==================================================
  document.getElementById("formUnggulan")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const productIds = Array.from(featuredSelection);

    try {
      await request("/admin/produk/unggulan", {
        method: "PUT",
        body: JSON.stringify({
          product_ids: productIds,
        }),
      });

      showUnggulan(false);

      reloadWithLoading(
        `${productIds.length} produk berhasil dipilih untuk beranda.`
      );

      return;
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  });

  // ==================================================
  // PREVIEW GAMBAR
  // ==================================================
  document.getElementById("inputFotoProduk")?.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type) || file.size > MAX_IMAGE_SIZE) {
      event.target.value = "";

      const preview = document.getElementById("previewFotoProduk");
      preview.src = "";
      preview.classList.add("hidden");

      return Swal.fire(
        "Foto tidak valid",
        "Gunakan gambar JPG, PNG, atau WebP maksimal 2 MB.",
        "warning"
      );
    }

    const reader = new FileReader();

    reader.onload = () => {
      const preview = document.getElementById("previewFotoProduk");
      preview.src = reader.result;
      preview.classList.remove("hidden");
    };

    reader.readAsDataURL(file);
  });

  // ==================================================
  // SIMPAN TAMBAH / EDIT PRODUK
  // ==================================================
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = document.getElementById("inputFotoProduk").files[0];

    if (!editingProductId && !file) {
      return Swal.fire(
        "Foto belum dipilih",
        "Pilih gambar produk.",
        "warning"
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (file && !allowedTypes.includes(file.type)) {
      return Swal.fire(
        "Foto tidak valid",
        "Gunakan gambar JPG, PNG, atau WebP.",
        "warning"
      );
    }

    if (file && file.size > MAX_IMAGE_SIZE) {
      return Swal.fire(
        "Foto terlalu besar",
        "Ukuran gambar maksimal 2 MB.",
        "warning"
      );
    }

    try {
      const formData = new FormData();

      formData.append("nama_produk", document.getElementById("namaProduk").value.trim());
      formData.append("harga", document.getElementById("hargaProduk").value);
      formData.append("nama_penjual", document.getElementById("namaPenjual").value.trim());
      formData.append("kontak_penjual", document.getElementById("noHpPenjual").value.trim());
      formData.append("email_penjual", document.getElementById("emailPenjual").value.trim());
      formData.append("deskripsi", document.getElementById("alamatPenjual").value.trim());

      if (file) {
        formData.append("gambar", file);
      }

      const sedangEdit = Boolean(editingProductId);
      const path = sedangEdit
        ? `/admin/produk/${editingProductId}`
        : "/admin/produk";

      await request(path, {
        method: sedangEdit ? "PUT" : "POST",
        body: formData,
      });

      form.reset();
      showForm(false);

      reloadWithLoading(
        sedangEdit
          ? "Data produk berhasil diperbarui."
          : "Produk berhasil ditambahkan."
      );

      return;
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  });

  // ==================================================
  // ACTION TABLE
  // ==================================================
  tbody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const row = button.closest("tr");

    if (!row) return;

    const item = products.find(
      (product) => String(product.id) === String(row.dataset.id)
    );

    if (!item) return;

    // ==================================================
    // VIEW
    // ==================================================
    if (button.dataset.action === "view") {
      showView(true, item);
      return;
    }

    // ==================================================
    // EDIT
    // ==================================================
    if (button.dataset.action === "edit") {
      showForm(true, item);
      return;
    }

    // ==================================================
    // UBAH STATUS
    // ==================================================
    if (button.dataset.action === "status") {
      const answer = await Swal.fire({
        title: "Ubah status produk",
        input: "select",

        inputOptions: {
          pending: "Menunggu",
          approved: "Disetujui",
          rejected: "Ditolak",
        },

        inputValue: item.status,
        showCancelButton: true,
        confirmButtonText: "Simpan",
        cancelButtonText: "Batal",
      });

      if (!answer.isConfirmed) return;

      try {
        await request(`/admin/produk/${item.id}/status`, {
          method: "PUT",
          body: JSON.stringify({
            status: answer.value,
          }),
        });

        reloadWithLoading("Status produk berhasil diperbarui.");
        return;
      } catch (error) {
        Swal.fire("Gagal", error.message, "error");
      }

      return;
    }

    // ==================================================
    // DELETE
    // ==================================================
    if (button.dataset.action === "delete") {
      const answer = await Swal.fire({
        title: "Hapus produk?",
        text: "Data akan dihapus permanen.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        confirmButtonText: "Ya, hapus",
        cancelButtonText: "Batal",
      });

      if (!answer.isConfirmed) return;

      try {
        await request(`/admin/produk/${item.id}`, {
          method: "DELETE",
        });

        reloadWithLoading("Produk berhasil dihapus.");
        return;
      } catch (error) {
        Swal.fire("Gagal", error.message, "error");
      }
    }
  });

  // ==================================================
  // LOAD AWAL
  // ==================================================
  load();
});