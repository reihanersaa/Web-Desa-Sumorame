// === Menu NavBar Mobile ===
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    let isOpen = false;

    menuBtn.addEventListener("click", () => {
      isOpen = !isOpen;

      if (isOpen) {
        mobileMenu.classList.remove("max-h-0", "opacity-0");
        mobileMenu.classList.add("max-h-[500px]", "opacity-100");
        menuBtn.textContent = "close";
      } else {
        mobileMenu.classList.remove("max-h-[500px]", "opacity-100");
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

    // ===== Animasi Sambutan Kepala Desa =====
    const sambutan = document.getElementById("sambutan");
    const sambutanItems = sambutan.querySelectorAll(".sambutan-item");

    window.addEventListener("scroll", () => {
      const trigger = window.innerHeight;

      if (sambutan.getBoundingClientRect().top < trigger - 100) {
        sambutanItems.forEach((item, i) => {
          setTimeout(() => {
            item.classList.remove(
              "opacity-0",
              "translate-y-16",
              "translate-x-16",
              "scale-90"
            );
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

    // === Animasi Berita Terkini ===
    const berita = document.getElementById("berita");
    const beritaItems = berita.querySelectorAll(".berita-item");

    window.addEventListener("scroll", () => {
      const trigger = window.innerHeight;

      if (berita.getBoundingClientRect().top < trigger - 100) {
        beritaItems.forEach((item, i) => {
          setTimeout(() => {
            item.classList.remove(
              "opacity-0",
              "-translate-y-10",
              "translate-y-10",
              "-translate-x-16",
              "translate-x-16"
            );
          }, i * 150);
        });
      }
    });

    // === Animasi Visi Dan Misi ===
    const visimisi = document.getElementById("visimisi");
    const visiItems = visimisi.querySelectorAll(".visi-item");

    window.addEventListener("scroll", () => {
      const trigger = window.innerHeight;

      if (visimisi.getBoundingClientRect().top < trigger - 100) {
        visiItems.forEach((item, i) => {
          setTimeout(() => {
            item.classList.remove(
              "opacity-0",
              "-translate-x-16",
              "translate-x-16"
            );
          }, i * 200);
        });
      }
    });

    // === Animasi Produk Unggulan ===
    const produk = document.getElementById("produk");
    const produkItems = produk.querySelectorAll(".produk-item");

    let produkAnimated = false;

    function showProduk() {

        if (produkAnimated) return;

        const trigger = window.innerHeight;

        if (produk.getBoundingClientRect().top < trigger - 100) {

            produkAnimated = true;

            produkItems.forEach((item, i) => {

                setTimeout(() => {

                    item.classList.remove(
                        "opacity-0",
                        "translate-y-16"
                    );

                }, i * 200);

            });

        }

    }

    window.addEventListener("load", showProduk);
    window.addEventListener("scroll", showProduk);

    // === Animasi Navbar ===
    const navItems = document.querySelectorAll(".nav-item");

    window.addEventListener("load", () => {
      navItems.forEach((item, i) => {
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, i * 100);
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
        card.style.transitionDelay = `${i * 0.15}s`; // ini yang bikin urut
      });

    });

    const modal = document.getElementById("myModal");
    const modalBox = document.getElementById("modalBox");

    // OPEN
    function openModal() {
      modal.classList.remove("hidden");

      modalBox.classList.add("modal-enter");
      setTimeout(() => {
        modalBox.classList.add("modal-enter-active");
        modalBox.classList.remove("modal-enter");
      }, 10);
    }

    // CLOSE
    function closeModal() {
      modalBox.classList.add("modal-exit-active");

      setTimeout(() => {
        modal.classList.add("hidden");
        modalBox.classList.remove("modal-exit-active");
      }, 250);
    }

    window.addEventListener("load", () => {
    setTimeout(() => {
      openModal();
    }, 1000);
  });

    modal.addEventListener("click", (e) => {
    // kalau klik di background (bukan isi modal)
    if (e.target === modal) {
      closeModal();
    }
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

    // === Animasi Hover Tombol Selengkapnya ===
    const btnProduk = document.getElementById("btnProduk");

    btnProduk.addEventListener("mouseenter", () => {

        btnProduk.classList.add("pulse-button");

    });

    btnProduk.addEventListener("mouseleave", () => {

        btnProduk.classList.remove("pulse-button");

    });

    // ======================
    // CARD STATISTIK
    // ======================

    const statCards = document.querySelectorAll(".stat-card");
    let statistikAnimated = false;

    function animateCounter(counter) {

        const target = parseInt(counter.dataset.target);
        let current = 0;

        const increment = Math.ceil(target / 80);

        function update() {

            current += increment;

            if (current >= target) {
                current = target;
            }

            counter.textContent = current.toLocaleString("id-ID");

            if (current < target) {
                requestAnimationFrame(update);
            }

        }

        update();
    }

    function showStatistik() {

        if (statistikAnimated) return;

        const statistik = document.getElementById("statistik");

        if (statistik.getBoundingClientRect().top < window.innerHeight - 100) {

            statistikAnimated = true;

            statCards.forEach((card, index) => {

                setTimeout(() => {

                    card.classList.remove("opacity-0", "translate-y-10");

                    card.querySelectorAll(".counter").forEach(counter => {
                        animateCounter(counter);
                    });

                }, index * 200);

            });

        }

    }

    window.addEventListener("load", showStatistik);
    window.addEventListener("scroll", showStatistik);