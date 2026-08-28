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
      throw new Error(result.message || "Gagal mengambil data informasi.");
    }

    informasiData = result.data || [];

    currentPage = 1;

    renderTable();
  } catch (error) {
    console.error("Error load informasi:", error);

    informasiTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-6 border text-center text-red-500">
          Gagal mengambil data informasi
        </td>
      </tr>
    `;

    tableInfo.innerText = "Showing 0 to 0 of 0 entries";

    Swal.fire({
      icon: "error",
      title: "Gagal Mengambil Data",
      text: error.message,
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
  if (!tanggal) {
    return "-";
  }

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
    year: "numeric",
  });
}

// ==================================================
// 6. FILTER DATA
// ==================================================
function getFilteredData() {
  const keyword = searchInput.value.trim().toLowerCase();

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
// 7. RENDER TABLE
// ==================================================
function renderTable() {
  const filteredData = getFilteredData();

  const total = filteredData.length;

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  const pageData = filteredData.slice(start, end);

  informasiTableBody.innerHTML = "";

  if (pageData.length === 0) {
    informasiTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-6 border text-center text-gray-500">
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

      row.style.animationDelay = `${index * 0.1}s`;

      const nomor = start + index + 1;

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
  rowsPerPage =
    parseInt(entriesSelect.value);

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

    box.classList.remove("scale-90", "opacity-0");

    box.classList.add("scale-100", "opacity-100");
  });
}

function closeModalFunc(modal, box) {
  modal.classList.add("opacity-0");

  box.classList.remove("scale-100", "opacity-100");

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

const judulTambah =
  document.getElementById("judulTambah");

const isiTambah =
  document.getElementById("isiTambah");

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

// ==================================================
// 14. MODAL VIEW
// ==================================================
const modalView =
  document.getElementById("modalView");

const modalBox =
  document.getElementById("modalBox");

const viewJudul =
  document.getElementById("viewJudul");

const viewTanggal =
  document.getElementById("viewTanggal");

const viewIsi =
  document.getElementById("viewIsi");

const viewPenjelasan =
  document.getElementById("viewPenjelasan");

const viewGambar =
  document.getElementById("viewGambar");

const viewJudul = document.getElementById("viewJudul");
const viewIsi = document.getElementById("viewIsi");
const viewPenjelasan = document.getElementById("viewPenjelasan");
const viewTanggal = document.getElementById("viewTanggal");
const viewGambar = document.getElementById("viewGambar");

// ==================================================
// 15. MODAL EDIT
// ==================================================
const modalEdit =
  document.getElementById("modalEdit");

const modalEditBox =
  document.getElementById("modalEditBox");

const judulEdit =
  document.getElementById("judulEdit");

const tanggalEdit =
  document.getElementById("tanggalEdit");

const isiEdit =
  document.getElementById("isiEdit");

const penjelasanEdit =
  document.getElementById("penjelasanEdit");

const gambarEdit =
  document.getElementById("gambarEdit");

const previewGambarEdit =
  document.getElementById("previewGambarEdit");

let idInformasiEdit = null;

const tanggalEditPicker = flatpickr(tanggalEdit, {
  dateFormat: "Y-m-d",
  altInput: true,
  altFormat: "d F Y",
  allowInput: true,
});

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
    dateFormat: "Y-m-d",
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
// 20. EVENT MODAL
// ==================================================
document.getElementById("btnTambah").onclick = () => {
  judulTambah.value = "";
  isiTambah.value = "";
  penjelasanTambah.value = "";
  gambarTambah.value = "";

  tanggalTambahPicker.clear();

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
// 21. PREVIEW GAMBAR EDIT
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
      text: "Gunakan JPG, JPEG, atau PNG.",
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
      text: "Ukuran gambar maksimal 2MB.",
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
// 22. EVENT ACTION TABLE
// ==================================================
function pasangEventAction() {
  // ================= VIEW =================
  document.querySelectorAll(".btnView").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;

      const item = informasiData.find((data) => {
        return String(data.id) === String(id);
      });

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

        viewJudul.textContent =
          item.judul || "-";

        viewTanggal.textContent =
          formatTanggalIndonesia(
            item.tanggal
          );

        viewIsi.textContent =
          item.isi || "-";

        viewPenjelasan.textContent =
          item.penjelasan || "-";

        if (item.gambar_url) {
          viewGambar.src =
            item.gambar_url;

  const kosong = [];

          viewGambar.classList.remove(
            "hidden"
          );
        } else {
          viewGambar.src = "";

  if (!tanggal) {
    kosong.push("Tanggal Kegiatan");
  }

        openModal(
          modalView,
          modalBox
        );
      };
    });

    return;
  }

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

        judulEdit.value =
          item.judul || "";

        isiEdit.value =
          item.isi || "";

        penjelasanEdit.value =
          item.penjelasan || "";

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

        gambarEdit.value = "";

        if (item.gambar_url) {
          previewGambarEdit.src =
            item.gambar_url;

          previewGambarEdit.classList.remove(
            "hidden"
          );
        } else {
          previewGambarEdit.src = "";

  const tanggal = tanggalEdit.value.trim();

        openModal(
          modalEdit,
          modalEditBox
        );
      };
    });

    return;
  }

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
                  <b>
                    ${escapeHTML(item.judul || "-")}
                  </b>
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

          const contentType =
            response.headers.get(
              "content-type"
            );

          let result = {};

          if (
            contentType &&
            contentType.includes(
              "application/json"
            )
          ) {
            result =
              await response.json();
          }

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
            text:
              error.message ||
              "Terjadi kesalahan saat menghapus data."
          });
        }
      };
    });
  }


// ==================================================
// 23. CLICK OUTSIDE MODAL
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
// 24. SIMPAN TAMBAH INFORMASI
// ==================================================
document
  .getElementById("btnSimpanTambah")
  .onclick = async () => {

    const judul =
      judulTambah.value.trim();

    const isi =
      isiTambah.value.trim();

    const penjelasan =
      penjelasanTambah.value.trim();

    const tanggal =
      tanggalTambah.value.trim();

    const gambar =
      gambarTambah.files[0];


    // ==================================================
    // VALIDASI FORM KOSONG
    // ==================================================
    const kosong = [];

    if (!judul) {
      kosong.push("Judul");
    }

    if (!isi) {
      kosong.push("Isi Berita");
    }

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

    if (kosong.length > 0) {
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
                      `<li>${escapeHTML(item)}</li>`
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

    if (
      !allowedTypes.includes(
        gambar.type
      )
    ) {
      Swal.fire({
        icon: "warning",
        title:
          "Format Gambar Tidak Valid",
        text:
          "Gunakan JPG, JPEG, atau PNG."
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


    // ==================================================
    // KONFIRMASI
    // ==================================================
    const konfirmasi =
      await Swal.fire({
        title:
          "Konfirmasi Data",

        html: `
          <div style="text-align:left;">

            <p>
              <b>Judul:</b>
              ${escapeHTML(judul)}
            </p>

            <p>
              <b>Tanggal:</b>
              ${escapeHTML(
                formatTanggalIndonesia(tanggal)
              )}
            </p>

            <p>
              <b>Isi:</b>
              ${escapeHTML(isi)}
            </p>

            <p>
              <b>Penjelasan:</b>
              ${escapeHTML(penjelasan)}
            </p>

            <p>
              <b>Gambar:</b>
              ${escapeHTML(gambar.name)}
            </p>

          </div>
        `,

        icon: "question",

        showCancelButton: true,

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
          "Menyimpan...",

        text:
          "Data informasi sedang disimpan.",

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

      formData.append(
        "tanggal",
        tanggal
      );

      formData.append(
        "gambar",
        gambar
      );


      // ==================================================
      // POST
      // ==================================================
      const response =
        await fetch(
          API_URL,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`
            },

            body:
              formData
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        );

      let result = {};

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        result =
          await response.json();
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Gagal menambahkan informasi."
        );
      }


      // ==================================================
      // BERHASIL
      // ==================================================
      await Swal.fire({
        title:
          "Berhasil 🎉",

        text:
          "Informasi berhasil ditambahkan.",

        icon:
          "success",

        timer:
          1500,

        showConfirmButton:
          false
      });


      // ==================================================
      // RESET FORM
      // ==================================================
      judulTambah.value = "";
      isiTambah.value = "";
      penjelasanTambah.value = "";
      gambarTambah.value = "";

      tanggalTambahPicker.clear();


      // ==================================================
      // TUTUP MODAL
      // ==================================================
      closeModalFunc(
        modalTambah,
        modalTambahBox
      );


      // ==================================================
      // LOAD ULANG DATA
      // ==================================================
      await loadInformasi();

    } catch (error) {
      console.error(
        "Error tambah informasi:",
        error
      );

      Swal.fire({
        icon:
          "error",

        title:
          "Gagal Menyimpan",

        text:
          error.message
      });
    }
  };


