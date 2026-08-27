document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // AMBIL & RENDER DATA INFORMASI DARI BACKEND
  // ===============================
  const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";

  const heroGambar = document.getElementById("heroGambar");
  const heroIsi = document.getElementById("heroIsi");
  const heroTanggal = document.getElementById("heroTanggal");
  const artikelText = document.getElementById("artikelText");
  const contentTerkini = document.getElementById("contentTerkini");

  const escapeHTML = (value = "") => {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    const tanggalBersih = String(tanggal).split("T")[0];
    const date = new Date(`${tanggalBersih}T00:00:00`);

    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Tampilkan 1 item sebagai artikel utama (hero + artikel panjang)
  function tampilkanArtikel(item) {
    heroGambar.src = item.gambar_url || "";
    heroIsi.innerText = item.isi || "-";
    heroTanggal.innerText = formatTanggal(item.tanggal);

    // "penjelasan" bisa berisi banyak paragraf dipisah baris baru,
    // pecah jadi <p> terpisah biar rapi kayak artikel asli
    const paragraf = String(item.penjelasan || "")
      .split(/\n+/)
      .filter((p) => p.trim())
      .map(
        (p) =>
          `<p class="artikel-item opacity-0 translate-y-6 transition-all duration-700 mb-4">${escapeHTML(p)}</p>`,
      )
      .join("");

    artikelText.innerHTML = paragraf;

    // Nyalakan lagi animasi scroll-reveal untuk paragraf yang baru masuk
    document.querySelectorAll(".artikel-item").forEach((el, i) => {
      setTimeout(
        () => el.classList.remove("opacity-0", "translate-y-6"),
        i * 150,
      );
    });
  }

  function renderArsip(items) {
    if (!items.length) {
      contentTerkini.innerHTML = `<p class="text-sm text-gray-400">Belum ada informasi.</p>`;
      return;
    }

    contentTerkini.innerHTML = items
      .map(
        (item) => `
      <div class="terkini-item bg-white border rounded-xl p-3 flex items-center gap-4 shadow-sm 
          hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] cursor-pointer" data-id="${item.id}">
        <img src="${item.gambar_url || ""}" alt="${escapeHTML(item.judul || "")}" class="w-16 h-16 object-cover rounded">
        <div>
          <h4 class="text-sm font-semibold">${escapeHTML(item.judul || "-")}</h4>
          <p class="text-xs text-gray-500">${formatTanggal(item.tanggal)}</p>
        </div>
      </div>`,
      )
      .join("");

    // Klik salah satu arsip -> tampilkan sebagai artikel utama di atas
    contentTerkini.querySelectorAll(".terkini-item").forEach((el) => {
      el.addEventListener("click", () => {
        const item = items.find((i) => String(i.id) === el.dataset.id);

        if (item) {
          tampilkanArtikel(item);

          document
            .querySelector(".card-kiri")
            .scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }
      });
    });
  }

  async function loadInformasi() {
    try {
      const response = await fetch(`${API_BASE_URL}/informasi`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memuat data informasi.");
      }

      const items = result.data || [];

      if (!items.length) {
        heroIsi.innerText = "Belum ada informasi yang dipublikasikan.";
        heroTanggal.innerText = "-";
        artikelText.innerHTML = "";
        renderArsip([]);
        return;
      }

      // Backend sudah urutkan created_at DESC, jadi item pertama = terbaru
      tampilkanArtikel(items[0]);
      renderArsip(items);
    } catch (error) {
      console.error("Gagal memuat informasi:", error);

      heroIsi.innerText = "Gagal memuat data informasi.";
      heroTanggal.innerText = "-";

      contentTerkini.innerHTML = `<p class="text-sm text-red-500">${escapeHTML(error.message)}</p>`;
    }
  }

  loadInformasi();

  // ===============================
  // NAVBAR MOBILE
  // ===============================
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

  // ===============================
  // ANIMASI NAVBAR
  // ===============================
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item, i) => {
    setTimeout(() => {
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, i * 100);
  });

  // ===============================
  // ANIMASI CARD UTAMA
  // ===============================
  const cardKiri = document.querySelector(".card-kiri");
  const cardKanan = document.querySelector(".card-kanan");

  function animasiCard() {
    const trigger = window.innerHeight * 0.85;

    if (cardKiri.getBoundingClientRect().top < trigger) {
      cardKiri.classList.remove("opacity-0", "-translate-x-40");
      cardKanan.classList.remove("opacity-0", "translate-x-40");
    }
  }

  window.addEventListener("scroll", animasiCard);
  animasiCard();

  // ===============================
  // NOTE: animasi fade-in untuk #artikelText dan #contentTerkini
  // sekarang ditangani langsung di tampilkanArtikel() / loadInformasi()
  // di atas, karena kontennya sekarang muncul belakangan (fetch async),
  // bukan udah ada dari awal kayak dulu waktu masih hardcoded di HTML.
  // ===============================
  const content = document.getElementById("contentTerkini");

  setTimeout(() => {
    content.classList.remove("opacity-0", "translate-x-20");
  }, 200);

  // ===============================
  // TAB TERKINI / KATEGORI
  // ===============================
  const btnTerkini = document.getElementById("btnTerkini");
  const btnKategori = document.getElementById("btnKategori");
  const contentKategori = document.getElementById("contentKategori");

  if (btnKategori) {
    btnTerkini.addEventListener("click", () => {
      contentKategori.classList.add("opacity-0", "translate-x-10");

      setTimeout(() => {
        contentKategori.classList.add("hidden");
        contentTerkini.classList.remove("hidden");

        setTimeout(() => {
          contentTerkini.classList.remove("opacity-0", "-translate-x-10");
          contentTerkini.classList.add("opacity-100", "translate-x-0");
        }, 50);
      }, 300);

      btnTerkini.classList.add("bg-yellow-400", "text-white");
      btnKategori.classList.remove("bg-yellow-400", "text-white");
      btnKategori.classList.add("text-green-700");
    });

    btnKategori.addEventListener("click", () => {
      contentTerkini.classList.add("opacity-0", "-translate-x-10");

      setTimeout(() => {
        contentTerkini.classList.add("hidden");
        contentKategori.classList.remove("hidden");

        setTimeout(() => {
          contentKategori.classList.remove("opacity-0", "translate-x-10");
          contentKategori.classList.add("opacity-100", "translate-x-0");
        }, 50);
      }, 300);

      btnKategori.classList.add("bg-yellow-400", "text-white");
      btnTerkini.classList.remove("bg-yellow-400", "text-white");
      btnTerkini.classList.add("text-green-700");
    });
  }

  // ===============================
  // ANIMASI FOOTER + KONTAK
  // ===============================
  const footer = document.getElementById("footer");
  const footerItems = document.querySelectorAll(".footer-item");
  const kontakItems = document.querySelectorAll(".kontak-item");

  function animasiFooter() {
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
  }

  window.addEventListener("scroll", animasiFooter);

  // ===============================
  // SUARA NAVBAR (TIDAK DOBEL)
  // ===============================
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

  // ===============================
  // ANIMASI PUBLIKASI (INTERSECTION)
  // ===============================
  const cards = document.querySelectorAll(".pub-card");

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

  // ======================
  // ANIMASI JUDUL BERITA
  // ======================

  const judul = document.getElementById("judulBerita");
  const teks = judul.textContent.trim();

  judul.innerHTML = "";

  // Membuat setiap huruf menjadi span
  teks.split("").forEach((huruf) => {
    const span = document.createElement("span");

    span.className = "letter";
    span.innerHTML = huruf === " " ? "&nbsp;" : huruf;

    judul.appendChild(span);
  });

  const letters = document.querySelectorAll("#judulBerita .letter");

  function animasiHuruf() {
    letters.forEach((letter, index) => {
      setTimeout(() => {
        letter.style.animation = "flipLetter 0.7s ease";

        // Reset agar bisa diputar lagi
        letter.addEventListener(
          "animationend",
          () => {
            letter.style.animation = "";
          },
          { once: true },
        );
      }, index * 120);
    });
  }

  // Jalankan pertama kali
  animasiHuruf();

  // Hitung total durasi animasi
  const totalDurasi = letters.length * 120 + 3000;

  // Loop terus
  setInterval(animasiHuruf, totalDurasi);

  // ================= ANIMASI HERO =================
  const heroItems = document.querySelectorAll(".hero-item");

  window.addEventListener("load", () => {
    heroItems.forEach((item, i) => {
      setTimeout(() => {
        item.classList.remove("opacity-0", "-translate-x-16");
      }, i * 200);
    });
  });
});