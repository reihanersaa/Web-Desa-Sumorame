document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // AMBIL & RENDER DATA INFORMASI DARI BACKEND
  // ===============================
  const API_BASE_URL =
    window.API_BASE_URL || "http://localhost:3000/api";

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

    const date =
      new Date(`${tanggalBersih}T00:00:00`);

    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };


  // ===============================
  // TAMPILKAN ARTIKEL UTAMA
  // ===============================
  function tampilkanArtikel(item) {
    if (!item) return;

    if (heroGambar) {
      heroGambar.src =
        item.gambar_url || "";

      heroGambar.alt =
        item.judul || "Gambar informasi";
    }

    if (heroIsi) {
      heroIsi.innerText =
        item.isi || "-";
    }

    if (heroTanggal) {
      heroTanggal.innerText =
        formatTanggal(item.tanggal);
    }

    if (!artikelText) return;

    const paragraf =
      String(item.penjelasan || "")
        .split(/\n+/)
        .filter((p) => p.trim())
        .map(
          (p) => `
            <p
              class="
                artikel-item
                opacity-0
                translate-y-6
                transition-all
                duration-700
                mb-4
              "
            >
              ${escapeHTML(p)}
            </p>
          `
        )
        .join("");

    artikelText.innerHTML =
      paragraf ||
      `<p class="text-gray-500">Tidak ada penjelasan.</p>`;

    document
      .querySelectorAll(".artikel-item")
      .forEach((el, i) => {
        setTimeout(() => {
          el.classList.remove(
            "opacity-0",
            "translate-y-6"
          );
        }, i * 150);
      });
  }


  // ===============================
  // RENDER ARSIP INFORMASI
  // ===============================
  function renderArsip(items) {
    if (!contentTerkini) return;

    if (!items.length) {
      contentTerkini.innerHTML = `
        <p class="text-sm text-gray-400">
          Belum ada informasi.
        </p>
      `;

      return;
    }

    contentTerkini.innerHTML =
      items
        .map(
          (item) => `
            <div
              class="
                terkini-item
                bg-white
                border
                rounded-xl
                p-3
                flex
                items-center
                gap-4
                shadow-sm
                hover:shadow-xl
                hover:-translate-y-1
                hover:scale-[1.01]
                cursor-pointer
                transition-all
              "
              data-id="${item.id}"
            >

              <img
                src="${item.gambar_url || ""}"
                alt="${escapeHTML(item.judul || "")}"
                class="
                  w-16
                  h-16
                  object-cover
                  rounded
                "
              >

              <div>

                <h4 class="text-sm font-semibold">
                  ${escapeHTML(item.judul || "-")}
                </h4>

                <p class="text-xs text-gray-500">
                  ${formatTanggal(item.tanggal)}
                </p>

              </div>

            </div>
          `
        )
        .join("");


    // Klik arsip
    contentTerkini
      .querySelectorAll(".terkini-item")
      .forEach((el) => {

        el.addEventListener("click", () => {
          const item =
            items.find(
              (i) =>
                String(i.id) ===
                String(el.dataset.id)
            );

          if (!item) return;

          tampilkanArtikel(item);

          const cardKiri =
            document.querySelector(".card-kiri");

          if (cardKiri) {
            cardKiri.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        });
      });
  }


  // ===============================
  // LOAD INFORMASI
  // ===============================
  async function loadInformasi() {
    try {
      const response =
        await fetch(
          `${API_BASE_URL}/informasi`
        );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType ||
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "Response backend bukan JSON."
        );
      }

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          "Gagal memuat data informasi."
        );
      }

      const items =
        result.data || [];

      if (!items.length) {
        if (heroIsi) {
          heroIsi.innerText =
            "Belum ada informasi yang dipublikasikan.";
        }

        if (heroTanggal) {
          heroTanggal.innerText = "-";
        }

        if (heroGambar) {
          heroGambar.src = "";
        }

        if (artikelText) {
          artikelText.innerHTML = "";
        }

        renderArsip([]);

        return;
      }

      // Item pertama = terbaru
      tampilkanArtikel(
        items[0]
      );

      renderArsip(
        items
      );

    } catch (error) {
      console.error(
        "Gagal memuat informasi:",
        error
      );

      if (heroIsi) {
        heroIsi.innerText =
          "Gagal memuat data informasi.";
      }

      if (heroTanggal) {
        heroTanggal.innerText = "-";
      }

      if (contentTerkini) {
        contentTerkini.innerHTML = `
          <p class="text-sm text-red-500">
            ${escapeHTML(error.message)}
          </p>
        `;
      }
    }
  }


  // Jalankan load data
  loadInformasi();


  // ===============================
  // NAVBAR MOBILE
  // ===============================
  const menuBtn =
    document.getElementById("menuBtn");

  const mobileMenu =
    document.getElementById("mobileMenu");

  let isOpen = false;

  if (
    menuBtn &&
    mobileMenu
  ) {
    menuBtn.addEventListener(
      "click",
      () => {
        isOpen =
          !isOpen;

        if (isOpen) {
          mobileMenu.classList.remove(
            "max-h-0",
            "opacity-0"
          );

          mobileMenu.classList.add(
            "max-h-[600px]",
            "opacity-100"
          );

          menuBtn.textContent =
            "close";

        } else {
          mobileMenu.classList.remove(
            "max-h-[600px]",
            "opacity-100"
          );

          mobileMenu.classList.add(
            "max-h-0",
            "opacity-0"
          );

          menuBtn.textContent =
            "menu";
        }
      }
    );


    document.addEventListener(
      "click",
      (e) => {
        if (
          isOpen &&
          !mobileMenu.contains(e.target) &&
          !menuBtn.contains(e.target)
        ) {
          mobileMenu.classList.remove(
            "max-h-[600px]",
            "opacity-100"
          );

          mobileMenu.classList.add(
            "max-h-0",
            "opacity-0"
          );

          menuBtn.textContent =
            "menu";

          isOpen =
            false;
        }
      }
    );
  }


  // ===============================
  // ANIMASI NAVBAR
  // ===============================
  const navItems =
    document.querySelectorAll(
      ".nav-item"
    );

  navItems.forEach(
    (item, i) => {
      setTimeout(() => {
        item.style.opacity =
          "1";

        item.style.transform =
          "translateY(0)";
      }, i * 100);
    }
  );


  // ===============================
  // ANIMASI CARD UTAMA
  // ===============================
  const cardKiri =
    document.querySelector(
      ".card-kiri"
    );

  const cardKanan =
    document.querySelector(
      ".card-kanan"
    );

  function animasiCard() {
    if (
      !cardKiri ||
      !cardKanan
    ) {
      return;
    }

    const trigger =
      window.innerHeight * 0.85;

    if (
      cardKiri
        .getBoundingClientRect()
        .top < trigger
    ) {
      cardKiri.classList.remove(
        "opacity-0",
        "-translate-x-40"
      );

      cardKanan.classList.remove(
        "opacity-0",
        "translate-x-40"
      );
    }
  }

  window.addEventListener(
    "scroll",
    animasiCard
  );

  animasiCard();


  // ===============================
  // ANIMASI CONTENT TERKINI
  // ===============================
  const content =
    document.getElementById(
      "contentTerkini"
    );

  if (content) {
    setTimeout(() => {
      content.classList.remove(
        "opacity-0",
        "translate-x-20"
      );
    }, 200);
  }


  // ===============================
  // TAB TERKINI / KATEGORI
  // ===============================
  const btnTerkini =
    document.getElementById(
      "btnTerkini"
    );

  const btnKategori =
    document.getElementById(
      "btnKategori"
    );

  const contentKategori =
    document.getElementById(
      "contentKategori"
    );

  if (
    btnTerkini &&
    btnKategori &&
    contentKategori &&
    contentTerkini
  ) {
    btnTerkini.addEventListener(
      "click",
      () => {
        contentKategori.classList.add(
          "opacity-0",
          "translate-x-10"
        );

        setTimeout(() => {
          contentKategori.classList.add(
            "hidden"
          );

          contentTerkini.classList.remove(
            "hidden"
          );

          setTimeout(() => {
            contentTerkini.classList.remove(
              "opacity-0",
              "-translate-x-10"
            );

            contentTerkini.classList.add(
              "opacity-100",
              "translate-x-0"
            );
          }, 50);

        }, 300);

        btnTerkini.classList.add(
          "bg-yellow-400",
          "text-white"
        );

        btnKategori.classList.remove(
          "bg-yellow-400",
          "text-white"
        );

        btnKategori.classList.add(
          "text-green-700"
        );
      }
    );


    btnKategori.addEventListener(
      "click",
      () => {
        contentTerkini.classList.add(
          "opacity-0",
          "-translate-x-10"
        );

        setTimeout(() => {
          contentTerkini.classList.add(
            "hidden"
          );

          contentKategori.classList.remove(
            "hidden"
          );

          setTimeout(() => {
            contentKategori.classList.remove(
              "opacity-0",
              "translate-x-10"
            );

            contentKategori.classList.add(
              "opacity-100",
              "translate-x-0"
            );
          }, 50);

        }, 300);

        btnKategori.classList.add(
          "bg-yellow-400",
          "text-white"
        );

        btnTerkini.classList.remove(
          "bg-yellow-400",
          "text-white"
        );

        btnTerkini.classList.add(
          "text-green-700"
        );
      }
    );
  }


  // ===============================
  // ANIMASI FOOTER + KONTAK
  // ===============================
  const footer =
    document.getElementById(
      "footer"
    );

  const footerItems =
    document.querySelectorAll(
      ".footer-item"
    );

  const kontakItems =
    document.querySelectorAll(
      ".kontak-item"
    );

  function animasiFooter() {
    if (!footer) {
      return;
    }

    const trigger =
      window.innerHeight;

    if (
      footer
        .getBoundingClientRect()
        .top <
      trigger - 100
    ) {
      footer.classList.remove(
        "opacity-0",
        "translate-y-10"
      );

      footerItems.forEach(
        (item, i) => {
          setTimeout(() => {
            item.classList.remove(
              "opacity-0",
              "translate-y-6"
            );
          }, i * 200);
        }
      );

      kontakItems.forEach(
        (item, i) => {
          setTimeout(() => {
            item.classList.remove(
              "opacity-0",
              "-translate-y-6",
              "-translate-x-10",
              "translate-x-10",
              "translate-y-10"
            );
          }, i * 200);
        }
      );
    }
  }

  window.addEventListener(
    "scroll",
    animasiFooter
  );

  animasiFooter();


  // ===============================
  // SUARA NAVBAR
  // ===============================
  navItems.forEach((item) => {
    item.addEventListener(
      "mouseenter",
      () => {
        const text =
          item.textContent.trim();

        if (!text) return;

        const speech =
          new SpeechSynthesisUtterance(
            text
          );

        speech.lang =
          "id-ID";

        window
          .speechSynthesis
          .cancel();

        window
          .speechSynthesis
          .speak(speech);
      }
    );
  });


  // ===============================
  // HEADER HILANG HANYA DI PALING ATAS
  // ===============================
  const mainHeader =
    document.getElementById(
      "mainHeader"
    );

  const heroSection =
    document.getElementById(
      "heroSection"
    );

  function handleHeaderScroll() {
    if (
      !mainHeader ||
      !heroSection
    ) {
      return;
    }

    if (
      window.scrollY <= 0
    ) {
      mainHeader.classList.add(
        "header-hidden"
      );

      heroSection.classList.add(
        "hero-top"
      );

    } else {
      mainHeader.classList.remove(
        "header-hidden"
      );

      heroSection.classList.remove(
        "hero-top"
      );
    }
  }

  window.addEventListener(
    "scroll",
    handleHeaderScroll
  );

  handleHeaderScroll();


  // ===============================
  // SCROLL TO TOP
  // ===============================
  const scrollTopBtn =
    document.getElementById(
      "scrollTopBtn"
    );

  if (scrollTopBtn) {
    window.addEventListener(
      "scroll",
      () => {
        if (
          window.scrollY > 300
        ) {
          scrollTopBtn.classList.add(
            "show"
          );
        } else {
          scrollTopBtn.classList.remove(
            "show"
          );
        }
      }
    );

    scrollTopBtn.addEventListener(
      "click",
      () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    );
  }


  // ===============================
  // ANIMASI PUBLIKASI
  // ===============================
  const cards =
    document.querySelectorAll(
      ".pub-card"
    );

  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach(
          (entry) => {
            if (
              entry.isIntersecting
            ) {
              entry.target
                .classList
                .add("show");
            }
          }
        );
      },
      {
        threshold: 0.2
      }
    );

  cards.forEach(
    (card, i) => {
      observer.observe(
        card
      );

      card.style.transitionDelay =
        `${i * 0.15}s`;
    }
  );


  // ===============================
  // ANIMASI JUDUL BERITA
  // ===============================
  const judul =
    document.getElementById(
      "judulBerita"
    );

  if (judul) {
    const teks =
      judul.textContent.trim();

    judul.innerHTML =
      "";

    teks
      .split("")
      .forEach((huruf) => {
        const span =
          document.createElement(
            "span"
          );

        span.className =
          "letter";

        span.innerHTML =
          huruf === " "
            ? "&nbsp;"
            : escapeHTML(huruf);

        judul.appendChild(
          span
        );
      });

    const letters =
      document.querySelectorAll(
        "#judulBerita .letter"
      );

    function animasiHuruf() {
      letters.forEach(
        (letter, index) => {
          setTimeout(() => {
            letter.style.animation =
              "flipLetter 0.7s ease";

            letter.addEventListener(
              "animationend",
              () => {
                letter.style.animation =
                  "";
              },
              {
                once: true
              }
            );

          }, index * 120);
        }
      );
    }

    animasiHuruf();

    const totalDurasi =
      letters.length * 120 + 3000;

    setInterval(
      animasiHuruf,
      totalDurasi
    );
  }


  // ===============================
  // ANIMASI HERO
  // ===============================
  const heroItems =
    document.querySelectorAll(
      ".hero-item"
    );

  heroItems.forEach(
    (item, i) => {
      setTimeout(() => {
        item.classList.remove(
          "opacity-0",
          "-translate-x-16"
        );
      }, i * 200);
    }
  );
});