// ================= SIDEBAR =================
// Logika burger, buka/tutup sidebar, dan sub-menu
// ditangani oleh DashboardAdmin.js

// ==================================================
// 1. KONFIGURASI API
// ==================================================
const API_URL = "http://localhost:3000/api/publikasi";

function getAdminToken() {
  return localStorage.getItem("token");
}

// ==================================================
// 2. ELEMENT TABLE
// ==================================================
const publikasiTableBody = document.getElementById("publikasiTableBody");
const searchInput = document.getElementById("searchInput");
const entriesSelect = document.getElementById("entriesSelect");
const tableInfo = document.getElementById("tableInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// ==================================================
// 3. DATA TABLE
// ==================================================
let publikasiData = [];
let currentPage = 1;
let rowsPerPage = parseInt(entriesSelect.value);

// ==================================================
// 4. GET DATA PUBLIKASI
// ==================================================
async function loadPublikasi() {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengambil data publikasi");
    }

    publikasiData = result.data || [];
    currentPage = 1;

    renderTable();
  } catch (error) {
    console.error("Error load publikasi:", error);

    publikasiTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-6 border text-center text-red-500">
          Gagal mengambil data publikasi
        </td>
      </tr>
    `;

    tableInfo.innerText = "Showing 0 to 0 of 0 entries";

    Swal.fire({
      icon: "error",
      title: "Gagal mengambil data",
      text: error.message,
    });
  }
}

// ==================================================
// 5. RENDER TABLE
// ==================================================
function renderTable() {
  const keyword = searchInput.value.trim().toLowerCase();

  const filteredData = publikasiData.filter((item) => {
    const judul = item.judul ? String(item.judul).toLowerCase() : "";
    const deskripsi = item.deskripsi
      ? String(item.deskripsi).toLowerCase()
      : "";
    const tanggal = item.waktu_kegiatan
      ? String(item.waktu_kegiatan).toLowerCase()
      : "";

    return (
      judul.includes(keyword) ||
      deskripsi.includes(keyword) ||
      tanggal.includes(keyword)
    );
  });

  const total = filteredData.length;

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  const pageData = filteredData.slice(start, end);

  publikasiTableBody.innerHTML = "";

  // ================= DATA KOSONG =================
  if (pageData.length === 0) {
    publikasiTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-6 border text-center text-gray-500">
          ${keyword ? "Data tidak ditemukan" : "Belum ada data publikasi"}
        </td>
      </tr>
    `;
  } else {
    // ================= ISI TABLE =================
    pageData.forEach((item, index) => {
      const row = document.createElement("tr");

      row.className =
        "hover:bg-blue-50 hover:scale-[1.01] transition-all duration-200 cursor-pointer fade-up";
      row.style.animationDelay = `${index * 0.1}s`;

      const nomor = start + index + 1;

      row.innerHTML = `
        <td class="px-4 py-3 border text-center">
          ${nomor}
        </td>

        <td class="px-4 py-3 border text-center">
          ${item.judul || "-"}
        </td>

        <td class="px-4 py-3 border text-center">
          ${potongText(item.deskripsi, 60)}
        </td>

        <td class="px-4 py-3 border text-center">
          ${formatTanggal(item.waktu_kegiatan)}
        </td>

        <td class="px-4 py-3 border text-center">
          <div class="inline-flex gap-1 rounded-lg">

            <!-- VIEW -->
            <button
              class="btnView bg-purple-500 hover:bg-purple-600 hover:shadow-lg active:scale-90 transition-all duration-150 text-white p-2 rounded"
              data-id="${item.id}"
              title="Lihat"
            >
              <span class="material-symbols-outlined text-sm">
                visibility
              </span>
            </button>

            <!-- EDIT -->
            <button
              class="btnEdit bg-green-500 hover:bg-green-600 hover:shadow-lg active:scale-90 transition-all duration-150 text-white p-2 rounded"
              data-id="${item.id}"
              title="Edit"
            >
              <span class="material-symbols-outlined text-sm">
                edit_document
              </span>
            </button>

            <!-- DELETE -->
            <button
              class="btnDelete bg-red-500 hover:bg-red-600 hover:shadow-lg active:scale-90 transition-all duration-150 text-white p-2 rounded"
              data-id="${item.id}"
              title="Hapus"
            >
              <span class="material-symbols-outlined text-sm">
                delete
              </span>
            </button>

          </div>
        </td>
      `;

      publikasiTableBody.appendChild(row);
    });
  }

  // ================= TABLE INFO =================
  if (total === 0) {
    tableInfo.innerText = "Showing 0 to 0 of 0 entries";
  } else {
    tableInfo.innerText = `Showing ${start + 1} to ${Math.min(end, total)} of ${total} entries`;
  }

  // ================= PAGINATION =================
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = end >= total;

  // Pasang kembali event tombol setelah tabel dibuat ulang
  pasangEventAction();
}

