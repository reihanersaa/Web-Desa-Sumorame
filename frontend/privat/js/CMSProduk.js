const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("table tbody");
  const form = document.getElementById("formProduk");
  const modal = document.getElementById("modalProduk");
  const modalBox = document.getElementById("modalProdukBox");
  const modalUnggulan = document.getElementById("modalUnggulan");
  const modalUnggulanBox = document.getElementById("modalUnggulanBox");
  const daftarPilihanUnggulan = document.getElementById("daftarPilihanUnggulan");
  const searchProdukUnggulan = document.getElementById("searchProdukUnggulan");
  const token = localStorage.getItem("token");
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
  let products = [];
  let featuredSelection = new Set();
  let editingProductId = null;

  const escapeHTML = (value = "") => {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  };
  const rupiah = (value) => new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(Number(value) || 0);
  const request = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || "Permintaan gagal diproses.");
    return body;
  };
  const badge = (status) => {
    const style = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };
    const label = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };
    return `<span class="${style[status] || style.pending} px-2 py-1 rounded-full text-xs font-bold">${label[status] || status}</span>`;
  };
  const render = () => {
    if (!products.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="p-8 text-center text-gray-500">Belum ada pengajuan produk.</td></tr>';
      return;
    }
    tbody.innerHTML = products.map((item, index) => `<tr data-id="${item.id}" class="hover:bg-blue-50">
      <td class="px-4 py-3 text-center border">${index + 1}</td><td class="px-4 py-3 text-center border">${escapeHTML(item.nik || "-")}</td>
      <td class="px-4 py-3 font-semibold text-center border">${escapeHTML(item.nama_penjual)}</td>
      <td class="px-4 py-3 text-center border">${escapeHTML(item.kontak_penjual || "-")}</td>
      <td class="px-4 py-3 font-semibold text-center border">${escapeHTML(item.nama_produk)}${item.is_featured ? '<span class="block mt-1 text-[10px] text-green-700">★ Tampil di beranda</span>' : ""}</td>
      <td class="px-4 py-3 text-green-600 font-bold text-center border">${rupiah(item.harga)}</td>
      <td class="px-4 py-3 text-center border">${badge(item.status)}</td>
      <td class="px-4 py-3 text-center border"><div class="inline-flex gap-1">
        <button data-action="view" class="bg-purple-500 text-white p-1.5 rounded" title="Detail"><span class="material-symbols-outlined text-sm">visibility</span></button>
        <button data-action="edit" class="bg-blue-500 text-white p-1.5 rounded" title="Edit Data"><span class="material-symbols-outlined text-sm">edit</span></button>
        <button data-action="status" class="bg-green-500 text-white p-1.5 rounded" title="Ubah Status"><span class="material-symbols-outlined text-sm">edit_document</span></button>
        <button data-action="delete" class="bg-red-500 text-white p-1.5 rounded" title="Hapus"><span class="material-symbols-outlined text-sm">delete</span></button>
      </div></td></tr>`).join("");
  };
  const load = async () => {
    if (!token) {
      tbody.innerHTML = '<tr><td colspan="8" class="p-8 text-center text-yellow-700">Sesi admin tidak ditemukan. Mengarahkan ke halaman login...</td></tr>';
      if (window.Swal) {
        await Swal.fire("Sesi admin diperlukan", "Silakan login kembali.", "warning");
      }
      window.location.href = "LoginAdmin.html";
      return;
    }
    try {
      products = (await request("/admin/produk")).data || [];
      render();
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-red-600">${escapeHTML(error.message)}</td></tr>`;
    }
  };
  const showForm = (open, item = null) => {
    if (open) {
      editingProductId = item ? String(item.id) : null;
      form.reset();
      document.getElementById("modalProdukTitle").textContent = item ? "Edit Produk" : "Tambah Produk";
      document.getElementById("btnSimpanProduk").textContent = item ? "Simpan Perubahan" : "Simpan";
      const fileInput = document.getElementById("inputFotoProduk");
      const preview = document.getElementById("previewFotoProduk");
      fileInput.required = !item;

      if (item) {
        document.getElementById("nikPenjual").value = item.nik || "";
        document.getElementById("namaProduk").value = item.nama_produk || "";
        document.getElementById("namaPenjual").value = item.nama_penjual || "";
        document.getElementById("hargaProduk").value = item.harga || "";
        document.getElementById("noHpPenjual").value = item.kontak_penjual || "";
        document.getElementById("alamatPenjual").value = item.deskripsi || "";
        preview.src = item.gambar || "";
        preview.classList.toggle("hidden", !item.gambar);
      } else {
        preview.src = "";
        preview.classList.add("hidden");
      }

      modal.classList.remove("hidden");
      requestAnimationFrame(() => { modal.classList.remove("opacity-0"); modalBox.classList.remove("scale-90", "opacity-0"); });
    } else {
      modal.classList.add("opacity-0"); modalBox.classList.add("scale-90", "opacity-0");
      setTimeout(() => modal.classList.add("hidden"), 300);
    }
  };

  const showUnggulan = (open) => {
    if (open) {
      featuredSelection = new Set(products.filter((item) => item.is_featured).map((item) => String(item.id)));
      searchProdukUnggulan.value = "";
      renderPilihanUnggulan();
      modalUnggulan.classList.remove("hidden");
      requestAnimationFrame(() => {
        modalUnggulan.classList.remove("opacity-0");
        modalUnggulanBox.classList.remove("scale-90", "opacity-0");
      });
    } else {
      modalUnggulan.classList.add("opacity-0");
      modalUnggulanBox.classList.add("scale-90", "opacity-0");
      setTimeout(() => modalUnggulan.classList.add("hidden"), 300);
    }
  };

  const updateJumlahPilihan = () => {
    document.getElementById("jumlahPilihanUnggulan").textContent = `${featuredSelection.size} dari 5 produk dipilih`;
  };

  const renderPilihanUnggulan = () => {
    const keyword = (searchProdukUnggulan.value || "").trim().toLocaleLowerCase("id");
    const approvedProducts = products.filter((item) => {
      if (item.status !== "approved") return false;
      const searchable = [item.nama_produk, item.nama_penjual, item.nik, item.harga]
        .map((value) => String(value || "").toLocaleLowerCase("id"))
        .join(" ");
      return !keyword || searchable.includes(keyword);
    });
    if (!approvedProducts.length) {
      daftarPilihanUnggulan.innerHTML = `<p class="sm:col-span-2 py-8 text-center text-gray-500">${keyword ? "Produk tidak ditemukan." : "Belum ada produk yang berstatus disetujui."}</p>`;
      updateJumlahPilihan();
      return;
    }
    daftarPilihanUnggulan.innerHTML = approvedProducts
      .sort((a, b) => (a.featured_order || 99) - (b.featured_order || 99))
      .map((item) => `<label class="flex items-center gap-3 border rounded-xl p-3 cursor-pointer hover:border-green-400 hover:bg-green-50 transition">
        <input type="checkbox" name="produk_unggulan" value="${item.id}" ${featuredSelection.has(String(item.id)) ? "checked" : ""} class="w-5 h-5 accent-green-600">
        <img src="${escapeHTML(item.gambar)}" alt="" class="w-14 h-14 rounded-lg object-cover bg-gray-100">
        <span class="min-w-0"><strong class="block truncate">${escapeHTML(item.nama_produk)}</strong><small class="text-gray-500">${escapeHTML(item.nama_penjual)} · ${rupiah(item.harga)}</small></span>
      </label>`).join("");
    updateJumlahPilihan();
  };

  document.getElementById("btnTambahProduk")?.addEventListener("click", () => showForm(true));
  document.getElementById("btnCloseModal")?.addEventListener("click", () => showForm(false));
  document.getElementById("btnBatal")?.addEventListener("click", () => showForm(false));
  document.getElementById("btnPilihUnggulan")?.addEventListener("click", () => showUnggulan(true));
  document.getElementById("btnCloseUnggulan")?.addEventListener("click", () => showUnggulan(false));
  document.getElementById("btnBatalUnggulan")?.addEventListener("click", () => showUnggulan(false));
  searchProdukUnggulan?.addEventListener("input", renderPilihanUnggulan);
  daftarPilihanUnggulan?.addEventListener("change", (event) => {
    const id = String(event.target.value);
    if (event.target.checked && featuredSelection.size >= 5) {
      event.target.checked = false;
      Swal.fire("Maksimal 5 produk", "Batalkan salah satu pilihan sebelum memilih produk lain.", "warning");
    } else if (event.target.checked) {
      featuredSelection.add(id);
    } else {
      featuredSelection.delete(id);
    }
    updateJumlahPilihan();
  });
  document.getElementById("formUnggulan")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const productIds = Array.from(featuredSelection);
    try {
      await request("/admin/produk/unggulan", { method: "PUT", body: JSON.stringify({ product_ids: productIds }) });
      showUnggulan(false);
      await load();
      Swal.fire("Tersimpan", `${productIds.length} produk akan ditampilkan di beranda.`, "success");
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  });
  document.getElementById("inputFotoProduk")?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) {
      event.target.value = "";
      const preview = document.getElementById("previewFotoProduk");
      preview.src = "";
      preview.classList.add("hidden");
      return Swal.fire("Foto tidak valid", "Gunakan gambar JPG, PNG, atau WebP maksimal 2 MB.", "warning");
    }
    const reader = new FileReader();
    reader.onload = () => { const preview = document.getElementById("previewFotoProduk"); preview.src = reader.result; preview.classList.remove("hidden"); };
    reader.readAsDataURL(file);
  });
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const file = document.getElementById("inputFotoProduk").files[0];
    if (!editingProductId && !file?.type.startsWith("image/")) return Swal.fire("Foto tidak valid", "Pilih sebuah file gambar.", "warning");
    if (file && !file.type.startsWith("image/")) return Swal.fire("Foto tidak valid", "Pilih sebuah file gambar.", "warning");
    if (file && file.size > MAX_IMAGE_SIZE) return Swal.fire("Foto terlalu besar", "Ukuran gambar maksimal 2 MB.", "warning");

    const simpanProduk = async (gambar = null) => {
      try {
        const payload = {
          nik: document.getElementById("nikPenjual").value.trim(),
          nama_produk: document.getElementById("namaProduk").value.trim(), harga: Number(document.getElementById("hargaProduk").value),
          nama_penjual: document.getElementById("namaPenjual").value.trim(), kontak_penjual: document.getElementById("noHpPenjual").value.trim(),
          deskripsi: document.getElementById("alamatPenjual").value.trim(),
          ...(gambar ? { gambar } : {}),
        };
        const sedangEdit = Boolean(editingProductId);
        const path = sedangEdit ? `/admin/produk/${editingProductId}` : "/publik/produk";
        await request(path, { method: sedangEdit ? "PUT" : "POST", body: JSON.stringify(payload) });
        form.reset(); showForm(false); await load();
        Swal.fire("Berhasil", sedangEdit ? "Data produk berhasil diperbarui." : "Produk ditambahkan dengan status menunggu.", "success");
      } catch (error) { Swal.fire("Gagal", error.message, "error"); }
    };

    if (!file) return simpanProduk();
    const reader = new FileReader();
    reader.onload = () => simpanProduk(reader.result);
    reader.readAsDataURL(file);
  });
  tbody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const item = products.find((product) => String(product.id) === button.closest("tr").dataset.id);
    if (!item) return;
    if (button.dataset.action === "view") {
      return Swal.fire({ title: escapeHTML(item.nama_produk), imageUrl: item.gambar, imageHeight: 220,
        html: `<div class="text-left"><b>NIK:</b> ${escapeHTML(item.nik || "-")}<br><b>Penjual:</b> ${escapeHTML(item.nama_penjual)}<br><b>Kontak:</b> ${escapeHTML(item.kontak_penjual)}<br><b>Harga:</b> ${rupiah(item.harga)}<br><b>Deskripsi:</b> ${escapeHTML(item.deskripsi || "-")}</div>` });
    }
    if (button.dataset.action === "edit") {
      showForm(true, item);
      return;
    }
    if (button.dataset.action === "status") {
      const answer = await Swal.fire({ title: "Ubah status produk", input: "select", inputOptions: { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" }, inputValue: item.status, showCancelButton: true, confirmButtonText: "Simpan" });
      if (!answer.isConfirmed) return;
      try { await request(`/admin/produk/${item.id}/status`, { method: "PUT", body: JSON.stringify({ status: answer.value }) }); await load(); Swal.fire("Tersimpan", "Status produk diperbarui.", "success"); }
      catch (error) { Swal.fire("Gagal", error.message, "error"); }
    }
    if (button.dataset.action === "delete") {
      const answer = await Swal.fire({ title: "Hapus produk?", text: "Data akan dihapus permanen.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Ya, hapus" });
      if (!answer.isConfirmed) return;
      try { await request(`/admin/produk/${item.id}`, { method: "DELETE" }); await load(); Swal.fire("Terhapus", "Produk berhasil dihapus.", "success"); }
      catch (error) { Swal.fire("Gagal", error.message, "error"); }
    }
  });
  load();
});