// ==================================================
// 25. SIMPAN EDIT INFORMASI
// ==================================================
document
  .getElementById("btnSimpanEdit")
  .onclick = async () => {

    const judul =
      judulEdit.value.trim();

    const isi =
      isiEdit.value.trim();

    const penjelasan =
      penjelasanEdit.value.trim();

    const tanggal =
      tanggalEdit.value.trim();

    const gambar =
      gambarEdit.files[0];


    // ==================================================
    // VALIDASI ID
    // ==================================================
    if (!idInformasiEdit) {
      Swal.fire({
        icon: "error",
        title:
          "Data Tidak Ditemukan",
        text:
          "ID informasi tidak ditemukan."
      });

      return;
    }


    // ==================================================
    // VALIDASI FORM
    // ==================================================
    if (
      !judul ||
      !isi ||
      !penjelasan ||
      !tanggal
    ) {
      Swal.fire({
        icon: "warning",
        title:
          "Form Belum Lengkap",
        text:
          "Judul, tanggal, isi berita, dan penjelasan berita wajib diisi."
      });

      return;
    }


    // ==================================================
    // VALIDASI GAMBAR BARU
    // ==================================================
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

    const response = await fetch(`${API_URL}/${idInformasiEdit}`, {
      method: "PUT",

    // ==================================================
    // KONFIRMASI EDIT
    // ==================================================
    const konfirmasi =
      await Swal.fire({
        title:
          "Konfirmasi Perubahan",

        html: `
          <div style="text-align:left;">

            <p>
              <b>Judul:</b>
              ${escapeHTML(judul)}
            </p>

            <p>
              <b>Tanggal:</b>
              ${escapeHTML(
                formatTanggalIndonesia(tanggal)
              )}
            </p>

            <p>
              <b>Isi:</b>
              ${escapeHTML(isi)}
            </p>

            <p>
              <b>Penjelasan:</b>
              ${escapeHTML(penjelasan)}
            </p>

            <p>
              <b>Gambar:</b>
              ${
                gambar
                  ? escapeHTML(gambar.name)
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

    await Swal.fire({
      title: "Berhasil 🎉",
      text: "Informasi berhasil diperbarui.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });

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

      formData.append(
        "tanggal",
        tanggal
      );

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

      const contentType =
        response.headers.get(
          "content-type"
        );

      let result = {};

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        result =
          await response.json();
      }

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
      // RESET
      // ==================================================
      idInformasiEdit = null;

      gambarEdit.value = "";

      previewGambarEdit.src = "";

      previewGambarEdit.classList.add(
        "hidden"
      );

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

    idInformasiEdit = null;
    tanggalEditPicker.clear();

    await loadInformasi();
  } catch (error) {
    console.error("Error edit informasi:", error);

    Swal.fire({
      icon: "error",
      title: "Gagal Memperbarui",
      text: error.message,
    });
  }
};

// ==================================================
// 26. LOAD DATA SAAT HALAMAN DIBUKA
// ==================================================
loadInformasi();