// ==================================================
// 6. POTONG TEXT
// ==================================================
function potongText(text, maxLength) {
  if (!text) {
    return "-";
  }

  const hasil = String(text);

  if (hasil.length <= maxLength) {
    return hasil;
  }

  return hasil.substring(0, maxLength) + "...";
}

// ==================================================
// 7. FORMAT TANGGAL
// ==================================================
function formatTanggal(tanggal) {
  if (!tanggal) {
    return "-";
  }

  return String(tanggal).split("T")[0];
}

// ==================================================
// 8. SEARCH
// ==================================================
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});

// ==================================================
// 9. SHOW ENTRIES
// ==================================================
entriesSelect.addEventListener("change", () => {
  rowsPerPage = parseInt(entriesSelect.value);
  currentPage = 1;

  renderTable();
});

// ==================================================
// 10. PREVIOUS
// ==================================================
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

// ==================================================
// 11. NEXT
// ==================================================
nextBtn.addEventListener("click", () => {
  const keyword = searchInput.value.trim().toLowerCase();

  const filteredData = publikasiData.filter((item) => {
    const judul = item.judul ? String(item.judul).toLowerCase() : "";
    const deskripsi = item.deskripsi
      ? String(item.deskripsi).toLowerCase()
      : "";
    const tanggal = item.waktu_kegiatan
      ? String(item.waktu_kegiatan).toLowerCase()
      : "";

    return (
      judul.includes(keyword) ||
      deskripsi.includes(keyword) ||
      tanggal.includes(keyword)
    );
  });

  if (currentPage * rowsPerPage < filteredData.length) {
    currentPage++;
    renderTable();
  }
});

// ==================================================
// 12. FLATPICKR
// ==================================================
if (document.getElementById("tanggalTambah")) {
  flatpickr("#tanggalTambah", {
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d F Y",
  });
}

if (document.getElementById("tanggalEdit")) {
  flatpickr("#tanggalEdit", {
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d F Y",
  });
}

// ==================================================
// 13. MODAL FUNCTION
// ==================================================
function openModal(modal, box) {
  modal.classList.remove("hidden");

  modal.classList.add("opacity-0");
  box.classList.add("scale-90", "opacity-0");

  requestAnimationFrame(() => {
    modal.classList.remove("opacity-0");

    box.classList.remove("scale-90", "opacity-0");
    box.classList.add("scale-100", "opacity-100");
  });
}

