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

  // === MODAL CARD ===
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");

  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalDate = document.getElementById("modalDate");

  const closeModal = document.getElementById("closeModal");

  // ambil semua card
  const cards = document.querySelectorAll(".pub-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const img = card.querySelector("img").src;
      const title = card.querySelector("h4").innerText;
      const desc = card.querySelector("p").innerText;
      const date = card.querySelectorAll("p")[1].innerText;

      // isi modal
      modalImg.src = img;
      modalTitle.innerText = title;
      modalDesc.innerText = desc;
      modalDate.innerText = date;

      // tampilkan modal
      modal.classList.remove("opacity-0", "pointer-events-none");
      modalContent.classList.remove("scale-90", "opacity-0");

      modal.classList.add("opacity-100");
      modalContent.classList.add("scale-100", "opacity-100");
    });
  });

  // tombol X
  closeModal.addEventListener("click", close);

  // klik luar modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  function close() {
    modal.classList.remove("opacity-100");
    modalContent.classList.remove("scale-100", "opacity-100");

    modal.classList.add("opacity-0");
    modalContent.classList.add("scale-90", "opacity-0");

    setTimeout(() => {
      modal.classList.add("pointer-events-none");
    }, 300);
  }

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
        card.style.transitionDelay = `${i * 0.03}s`; // ini yang bikin urut
      });

    });

    // === HERO SLIDER ===
    const slider = document.getElementById("slider");
    const slides = document.querySelectorAll("#slider > div");

    let index = 0;
    let total = slides.length;

    // fungsi geser
    function showSlide(i) {
      index = (i + total) % total;
      slider.style.transform = `translateX(-${index * 100}%)`;
    }

    // tombol manual
    document.getElementById("next").onclick = () => showSlide(index + 1);
    document.getElementById("prev").onclick = () => showSlide(index - 1);

    // AUTO SLIDE
    let autoSlide = setInterval(() => {
      showSlide(index + 1);
    }, 4000);

    // STOP kalau hover (desktop)
    slider.addEventListener("mouseenter", () => clearInterval(autoSlide));
    slider.addEventListener("mouseleave", () => {
      autoSlide = setInterval(() => showSlide(index + 1), 4000);
    });

    // SWIPE MOBILE
    let startX = 0;

    slider.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    slider.addEventListener("touchend", (e) => {
      let endX = e.changedTouches[0].clientX;

      if (startX - endX > 50) {
        showSlide(index + 1);
      } else if (endX - startX > 50) {
        showSlide(index - 1);
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

    // === CONTROL KEYBOARD ===
    document.addEventListener("keydown", (e) => {

      const tag = document.activeElement.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "End") {
        e.preventDefault(); // ⬅️ ini penting
        showSlide(index + 1);
      }

      if (e.key === "Home") {
        e.preventDefault(); // ⬅️ ini penting
        showSlide(index - 1);
      }
      

    });