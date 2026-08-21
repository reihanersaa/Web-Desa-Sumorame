// ==================================================
// 1. KONFIGURASI API
// ==================================================
const API_URL = "http://localhost:3000/api/kelembagaan";

function getAdminToken() {
  return localStorage.getItem("token");
}


// ==================================================
// 2. ELEMENT TABLE
// ==================================================
const kelembagaanTableBody = document.getElementById("kelembagaanTableBody");
const searchInput = document.getElementById("searchInput");
const entriesSelect = document.getElementById("entriesSelect");
const tableInfo = document.getElementById("tableInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");


// ==================================================
// 3. DATA
// ==================================================
let kelembagaanData = [];
let currentPage = 1;
let rowsPerPage = parseInt(entriesSelect.value);


// ==================================================
// 4. GET DATA KELEMBAGAAN
// ==================================================
async function loadKelembagaan() {
  try {
    const response = await fetch(API_URL);

    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response backend bukan JSON.");
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Gagal mengambil data kelembagaan."
      );
    }

    kelembagaanData = result.data || [];

    currentPage = 1;

    renderTable();

  } catch (error) {
    console.error("Error load kelembagaan:", error);

    kelembagaanTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-6 border text-center text-red-500">
          Gagal mengambil data kelembagaan
        </td>
      </tr>
    `;

    tableInfo.innerText = "Showing 0 to 0 of 0 entries";

    Swal.fire({
      icon: "error",
      title: "Gagal Mengambil Data",
      text: error.message
    });
  }
}


// ==================================================
// 5. POTONG TEXT
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
// 6. FILTER DATA
// ==================================================
function getFilteredData() {
  const keyword = searchInput.value.trim().toLowerCase();

  return kelembagaanData.filter(item => {
    const nama = String(item.nama || "").toLowerCase();
    const pengertian = String(item.pengertian || "").toLowerCase();
    const tugas = String(item.tugas || "").toLowerCase();
    const tujuan = String(item.tujuan || "").toLowerCase();

    return (
      nama.includes(keyword) ||
      pengertian.includes(keyword) ||
      tugas.includes(keyword) ||
      tujuan.includes(keyword)
    );
  });
}


// ==================================================
// 7. RENDER TABLE
// ==================================================
function renderTable() {
  const filteredData = getFilteredData();

  const total = filteredData.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / rowsPerPage)
  );

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  const pageData = filteredData.slice(start, end);

  kelembagaanTableBody.innerHTML = "";

  if (pageData.length === 0) {
    kelembagaanTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-6 border text-center text-gray-500">
          ${
            searchInput.value.trim()
              ? "Data tidak ditemukan"
              : "Belum ada data kelembagaan"
          }
        </td>
      </tr>
    `;
  } else {
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
          ${item.nama || "-"}
        </td>

        <td class="px-4 py-3 border text-center">
          ${potongText(item.pengertian, 60)}
        </td>

        <td class="px-4 py-3 border text-center">
          ${potongText(item.tugas, 60)}
        </td>

        <td class="px-4 py-3 border text-center">
          <div class="inline-flex gap-1 rounded-lg">

            <button
              class="btnView bg-purple-500 hover:bg-purple-600 text-white p-2 rounded hover:shadow-lg active:scale-90 transition-all duration-150"
              data-id="${item.id}"
              title="Lihat"
            >
              <span class="material-symbols-outlined text-sm">
                visibility
              </span>
            </button>

            <button
              class="btnEdit bg-green-500 hover:bg-green-600 text-white p-2 rounded hover:shadow-lg active:scale-90 transition-all duration-150"
              data-id="${item.id}"
              title="Edit"
            >
              <span class="material-symbols-outlined text-sm">
                edit_document
              </span>
            </button>

            <button
              class="btnDelete bg-red-500 hover:bg-red-600 text-white p-2 rounded hover:shadow-lg active:scale-90 transition-all duration-150"
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

      kelembagaanTableBody.appendChild(row);
    });
  }

  if (total === 0) {
    tableInfo.innerText =
      "Showing 0 to 0 of 0 entries";
  } else {
    tableInfo.innerText =
      `Showing ${start + 1} to ${Math.min(end, total)} of ${total} entries`;
  }

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = end >= total;

  pasangEventAction();
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
  const filteredData = getFilteredData();

  if (
    currentPage * rowsPerPage <
    filteredData.length
  ) {
    currentPage++;

    renderTable();
  }
});