function closeModalFunc(modal, box) {
  modal.classList.add("opacity-0");

  box.classList.remove("scale-100", "opacity-100");
  box.classList.add("scale-90", "opacity-0");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

// ==================================================
// 14. MODAL TAMBAH
// ==================================================
const modalTambah = document.getElementById("modalTambah");
const modalTambahBox = document.getElementById("modalTambahBox");

document.getElementById("btnTambah").onclick = () => {
  openModal(modalTambah, modalTambahBox);
};

document.getElementById("closeTambah").onclick = () => {
  closeModalFunc(modalTambah, modalTambahBox);
};

document.getElementById("btnCloseTambah").onclick = () => {
  closeModalFunc(modalTambah, modalTambahBox);
};

// ==================================================
// 15. MODAL VIEW
// ==================================================
const modalView = document.getElementById("modalView");
const modalBox = document.getElementById("modalBox");

const viewJudul = document.getElementById("viewJudul");
const viewIsi = document.getElementById("viewIsi");
const viewTanggal = document.getElementById("viewTanggal");
const viewGambar = document.getElementById("viewGambar");

document.getElementById("closeModal").onclick = () => {
  closeModalFunc(modalView, modalBox);
};

document.getElementById("btnClose2").onclick = () => {
  closeModalFunc(modalView, modalBox);
};

// ==================================================
// 16. MODAL EDIT
// ==================================================
const modalEdit = document.getElementById("modalEdit");
const modalEditBox = document.getElementById("modalEditBox");

const judulEdit = document.getElementById("judulEdit");
const isiEdit = document.getElementById("isiEdit");
const tanggalEdit = document.getElementById("tanggalEdit");
const gambarEdit = document.getElementById("gambarEdit");
const previewGambarEdit = document.getElementById("previewGambarEdit");

let idPublikasiEdit = null;

document.getElementById("closeEdit").onclick = () => {
  closeModalFunc(modalEdit, modalEditBox);
};

document.getElementById("btnCloseEdit").onclick = () => {
  closeModalFunc(modalEdit, modalEditBox);
};

// ==================================================
// PREVIEW GAMBAR EDIT
// ==================================================
gambarEdit.addEventListener("change", () => {
  const file = gambarEdit.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    previewGambarEdit.src = event.target.result;
    previewGambarEdit.classList.remove("hidden");
  };

  reader.readAsDataURL(file);
});

// ==================================================
// 17. EVENT ACTION TABLE
// ==================================================
function pasangEventAction() {
  // ================= VIEW =================
  document.querySelectorAll(".btnView").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;

      const item = publikasiData.find((data) => {
        return String(data.id) === String(id);
      });

      if (!item) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan",
          text: "Data publikasi yang dipilih tidak ditemukan.",
        });

        return;
      }

      // Masukkan data dari database ke modal View
      viewJudul.textContent = item.judul || "-";
      viewIsi.textContent = item.deskripsi || "-";
      viewTanggal.textContent = formatTanggal(item.waktu_kegiatan);

      // Tampilkan gambar
      if (item.gambar_url) {
        viewGambar.src = item.gambar_url;
        viewGambar.alt = item.judul || "Gambar kegiatan";
        viewGambar.classList.remove("hidden");
      } else {
        viewGambar.src = "";
        viewGambar.classList.add("hidden");
      }

      openModal(modalView, modalBox);
    };
  });

  // ================= EDIT =================
  document.querySelectorAll(".btnEdit").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;

      const item = publikasiData.find((data) => {
        return String(data.id) === String(id);
      });

      if (!item) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan",
          text: "Data publikasi yang dipilih tidak ditemukan.",
        });

        return;
      }

      // Simpan ID data yang sedang diedit
      idPublikasiEdit = item.id;

      // Isi form dengan data lama
      judulEdit.value = item.judul || "";
      isiEdit.value = item.deskripsi || "";
      tanggalEdit.value = formatTanggal(item.waktu_kegiatan);

      // Kosongkan input file
      gambarEdit.value = "";

      // Tampilkan gambar lama
      if (item.gambar_url) {
        previewGambarEdit.src = item.gambar_url;
        previewGambarEdit.classList.remove("hidden");
      } else {
        previewGambarEdit.src = "";
        previewGambarEdit.classList.add("hidden");
      }

      openModal(modalEdit, modalEditBox);
    };
  });

  // ================= DELETE =================
  document.querySelectorAll(".btnDelete").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.id;

      const item = publikasiData.find((data) => {
        return String(data.id) === String(id);
      });

      if (!item) {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: "Data publikasi yang dipilih tidak ditemukan.",
        });

        return;
      }

      // ================= TOKEN =================
      const token = getAdminToken();

      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Token Admin Tidak Ditemukan",
          text: "Silakan login sebagai admin terlebih dahulu.",
        });

        return;
      }

      // ================= KONFIRMASI =================
      const konfirmasi = await Swal.fire({
        title: "Yakin Hapus?",
        html: `
        <div style="text-align:center;">
          <p>Publikasi berikut akan dihapus:</p>

          <p style="margin-top:10px;">
            <b>${item.judul}</b>
          </p>

          <p style="margin-top:10px; color:#dc2626;">
            Data yang sudah dihapus tidak dapat dikembalikan.
          </p>
        </div>
      `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
      });

      if (!konfirmasi.isConfirmed) {
        return;
      }

      try {
        // ================= LOADING =================
        Swal.fire({
          title: "Menghapus...",
          text: "Publikasi sedang dihapus.",
          allowOutsideClick: false,
          showConfirmButton: false,

          didOpen: () => {
            Swal.showLoading();
          },
        });

        // ================= DELETE API =================
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal menghapus publikasi.");
        }

        // ================= BERHASIL =================
        await Swal.fire({
          title: "Berhasil 🎉",
          text: "Publikasi berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // ================= REFRESH TABEL =================
        await loadPublikasi();
      } catch (error) {
        console.error("Error delete publikasi:", error);

        Swal.fire({
          icon: "error",
          title: "Gagal Menghapus",
          text: error.message,
        });
      }
    };
  });
}

