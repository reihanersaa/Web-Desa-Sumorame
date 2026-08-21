const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("table tbody");
  const form = document.getElementById("formProduk");
  const modal = document.getElementById("modalProduk");
  const modalBox = document.getElementById("modalProdukBox");
  const token = localStorage.getItem("token");
  let products = [];

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
      tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-500">Belum ada pengajuan produk.</td></tr>';
      return;
    }
    tbody.innerHTML = products.map((item, index) => `<tr data-id="${item.id}" class="hover:bg-blue-50">
      <td class="px-4 py-3 text-center border">${index + 1}</td><td class="px-4 py-3 text-center border">-</td>
      <td class="px-4 py-3 font-semibold text-center border">${escapeHTML(item.nama_penjual)}</td>
      <td class="px-4 py-3 font-semibold text-center border">${escapeHTML(item.nama_produk)}</td>
      <td class="px-4 py-3 text-green-600 font-bold text-center border">${rupiah(item.harga)}</td>
      <td class="px-4 py-3 text-center border">${badge(item.status)}</td>
      <td class="px-4 py-3 text-center border"><div class="inline-flex gap-1">
        <button data-action="view" class="bg-purple-500 text-white p-1.5 rounded" title="Detail"><span class="material-symbols-outlined text-sm">visibility</span></button>
        <button data-action="status" class="bg-green-500 text-white p-1.5 rounded" title="Ubah Status"><span class="material-symbols-outlined text-sm">edit_document</span></button>
        <button data-action="delete" class="bg-red-500 text-white p-1.5 rounded" title="Hapus"><span class="material-symbols-outlined text-sm">delete</span></button>
      </div></td></tr>`).join("");
  };
  const load = async () => {
    if (!token) {
      tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-yellow-700">Sesi admin tidak ditemukan. Mengarahkan ke halaman login...</td></tr>';
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
      tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-red-600">${escapeHTML(error.message)}</td></tr>`;
    }
  };
  const showForm = (open) => {
    if (open) {
      modal.classList.remove("hidden");
      requestAnimationFrame(() => { modal.classList.remove("opacity-0"); modalBox.classList.remove("scale-90", "opacity-0"); });
    } else {
      modal.classList.add("opacity-0"); modalBox.classList.add("scale-90", "opacity-0");
      setTimeout(() => modal.classList.add("hidden"), 300);
    }
  };

  document.getElementById("btnTambahProduk")?.addEventListener("click", () => showForm(true));
  document.getElementById("btnCloseModal")?.addEventListener("click", () => showForm(false));
  document.getElementById("btnBatal")?.addEventListener("click", () => showForm(false));
  document.getElementById("inputFotoProduk")?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const preview = document.getElementById("previewFotoProduk"); preview.src = reader.result; preview.classList.remove("hidden"); };
    reader.readAsDataURL(file);
  });
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const file = document.getElementById("inputFotoProduk").files[0];
    if (!file?.type.startsWith("image/")) return Swal.fire("Foto tidak valid", "Pilih sebuah file gambar.", "warning");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await request("/publik/produk", { method: "POST", body: JSON.stringify({
          nama_produk: document.getElementById("namaProduk").value.trim(), harga: Number(document.getElementById("hargaProduk").value),
          nama_penjual: document.getElementById("namaPenjual").value.trim(), kontak_penjual: document.getElementById("noHpPenjual").value.trim(),
          deskripsi: document.getElementById("alamatPenjual").value.trim(), gambar: reader.result,
        }) });
        form.reset(); showForm(false); await load(); Swal.fire("Berhasil", "Produk ditambahkan dengan status menunggu.", "success");
      } catch (error) { Swal.fire("Gagal", error.message, "error"); }
    };
    reader.readAsDataURL(file);
  });
  tbody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const item = products.find((product) => String(product.id) === button.closest("tr").dataset.id);
    if (!item) return;
    if (button.dataset.action === "view") {
      return Swal.fire({ title: escapeHTML(item.nama_produk), imageUrl: item.gambar, imageHeight: 220,
        html: `<div class="text-left"><b>Penjual:</b> ${escapeHTML(item.nama_penjual)}<br><b>Kontak:</b> ${escapeHTML(item.kontak_penjual)}<br><b>Harga:</b> ${rupiah(item.harga)}<br><b>Deskripsi:</b> ${escapeHTML(item.deskripsi || "-")}</div>` });
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