// ==================================================
// 12. MODAL FUNCTION
// ==================================================
function openModal(modal, box) {
  modal.classList.remove("hidden");

  modal.classList.add("opacity-0");

  box.classList.add(
    "scale-90",
    "opacity-0"
  );

  requestAnimationFrame(() => {
    modal.classList.remove("opacity-0");

    box.classList.remove(
      "scale-90",
      "opacity-0"
    );

    box.classList.add(
      "scale-100",
      "opacity-100"
    );
  });
}


function closeModalFunc(modal, box) {
  modal.classList.add("opacity-0");

  box.classList.remove(
    "scale-100",
    "opacity-100"
  );

  box.classList.add(
    "scale-90",
    "opacity-0"
  );

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}


// ==================================================
// 13. MODAL TAMBAH
// ==================================================
const modalTambah =
  document.getElementById("modalTambah");

const modalTambahBox =
  document.getElementById("modalTambahBox");

const namaTambah =
  document.getElementById("namaTambah");

const pengertianTambah =
  document.getElementById("pengertianTambah");

const tugasTambah =
  document.getElementById("tugasTambah");

const tujuanTambah =
  document.getElementById("tujuanTambah");

const gambarTambah =
  document.getElementById("gambarTambah");


document.getElementById("btnTambah").onclick = () => {
  openModal(
    modalTambah,
    modalTambahBox
  );
};


document.getElementById("closeTambah").onclick = () => {
  closeModalFunc(
    modalTambah,
    modalTambahBox
  );
};


document.getElementById("btnCloseTambah").onclick = () => {
  closeModalFunc(
    modalTambah,
    modalTambahBox
  );
};


// ==================================================
// 14. MODAL VIEW
// ==================================================
const modalView =
  document.getElementById("modalView");

const modalBox =
  document.getElementById("modalBox");

const viewNama =
  document.getElementById("viewNama");

const viewPengertian =
  document.getElementById("viewPengertian");

const viewTugas =
  document.getElementById("viewTugas");

const viewTujuan =
  document.getElementById("viewTujuan");

const viewGambar =
  document.getElementById("viewGambar");


document.getElementById("closeModal").onclick = () => {
  closeModalFunc(
    modalView,
    modalBox
  );
};


document.getElementById("btnClose2").onclick = () => {
  closeModalFunc(
    modalView,
    modalBox
  );
};


// ==================================================
// 15. MODAL EDIT
// ==================================================
const modalEdit =
  document.getElementById("modalEdit");

const modalEditBox =
  document.getElementById("modalEditBox");

const namaEdit =
  document.getElementById("namaEdit");

const pengertianEdit =
  document.getElementById("pengertianEdit");

const tugasEdit =
  document.getElementById("tugasEdit");

const tujuanEdit =
  document.getElementById("tujuanEdit");

const gambarEdit =
  document.getElementById("gambarEdit");

const previewGambarEdit =
  document.getElementById("previewGambarEdit");

let idKelembagaanEdit = null;


// ================= CLOSE EDIT =================
document.getElementById("closeEdit").onclick = () => {
  closeModalFunc(
    modalEdit,
    modalEditBox
  );
};


document.getElementById("btnCloseEdit").onclick = () => {
  closeModalFunc(
    modalEdit,
    modalEditBox
  );
};