// ==================================================
// 18. OUTSIDE CLICK
// ==================================================
function enableOutsideClick(modal, box) {
  modal.addEventListener("click", (e) => {
    if (!box.contains(e.target)) {
      closeModalFunc(modal, box);
    }
  });
}

enableOutsideClick(modalTambah, modalTambahBox);
enableOutsideClick(modalView, modalBox);
enableOutsideClick(modalEdit, modalEditBox);

// ==================================================
// 19. SIMPAN TAMBAH
// ==================================================
document.getElementById("btnSimpanTambah").onclick = async () => {
  const judul = document.getElementById("judulTambah").value.trim();
  const isi = document.getElementById("isiTambah").value.trim();
  const tanggal = document.getElementById("tanggalTambah").value;
  const gambar = document.getElementById("gambarTambah").files[0];

  const kosong = [];

  if (!judul) {
    kosong.push("Judul");
  }

  if (!isi) {
    kosong.push("Isi Kegiatan");
  }

  if (!tanggal) {
    kosong.push("Tanggal");
  }

  if (!gambar) {
    kosong.push("Gambar");
  }

  if (kosong.length > 0) {
    Swal.fire({
      title: "Form Belum Lengkap ⚠️",
      html: `
        <div style="text-align:center;">
          <p>Data berikut masih kosong:</p>
          <ul style="list-style-position: inside;">
            ${kosong.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      `,
      icon: "warning",
      confirmButtonColor: "#f59e0b",
      background: "#fffbeb",
      color: "#92400e",
    });

    return;
  }

  const token = getAdminToken();

  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Token Admin Tidak Ditemukan",
      text: "Silakan login sebagai admin terlebih dahulu.",
    });

    return;
  }

  const konfirmasi = await Swal.fire({
    title: "Konfirmasi Data",
    html: `
      <div style="text-align:left;">
        <p><b>Judul:</b> ${judul}</p>
        <p><b>Isi:</b> ${isi}</p>
        <p><b>Tanggal:</b> ${tanggal}</p>
        <p><b>Gambar:</b> ${gambar.name}</p>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, simpan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
  });

  if (!konfirmasi.isConfirmed) {
    return;
  }

  try {
    Swal.fire({
      title: "Menyimpan...",
      text: "Mohon tunggu",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // ================= FORM DATA (kirim file gambar asli, bukan URL placeholder) =================
    const formData = new FormData();
    formData.append("judul", judul);
    formData.append("deskripsi", isi);
    formData.append("waktu_kegiatan", tanggal);
    formData.append("gambar", gambar);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal menambahkan publikasi");
    }

    Swal.fire({
      title: "Berhasil 🎉",
      text: "Publikasi berhasil ditambahkan.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });

    document.getElementById("judulTambah").value = "";
    document.getElementById("isiTambah").value = "";
    document.getElementById("tanggalTambah").value = "";
    document.getElementById("gambarTambah").value = "";

    setTimeout(() => {
      closeModalFunc(modalTambah, modalTambahBox);
      loadPublikasi();
    }, 1500);
  } catch (error) {
    console.error("Error tambah publikasi:", error);

    Swal.fire({
      icon: "error",
      title: "Gagal Menyimpan",
      text: error.message,
    });
  }
};

// ==================================================
// 20. SIMPAN EDIT
// ==================================================
document.getElementById("btnSimpanEdit").onclick = async () => {
  const judul = judulEdit.value.trim();
  const isi = isiEdit.value.trim();
  const tanggal = tanggalEdit.value;
  const gambar = gambarEdit.files[0];

  // ================= VALIDASI ID =================
  if (!idPublikasiEdit) {
    Swal.fire({
      icon: "error",
      title: "Data tidak ditemukan",
      text: "ID publikasi yang akan diedit tidak ditemukan.",
    });

    return;
  }

  // ================= VALIDASI FORM =================
  const kosong = [];

  if (!judul) {
    kosong.push("Judul");
  }

  if (!isi) {
    kosong.push("Isi Kegiatan");
  }

  if (!tanggal) {
    kosong.push("Tanggal");
  }

  if (kosong.length > 0) {
    Swal.fire({
      title: "Form Belum Lengkap ⚠️",
      html: `
        <div style="text-align:center;">
          <p>Data berikut masih kosong:</p>

          <ul style="list-style-position: inside;">
            ${kosong.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      `,
      icon: "warning",
    });

    return;
  }

  // ================= VALIDASI GAMBAR BARU =================
  if (gambar) {
    const maksimalUkuran = 2 * 1024 * 1024;

    const tipeGambar = ["image/jpeg", "image/png"];

    if (gambar.size > maksimalUkuran) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran Gambar Terlalu Besar",
        text: "Ukuran gambar maksimal 2MB.",
      });

      return;
    }

    if (!tipeGambar.includes(gambar.type)) {
      Swal.fire({
        icon: "warning",
        title: "Format Gambar Tidak Valid",
        text: "Gunakan gambar JPG, JPEG, atau PNG.",
      });

      return;
    }
  }

  // ================= TOKEN =================
  const token = getAdminToken();

  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Token Admin Tidak Ditemukan",
      text: "Silakan login sebagai admin terlebih dahulu.",
    });

    return;
  }

  // ================= KONFIRMASI =================
  const konfirmasi = await Swal.fire({
    title: "Konfirmasi Perubahan",
    html: `
      <div style="text-align:left;">
        <p><b>Judul:</b> ${judul}</p>
        <p><b>Isi:</b> ${isi}</p>
        <p><b>Tanggal:</b> ${tanggal}</p>
        <p><b>Gambar:</b> ${gambar ? gambar.name : "Tetap menggunakan gambar lama"}</p>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, simpan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
  });

  if (!konfirmasi.isConfirmed) {
    return;
  }

  try {
    Swal.fire({
      title: "Menyimpan Perubahan...",
      text: "Data publikasi sedang diperbarui.",
      allowOutsideClick: false,
      showConfirmButton: false,

      didOpen: () => {
        Swal.showLoading();
      },
    });

    // ================= FORM DATA =================
    const formData = new FormData();

    formData.append("judul", judul);
    formData.append("deskripsi", isi);
    formData.append("waktu_kegiatan", tanggal);

    // Gambar tidak wajib saat edit
    if (gambar) {
      formData.append("gambar", gambar);
    }

    // ================= PUT =================
    const response = await fetch(`${API_URL}/${idPublikasiEdit}`, {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal memperbarui publikasi");
    }

    // ================= BERHASIL =================
    await Swal.fire({
      title: "Berhasil 🎉",
      text: "Publikasi berhasil diperbarui.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });

    // Tutup modal
    closeModalFunc(modalEdit, modalEditBox);

    // Reset ID
    idPublikasiEdit = null;

    // Refresh tabel
    await loadPublikasi();
  } catch (error) {
    console.error("Error edit publikasi:", error);

    Swal.fire({
      icon: "error",
      title: "Gagal Memperbarui",
      text: error.message,
    });
  }
};

// ==================================================
// 21. LOAD DATA SAAT HALAMAN DIBUKA
// ==================================================
loadPublikasi();
