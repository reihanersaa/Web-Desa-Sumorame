document.addEventListener("DOMContentLoaded", function () {
  function initDatePicker() {
    flatpickr(".datepicker", {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d F Y",
      allowInput: true,
    });
  }

  let currentJenis = null; // buat nyimpen jenis surat yang lagi kebuka, dipake pas submit

  window.addEventListener("load", () => {
    const jenisPending = localStorage.getItem("jenisDipilih");
    if (jenisPending && window.AuthSession?.isAuthenticated()) {
      localStorage.removeItem("jenisDipilih");
      tampilForm(jenisPending);
    }
  });

  // ================= LOGIN MODAL =================
  const loginModal = document.getElementById("loginModal");
  const loginBox = document.getElementById("loginBox");
  const btnLogin = document.getElementById("btnLogin");
  const closeLoginModal = document.getElementById("closeLoginModal");

  btnLogin.addEventListener("click", () => {
    window.AuthSession?.requireLogin("/AdminP");
  });

  function tutupLoginModal() {
    loginModal.classList.add("opacity-0", "pointer-events-none");
    loginBox.classList.remove("scale-100");
    loginBox.classList.add("scale-95");
  }

  closeLoginModal.addEventListener("click", tutupLoginModal);

  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) tutupLoginModal();
  });

  // ================= NAVBAR MOBILE =================
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  let isOpen = false;

  menuBtn.addEventListener("click", () => {
    isOpen = !isOpen;

    if (isOpen) {
      mobileMenu.classList.remove("max-h-0", "opacity-0");
      mobileMenu.classList.add("max-h-[600px]", "opacity-100");
      menuBtn.textContent = "close";
    } else {
      mobileMenu.classList.remove("max-h-[600px]", "opacity-100");
      mobileMenu.classList.add("max-h-0", "opacity-0");
      menuBtn.textContent = "menu";
    }
  });

  document.addEventListener("click", (e) => {
    if (
      isOpen &&
      !mobileMenu.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      mobileMenu.classList.remove("max-h-[600px]", "opacity-100");
      mobileMenu.classList.add("max-h-0", "opacity-0");
      menuBtn.textContent = "menu";
      isOpen = false;
    }
  });

  // ================= ANIMASI NAVBAR =================
  const navItems = document.querySelectorAll(".nav-item");

  window.addEventListener("load", () => {
    navItems.forEach((item, i) => {
      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, i * 100);
    });
  });

  // ================= ANIMASI HERO =================
  const heroItems = document.querySelectorAll(".hero-item");

  window.addEventListener("load", () => {
    heroItems.forEach((item, i) => {
      setTimeout(() => {
        item.classList.remove("opacity-0", "-translate-x-16");
      }, i * 200);
    });
  });

  // ================= FOOTER =================
  const footer = document.getElementById("footer");
  const footerItems = document.querySelectorAll(".footer-item");
  const kontakItems = document.querySelectorAll(".kontak-item");

  window.addEventListener("scroll", () => {
    const trigger = window.innerHeight;

    if (footer.getBoundingClientRect().top < trigger - 100) {
      footer.classList.remove("opacity-0", "translate-y-10");

      footerItems.forEach((item, i) => {
        setTimeout(() => {
          item.classList.remove("opacity-0", "translate-y-6");
        }, i * 200);
      });

      kontakItems.forEach((item, i) => {
        setTimeout(() => {
          item.classList.remove(
            "opacity-0",
            "-translate-y-6",
            "-translate-x-10",
            "translate-x-10",
            "translate-y-10",
          );
        }, i * 200);
      });
    }
  });

  // ================= SUARA NAVBAR =================
  navItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      const text = item.textContent.trim();
      if (!text) return;

      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = "id-ID";

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(speech);
    });
  });

  // ================= Tutup Modal =================
  window.tutupModal = function () {
    modal.classList.add("opacity-0", "pointer-events-none");
    modalContent.classList.remove("scale-100");
    modalContent.classList.add("scale-95");
  };

  // ================= MODAL FORM =================
  const modal = document.getElementById("modalForm");
  const modalContent = document.getElementById("modalContent");
  const judul = document.getElementById("judulForm");
  const isiForm = document.getElementById("isiForm");

  window.tampilForm = function (jenis) {
    // 🔒 CEK LOGIN
    currentJenis = jenis;
    if (!window.AuthSession?.isAuthenticated()) {
      localStorage.setItem("jenisDipilih", jenis);
      // simpen jenis surat aktif buat dipake pas submit
      setTimeout(() => {
        initDatePicker();
      }, 100);

      loginModal.classList.remove("opacity-0", "pointer-events-none");
      loginBox.classList.remove("scale-95");
      loginBox.classList.add("scale-100");
      return;
    }

    setTimeout(() => {
      initDatePicker();
    }, 100);

    isiForm.innerHTML = "";
    // ================= TEMPLATE FIELD =================
    function inputText(id, label, placeholder) {
      return `
        <div class="mb-4">
          <label>${label}</label>
          <input type="text" id="${id}" class="w-full border p-2 rounded" placeholder="${placeholder}">
        </div>`;
    }

    function inputNIK() {
      return `
        <div class="mb-4">
          <label>Nomor Induk Kependudukan (NIK)*</label>
          <input type="text" id="nik" class="w-full border p-2 rounded" placeholder="Masukkan NIK">
          <small class="text-xs text-gray-500">Masukkan NIK berupa angka 16 digit (3515135552450008)</small>
        </div>`;
    }

    function inputNoKK() {
      return `
        <div class="mb-4">
          <label>Nomor Kartu Keluarga (No KK)</label>
          <input type="text" id="nokk" class="w-full border p-2 rounded" placeholder="Masukkan No KK">
          <small class="text-xs text-gray-500">Masukkan No KK berupa angka 16 digit</small>
        </div>`;
    }

    function textarea(id, label, placeholder) {
      return `
        <div class="mb-4">
          <label>${label}</label>
          <textarea id="${id}" class="w-full border p-2 rounded" placeholder="${placeholder}"></textarea>
        </div>`;
    }

    function select(id, label, options) {
      return `
        <div class="mb-4">
          <label>${label}</label>
          <select id="${id}" class="w-full border p-2 rounded">
            <option value="">Pilih ${label}</option>
            ${options.map((o) => `<option>${o}</option>`).join("")}
          </select>
        </div>`;
    }

    function inputDate(id, label) {
      return `
        <div class="mb-4">
          <label>${label}</label>
          <input type="text" id="${id}" class="w-full border p-2 rounded datepicker" placeholder="DD-MM-YYYY">
        </div>`;
    }

    // ================= FORM PER JENIS =================

    if (jenis === "domisili") {
      judul.textContent = "Form Surat Keterangan Domisili";

      isiForm.innerHTML += inputNIK();
      isiForm.innerHTML += inputText(
        "nama",
        "Nama Lengkap Pemohon",
        "Masukkan Nama",
      );
      isiForm.innerHTML += select("kota", "Tempat Lahir", [
        "Surabaya",
        "Sidoarjo",
        "Malang",
      ]);
      isiForm.innerHTML += inputDate("tgl", "Tanggal Lahir");
      isiForm.innerHTML += select("agama", "Agama", [
        "Islam",
        "Kristen",
        "Hindu",
        "Budha",
      ]);
      isiForm.innerHTML += inputText("nohp", "Nomor HP", "Masukkan No HP");
      isiForm.innerHTML += inputText("email", "Email", "Masukkan Email");
      isiForm.innerHTML += select("jk", "Jenis Kelamin", [
        "Laki-laki",
        "Perempuan",
      ]);
      isiForm.innerHTML += select("status", "Status Nikah", [
        "Belum Kawin",
        "Kawin",
      ]);
      isiForm.innerHTML += inputText(
        "pekerjaan",
        "Pekerjaan",
        "Masukkan Pekerjaan",
      );
      isiForm.innerHTML += textarea(
        "alamat",
        "Alamat Lengkap",
        "Masukkan Alamat",
      );
      isiForm.innerHTML += inputText(
        "warga",
        "Warga Negara",
        "Masukkan Kewarganegaraan",
      );
    } else if (jenis === "kehilangan") {
      judul.textContent = "Form Surat Keterangan Kehilangan";

      isiForm.innerHTML += inputNIK();
      isiForm.innerHTML += inputText("nama", "Nama Lengkap", "Masukkan Nama");
      isiForm.innerHTML += inputText("nohp", "No HP", "Masukkan No HP");
      isiForm.innerHTML += inputText("email", "Email", "Masukkan Email");
      isiForm.innerHTML += inputText("umur", "Umur", "Masukkan Umur");
      isiForm.innerHTML += inputText(
        "pekerjaan",
        "Pekerjaan",
        "Masukkan Pekerjaan",
      );
      isiForm.innerHTML += textarea("alamat", "Alamat", "Masukkan Alamat");
      isiForm.innerHTML += textarea(
        "catatan",
        "Catatan Kehilangan",
        "Masukkan Catatan",
      );
    } else if (jenis === "tanah") {
      judul.textContent = "Form Surat Keterangan Harga Tanah";

      isiForm.innerHTML += inputNIK();
      isiForm.innerHTML += inputText("nama", "Nama Lengkap", "Masukkan Nama");
      isiForm.innerHTML += inputText("nohp", "No HP", "Masukkan No HP");
      isiForm.innerHTML += inputText("email", "Email", "Masukkan Email");
      isiForm.innerHTML += inputText("umur", "Umur", "Masukkan Umur");
      isiForm.innerHTML += inputText(
        "pekerjaan",
        "Pekerjaan",
        "Masukkan Pekerjaan",
      );
      isiForm.innerHTML += textarea("alamat", "Alamat", "Masukkan Alamat");
      isiForm.innerHTML += inputText("catatan", "Catatan", "Masukkan Catatan");
    } else if (jenis === "tidakmampu") {
      judul.textContent = "Form Surat Keterangan Tidak Mampu";

      isiForm.innerHTML += inputNIK();
      isiForm.innerHTML += inputNoKK();
      isiForm.innerHTML += inputText("nama", "Nama Lengkap", "Masukkan Nama");
      isiForm.innerHTML += inputDate("tgl", "Tanggal Lahir");
      isiForm.innerHTML += select("agama", "Agama", [
        "Islam",
        "Kristen",
        "Hindu",
        "Budha",
      ]);
      isiForm.innerHTML += inputText("nohp", "No HP", "Masukkan No HP");
      isiForm.innerHTML += inputText("email", "Email", "Masukkan Email");
      isiForm.innerHTML += select("jk", "Jenis Kelamin", [
        "Laki-laki",
        "Perempuan",
      ]);
      isiForm.innerHTML += select("status", "Status Nikah", [
        "Belum Kawin",
        "Kawin",
      ]);
      isiForm.innerHTML += inputText(
        "pekerjaan",
        "Pekerjaan",
        "Masukkan Pekerjaan",
      );
      isiForm.innerHTML += textarea("alamat", "Alamat", "Masukkan Alamat");
      isiForm.innerHTML += inputText("dusun", "Dusun", "Masukkan Dusun");

      isiForm.innerHTML += inputText(
        "kepala",
        "Nama Kepala Keluarga",
        "Masukkan Nama",
      );
      isiForm.innerHTML += inputText(
        "tempat",
        "Tempat Lahir Kepala Keluarga",
        "Masukkan Tempat",
      );
      isiForm.innerHTML += inputDate(
        "tgl_kepala",
        "Tanggal Lahir Kepala Keluarga",
      );
      isiForm.innerHTML += select(
        "jk_kepala",
        "Jenis Kelamin Kepala Keluarga",
        ["Laki-laki", "Perempuan"],
      );
      isiForm.innerHTML += select(
        "status_kepala",
        "Status Kawin Kepala Keluarga",
        ["Kawin", "Belum"],
      );
      isiForm.innerHTML += select("agama_kepala", "Agama Kepala Keluarga", [
        "Islam",
        "Kristen",
      ]);
      isiForm.innerHTML += inputText(
        "kerja",
        "Pekerjaan Kepala Keluarga",
        "Masukkan Pekerjaan",
      );
    }

    // ================= TAMPILKAN MODAL =================
    modal.classList.remove("opacity-0", "pointer-events-none");
    modalContent.classList.remove("scale-95");
    modalContent.classList.add("scale-100");
  };

  // ================= TUTUP MODAL =================
  document.getElementById("overlay").addEventListener("click", () => {
    modal.classList.add("opacity-0", "pointer-events-none");
    modalContent.classList.remove("scale-100");
    modalContent.classList.add("scale-95");
  });

  // ================= SUBMIT =================
  document.getElementById("btnKirim").addEventListener("click", function () {
    // Ambil SEMUA field (input, select, textarea) di dalam form, bukan cuma <input>
    const fields = document.querySelectorAll(
      "#isiForm input, #isiForm select, #isiForm textarea",
    );
    let kosong = false;
    const data_form = {};

    fields.forEach((field) => {
      if (!field.value.trim()) kosong = true;
      data_form[field.id] = field.value.trim();
    });

    if (kosong) {
      Swal.fire({
        title: "Peringatan!",
        text: "Semua field wajib diisi",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
        background: "#fff5f5",
        color: "#b91c1c",
      });
      return;
    }

    const session = window.AuthSession?.get();
    if (!session) {
      Swal.fire({
        title: "Sesi Habis",
        text: "Silakan login ulang sebelum mengajukan surat.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      return;
    }
    const token = session.token;

    // judul_surat wajib diisi di backend, kita generate otomatis
    const namaPemohon = data_form.nama || data_form.kepala || "Warga";
    const judul_surat = `${judul.textContent} - ${namaPemohon}`;

    fetch(`${window.API_BASE_URL}/surat/ajukan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        judul_surat,
        jenis_surat: currentJenis,
        data_form,
      }),
    })
      .then((res) => res.json().then((result) => ({ ok: res.ok, result })))
      .then(({ ok, result }) => {
        if (ok && result.success) {
          Swal.fire({
            title: "Berhasil! 🎉",
            text: "Pengajuan surat berhasil dikirim.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
            background: "#f0fff4",
            color: "#2e7d32",
          }).then(() => {
            window.tutupModal();
          });
        } else {
          Swal.fire({
            title: "Gagal",
            text: result.message || "Terjadi kesalahan saat mengirim surat.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        Swal.fire({
          title: "Error",
          text: "Gagal terhubung ke server backend.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      });
  });

  // ===============================
  // HEADER HILANG HANYA DI PALING ATAS
  // ===============================

  const mainHeader = document.getElementById("mainHeader");
  const heroSection = document.getElementById("heroSection");

  window.addEventListener("scroll", function () {
    if (window.scrollY <= 0) {
      // Navbar hilang
      mainHeader.classList.add("header-hidden");

      // Hero langsung naik menutup celah
      heroSection.classList.add("hero-top");
    } else {
      // Navbar muncul
      mainHeader.classList.remove("header-hidden");

      // Hero kembali ke posisi normal
      heroSection.classList.remove("hero-top");
    }
  });

  // ======================
  // SCROLL TO TOP
  // ======================

  const scrollTopBtn = document.getElementById("scrollTopBtn");

  // Tampilkan tombol saat scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }
  });

  // Klik tombol
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});
