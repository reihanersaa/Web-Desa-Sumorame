// ==================================================
// 1. KONFIGURASI API
// ==================================================
const API_URL = `${window.API_BASE_URL}/informasi`;

function escapeHTML(value = "") {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function getAdminToken() {
  return localStorage.getItem("token");
}


// ==================================================
// 2. ELEMENT TABLE
// ==================================================
const informasiTableBody = document.getElementById("informasiTableBody");
const searchInput = document.getElementById("searchInput");
const entriesSelect = document.getElementById("entriesSelect");
const tableInfo = document.getElementById("tableInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");


// ==================================================
// 3. DATA
// ==================================================
let informasiData = [];
let currentPage = 1;
let rowsPerPage = parseInt(entriesSelect.value);


// ==================================================
// 4. GET DATA INFORMASI
// ==================================================
async function loadInformasi() {
  try {
    const response = await fetch(API_URL);

    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response backend bukan JSON.");
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Gagal mengambil data informasi."
      );
    }

    informasiData = result.data || [];

    currentPage = 1;

    renderTable();

  } catch (error) {
    console.error("Error load informasi:", error);

    informasiTableBody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="px-4 py-6 border text-center text-red-500"
        >
          Gagal mengambil data informasi
        </td>
      </tr>
    `;

    tableInfo.innerText =
      "Showing 0 to 0 of 0 entries";

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

function formatTanggalIndonesia(tanggal) {
  if (!tanggal) return "-";
  const tanggalBersih = String(tanggal).split("T")[0];
  const date = new Date(`${tanggalBersih}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ==================================================
// 6. FORMAT TANGGAL INDONESIA
// ==================================================
function formatTanggalIndonesia(tanggal) {
  if (!tanggal) {
    return "-";
  }

  // Jika backend mengembalikan:
  // 2026-08-26T00:00:00.000Z
  // maka diambil hanya 2026-08-26
  const tanggalBersih =
    String(tanggal).split("T")[0];

  const date =
    new Date(`${tanggalBersih}T00:00:00`);

  if (isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}


// ==================================================
// 7. FILTER DATA
// ==================================================
function getFilteredData() {
  const keyword =
    searchInput.value.trim().toLowerCase();

  return informasiData.filter((item) => {
    const judul = String(item.judul || "").toLowerCase();
    const isi = String(item.isi || "").toLowerCase();
    const penjelasan = String(item.penjelasan || "").toLowerCase();
    const tanggal = String(item.tanggal || "").toLowerCase();

    return (
      judul.includes(keyword) ||
      isi.includes(keyword) ||
      penjelasan.includes(keyword) ||
      tanggal.includes(keyword)
    );
  });
}


// ==================================================
// 8. RENDER TABLE
// ==================================================
function renderTable() {
  const filteredData = getFilteredData();

  const total = filteredData.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(total / rowsPerPage)
    );

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const start =
    (currentPage - 1) * rowsPerPage;

  const end =
    start + rowsPerPage;

  const pageData =
    filteredData.slice(start, end);

  informasiTableBody.innerHTML = "";

  if (pageData.length === 0) {

    informasiTableBody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="px-4 py-6 border text-center text-gray-500"
        >
          ${
            searchInput.value.trim()
              ? "Data tidak ditemukan"
              : "Belum ada data informasi"
          }
        </td>
      </tr>
    `;

  } else {

    pageData.forEach((item, index) => {

      const row =
        document.createElement("tr");

      row.className =
        "hover:bg-blue-50 hover:scale-[1.01] transition-all duration-200 cursor-pointer fade-up";

      row.style.animationDelay =
        `${index * 0.1}s`;

      const nomor =
        start + index + 1;

      row.innerHTML = `
        <td class="px-4 py-3 text-center border">
          ${nomor}
        </td>

        <td class="px-4 py-3 text-center border">
          ${escapeHTML(item.judul || "-")}
        </td>

        <td class="px-4 py-3 text-center border">
          ${escapeHTML(potongText(item.isi, 80))}
        </td>

        <td class="px-4 py-3 text-center border">
          ${escapeHTML(potongText(item.penjelasan, 80))}
        </td>

        <td class="px-4 py-3 text-center border">

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

      informasiTableBody.appendChild(row);
    });
  }


  if (total === 0) {

    tableInfo.innerText =
      "Showing 0 to 0 of 0 entries";

  } else {

    tableInfo.innerText =
      `Showing ${start + 1} to ${Math.min(end, total)} of ${total} entries`;
  }


  prevBtn.disabled =
    currentPage === 1;

  nextBtn.disabled =
    end >= total;


  pasangEventAction();
}


