document.addEventListener("DOMContentLoaded", function () {
  tampilkanAduan();
  cekStatusForm();
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
  const heroItems = document.querySelectorAll(".hero-item");

  window.addEventListener("load", () => {
    heroItems.forEach((item, i) => {
      setTimeout(() => {
        item.classList.remove("opacity-0", "-translate-x-16");
      }, i * 200);
    });
  });

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

  // 🚨 LANGSUNG CEK LOGIN SAAT MASUK HALAMAN
  if (!localStorage.getItem("login")) {
    modal.classList.remove("opacity-0", "pointer-events-none");
    box.classList.remove("scale-95");
    box.classList.add("scale-100");
  }

  // tombol login → redirect
  btnLogin.addEventListener("click", () => {
    window.location.href = "login.html";
  });

  // klik luar modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("opacity-0", "pointer-events-none");
      box.classList.remove("scale-100");
      box.classList.add("scale-95");
    }
  });

  // ================= FORM ADUAN =================
  const formAduan = document.getElementById("formAduan");

  formAduan.addEventListener("submit", async function (e) {
    e.preventDefault();

    // 1. CEK TOKEN LOGIN
    // Pastikan "token" adalah nama key yang kamu gunakan saat menyimpan JWT di localStorage saat proses Login Warga
    const token = localStorage.getItem("token"); 
    
    if (!token) {
      modal.classList.remove("opacity-0", "pointer-events-none");
      box.classList.remove("scale-95");
      box.classList.add("scale-100");
      return;
    }

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
        <b>Nama:</b> ${nama}<br>
        <b>Email:</b> ${email}<br>
        <b>No. WhatsApp:</b> ${no_wa}<br>
        <b>Judul:</b> ${judul}<br>
        <b>Isi:</b> ${isi}
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
          const response = await fetch("http://localhost:3000/api/aduan", {
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

          // Panggil fungsi untuk merender ulang daftar aduan di halaman warga jika ada
          // tampilkanAduan(); 

        } catch (error) {
          console.error("Error submit aduan:", error);
          Swal.fire("Gagal!", error.message, "error");
        }
      }
    });
  });

  // ================= TAMPILKAN ADUAN =================
  function tampilkanAduan() {
    const container = document.getElementById("trackAduan");
    const list = document.getElementById("listAduan");

    const data = JSON.parse(localStorage.getItem("aduan")) || [];

    if (data.length === 0) return;

    container.classList.remove("hidden");
    list.innerHTML = "";

    data.reverse().forEach((item, i) => {
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
              <h4 class="font-bold text-green-700">${item.judul}</h4>
            </div>

            <span class="text-xs px-2 py-1 rounded ${statusColor}">
              ${item.status}
            </span>

          </div>

          <p class="text-sm text-gray-600">${item.isi}</p>

          ${
            item.gambar
              ? `<img src="${item.gambar}" class="mt-3 rounded-lg max-h-40 object-cover w-full">`
              : ""
          }

          <p class="text-xs text-gray-400 mt-2">${item.tanggal}</p>

          <button onclick="ubahStatus(${data.length - 1 - i})"
            class="mt-2 text-xs text-blue-600 hover:underline">
            Tandai Selesai
          </button>

        </div>
      `;
    });
  }

  // ================= UBAH STATUS ADUAN =================
  function ubahStatus(index) {
    let data = JSON.parse(localStorage.getItem("aduan")) || [];

    data[index].status = "Selesai";

    localStorage.setItem("aduan", JSON.stringify(data));

    tampilkanAduan();
    cekStatusForm(); // ⬅️ update kondisi form
  }

  // ================= CEK STATUS ADUAN =================
  function cekStatusForm() {
    const data = JSON.parse(localStorage.getItem("aduan")) || [];

    const form = document.getElementById("formAduan");
    const inputs = form.querySelectorAll("input, textarea, button");

    // cek apakah ada aduan yang masih diproses
    const adaDiproses = data.some((item) => item.status === "Diproses");

    if (adaDiproses) {
      // FORM DIKUNCI
      inputs.forEach((el) => (el.disabled = true));

      Swal.fire({
        title: "Aduan Sedang Diproses",
        text: "Anda tidak bisa mengirim aduan baru sebelum aduan sebelumnya selesai.",
        icon: "warning",
      });
    } else {
      // FORM AKTIF
      inputs.forEach((el) => (el.disabled = false));
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
