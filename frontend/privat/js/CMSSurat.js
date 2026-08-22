/* ===================================================
   CMSSurat.js — LOGIC ASLI UNTUK CMS PERSURATAN
   (Menggantikan SKD.js / SKK.js / SKT.js / SKTM.js /
   SuratMenyurat.js yang lama — semua masih dummy/statis)
=================================================== */

// File ini SAMA PERSIS untuk ke-5 halaman, JANGAN diedit per halaman.
// Konfigurasi jenis surat diambil dari window.JENIS_SURAT, yang di-set
// lewat 1 baris <script> kecil di masing-masing file HTML (lihat di bawah).
const JENIS_SURAT = window.JENIS_SURAT || "all";

const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const tbody = document.querySelector("table tbody");
  const searchInput = document.getElementById("searchInput");
  const entriesSelect = document.getElementById("entriesSelect");
  const tableInfo = document.getElementById("tableInfo");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const modalView = document.getElementById("modalView");
  const modalBox = document.getElementById("modalBox");
  const modalBody = document.getElementById("modalBody");

  function bukaModalView() {
    modalView.classList.remove("hidden");
    modalView.classList.add("opacity-0");
    modalBox.classList.add("scale-90", "opacity-0");
    requestAnimationFrame(() => {
      modalView.classList.remove("opacity-0");
      modalBox.classList.remove("scale-90", "opacity-0");
      modalBox.classList.add("scale-100", "opacity-100");
    });
  }
  function tutupModalView() {
    modalView.classList.add("opacity-0");
    modalBox.classList.remove("scale-100", "opacity-100");
    modalBox.classList.add("scale-90", "opacity-0");
    setTimeout(() => modalView.classList.add("hidden"), 300);
  }
  document
    .getElementById("closeModal")
    ?.addEventListener("click", tutupModalView);
  document
    .getElementById("btnCloseView")
    ?.addEventListener("click", tutupModalView);
  modalView.addEventListener("click", (e) => {
    if (e.target === modalView) tutupModalView();
  });

  const modalEdit = document.getElementById("modalEdit");
  const modalEditBox = document.getElementById("modalEditBox");
  const statusSurat = document.getElementById("statusSurat");
  const btnSimpanStatus = document.getElementById("btnSimpanStatus");

  function bukaModalEdit() {
    modalEdit.classList.remove("hidden");
    modalEdit.classList.add("opacity-0");
    modalEditBox.classList.add("scale-90", "opacity-0");
    requestAnimationFrame(() => {
      modalEdit.classList.remove("opacity-0");
      modalEditBox.classList.remove("scale-90", "opacity-0");
      modalEditBox.classList.add("scale-100", "opacity-100");
    });
  }
  function tutupModalEdit() {
    modalEdit.classList.add("opacity-0");
    modalEditBox.classList.remove("scale-100", "opacity-100");
    modalEditBox.classList.add("scale-90", "opacity-0");
    setTimeout(() => modalEdit.classList.add("hidden"), 300);
  }
  document
    .getElementById("closeEdit")
    ?.addEventListener("click", tutupModalEdit);
  document
    .getElementById("btnBatalEdit")
    ?.addEventListener("click", tutupModalEdit);
  modalEdit.addEventListener("click", (e) => {
    if (e.target === modalEdit) tutupModalEdit();
  });

  const escapeHTML = (value = "") => {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  };

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
    if (!response.ok)
      throw new Error(body.message || "Permintaan gagal diproses.");
    return body;
  };

  const badgeStatus = (status) => {
    const style = {
      draft: "bg-yellow-100 text-yellow-700",
      diproses: "bg-blue-100 text-blue-700",
      disetujui: "bg-green-100 text-green-700",
      ditolak: "bg-red-100 text-red-700",
    };
    const label = {
      draft: "Menunggu",
      diproses: "Sedang Diproses",
      disetujui: "Selesai (Siap Diambil)",
      ditolak: "Ditolak",
    };
    return `<span class="${style[status] || style.draft} px-2 py-1 rounded-full text-xs font-bold">${label[status] || status}</span>`;
  };

  const namaPemohon = (item) =>
    item.data_form?.nama || item.data_form?.kepala || "-";
  const nikPemohon = (item) => item.data_form?.nik || "-";

  let allSurat = [];
  let currentPage = 1;
  let rowsPerPage = parseInt(entriesSelect.value, 10);
  let selectedItem = null;

  function renderTable() {
    const keyword = (searchInput.value || "").toLowerCase();
    const filtered = allSurat.filter(
      (item) =>
        namaPemohon(item).toLowerCase().includes(keyword) ||
        nikPemohon(item).toLowerCase().includes(keyword),
    );

    const total = filtered.length;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageItems = filtered.slice(start, end);

    if (!pageItems.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Belum ada data.</td></tr>`;
    } else {
      tbody.innerHTML = pageItems
        .map(
          (item, i) => `
        <tr class="hover:bg-blue-50 transition-colors border-b" data-id="${item.id}">
          <td class="px-4 py-3 text-center border-r">${start + i + 1}</td>
          <td class="px-4 py-3 font-medium border-r">${escapeHTML(nikPemohon(item))}</td>
          <td class="px-4 py-3 font-semibold text-gray-800 border-r">${escapeHTML(namaPemohon(item))}</td>
          <td class="px-4 py-3 text-center border-r">${new Date(item.created_at).toLocaleDateString("id-ID")}</td>
          <td class="px-4 py-3 text-center border-r">${badgeStatus(item.status)}</td>
          <td class="px-4 py-3 text-center">
            <div class="inline-flex gap-1">
              <button class="btnView bg-purple-500 hover:bg-purple-600 text-white p-1.5 rounded transition shadow-sm" title="Lihat Detail">
                <span class="material-symbols-outlined text-sm">visibility</span>
              </button>
              <button class="btnEdit bg-green-500 hover:bg-green-600 text-white p-1.5 rounded transition shadow-sm" title="Proses Surat">
                <span class="material-symbols-outlined text-sm">edit_document</span>
              </button>
              <button class="btnDelete bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition shadow-sm" title="Hapus">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </td>
        </tr>`,
        )
        .join("");
    }

    tableInfo.innerText = `Showing ${total === 0 ? 0 : start + 1} to ${Math.min(end, total)} of ${total} entries`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = end >= total;
  }

  async function load() {
    if (!token) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-yellow-700">Sesi admin tidak ditemukan. Silakan login ulang.</td></tr>`;
      window.location.href = "LoginAdmin.html";
      return;
    }
    try {
      const all = (await request("/surat/admin")).data || [];
      allSurat =
        JENIS_SURAT === "all"
          ? all
          : all.filter((item) => item.jenis_surat === JENIS_SURAT);
      renderTable();
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-600">${escapeHTML(error.message)}</td></tr>`;
    }
  }

  tbody.addEventListener("click", (event) => {
    const tr = event.target.closest("tr[data-id]");
    if (!tr) return;
    const item = allSurat.find((s) => String(s.id) === tr.dataset.id);
    if (!item) return;

    if (event.target.closest(".btnView")) {
      if (modalBody) {
        const rows = Object.entries(item.data_form || {})
          .map(
            ([key, val]) => `
            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">${escapeHTML(key)}</p>
              <p class="font-semibold text-gray-800">${escapeHTML(String(val))}</p>
            </div>`,
          )
          .join("");
        modalBody.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${rows}</div>`;
      }
      bukaModalView();
    }

    if (event.target.closest(".btnEdit")) {
      selectedItem = item;
      if (statusSurat) statusSurat.value = mapStatusKeToOption(item.status);
      bukaModalEdit();
    }

    if (event.target.closest(".btnDelete")) {
      Swal.fire({
        title: "Yakin ingin menghapus?",
        text: "Data permohonan ini akan dihapus permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Hapus!",
      }).then(async (result) => {
        if (!result.isConfirmed) return;
        try {
          await request(`/surat/admin/${item.id}`, { method: "DELETE" });
          await load();
          Swal.fire(
            "Terhapus!",
            "Data berhasil dihapus dari sistem.",
            "success",
          );
        } catch (error) {
          Swal.fire("Gagal", error.message, "error");
        }
      });
    }
  });

  function mapStatusKeToOption(status) {
    const map = {
      draft: "Menunggu",
      diproses: "Sedang Diproses",
      disetujui: "Selesai",
      ditolak: "Ditolak",
    };
    return map[status] || "Menunggu";
  }
  function mapOptionToStatusKe(optionValue) {
    const map = {
      Menunggu: "draft",
      "Sedang Diproses": "diproses",
      Selesai: "disetujui",
      Ditolak: "ditolak",
    };
    return map[optionValue] || "draft";
  }

  btnSimpanStatus?.addEventListener("click", () => {
    if (!selectedItem) return;
    const statusBaru = mapOptionToStatusKe(statusSurat.value);

    Swal.fire({
      title: "Konfirmasi Proses",
      text: `Ubah status permohonan menjadi "${statusSurat.value}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Simpan!",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await request(`/surat/admin/${selectedItem.id}/status`, {
          method: "PUT",
          body: JSON.stringify({ status: statusBaru }),
        });
        await load();
        Swal.fire("Tersimpan!", "Status surat berhasil diperbarui.", "success");
        tutupModalEdit();
      } catch (error) {
        Swal.fire("Gagal", error.message, "error");
      }
    });
  });

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });
  entriesSelect.addEventListener("change", () => {
    rowsPerPage = parseInt(entriesSelect.value, 10);
    currentPage = 1;
    renderTable();
  });
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });
  nextBtn.addEventListener("click", () => {
    const keyword = (searchInput.value || "").toLowerCase();
    const total = allSurat.filter((item) =>
      namaPemohon(item).toLowerCase().includes(keyword),
    ).length;
    if (currentPage * rowsPerPage < total) {
      currentPage++;
      renderTable();
    }
  });

  load();
});