// ==================================================
// 9. SEARCH
// ==================================================
searchInput.addEventListener("input", () => {

  currentPage = 1;

  renderTable();
});


// ==================================================
// 10. SHOW ENTRIES
// ==================================================
entriesSelect.addEventListener("change", () => {

  rowsPerPage =
    parseInt(entriesSelect.value);

  currentPage = 1;

  renderTable();
});


// ==================================================
// 11. PREVIOUS
// ==================================================
prevBtn.addEventListener("click", () => {

  if (currentPage > 1) {

    currentPage--;

    renderTable();
  }
});


// ==================================================
// 12. NEXT
// ==================================================
nextBtn.addEventListener("click", () => {

  const filteredData =
    getFilteredData();

  if (
    currentPage * rowsPerPage <
    filteredData.length
  ) {

    currentPage++;

    renderTable();
  }
});


// ==================================================
// 13. MODAL FUNCTION
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


const judulTambah = document.getElementById("judulTambah");
const isiTambah = document.getElementById("isiTambah");
const penjelasanTambah = document.getElementById("penjelasanTambah");
const tanggalTambah = document.getElementById("tanggalTambah");
const gambarTambah = document.getElementById("gambarTambah");

const tanggalTambahPicker = flatpickr(tanggalTambah, {
  dateFormat: "Y-m-d",
  altInput: true,
  altFormat: "d F Y",
  allowInput: true,
});

document.getElementById("btnTambah").onclick = () => {
  judulTambah.value = "";
  isiTambah.value = "";
  penjelasanTambah.value = "";
  gambarTambah.value = "";
  tanggalTambahPicker.clear();
  openModal(modalTambah, modalTambahBox);
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


const viewJudul = document.getElementById("viewJudul");
const viewIsi = document.getElementById("viewIsi");
const viewPenjelasan = document.getElementById("viewPenjelasan");
const viewTanggal = document.getElementById("viewTanggal");
const viewGambar = document.getElementById("viewGambar");

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


const judulEdit = document.getElementById("judulEdit");
const isiEdit = document.getElementById("isiEdit");
const penjelasanEdit = document.getElementById("penjelasanEdit");
const tanggalEdit = document.getElementById("tanggalEdit");
const gambarEdit = document.getElementById("gambarEdit");
const previewGambarEdit = document.getElementById("previewGambarEdit");

let idInformasiEdit = null;

const tanggalEditPicker = flatpickr(tanggalEdit, {
  dateFormat: "Y-m-d",
  altInput: true,
  altFormat: "d F Y",
  allowInput: true,
});

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
// 17. KONFIGURASI FLATPICKR INDONESIA
// ==================================================
const localeIndonesia = {

  firstDayOfWeek: 1,

  weekdays: {

    shorthand: [
      "Min",
      "Sen",
      "Sel",
      "Rab",
      "Kam",
      "Jum",
      "Sab"
    ],

    longhand: [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu"
    ]
  },


  months: {

    shorthand: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des"
    ],

    longhand: [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember"
    ]
  }
};


// ==================================================
// 18. FLATPICKR TANGGAL TAMBAH
// ==================================================
const tanggalTambahPicker =
  flatpickr("#tanggalTambah", {

    // Nilai asli:
    // 2026-08-26
    dateFormat: "Y-m-d",

    // Tampilan:
    // 26 Agustus 2026
    altInput: true,

    altFormat: "d F Y",

    allowInput: true,

    locale: localeIndonesia
  });


