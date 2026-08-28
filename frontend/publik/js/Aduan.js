document.addEventListener("DOMContentLoaded", function () {
  let aduanSaya = [];
  const escapeHTML = (value = "") => {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
  };

  if (window.AuthSession?.isAuthenticated()) {
    tampilkanAduan();
  }
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
      mobileMenu.classList.add("max-h-0", "opacity-0");
      mobileMenu.classList.remove("max-h-[600px]", "opacity-100");
      menuBtn.textContent = "menu";
    }
  });

  document.addEventListener("click", (e) => {
    if (
      isOpen &&
      !mobileMenu.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      mobileMenu.classList.add("max-h-0", "opacity-0");
      mobileMenu.classList.remove("max-h-[600px]", "opacity-100");
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
  // Judul memakai animasi loop CSS seperti Administrasi Persuratan;
  // deskripsi masuk satu kali dari kiri.
  const heroItems = document.querySelectorAll(".hero-item");

  const showHeroItems = () => {
    heroItems.forEach((item, i) => {
      setTimeout(() => {
        item.classList.remove("opacity-0", "-translate-x-16");
      }, i * 200);
    });
  };

  if (document.readyState === "complete") {
    showHeroItems();
  } else {
    window.addEventListener("load", showHeroItems, { once: true });
  }

  // ================= ANIMASI FOOTER =================
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

  // ================= ANIMASI CARD ADUAN =================
  const cardAduan = document.getElementById("cardAduan");

  window.addEventListener("scroll", () => {
    const trigger = window.innerHeight;

    if (cardAduan.getBoundingClientRect().top < trigger - 100) {
      cardAduan.classList.remove("opacity-0", "translate-y-16", "scale-95");
    }
  });

  // ================= VALIDASI FILE =================
  const fileUpload = document.getElementById("fileUpload");

  fileUpload.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert("File harus JPG, PNG, atau PDF!");
      this.value = "";
      return;
    }

    if (file.size > maxSize) {
      alert("Ukuran maksimal 2MB!");
      this.value = "";
    }
  });

  // ================= PREVIEW IMAGE =================
  const preview = document.getElementById("previewImage");

  fileUpload.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      preview.classList.add("hidden");
      return;
    }

    if (file.size > maxSize) {
      preview.classList.add("hidden");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });

  // ================= ANIMASI PUBLIKASI =================
  const cards = document.querySelectorAll(".pub-card");

  if (cards.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 },
    );

    cards.forEach((card, i) => {
      observer.observe(card);
      card.style.transitionDelay = `${i * 0.15}s`;
    });
  }

  // ================= MODAL LOGIN WAJIB =================
  const modal = document.getElementById("loginModal");
  const box = document.getElementById("modalBox");
  const btnLogin = document.getElementById("btnLogin");
  const btnTutupLogin = document.getElementById("btnTutupLogin");

  function tampilkanLoginModal() {
    modal.classList.remove("opacity-0", "pointer-events-none");
    box.classList.remove("scale-95");
    box.classList.add("scale-100");
  }

  function tutupLoginModal() {
    modal.classList.add("opacity-0", "pointer-events-none");
    box.classList.remove("scale-100");
    box.classList.add("scale-95");
  }

  // Guest boleh melihat halaman, tetapi form tetap terkunci.
  if (!window.AuthSession?.isAuthenticated()) {
    tampilkanLoginModal();
  }

  // tombol login → redirect
  btnLogin.addEventListener("click", () => {
    window.AuthSession?.requireLogin("/Aduan");
  });

  btnTutupLogin.addEventListener("click", tutupLoginModal);

  // klik luar modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      tutupLoginModal();
    }
  });

  // ================= FORM ADUAN =================
  const formAduan = document.getElementById("formAduan");

  if (!window.AuthSession?.isAuthenticated()) {
    const lockNotice = document.createElement("div");
    lockNotice.className =
      "mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900";
    lockNotice.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined" aria-hidden="true">lock</span>
        <div class="flex-1">
          <p class="font-semibold">Form aduan terkunci untuk guest.</p>
          <p class="mt-1">Login dengan akun warga terdaftar untuk mengisi layanan ini.</p>
          <button type="button" id="btnLoginDariForm"
            class="mt-3 rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
            Login Warga
          </button>
        </div>
      </div>`;
    formAduan.parentElement.insertBefore(lockNotice, formAduan);
    formAduan.querySelectorAll("input, textarea, button").forEach((control) => {
      control.disabled = true;
      control.setAttribute("aria-disabled", "true");
    });
    document.getElementById("btnLoginDariForm").addEventListener("click", tampilkanLoginModal);
  }

  formAduan.addEventListener("submit", async function (e) {
    e.preventDefault();

    // 1. CEK TOKEN LOGIN
    const session = window.AuthSession?.get();
    if (!session) {
      tampilkanLoginModal();
      return;
    }
    const token = session.token;

    const nama = document.getElementById("nama").value.trim();
    const email = document.getElementById("email").value.trim();
    const no_wa = document.getElementById("no_wa").value.trim();
    const judul = document.getElementById("judul").value.trim();
    const isi = document.getElementById("isi").value.trim();
    const bukti = document.getElementById("fileUpload").files[0];

    // ================= VALIDASI KOSONG =================
    let kosong = [];

    document.querySelectorAll("#formAduan input, #formAduan textarea").forEach((el) => {
      el.classList.remove("border-red-500");
    });

    if (!nama) { kosong.push("Nama"); document.getElementById("nama").classList.add("border-red-500"); }
    if (!email) { kosong.push("Email"); document.getElementById("email").classList.add("border-red-500"); }
    if (!no_wa) { kosong.push("No. WhatsApp"); document.getElementById("no_wa").classList.add("border-red-500"); }
    if (!judul) { kosong.push("Judul Aduan"); document.getElementById("judul").classList.add("border-red-500"); }
    if (!isi) { kosong.push("Isi Aduan"); document.getElementById("isi").classList.add("border-red-500"); }
    if (!bukti) { kosong.push("Bukti Aduan"); document.getElementById("fileUpload").classList.add("border-red-500"); }

    if (kosong.length > 0) {
      Swal.fire({
        title: "Form Belum Lengkap ⚠️",
        html: `
          <div style="text-align:center;">
            <p style="margin-bottom:8px;">Kolom berikut masih kosong:</p>
            <ul style="list-style-position: inside; padding:0; margin:0;">
              ${kosong.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </div>
        `,
        icon: "warning",
        background: "#f0fff4",
        color: "#2e7d32",
        confirmButtonColor: "#2e7d32",
      });
      return;
    }

    // ================= KONFIRMASI DATA =================
    Swal.fire({
      title: "Konfirmasi Aduan ❓",
      html: `
      <div style="text-align:left;font-size:13px;color:#2e7d32">
        <b>Nama:</b> ${escapeHTML(nama)}<br>
        <b>Email:</b> ${escapeHTML(email)}<br>
        <b>No. WhatsApp:</b> ${escapeHTML(no_wa)}<br>
        <b>Judul:</b> ${escapeHTML(judul)}<br>
        <b>Isi:</b> ${escapeHTML(isi)}
      </div>
      <br><b>Apakah data sudah benar?</b>
    `,
      icon: "question",
      background: "#f0fff4",
      color: "#2e7d32",
      showCancelButton: true,
      confirmButtonText: "Ya, Kirim",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#d33",
    }).then(async (result) => {
      
      if (result.isConfirmed) {
        
        // Tampilkan efek loading
        Swal.fire({
          title: 'Mengirim Aduan...',
          text: 'Mohon tunggu sebentar',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        try {
          // 2. BUNGKUS DATA KE FORMDATA
          const formData = new FormData();
          formData.append("nama_pelapor", nama);
          formData.append("email_pelapor", email);
          formData.append("no_wa", no_wa);
          formData.append("judul_aduan", judul);
          formData.append("isi_aduan", isi);
          formData.append("file_bukti", bukti);

          // 3. KIRIM KE BACKEND BESERTA TOKEN
          const response = await fetch(`${window.API_BASE_URL}/aduan`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}` // Ini kuncinya agar lolos verifyToken
            },
            body: formData,
          });

          const resultData = await response.json();

          if (!response.ok) {
            throw new Error(resultData.message || 'Gagal mengirim aduan ke server');
          }

          // 4. ALERT BERHASIL
          Swal.fire({
            title: "Berhasil 🎉",
            text: "Aduan Anda telah dikirim",
            icon: "success",
            background: "#f0fff4",
            color: "#2e7d32",
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
          });

          // Reset Form
          formAduan.reset();
          document.getElementById("previewImage").classList.add("hidden");
          
          // Kosongkan value file input secara manual
          document.getElementById("fileUpload").value = "";

          await tampilkanAduan();

        } catch (error) {
          console.error("Error submit aduan:", error);
          Swal.fire("Gagal!", error.message, "error");
        }
      }
    });
  });

  // ================= TAMPILKAN ADUAN =================
  async function tampilkanAduan() {
    const container = document.getElementById("trackAduan");
    const list = document.getElementById("listAduan");
    const session = window.AuthSession?.get();

    if (!session || !container || !list) return;

    try {
      const response = await fetch(`${window.API_BASE_URL}/aduan/saya`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Riwayat aduan gagal dimuat.");
      }
      aduanSaya = result.data || [];
    } catch (error) {
      console.error("Gagal memuat riwayat aduan:", error);
      container.classList.remove("hidden");
      list.innerHTML = `<p class="rounded-lg bg-red-50 p-4 text-center text-red-700">${escapeHTML(error.message)}</p>`;
      return;
    }

    container.classList.remove("hidden");
    list.innerHTML = "";

    if (!aduanSaya.length) {
      list.innerHTML = '<p class="rounded-lg bg-gray-50 p-4 text-center text-gray-500">Belum ada riwayat aduan.</p>';
      cekStatusForm();
      return;
    }

    aduanSaya.forEach((item, i) => {
      const icon =
        item.status === "Selesai"
          ? `<span class="material-symbols-outlined text-green-600">check_circle</span>`
          : `<span class="material-symbols-outlined text-yellow-500">hourglass_top</span>`;

      const statusColor =
        item.status === "Selesai"
          ? "bg-green-200 text-green-800"
          : "bg-yellow-200 text-yellow-800";

      list.innerHTML += `
        <div class="bg-gray-100 p-4 rounded-lg shadow opacity-0 translate-y-6 transition-all duration-700"
            style="animation: fadeInUp 0.5s ease forwards; animation-delay:${i * 0.1}s">

          <div class="flex justify-between items-center mb-2">

            <div class="flex items-center gap-2">
              ${icon}
              <h4 class="font-bold text-green-700">${escapeHTML(item.judul_aduan)}</h4>
            </div>

            <span class="text-xs px-2 py-1 rounded ${statusColor}">
              ${escapeHTML(item.status)}
            </span>

          </div>

          <p class="text-sm text-gray-600">${escapeHTML(item.isi_aduan)}</p>

          ${
            item.file_bukti_url && !item.file_bukti_is_pdf
              ? `<img src="${escapeHTML(item.file_bukti_url)}" alt="Bukti aduan" loading="lazy" decoding="async" class="mt-3 rounded-lg max-h-40 object-cover w-full">`
              : item.file_bukti_url
                ? `<a href="${escapeHTML(item.file_bukti_url)}" target="_blank" rel="noopener" class="mt-3 inline-flex text-sm font-semibold text-blue-700 hover:underline">Lihat bukti PDF</a>`
              : ""
          }

          ${item.tanggapan_admin ? `<div class="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm"><strong>Tanggapan admin:</strong><p class="mt-1">${escapeHTML(item.tanggapan_admin)}</p></div>` : ""}
          <p class="text-xs text-gray-400 mt-2">${escapeHTML(new Date(item.created_at).toLocaleString("id-ID"))}</p>

        </div>
      `;
    });
    cekStatusForm();
  }

  // ================= CEK STATUS ADUAN =================
  function cekStatusForm() {
    const form = document.getElementById("formAduan");
    const inputs = form.querySelectorAll("input, textarea, button");
    const adaAktif = aduanSaya.some((item) => ["Menunggu", "Diproses"].includes(item.status));
    inputs.forEach((el) => { el.disabled = adaAktif; });

    let notice = document.getElementById("aduanAktifNotice");
    if (adaAktif && !notice) {
      notice = document.createElement("p");
      notice.id = "aduanAktifNotice";
      notice.className = "mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900";
      notice.textContent = "Aduan sebelumnya masih aktif. Form akan terbuka kembali setelah statusnya Selesai.";
      form.parentElement.insertBefore(notice, form);
    } else if (!adaAktif && notice) {
      notice.remove();
    }
  }

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
