const STATISTIK_API_URL = `${window.API_BASE_URL || "http://localhost:3000/api"}/statistik`;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const tbody = document.getElementById("statistikTableBody");
  const searchInput = document.getElementById("searchInput");
  const entriesSelect = document.getElementById("entriesSelect");
  const tableInfo = document.getElementById("tableInfo");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const modal = document.getElementById("modalEdit");
  const modalBox = document.getElementById("modalEditBox");
  const modalTambah = document.getElementById("modalTambah");
  const modalTambahBox = document.getElementById("modalTambahBox");
  let dataWarga = [];
  let currentPage = 1;
  let rowsPerPage = Number(entriesSelect.value);

  const escapeHTML = (value = "") => {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  };

  const request = async (path = "", options = {}) => {
    const response = await fetch(`${STATISTIK_API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || "Permintaan gagal diproses.");
    return body;
  };

  const filteredData = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    return dataWarga
      .filter((item) => [item.nik, item.nama_warga, item.jenis_kelamin, item.rt, item.rw].some((value) => String(value || "").toLowerCase().includes(keyword)))
      .sort((a, b) => {
        const rwDifference = (Number(a.rw) || 0) - (Number(b.rw) || 0);
        if (rwDifference !== 0) return rwDifference;

        const rtDifference = (Number(a.rt) || 0) - (Number(b.rt) || 0);
        if (rtDifference !== 0) return rtDifference;

        return String(a.nama_warga || "").localeCompare(
          String(b.nama_warga || ""),
          "id",
          { sensitivity: "base" },
        );
      });
  };

  const render = () => {
    const filtered = filteredData();
    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * rowsPerPage;
    const pageData = filtered.slice(start, start + rowsPerPage);
    tbody.innerHTML = pageData.length ? pageData.map((item, index) => `<tr data-id="${item.id}" class="hover:bg-blue-50 transition">
      <td class="px-4 py-3 border text-center">${start + index + 1}</td>
      <td class="px-4 py-3 border text-center">${escapeHTML(item.nik)}</td>
      <td class="px-4 py-3 border text-center font-semibold">${escapeHTML(item.nama_warga)}</td>
      <td class="px-4 py-3 border text-center">${escapeHTML(item.jenis_kelamin || "-")}</td>
      <td class="px-4 py-3 border text-center">${escapeHTML(item.rt)}</td>
      <td class="px-4 py-3 border text-center">${escapeHTML(item.rw)}</td>
      <td class="px-4 py-3 border text-center"><div class="inline-flex gap-1">
        <button data-action="edit" class="bg-green-500 hover:bg-green-600 text-white p-2 rounded" title="Edit"><span class="material-symbols-outlined text-sm">edit_document</span></button>
        <button data-action="delete" class="bg-red-500 hover:bg-red-600 text-white p-2 rounded" title="Hapus"><span class="material-symbols-outlined text-sm">delete</span></button>
      </div></td></tr>`).join("") : `<tr><td colspan="7" class="p-8 text-center text-gray-500">${searchInput.value ? "Data tidak ditemukan." : "Belum ada data statistik warga."}</td></tr>`;
    tableInfo.textContent = `Showing ${filtered.length ? start + 1 : 0} to ${Math.min(start + rowsPerPage, filtered.length)} of ${filtered.length} entries`;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
  };

  const load = async () => {
    if (!token) return window.location.href = "/admin/LoginAdmin.html";
    try { dataWarga = (await request()).data || []; render(); }
    catch (error) { tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-red-600">${escapeHTML(error.message)}</td></tr>`; }
  };

  const showModal = (open) => {
    if (open) {
      modal.classList.remove("hidden");
      requestAnimationFrame(() => { modal.classList.remove("opacity-0"); modalBox.classList.remove("scale-90", "opacity-0"); });
    } else {
      modal.classList.add("opacity-0"); modalBox.classList.add("scale-90", "opacity-0");
      setTimeout(() => modal.classList.add("hidden"), 300);
    }
  };

  const showModalTambah = (open) => {
    if (open) {
      modalTambah.classList.remove("hidden");
      requestAnimationFrame(() => { modalTambah.classList.remove("opacity-0"); modalTambahBox.classList.remove("scale-90", "opacity-0"); });
    } else {
      modalTambah.classList.add("opacity-0"); modalTambahBox.classList.add("scale-90", "opacity-0");
      setTimeout(() => modalTambah.classList.add("hidden"), 300);
    }
  };

  searchInput.addEventListener("input", () => { currentPage = 1; render(); });
  entriesSelect.addEventListener("change", () => { rowsPerPage = Number(entriesSelect.value); currentPage = 1; render(); });
  prevBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage -= 1; render(); } });
  nextBtn.addEventListener("click", () => { currentPage += 1; render(); });
  document.getElementById("btnCloseEdit").addEventListener("click", () => showModal(false));
  document.getElementById("btnBatalEdit").addEventListener("click", () => showModal(false));
  document.getElementById("btnTambahWarga").addEventListener("click", () => showModalTambah(true));
  document.getElementById("btnCloseTambah").addEventListener("click", () => showModalTambah(false));
  document.getElementById("btnBatalTambah").addEventListener("click", () => showModalTambah(false));

  tbody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const item = dataWarga.find((row) => String(row.id) === button.closest("tr").dataset.id);
    if (!item) return;
    if (button.dataset.action === "edit") {
      document.getElementById("editId").value = item.id;
      document.getElementById("editNik").value = item.nik;
      document.getElementById("editNama").value = item.nama_warga;
      document.getElementById("editJenisKelamin").value = item.jenis_kelamin || "";
      document.getElementById("editRt").value = item.rt;
      document.getElementById("editRw").value = item.rw;
      showModal(true);
    }
    if (button.dataset.action === "delete") {
      const answer = await Swal.fire({ title: "Hapus data warga?", text: `${item.nama_warga} akan dihapus permanen.`, icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Ya, hapus" });
      if (!answer.isConfirmed) return;
      try { await request(`/${item.id}`, { method: "DELETE" }); await load(); Swal.fire("Terhapus", "Data warga berhasil dihapus.", "success"); }
      catch (error) { Swal.fire("Gagal", error.message, "error"); }
    }
  });

  document.getElementById("formEdit").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = document.getElementById("editId").value;
    const body = { nik: document.getElementById("editNik").value.trim(), nama_warga: document.getElementById("editNama").value.trim(), jenis_kelamin: document.getElementById("editJenisKelamin").value, rt: document.getElementById("editRt").value.trim(), rw: document.getElementById("editRw").value.trim() };
    try { await request(`/${id}`, { method: "PUT", body: JSON.stringify(body) }); showModal(false); await load(); Swal.fire("Tersimpan", "Data warga berhasil diperbarui.", "success"); }
    catch (error) { Swal.fire("Gagal", error.message, "error"); }
  });

  document.getElementById("formTambah").addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = {
      nik: document.getElementById("tambahNik").value.trim(),
      nama_warga: document.getElementById("tambahNama").value.trim(),
      jenis_kelamin: document.getElementById("tambahJenisKelamin").value,
      rt: document.getElementById("tambahRt").value.trim(),
      rw: document.getElementById("tambahRw").value.trim(),
    };
    try {
      await request("", { method: "POST", body: JSON.stringify(body) });
      document.getElementById("formTambah").reset();
      showModalTambah(false);
      await load();
      Swal.fire("Berhasil", "Data warga berhasil ditambahkan.", "success");
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  });

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const toggleSidebar = () => { sidebar.classList.toggle("-translate-x-full"); overlay.classList.toggle("hidden"); };
  document.getElementById("burgerBtn").addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", toggleSidebar);

  const cmsToggle = document.getElementById("cmsToggle");
  const cmsMenu = document.getElementById("cmsMenu");
  const cmsIcon = document.getElementById("cmsIcon");
  cmsToggle.addEventListener("click", () => {
    const isOpen = cmsToggle.getAttribute("aria-expanded") === "true";
    cmsToggle.setAttribute("aria-expanded", String(!isOpen));
    cmsMenu.classList.toggle("max-h-96", !isOpen);
    cmsMenu.classList.toggle("opacity-100", !isOpen);
    cmsMenu.classList.toggle("max-h-0", isOpen);
    cmsMenu.classList.toggle("opacity-0", isOpen);
    cmsIcon.classList.toggle("rotate-180", !isOpen);
  });
  load();
});
