/* =========================================================
   PPID.js
   ADMIN PPID - WEBSITE DESA SUMORAME
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  // =====================================================
  // KONFIGURASI API
  // =====================================================
  const API_BASE_URL = "http://localhost:3000";

  const API = {
    struktur: `${API_BASE_URL}/api/ppid`,
    updateStruktur: `${API_BASE_URL}/api/ppid/struktur`,
    pdf: `${API_BASE_URL}/api/ppid/pdf`,
    hapusPDF: (id) => `${API_BASE_URL}/api/ppid/pdf/${id}`
  };


  // =====================================================
  // TOKEN ADMIN
  // =====================================================
  function getToken() {
    return localStorage.getItem("token");
  }


  // =====================================================
  // ELEMENT STRUKTUR PPID
  // =====================================================
  const formStruktur = document.getElementById("formStruktur");
  const inputStruktur = document.getElementById("inputStruktur");
  const previewStruktur = document.getElementById("previewStruktur");
  const btnSimpanStruktur = document.getElementById("btnSimpanStruktur");
  const textBtnStruktur = document.getElementById("textBtnStruktur");


  // =====================================================
  // ELEMENT PDF
  // =====================================================
  const daftarPDF = document.getElementById("daftarPDF");

  const btnTambahPDF = document.getElementById("btnTambahPDF");
  const modalTambahPDF = document.getElementById("modalTambahPDF");
  const modalPDFBox = document.getElementById("modalPDFBox");

  const closeModalPDF = document.getElementById("closeModalPDF");
  const btnBatalPDF = document.getElementById("btnBatalPDF");

  const formTambahPDF = document.getElementById("formTambahPDF");
  const judulPDF = document.getElementById("judulPDF");
  const inputFilePDF = document.getElementById("inputFilePDF");
  const namaFilePDF = document.getElementById("namaFilePDF");

  const btnSimpanPDF = document.getElementById("btnSimpanPDF");
  const textBtnUploadPDF = document.getElementById("textBtnUploadPDF");


  // =====================================================
  // HELPER
  // =====================================================

  function formatFileSize(bytes) {
    if (!bytes) return "0 KB";

    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, index);

    return `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
  }


  function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function getFileURL(path) {
    if (!path) return "";

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    if (path.startsWith("/")) {
      return `${API_BASE_URL}${path}`;
    }

    return `${API_BASE_URL}/${path}`;
  }


  async function parseResponse(response) {
    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error("Response server tidak valid.");
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
        result.error ||
        `Terjadi kesalahan. HTTP ${response.status}`
      );
    }

    return result;
  }


  function cekToken() {
    const token = getToken();

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Sesi login tidak ditemukan",
        text: "Silakan login kembali sebagai admin."
      });

      return null;
    }

    return token;
  }


  // =====================================================
  // MODAL PDF
  // =====================================================

  function bukaModalPDF() {
    if (!modalTambahPDF || !modalPDFBox) return;

    modalTambahPDF.classList.remove("hidden");
    modalTambahPDF.classList.add("opacity-0");

    modalPDFBox.classList.remove("scale-100", "opacity-100");
    modalPDFBox.classList.add("scale-90", "opacity-0");

    requestAnimationFrame(() => {
      modalTambahPDF.classList.remove("opacity-0");

      modalPDFBox.classList.remove("scale-90", "opacity-0");
      modalPDFBox.classList.add("scale-100", "opacity-100");
    });

    setTimeout(() => {
      judulPDF?.focus();
    }, 200);
  }


  function tutupModalPDF() {
    if (!modalTambahPDF || !modalPDFBox) return;

    modalTambahPDF.classList.add("opacity-0");

    modalPDFBox.classList.remove("scale-100", "opacity-100");
    modalPDFBox.classList.add("scale-90", "opacity-0");

    setTimeout(() => {
      modalTambahPDF.classList.add("hidden");
      resetFormPDF();
    }, 300);
  }


  function resetFormPDF() {
    formTambahPDF?.reset();

    if (namaFilePDF) {
      namaFilePDF.textContent = "";
      namaFilePDF.classList.add("hidden");
    }
  }


  btnTambahPDF?.addEventListener("click", bukaModalPDF);
  closeModalPDF?.addEventListener("click", tutupModalPDF);
  btnBatalPDF?.addEventListener("click", tutupModalPDF);


  modalTambahPDF?.addEventListener("click", (event) => {
    if (event.target === modalTambahPDF) {
      tutupModalPDF();
    }
  });


  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      modalTambahPDF &&
      !modalTambahPDF.classList.contains("hidden")
    ) {
      tutupModalPDF();
    }
  });


  // =====================================================
  // PREVIEW GAMBAR STRUKTUR
  // =====================================================

  inputStruktur?.addEventListener("change", () => {
    const file = inputStruktur.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      inputStruktur.value = "";

      Swal.fire({
        icon: "warning",
        title: "Format tidak sesuai",
        text: "Gunakan gambar JPG, PNG, atau WEBP."
      });

      return;
    }

    if (file.size > maxSize) {
      inputStruktur.value = "";

      Swal.fire({
        icon: "warning",
        title: "Ukuran terlalu besar",
        text: "Ukuran gambar maksimal 2 MB."
      });

      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      if (previewStruktur) {
        previewStruktur.src = event.target.result;
      }
    };

    reader.readAsDataURL(file);
  });


  // =====================================================
  // AMBIL STRUKTUR PPID
  // GET /api/ppid
  // =====================================================

  async function loadStruktur() {
    if (!previewStruktur) return;

    try {
      const response = await fetch(API.struktur, {
        method: "GET"
      });

      const result = await parseResponse(response);

      const struktur =
        result.struktur ||
        result.gambar_struktur ||
        result.data?.struktur ||
        result.data?.gambar_struktur ||
        result.data?.file;

      if (struktur) {
        previewStruktur.src = getFileURL(struktur);
      }

    } catch (error) {
      console.error(
        "Gagal mengambil struktur PPID:",
        error
      );
    }
  }


  // =====================================================
  // SIMPAN / UPDATE STRUKTUR PPID
  // PUT /api/ppid/struktur
  // =====================================================

  formStruktur?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = cekToken();

    if (!token) return;

    const file = inputStruktur?.files[0];

    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "Gambar belum dipilih",
        text: "Silakan pilih gambar struktur terlebih dahulu."
      });

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Format tidak sesuai",
        text: "Gunakan gambar JPG, PNG, atau WEBP."
      });

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran terlalu besar",
        text: "Ukuran gambar maksimal 2 MB."
      });

      return;
    }

    const formData = new FormData();

    formData.append("struktur", file);

    try {
      setLoadingStruktur(true);

      const response = await fetch(API.updateStruktur, {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`
        },

        body: formData
      });

      const result = await parseResponse(response);

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text:
          result.message ||
          "Gambar struktur berhasil diperbarui.",
        timer: 1800,
        showConfirmButton: false
      });

      inputStruktur.value = "";

      await loadStruktur();

    } catch (error) {
      console.error(
        "Gagal update struktur PPID:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message
      });

    } finally {
      setLoadingStruktur(false);
    }
  });


  function setLoadingStruktur(status) {
    if (!btnSimpanStruktur) return;

    btnSimpanStruktur.disabled = status;

    btnSimpanStruktur.classList.toggle(
      "opacity-60",
      status
    );

    btnSimpanStruktur.classList.toggle(
      "cursor-not-allowed",
      status
    );

    if (textBtnStruktur) {
      textBtnStruktur.textContent =
        status
          ? "Menyimpan..."
          : "Simpan Gambar";
    }
  }


  // =====================================================
  // VALIDASI FILE PDF
  // =====================================================

  inputFilePDF?.addEventListener("change", () => {
    const file = inputFilePDF.files[0];

    if (!file) {
      if (namaFilePDF) {
        namaFilePDF.textContent = "";
        namaFilePDF.classList.add("hidden");
      }

      return;
    }

    if (file.type !== "application/pdf") {
      inputFilePDF.value = "";

      Swal.fire({
        icon: "warning",
        title: "Format tidak sesuai",
        text: "File yang diperbolehkan hanya PDF."
      });

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      inputFilePDF.value = "";

      Swal.fire({
        icon: "warning",
        title: "File terlalu besar",
        text: "Ukuran maksimal PDF adalah 10 MB."
      });

      return;
    }

    if (namaFilePDF) {
      namaFilePDF.textContent =
        `${file.name} (${formatFileSize(file.size)})`;

      namaFilePDF.classList.remove("hidden");
    }
  });


  // =====================================================
  // AMBIL DAFTAR PDF
  // GET /api/ppid/pdf
  // =====================================================

  async function loadDaftarPDF() {
    if (!daftarPDF) return;

    tampilkanLoadingPDF();

    try {
      const response = await fetch(API.pdf, {
        method: "GET"
      });

      const result = await parseResponse(response);

      let data = [];

      if (Array.isArray(result)) {
        data = result;

      } else if (Array.isArray(result.data)) {
        data = result.data;

      } else if (Array.isArray(result.pdf)) {
        data = result.pdf;
      }

      renderDaftarPDF(data);

    } catch (error) {
      console.error(
        "Gagal mengambil daftar PDF:",
        error
      );

      daftarPDF.innerHTML = `
        <tr>
          <td
            colspan="4"
            class="px-4 py-10 text-center text-red-500"
          >
            <span
              class="material-symbols-outlined text-4xl"
            >
              error
            </span>

            <p class="font-semibold mt-2">
              Data gagal dimuat
            </p>

            <p class="text-xs text-gray-500 mt-1">
              ${escapeHTML(error.message)}
            </p>

            <button
              type="button"
              id="btnReloadPDF"
              class="
                mt-3
                px-4
                py-2
                bg-blue-600
                hover:bg-blue-700
                text-white
                rounded
                text-xs
              "
            >
              Muat Ulang
            </button>
          </td>
        </tr>
      `;

      document
        .getElementById("btnReloadPDF")
        ?.addEventListener(
          "click",
          loadDaftarPDF
        );
    }
  }


  function tampilkanLoadingPDF() {
    if (!daftarPDF) return;

    daftarPDF.innerHTML = `
      <tr>
        <td
          colspan="4"
          class="px-4 py-10 text-center text-gray-400"
        >
          <div
            class="flex flex-col items-center gap-2"
          >
            <span
              class="
                material-symbols-outlined
                animate-spin
                text-blue-500
              "
            >
              progress_activity
            </span>

            <span>
              Memuat data...
            </span>
          </div>
        </td>
      </tr>
    `;
  }


  // =====================================================
  // RENDER DATA PDF
  // =====================================================

  function renderDaftarPDF(data) {
    if (!daftarPDF) return;

    if (!Array.isArray(data) || data.length === 0) {
      daftarPDF.innerHTML = `
        <tr>
          <td
            colspan="4"
            class="px-4 py-12 text-center text-gray-400"
          >
            <span
              class="
                material-symbols-outlined
                text-5xl
                text-gray-300
              "
            >
              folder_off
            </span>

            <p class="font-semibold mt-2">
              Belum ada file PDF
            </p>

            <p class="text-xs">
              Klik "Tambah File PDF" untuk menambahkan file.
            </p>
          </td>
        </tr>
      `;

      return;
    }

    daftarPDF.innerHTML = "";

    data.forEach((item, index) => {
      const id =
        item.id ||
        item.id_pdf ||
        item.ppid_pdf_id;

      const judul =
        item.judul ||
        item.nama_laporan ||
        item.nama ||
        "Tanpa Judul";

      const file =
        item.file ||
        item.file_pdf ||
        item.path ||
        item.url ||
        "";

      const ukuran =
        item.ukuran ??
        item.size ??
        item.file_size ??
        0;

      const fileURL = getFileURL(file);

      const row = document.createElement("tr");

      row.className =
        "hover:bg-blue-50 border-b border-gray-100 transition-colors";

      row.innerHTML = `
        <td class="px-4 py-4 font-medium">
          ${index + 1}
        </td>

        <td
          class="px-4 py-4 font-semibold text-gray-800"
        >
          <div class="flex items-center gap-3">

            <span
              class="
                material-symbols-outlined
                text-red-500
                text-3xl
              "
            >
              picture_as_pdf
            </span>

            <span>
              ${escapeHTML(judul)}
            </span>

          </div>
        </td>

        <td
          class="px-4 py-4 text-center text-gray-500"
        >
          ${
            typeof ukuran === "string"
              ? escapeHTML(ukuran)
              : formatFileSize(Number(ukuran))
          }
        </td>

        <td class="px-4 py-4 text-center">

          <div class="inline-flex gap-2">

            <button
              type="button"
              class="
                btnLihatPDF
                bg-purple-500
                hover:bg-purple-600
                text-white
                p-1.5
                rounded
                transition
                shadow-sm
              "
              data-url="${escapeHTML(fileURL)}"
              title="Lihat PDF"
            >
              <span
                class="material-symbols-outlined text-sm"
              >
                visibility
              </span>
            </button>


            <button
              type="button"
              class="
                btnHapusPDF
                bg-red-500
                hover:bg-red-600
                text-white
                p-1.5
                rounded
                transition
                shadow-sm
              "
              data-id="${escapeHTML(id)}"
              data-judul="${escapeHTML(judul)}"
              title="Hapus PDF"
            >
              <span
                class="material-symbols-outlined text-sm"
              >
                delete
              </span>
            </button>

          </div>

        </td>
      `;

      daftarPDF.appendChild(row);
    });
  }


  // =====================================================
  // AKSI BUTTON PDF
  // =====================================================

  daftarPDF?.addEventListener("click", (event) => {

    // ================= LIHAT PDF =================
    const btnLihat =
      event.target.closest(".btnLihatPDF");

    if (btnLihat) {
      const url = btnLihat.dataset.url;

      if (!url) {
        Swal.fire({
          icon: "warning",
          title: "File tidak ditemukan",
          text: "Alamat file PDF tidak tersedia."
        });

        return;
      }

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }


    // ================= HAPUS PDF =================
    const btnHapus =
      event.target.closest(".btnHapusPDF");

    if (btnHapus) {
      const id = btnHapus.dataset.id;
      const judul = btnHapus.dataset.judul;

      hapusPDF(id, judul);
    }
  });


  // =====================================================
  // UPLOAD PDF
  // POST /api/ppid/pdf
  // =====================================================

  formTambahPDF?.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const token = cekToken();

      if (!token) return;

      const judul = judulPDF?.value.trim();
      const file = inputFilePDF?.files[0];

      if (!judul) {
        Swal.fire({
          icon: "warning",
          title: "Nama laporan kosong",
          text: "Silakan isi nama laporan."
        });

        judulPDF?.focus();
        return;
      }

      if (!file) {
        Swal.fire({
          icon: "warning",
          title: "File belum dipilih",
          text: "Silakan pilih file PDF."
        });

        return;
      }

      if (file.type !== "application/pdf") {
        Swal.fire({
          icon: "warning",
          title: "Format tidak sesuai",
          text: "File yang diperbolehkan hanya PDF."
        });

        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "File terlalu besar",
          text: "Ukuran maksimal PDF adalah 10 MB."
        });

        return;
      }

      const formData = new FormData();

      formData.append("judul", judul);
      formData.append("file_pdf", file);

      try {
        setLoadingUploadPDF(true);

        const response = await fetch(API.pdf, {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`
          },

          body: formData
        });

        const result =
          await parseResponse(response);

        tutupModalPDF();

        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text:
            result.message ||
            "PDF berhasil ditambahkan.",
          timer: 1800,
          showConfirmButton: false
        });

        await loadDaftarPDF();

      } catch (error) {
        console.error(
          "Gagal upload PDF:",
          error
        );

        Swal.fire({
          icon: "error",
          title: "Upload gagal",
          text: error.message
        });

      } finally {
        setLoadingUploadPDF(false);
      }
    }
  );


  function setLoadingUploadPDF(status) {
    if (!btnSimpanPDF) return;

    btnSimpanPDF.disabled = status;

    btnSimpanPDF.classList.toggle(
      "opacity-60",
      status
    );

    btnSimpanPDF.classList.toggle(
      "cursor-not-allowed",
      status
    );

    if (textBtnUploadPDF) {
      textBtnUploadPDF.textContent =
        status
          ? "Mengupload..."
          : "Upload";
    }
  }


  // =====================================================
  // HAPUS PDF
  // DELETE /api/ppid/pdf/:id
  // =====================================================

  async function hapusPDF(id, judul) {
    if (!id) {
      Swal.fire({
        icon: "error",
        title: "ID tidak ditemukan",
        text: "Data PDF tidak mempunyai ID."
      });

      return;
    }

    const token = cekToken();

    if (!token) return;


    const konfirmasi = await Swal.fire({
      title: "Hapus PDF?",

      html:
        `File <b>${escapeHTML(judul)}</b> akan dihapus.`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Ya, hapus",

      cancelButtonText: "Batal",

      confirmButtonColor: "#dc2626"
    });


    if (!konfirmasi.isConfirmed) return;


    try {
      Swal.fire({
        title: "Menghapus...",
        text: "Mohon tunggu.",
        allowOutsideClick: false,
        allowEscapeKey: false,

        didOpen: () => {
          Swal.showLoading();
        }
      });


      const response = await fetch(
        API.hapusPDF(id),
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      const result =
        await parseResponse(response);


      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text:
          result.message ||
          "PDF berhasil dihapus.",
        timer: 1600,
        showConfirmButton: false
      });


      await loadDaftarPDF();

    } catch (error) {
      console.error(
        "Gagal hapus PDF:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Gagal menghapus",
        text: error.message
      });
    }
  }


  // =====================================================
  // LOAD DATA SAAT HALAMAN DIBUKA
  // =====================================================
  loadStruktur();
  loadDaftarPDF();

});