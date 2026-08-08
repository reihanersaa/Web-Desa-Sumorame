// NAVBAR MOBILE
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
      mobileMenu.classList.remove("max-h-[400px]", "opacity-100");
      mobileMenu.classList.add("max-h-0", "opacity-0");
      menuBtn.textContent = "menu";
    }
  });

  document.addEventListener("click", (e) => {
      const isClickInsideMenu = mobileMenu.contains(e.target);
      const isClickButton = menuBtn.contains(e.target);

      if (isOpen && !isClickInsideMenu && !isClickButton) {
        mobileMenu.classList.remove("max-h-[600px]", "opacity-100");
        mobileMenu.classList.add("max-h-0", "opacity-0");
        menuBtn.textContent = "menu";
        isOpen = false;
      }
    });

  // ANIMASI NAVBAR
  const navItems = document.querySelectorAll(".nav-item");

  window.addEventListener("load", () => {
    navItems.forEach((item, i) => {
      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, i * 100);
    });
  });

  // ===== Animasi Footer =====
    const footer = document.getElementById("footer");
    const footerItems = document.querySelectorAll(".footer-item");

    window.addEventListener("scroll", () => {
      const trigger = window.innerHeight;

      if (footer.getBoundingClientRect().top < trigger - 100) {
        footer.classList.remove("opacity-0", "translate-y-10");

        footerItems.forEach((item, i) => {
          setTimeout(() => {
            item.classList.remove("opacity-0", "translate-y-6");
          }, i * 200);
        });
      }
    });

    // === Animasi Header ===
    const heroItems = document.querySelectorAll(".hero-item");

    window.addEventListener("load", () => {
      heroItems.forEach((item, i) => {
        setTimeout(() => {
          item.classList.remove("opacity-0", "-translate-x-16");
        }, i * 200);
      });
    });

    // === Animasi Kontak ===
    const kontakItems = document.querySelectorAll(".kontak-item");

    window.addEventListener("scroll", () => {
      const trigger = window.innerHeight;

      if (footer.getBoundingClientRect().top < trigger - 100) {
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
    });

    // === Animasi Suara Untuk Navbar ===
    document.addEventListener("DOMContentLoaded", () => {

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
      item.addEventListener("mouseenter", () => {
        const text = item.textContent.trim();

        if (!text) return;

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "id-ID";
        speech.rate = 1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
      });
    });

  });

  // === Animasi Suara Untuk Navbar ===
    document.addEventListener("DOMContentLoaded", () => {

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
      item.addEventListener("mouseenter", () => {
        const text = item.textContent.trim();

        if (!text) return;

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "id-ID";
        speech.rate = 1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
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

    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {
            scrollTopBtn.classList.add("show");
        } else {
            scrollTopBtn.classList.remove("show");
        }

    });

    scrollTopBtn.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

  // === ANIMASI CARD PUBLIKASI (SCROLL REVEAL + STAGGER) ===
      document.addEventListener("DOMContentLoaded", () => {

      const cards = document.querySelectorAll(".pub-card");

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      }, {
        threshold: 0.2
      });

      cards.forEach((card, i) => {
        observer.observe(card);
        card.style.transitionDelay = `${i * 0.15}s`; // ini yang bikin urut
      });

    });