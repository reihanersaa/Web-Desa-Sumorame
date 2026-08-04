document.addEventListener("DOMContentLoaded", () => {

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
    if (isOpen && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
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
  // ANIMASI ARTIKEL
  // ===============================
  const artikel = document.getElementById("artikelText");
  const artikelItems = document.querySelectorAll(".artikel-item");

  function animasiArtikel() {
    const trigger = window.innerHeight;

    if (artikel.getBoundingClientRect().top < trigger - 100) {
      artikelItems.forEach((item, i) => {
        setTimeout(() => {
          item.classList.remove("opacity-0", "translate-y-6");
        }, i * 150);
      });
    }
  }

  window.addEventListener("scroll", animasiArtikel);


  // ===============================
  // ANIMASI TERKINI (🔥 FIX UTAMA)
  // ===============================
  const content = document.getElementById("contentTerkini");
  const items = document.querySelectorAll(".terkini-item");

  setTimeout(() => {
    content.classList.remove("opacity-0", "translate-x-20");
  }, 200);

  items.forEach((item, i) => {
    setTimeout(() => {
      item.classList.remove("opacity-0", "translate-x-10");
    }, 400 + (i * 120));
  });


  // ===============================
  // TAB TERKINI / KATEGORI
  // ===============================
  const btnTerkini = document.getElementById("btnTerkini");
  const btnKategori = document.getElementById("btnKategori");

  const contentTerkini = document.getElementById("contentTerkini");
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
            "translate-y-10"
          );
        }, i * 200);
      });
    }
  }

  window.addEventListener("scroll", animasiFooter);


  // ===============================
  // SUARA NAVBAR (TIDAK DOBEL)
  // ===============================
  navItems.forEach(item => {
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
  // ANIMASI PUBLIKASI (INTERSECTION)
  // ===============================
  const cards = document.querySelectorAll(".pub-card");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, { threshold: 0.2 });

  cards.forEach((card, i) => {
    observer.observe(card);
    card.style.transitionDelay = `${i * 0.15}s`;
  });

  // ======================
  // ANIMASI JUDUL BERITA
  // ======================

  const judul = document.getElementById("judulBerita");
  const teks = judul.textContent;

  judul.innerHTML = "";

  // Membuat setiap huruf menjadi span
  teks.split("").forEach(huruf => {

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
              letter.addEventListener("animationend", () => {
                  letter.style.animation = "";
              }, { once: true });

          }, index * 120);

      });

  }

  // Jalankan pertama kali
  animasiHuruf();

  // Hitung total durasi animasi
  const totalDurasi = (letters.length * 120) + 3000;

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