// ==================================================
// 16. PREVIEW GAMBAR EDIT
// ==================================================
gambarEdit.addEventListener("change", () => {
  const file = gambarEdit.files[0];

  if (!file) {
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png"
  ];

  if (!allowedTypes.includes(file.type)) {
    Swal.fire({
      icon: "warning",
      title: "Format Gambar Tidak Valid",
      text: "Gunakan JPG, JPEG, atau PNG."
    });

    gambarEdit.value = "";

    return;
  }

  const maksimalUkuran =
    2 * 1024 * 1024;

  if (file.size > maksimalUkuran) {
    Swal.fire({
      icon: "warning",
      title: "Ukuran Gambar Terlalu Besar",
      text: "Ukuran gambar maksimal 2MB."
    });

    gambarEdit.value = "";

    return;
  }

  const reader =
    new FileReader();

  reader.onload = event => {
    previewGambarEdit.src =
      event.target.result;

    previewGambarEdit.classList.remove(
      "hidden"
    );
  };

  reader.readAsDataURL(file);
});


// ==================================================
// 17. EVENT ACTION TABLE
// ==================================================
function pasangEventAction() {

  // ==================================================
  // VIEW
  // ==================================================
  document.querySelectorAll(".btnView").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;

      const item = kelembagaanData.find(data => {
        return String(data.id) === String(id);
      });

      if (!item) {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: "Data kelembagaan tidak ditemukan."
        });

        return;
      }

      viewNama.textContent =
        item.nama || "-";

      viewPengertian.textContent =
        item.pengertian || "-";

      viewTugas.textContent =
        item.tugas || "-";

      viewTujuan.textContent =
        item.tujuan || "-";

      if (item.gambar_url) {
        viewGambar.src =
          item.gambar_url;

        viewGambar.alt =
          item.nama || "Gambar kelembagaan";

        viewGambar.classList.remove(
          "hidden"
        );
      } else {
        viewGambar.src = "";

        viewGambar.classList.add(
          "hidden"
        );
      }

      openModal(
        modalView,
        modalBox
      );
    };
  });


  // ==================================================
  // EDIT
  // ==================================================
  document.querySelectorAll(".btnEdit").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;

      const item = kelembagaanData.find(data => {
        return String(data.id) === String(id);
      });

      if (!item) {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: "Data kelembagaan tidak ditemukan."
        });

        return;
      }

      // Simpan ID
      idKelembagaanEdit =
        item.id;

      // Isi data lama
      namaEdit.value =
        item.nama || "";

      pengertianEdit.value =
        item.pengertian || "";

      tugasEdit.value =
        item.tugas || "";

      tujuanEdit.value =
        item.tujuan || "";

      // Reset input gambar
      gambarEdit.value = "";

      // Preview gambar lama
      if (item.gambar_url) {
        previewGambarEdit.src =
          item.gambar_url;

        previewGambarEdit.classList.remove(
          "hidden"
        );
      } else {
        previewGambarEdit.src = "";

        previewGambarEdit.classList.add(
          "hidden"
        );
      }

      openModal(
        modalEdit,
        modalEditBox
      );
    };
  });


  // ==================================================
  // DELETE
  // ==================================================
  document.querySelectorAll(".btnDelete").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;

      const item = kelembagaanData.find(data => {
        return String(data.id) === String(id);
      });

      if (!item) {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: "Data kelembagaan tidak ditemukan."
        });

        return;
      }

      const token =
        getAdminToken();

      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Token Admin Tidak Ditemukan",
          text: "Silakan login sebagai admin terlebih dahulu."
        });

        return;
      }

      const konfirmasi =
        await Swal.fire({
          title: "Yakin Hapus?",
          html: `
            <div style="text-align:center;">
              <p>
                Data kelembagaan berikut akan dihapus:
              </p>

              <p style="margin-top:10px;">
                <b>${item.nama}</b>
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
          cancelButtonColor: "#6b7280"
        });

      if (!konfirmasi.isConfirmed) {
        return;
      }

      try {
        Swal.fire({
          title: "Menghapus...",
          text: "Data kelembagaan sedang dihapus.",
          allowOutsideClick: false,
          showConfirmButton: false,

          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response =
          await fetch(
            `${API_URL}/${id}`,
            {
              method: "DELETE",

              headers: {
                "Authorization": `Bearer ${token}`
              }
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            "Gagal menghapus kelembagaan."
          );
        }

        await Swal.fire({
          title: "Berhasil 🎉",
          text: "Data kelembagaan berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });

        await loadKelembagaan();

      } catch (error) {
        console.error(
          "Error delete kelembagaan:",
          error
        );

        Swal.fire({
          icon: "error",
          title: "Gagal Menghapus",
          text: error.message
        });
      }
    };
  });
}


// ==================================================
// 18. CLICK OUTSIDE MODAL
// ==================================================
function enableOutsideClick(modal, box) {
  modal.addEventListener("click", event => {
    if (
      event.target === modal
    ) {
      closeModalFunc(
        modal,
        box
      );
    }
  });
}


enableOutsideClick(
  modalTambah,
  modalTambahBox
);

enableOutsideClick(
  modalView,
  modalBox
);

enableOutsideClick(
  modalEdit,
  modalEditBox
);


// ==================================================
// 19. SIMPAN TAMBAH KELEMBAGAAN
// ==================================================
document.getElementById("btnSimpanTambah").onclick = async () => {
  const nama =
    namaTambah.value.trim();

  const pengertian =
    pengertianTambah.value.trim();

  const tugas =
    tugasTambah.value.trim();

  const tujuan =
    tujuanTambah.value.trim();

  const gambar =
    gambarTambah.files[0];

  const kosong = [];

  if (!nama) {
    kosong.push("Nama");
  }

  if (!pengertian) {
    kosong.push("Pengertian");
  }

  if (!tugas) {
    kosong.push("Tugas");
  }

  if (!tujuan) {
    kosong.push("Tujuan");
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

          <ul style="list-style-position:inside;">
            ${kosong
              .map(item => `<li>${item}</li>`)
              .join("")}
          </ul>
        </div>
      `,
      icon: "warning",
      confirmButtonColor: "#f59e0b"
    });

    return;
  }

  const maksimalUkuran =
    2 * 1024 * 1024;

  if (gambar.size > maksimalUkuran) {
    Swal.fire({
      icon: "warning",
      title: "Ukuran Gambar Terlalu Besar",
      text: "Ukuran gambar maksimal 2MB."
    });

    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png"
  ];

  if (!allowedTypes.includes(gambar.type)) {
    Swal.fire({
      icon: "warning",
      title: "Format Gambar Tidak Valid",
      text: "Gunakan JPG, JPEG, atau PNG."
    });

    return;
  }

  const token =
    getAdminToken();

  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Token Admin Tidak Ditemukan",
      text: "Silakan login sebagai admin terlebih dahulu."
    });

    return;
  }

  const konfirmasi =
    await Swal.fire({
      title: "Konfirmasi Data",
      html: `
        <div style="text-align:left;">
          <p><b>Nama:</b> ${nama}</p>
          <p><b>Pengertian:</b> ${pengertian}</p>
          <p><b>Tugas:</b> ${tugas}</p>
          <p><b>Tujuan:</b> ${tujuan}</p>
          <p><b>Gambar:</b> ${gambar.name}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280"
    });

  if (!konfirmasi.isConfirmed) {
    return;
  }

  try {
    Swal.fire({
      title: "Menyimpan...",
      text: "Data kelembagaan sedang disimpan.",
      allowOutsideClick: false,
      showConfirmButton: false,

      didOpen: () => {
        Swal.showLoading();
      }
    });

    const formData =
      new FormData();

    formData.append(
      "nama",
      nama
    );

    formData.append(
      "pengertian",
      pengertian
    );

    formData.append(
      "tugas",
      tugas
    );

    formData.append(
      "tujuan",
      tujuan
    );

    formData.append(
      "gambar",
      gambar
    );

    const response =
      await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Authorization": `Bearer ${token}`
          },

          body: formData
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Gagal menambahkan kelembagaan."
      );
    }

    await Swal.fire({
      title: "Berhasil 🎉",
      text: "Kelembagaan berhasil ditambahkan.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });

    // Reset form
    namaTambah.value = "";
    pengertianTambah.value = "";
    tugasTambah.value = "";
    tujuanTambah.value = "";
    gambarTambah.value = "";

    closeModalFunc(
      modalTambah,
      modalTambahBox
    );

    await loadKelembagaan();

  } catch (error) {
    console.error(
      "Error tambah kelembagaan:",
      error
    );

    Swal.fire({
      icon: "error",
      title: "Gagal Menyimpan",
      text: error.message
    });
  }
};


// ==================================================
// 20. SIMPAN EDIT KELEMBAGAAN
// ==================================================
document.getElementById("btnSimpanEdit").onclick = async () => {
  const nama =
    namaEdit.value.trim();

  const pengertian =
    pengertianEdit.value.trim();

  const tugas =
    tugasEdit.value.trim();

  const tujuan =
    tujuanEdit.value.trim();

  const gambar =
    gambarEdit.files[0];

  if (!idKelembagaanEdit) {
    Swal.fire({
      icon: "error",
      title: "Data Tidak Ditemukan",
      text: "ID kelembagaan tidak ditemukan."
    });

    return;
  }

  if (
    !nama ||
    !pengertian ||
    !tugas ||
    !tujuan
  ) {
    Swal.fire({
      icon: "warning",
      title: "Form Belum Lengkap",
      text: "Nama, pengertian, tugas, dan tujuan wajib diisi."
    });

    return;
  }

  // Validasi gambar jika memilih gambar baru
  if (gambar) {
    const maksimalUkuran =
      2 * 1024 * 1024;

    if (gambar.size > maksimalUkuran) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran Gambar Terlalu Besar",
        text: "Ukuran gambar maksimal 2MB."
      });

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png"
    ];

    if (!allowedTypes.includes(gambar.type)) {
      Swal.fire({
        icon: "warning",
        title: "Format Gambar Tidak Valid",
        text: "Gunakan JPG, JPEG, atau PNG."
      });

      return;
    }
  }

  const token =
    getAdminToken();

  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Token Admin Tidak Ditemukan",
      text: "Silakan login sebagai admin terlebih dahulu."
    });

    return;
  }

  const konfirmasi =
    await Swal.fire({
      title: "Konfirmasi Perubahan",
      html: `
        <div style="text-align:left;">
          <p><b>Nama:</b> ${nama}</p>
          <p><b>Pengertian:</b> ${pengertian}</p>
          <p><b>Tugas:</b> ${tugas}</p>
          <p><b>Tujuan:</b> ${tujuan}</p>

          <p>
            <b>Gambar:</b>
            ${
              gambar
                ? gambar.name
                : "Tetap menggunakan gambar lama"
            }
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280"
    });

  if (!konfirmasi.isConfirmed) {
    return;
  }

  try {
    Swal.fire({
      title: "Menyimpan Perubahan...",
      text: "Data kelembagaan sedang diperbarui.",
      allowOutsideClick: false,
      showConfirmButton: false,

      didOpen: () => {
        Swal.showLoading();
      }
    });

    const formData =
      new FormData();

    formData.append(
      "nama",
      nama
    );

    formData.append(
      "pengertian",
      pengertian
    );

    formData.append(
      "tugas",
      tugas
    );

    formData.append(
      "tujuan",
      tujuan
    );

    // Gambar tidak wajib diganti
    if (gambar) {
      formData.append(
        "gambar",
        gambar
      );
    }

    const response =
      await fetch(
        `${API_URL}/${idKelembagaanEdit}`,
        {
          method: "PUT",

          headers: {
            "Authorization": `Bearer ${token}`
          },

          body: formData
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Gagal memperbarui kelembagaan."
      );
    }

    await Swal.fire({
      title: "Berhasil 🎉",
      text: "Kelembagaan berhasil diperbarui.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });

    closeModalFunc(
      modalEdit,
      modalEditBox
    );

    idKelembagaanEdit = null;

    await loadKelembagaan();

  } catch (error) {
    console.error(
      "Error edit kelembagaan:",
      error
    );

    Swal.fire({
      icon: "error",
      title: "Gagal Memperbarui",
      text: error.message
    });
  }
};


// ==================================================
// 21. LOAD DATA SAAT HALAMAN DIBUKA
// ==================================================
loadKelembagaan();