// ==================================================
// 19. FLATPICKR TANGGAL EDIT
// ==================================================
const tanggalEditPicker =
  flatpickr("#tanggalEdit", {

    dateFormat: "Y-m-d",

    altInput: true,

    altFormat: "d F Y",

    allowInput: true,

    locale: localeIndonesia
  });


// ==================================================
// 20. PREVIEW GAMBAR EDIT
// ==================================================
gambarEdit.addEventListener("change", () => {

  const file =
    gambarEdit.files[0];

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


  reader.onload = (event) => {

    previewGambarEdit.src =
      event.target.result;

    previewGambarEdit.classList.remove(
      "hidden"
    );
  };


  reader.readAsDataURL(file);
});


// ==================================================
// 21. EVENT ACTION TABLE
// ==================================================
function pasangEventAction() {

  // ==================================================
  // VIEW
  // ==================================================
  document
    .querySelectorAll(".btnView")
    .forEach((btn) => {

      btn.onclick = () => {

        const id =
          btn.dataset.id;


        const item =
          informasiData.find((data) => {

      viewPenjelasan.textContent = item.penjelasan || "-";
      viewTanggal.textContent = formatTanggalIndonesia(item.tanggal);


        if (!item) {

          Swal.fire({
            icon: "error",
            title: "Data Tidak Ditemukan",
            text: "Data informasi tidak ditemukan."
          });

        viewGambar.classList.add("hidden");
      }

      openModal(modalView, modalBox);
    };
  });

  // ================= EDIT =================
  document.querySelectorAll(".btnEdit").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;

      const item = informasiData.find((data) => {
        return String(data.id) === String(id);
      });

      if (!item) {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: "Data informasi tidak ditemukan.",
        });

        return;
      }

      idInformasiEdit = item.id;

      judulEdit.value = item.judul || "";

      isiEdit.value = item.isi || "";

      penjelasanEdit.value = item.penjelasan || "";

      if (item.tanggal) {
        tanggalEditPicker.setDate(String(item.tanggal).split("T")[0], true);
      } else {
        tanggalEditPicker.clear();
      }

      gambarEdit.value = "";

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

      const item = informasiData.find((data) => {
        return String(data.id) === String(id);
      });

      if (!item) {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: "Data informasi tidak ditemukan.",
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
        title: "Yakin Hapus?",
        html: `
            <div style="text-align:center;">
              <p>Data informasi berikut akan dihapus:</p>

              <p style="margin-top:10px;">
                <b>${escapeHTML(item.judul)}</b>
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
        Swal.fire({
          title: "Menghapus...",
          text: "Data informasi sedang dihapus.",
          allowOutsideClick: false,
          showConfirmButton: false,

          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal menghapus informasi.");
        }


        // ================= JUDUL =================
        viewJudul.textContent =
          item.judul || "-";


        // ================= TANGGAL =================
        viewTanggal.textContent =
          formatTanggalIndonesia(
            item.tanggal
          );


        // ================= ISI =================
        viewIsi.textContent =
          item.isi || "-";


        // ================= PENJELASAN =================
        viewPenjelasan.textContent =
          item.penjelasan || "-";


        // ================= GAMBAR =================
        if (item.gambar_url) {

          viewGambar.src =
            item.gambar_url;

          viewGambar.alt =
            item.judul ||
            "Gambar informasi";

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
  document
    .querySelectorAll(".btnEdit")
    .forEach((btn) => {

      btn.onclick = () => {

        const id =
          btn.dataset.id;


        const item =
          informasiData.find((data) => {

            return (
              String(data.id) ===
              String(id)
            );
          });


        if (!item) {

          Swal.fire({
            icon: "error",
            title: "Data Tidak Ditemukan",
            text: "Data informasi tidak ditemukan."
          });

          return;
        }


        idInformasiEdit =
          item.id;


        // ================= JUDUL =================
        judulEdit.value =
          item.judul || "";


        // ================= ISI =================
        isiEdit.value =
          item.isi || "";


        // ================= PENJELASAN =================
        penjelasanEdit.value =
          item.penjelasan || "";


        // ================= TANGGAL =================
        if (item.tanggal) {

          const tanggalBersih =
            String(item.tanggal)
              .split("T")[0];

          tanggalEditPicker.setDate(
            tanggalBersih,
            true
          );

        } else {

          tanggalEditPicker.clear();
        }


        // ================= RESET INPUT GAMBAR =================
        gambarEdit.value = "";


        // ================= GAMBAR LAMA =================
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
  document
    .querySelectorAll(".btnDelete")
    .forEach((btn) => {

      btn.onclick = async () => {

        const id =
          btn.dataset.id;


        const item =
          informasiData.find((data) => {

            return (
              String(data.id) ===
              String(id)
            );
          });


        if (!item) {

          Swal.fire({
            icon: "error",
            title: "Data Tidak Ditemukan",
            text: "Data informasi tidak ditemukan."
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
                  Data informasi berikut akan dihapus:
                </p>

                <p style="margin-top:10px;">
                  <b>${item.judul}</b>
                </p>

                <p
                  style="
                    margin-top:10px;
                    color:#dc2626;
                  "
                >
                  Data yang sudah dihapus
                  tidak dapat dikembalikan.
                </p>

              </div>
            `,

            icon: "warning",

            showCancelButton: true,

            confirmButtonText:
              "Ya, Hapus",

            cancelButtonText:
              "Batal",

            confirmButtonColor:
              "#dc2626",

            cancelButtonColor:
              "#6b7280"
          });


        if (!konfirmasi.isConfirmed) {
          return;
        }


        try {

          Swal.fire({
            title: "Menghapus...",
            text: "Data informasi sedang dihapus.",
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
                  Authorization:
                    `Bearer ${token}`
                }
              }
            );


          const result =
            await response.json();


          if (!response.ok) {

            throw new Error(
              result.message ||
              "Gagal menghapus informasi."
            );
          }


          await Swal.fire({
            title: "Berhasil 🎉",
            text: "Data informasi berhasil dihapus.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });


          await loadInformasi();

        } catch (error) {

          console.error(
            "Error delete informasi:",
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
// 22. CLICK OUTSIDE MODAL
// ==================================================
function enableOutsideClick(modal, box) {

  modal.addEventListener(
    "click",
    (event) => {

      if (event.target === modal) {

        closeModalFunc(
          modal,
          box
        );
      }
    }
  );
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
// 23. SIMPAN TAMBAH INFORMASI
// ==================================================
document
  .getElementById("btnSimpanTambah")
  .onclick = async () => {

    // ==================================================
    // AMBIL VALUE
    // ==================================================
    const judul =
      judulTambah.value.trim();

    const isi =
      isiTambah.value.trim();

  const tanggal = tanggalTambah.value.trim();

  const gambar = gambarTambah.files[0];

    const tanggal =
      tanggalTambah.value.trim();

    const gambar =
      gambarTambah.files[0];


    // ==================================================
    // VALIDASI FORM KOSONG
    // ==================================================
    const kosong = [];

  if (!tanggal) {
    kosong.push("Tanggal Kegiatan");
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
            ${kosong.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      `,
      icon: "warning",
      confirmButtonColor: "#f59e0b",
    });

    return;
  }

  const maksimalUkuran = 2 * 1024 * 1024;

  if (gambar.size > maksimalUkuran) {
    Swal.fire({
      icon: "warning",
      title: "Ukuran Gambar Terlalu Besar",
      text: "Ukuran gambar maksimal 2MB.",
    });

    return;
  }

  const allowedTypes = ["image/jpeg", "image/png"];

  if (!allowedTypes.includes(gambar.type)) {
    Swal.fire({
      icon: "warning",
      title: "Format Gambar Tidak Valid",
      text: "Gunakan JPG, JPEG, atau PNG.",
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
          <p><b>Judul:</b> ${escapeHTML(judul)}</p>
          <p><b>Tanggal:</b> ${escapeHTML(formatTanggalIndonesia(tanggal))}</p>
          <p><b>Isi:</b> ${escapeHTML(isi)}</p>
          <p><b>Penjelasan:</b> ${escapeHTML(penjelasan)}</p>
          <p><b>Gambar:</b> ${escapeHTML(gambar.name)}</p>
        </div>
      `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, Simpan",
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
      text: "Data informasi sedang disimpan.",
      allowOutsideClick: false,
      showConfirmButton: false,

      didOpen: () => {
        Swal.showLoading();
      },
    });

    const formData = new FormData();

    formData.append("judul", judul);

    formData.append("isi", isi);

    formData.append("penjelasan", penjelasan);

    formData.append("tanggal", tanggal);

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
      throw new Error(result.message || "Gagal menambahkan informasi.");
    }


    judulTambah.value = "";
    isiTambah.value = "";
    penjelasanTambah.value = "";
    gambarTambah.value = "";
    tanggalTambahPicker.clear();


    if (!penjelasan) {
      kosong.push(
        "Penjelasan Berita"
      );
    }


    if (!tanggal) {
      kosong.push(
        "Tanggal Kegiatan"
      );
    }


    if (!gambar) {
      kosong.push("Gambar");
    }

  const tanggal = tanggalEdit.value.trim();

  const gambar = gambarEdit.files[0];

    if (kosong.length > 0) {

    return;
  }

  if (!judul || !isi || !penjelasan || !tanggal) {
    Swal.fire({
      icon: "warning",
      title: "Form Belum Lengkap",
      text: "Judul, tanggal, isi berita, dan penjelasan berita wajib diisi.",
    });

    return;
  }

  if (gambar) {
    const maksimalUkuran = 2 * 1024 * 1024;

    if (gambar.size > maksimalUkuran) {
      Swal.fire({

        title:
          "Form Belum Lengkap ⚠️",

        html: `
          <div style="text-align:center;">

            <p>
              Data berikut masih kosong:
            </p>

            <ul
              style="
                list-style-position:inside;
                margin-top:10px;
              "
            >
              ${
                kosong
                  .map(
                    (item) =>
                      `<li>${item}</li>`
                  )
                  .join("")
              }
            </ul>

          </div>
        `,

        icon: "warning",

        confirmButtonColor:
          "#f59e0b"
      });

      return;
    }


    // ==================================================
    // VALIDASI UKURAN GAMBAR
    // ==================================================
    const maksimalUkuran =
      2 * 1024 * 1024;


    if (
      gambar.size >
      maksimalUkuran
    ) {

      Swal.fire({
        icon: "warning",
        title:
          "Ukuran Gambar Terlalu Besar",
        text:
          "Ukuran gambar maksimal 2MB."
      });

      return;
    }


    // ==================================================
    // VALIDASI FORMAT GAMBAR
    // ==================================================
    const allowedTypes = [
      "image/jpeg",
      "image/png"
    ];


  const konfirmasi = await Swal.fire({
    title: "Konfirmasi Perubahan",
    html: `
        <div style="text-align:left;">
          <p><b>Judul:</b> ${escapeHTML(judul)}</p>
          <p><b>Tanggal:</b> ${escapeHTML(formatTanggalIndonesia(tanggal))}</p>
          <p><b>Isi:</b> ${escapeHTML(isi)}</p>
          <p><b>Penjelasan:</b> ${escapeHTML(penjelasan)}</p>

          <p>
            <b>Gambar:</b>
            ${escapeHTML(gambar ? gambar.name : "Tetap menggunakan gambar lama")}
          </p>
        </div>
      `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, Simpan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
  });

      return;
    }


    // ==================================================
    // TOKEN
    // ==================================================
    const token =
      getAdminToken();


    if (!token) {

      Swal.fire({
        icon: "warning",
        title:
          "Token Admin Tidak Ditemukan",
        text:
          "Silakan login sebagai admin terlebih dahulu."
      });

      return;
    }

    formData.append("tanggal", tanggal);

    if (gambar) {

      const maksimalUkuran =
        2 * 1024 * 1024;


      if (
        gambar.size >
        maksimalUkuran
      ) {

        Swal.fire({
          icon:
            "warning",

          title:
            "Ukuran Gambar Terlalu Besar",

          text:
            "Ukuran gambar maksimal 2MB."
        });

        return;
      }


      const allowedTypes = [
        "image/jpeg",
        "image/png"
      ];


      if (
        !allowedTypes.includes(
          gambar.type
        )
      ) {

        Swal.fire({
          icon:
            "warning",

          title:
            "Format Gambar Tidak Valid",

          text:
            "Gunakan JPG, JPEG, atau PNG."
        });

        return;
      }
    }


    // ==================================================
    // TOKEN
    // ==================================================
    const token =
      getAdminToken();


    if (!token) {

      Swal.fire({
        icon:
          "warning",

        title:
          "Token Admin Tidak Ditemukan",

        text:
          "Silakan login sebagai admin terlebih dahulu."
      });

      return;
    }


    // ==================================================
    // KONFIRMASI EDIT
    // ==================================================
    const konfirmasi =
      await Swal.fire({

    idInformasiEdit = null;
    tanggalEditPicker.clear();

        html: `
          <div style="text-align:left;">

            <p>
              <b>Judul:</b>
              ${judul}
            </p>

            <p>
              <b>Tanggal:</b>
              ${formatTanggalIndonesia(tanggal)}
            </p>

            <p>
              <b>Isi:</b>
              ${isi}
            </p>

            <p>
              <b>Penjelasan:</b>
              ${penjelasan}
            </p>

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

        icon:
          "question",

        showCancelButton:
          true,

        confirmButtonText:
          "Ya, Simpan",

        cancelButtonText:
          "Batal",

        confirmButtonColor:
          "#3b82f6",

        cancelButtonColor:
          "#6b7280"
      });


    if (!konfirmasi.isConfirmed) {
      return;
    }


    try {

      // ==================================================
      // LOADING
      // ==================================================
      Swal.fire({

        title:
          "Menyimpan Perubahan...",

        text:
          "Data informasi sedang diperbarui.",

        allowOutsideClick:
          false,

        showConfirmButton:
          false,

        didOpen: () => {
          Swal.showLoading();
        }
      });


      // ==================================================
      // FORMDATA
      // ==================================================
      const formData =
        new FormData();


      formData.append(
        "judul",
        judul
      );


      formData.append(
        "isi",
        isi
      );


      formData.append(
        "penjelasan",
        penjelasan
      );


      // ================= TANGGAL =================
      formData.append(
        "tanggal",
        tanggal
      );


      // ================= GAMBAR BARU =================
      if (gambar) {

        formData.append(
          "gambar",
          gambar
        );
      }


      // ==================================================
      // PUT
      // ==================================================
      const response =
        await fetch(
          `${API_URL}/${idInformasiEdit}`,
          {
            method:
              "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`
            },

            body:
              formData
          }
        );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          "Gagal memperbarui informasi."
        );
      }


      // ==================================================
      // BERHASIL
      // ==================================================
      await Swal.fire({

        title:
          "Berhasil 🎉",

        text:
          "Informasi berhasil diperbarui.",

        icon:
          "success",

        timer:
          1500,

        showConfirmButton:
          false
      });


      // ==================================================
      // TUTUP MODAL
      // ==================================================
      closeModalFunc(
        modalEdit,
        modalEditBox
      );


      // ==================================================
      // RESET ID
      // ==================================================
      idInformasiEdit =
        null;


      // ==================================================
      // RESET FLATPICKR EDIT
      // ==================================================
      tanggalEditPicker.clear();


      // ==================================================
      // LOAD ULANG
      // ==================================================
      await loadInformasi();

    } catch (error) {

      console.error(
        "Error edit informasi:",
        error
      );


      Swal.fire({

        icon:
          "error",

        title:
          "Gagal Memperbarui",

        text:
          error.message
      });
    }
  };


// ==================================================
// 25. LOAD DATA SAAT HALAMAN DIBUKA
// ==================================================
loadInformasi();