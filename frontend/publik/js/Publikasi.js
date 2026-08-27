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
    mobileMenu.classList.remove("max-h-[600px]", "opacity-100");
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

// ======================================================
// ANIMASI NAVBAR
// ======================================================

const navItems = document.querySelectorAll(".nav-item");

window.addEventListener("load", () => {
  navItems.forEach((item, i) => {
    setTimeout(() => {
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, i * 100);
  });
});

// ======================================================
// MODAL CARD
// ======================================================

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalDate = document.getElementById("modalDate");

const closeModal = document.getElementById("closeModal");

// Tombol X
closeModal.addEventListener("click", close);

// Klik luar modal
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    close();
  }
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

function bukaModal(item) {
  modalImg.src = item.gambar_url;
  modalTitle.innerText = item.judul;
  modalDesc.innerText = item.deskripsi;
  modalDate.innerText = formatTanggal(item.waktu_kegiatan);

  modal.classList.remove("opacity-0", "pointer-events-none");
  modalContent.classList.remove("scale-90", "opacity-0");

  modal.classList.add("opacity-100");
  modalContent.classList.add("scale-100", "opacity-100");
}

// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatTanggal(tanggal) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ======================================================
// ESCAPE HTML
// ======================================================

const escapeHTML = (value = "") => {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
};

// ======================================================
// HERO SLIDER DINAMIS
// ======================================================

const slider = document.getElementById("slider");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

let index = 0;
let total = 0;
let autoSlide = null;
let startX = 0;

// Fungsi geser slide
function showSlide(i) {
  if (!slider || total === 0) {
    return;
  }

  index = (i + total) % total;

  slider.style.transform = `translateX(-${index * 100}%)`;
}

// Aktifkan slider setelah gambar selesai dirender
function initHeroSlider() {
  if (!slider) {
    return;
  }

  total = slider.children.length;

  index = 0;

  showSlide(0);

  // Hentikan interval lama kalau ada
  if (autoSlide) {
    clearInterval(autoSlide);
    autoSlide = null;
  }

  // Jalankan auto slide jika gambar lebih dari 1
  if (total > 1) {
    autoSlide = setInterval(() => {
      showSlide(index + 1);
    }, 4000);
  }

  // Sembunyikan button jika cuma 1 gambar
  if (total <= 1) {
    if (nextBtn) {
      nextBtn.classList.add("hidden");
    }

    if (prevBtn) {
      prevBtn.classList.add("hidden");
    }
  } else {
    if (nextBtn) {
      nextBtn.classList.remove("hidden");
    }

    if (prevBtn) {
      prevBtn.classList.remove("hidden");
    }
  }
}

// ======================================================
// RENDER 3 GAMBAR PUBLIKASI TERBARU KE HERO
// ======================================================

function renderHeroTerbaru(items) {
  if (!slider) {
    return;
  }

  // Urutkan data dari tanggal terbaru ke terlama
  const terbaru = [...items]
    .sort((a, b) => {
      return (
        new Date(b.waktu_kegiatan).getTime() -
        new Date(a.waktu_kegiatan).getTime()
      );
    })
    .slice(0, 3);

  // Kosongkan slider lama
  slider.innerHTML = "";

  // Masukkan maksimal 3 gambar terbaru
  terbaru.forEach((item) => {
    const slide = document.createElement("div");

    slide.className = "min-w-full relative";

    slide.innerHTML = `
      <img
        src="${item.gambar_url}"
        alt="${escapeHTML(item.judul)}"
        class="hero-image"
      />
    `;

    slider.appendChild(slide);
  });

  // Aktifkan slider setelah semua gambar masuk
  initHeroSlider();
}

// ======================================================
// BUTTON NEXT
// ======================================================

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    showSlide(index + 1);
  });
}

// ======================================================
// BUTTON PREVIOUS
// ======================================================

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    showSlide(index - 1);
  });
}

// ======================================================
// STOP AUTO SLIDE SAAT HOVER
// ======================================================

if (slider) {
  slider.addEventListener("mouseenter", () => {
    if (autoSlide) {
      clearInterval(autoSlide);
      autoSlide = null;
    }
  });

  slider.addEventListener("mouseleave", () => {
    if (total > 1) {
      if (autoSlide) {
        clearInterval(autoSlide);
      }

      autoSlide = setInterval(() => {
        showSlide(index + 1);
      }, 4000);
    }
  });
}

// ======================================================
// SWIPE MOBILE
// ======================================================

if (slider) {
  slider.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
    },
    {
      passive: true,
    },
  );

  slider.addEventListener(
    "touchend",
    (e) => {
      const endX = e.changedTouches[0].clientX;

      // Swipe kiri
      if (startX - endX > 50) {
        showSlide(index + 1);
      }

      // Swipe kanan
      if (endX - startX > 50) {
        showSlide(index - 1);
      }
    },
    {
      passive: true,
    },
  );
}

// ======================================================
// AMBIL & RENDER DATA PUBLIKASI DARI BACKEND
// ======================================================

const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";

const publikasiGrid = document.getElementById("publikasiGrid");

async function loadPublikasi() {
  try {
    const response = await fetch(`${API_BASE_URL}/publikasi`);

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Gagal memuat data publikasi.");
    }

    const items = result.data || [];

    // ==================================================
    // JIKA DATA PUBLIKASI KOSONG
    // ==================================================

    if (!items.length) {
      publikasiGrid.innerHTML = `
        <p class="col-span-full text-center text-gray-400 py-10">
          Belum ada publikasi kegiatan.
        </p>
      `;

      if (slider) {
        slider.innerHTML = "";
      }

      total = 0;

      if (autoSlide) {
        clearInterval(autoSlide);
        autoSlide = null;
      }

      if (nextBtn) {
        nextBtn.classList.add("hidden");
      }

      if (prevBtn) {
        prevBtn.classList.add("hidden");
      }

      return;
    }

    // ==================================================
    // HERO
    // AMBIL 3 PUBLIKASI TERBARU
    // ==================================================

    renderHeroTerbaru(items);

    // ==================================================
    // RENDER MAIN CONTENT
    // ==================================================

    publikasiGrid.innerHTML = items
      .map(
        (item) => `
          <div
            class="pub-card opacity-0 translate-y-10 md:translate-y-16 transition-all duration-700"
            data-id="${item.id}"
          >

            <img
              src="${item.gambar_url}"
              class="w-full h-48 object-cover"
              alt="${escapeHTML(item.judul)}"
            >

            <div class="pub-card-body bg-green-50 p-5 rounded-b-xl">

              <h4
                class="pub-card-title text-lg font-bold text-green-800 mb-2"
              >
                ${escapeHTML(item.judul)}
              </h4>

              <p
                class="pub-card-description text-gray-600 text-sm"
              >
                ${escapeHTML(item.deskripsi)}
              </p>

              <span class="pub-card-more">Selengkapnya</span>

              <p
                class="pub-card-date text-xs text-gray-400"
              >
                ${formatTanggal(item.waktu_kegiatan)}
              </p>

            </div>

          </div>
        `,
      )
      .join("");

    // Tampilkan penanda hanya pada deskripsi yang benar-benar terpotong.
    publikasiGrid
      .querySelectorAll(".pub-card-description")
      .forEach((description) => {
        if (description.scrollHeight > description.clientHeight + 1) {
          description.classList.add("is-truncated");
        }
      });
<<<<<<< HEAD

=======
>>>>>>> 01607de (feat/be1-reihan: tambah fitur guest)

    // ==================================================
    // KLIK CARD → BUKA MODAL
    // ==================================================

    publikasiGrid.querySelectorAll(".pub-card").forEach((card) => {
      card.addEventListener("click", () => {
        const item = items.find(
          (i) => String(i.id) === String(card.dataset.id),
        );

        if (item) {
          bukaModal(item);
        }
      });
    });

    // ==================================================
    // AKTIFKAN ANIMASI CARD
    // ==================================================

    initScrollRevealCards();
  } catch (error) {
    console.error("Gagal memuat publikasi:", error);

    publikasiGrid.innerHTML = `
      <p class="col-span-full text-center text-red-500 py-10">
        ${escapeHTML(error.message)}
      </p>
    `;
  }
}

// Jalankan fetch data
loadPublikasi();

// ======================================================
// ANIMASI FOOTER
// ======================================================

const footer = document.getElementById("footer");

const footerItems = document.querySelectorAll(".footer-item");

window.addEventListener("scroll", () => {
  const trigger = window.innerHeight;

  if (footer && footer.getBoundingClientRect().top < trigger - 100) {
    footer.classList.remove("opacity-0", "translate-y-10");

    footerItems.forEach((item, i) => {
      setTimeout(() => {
        item.classList.remove("opacity-0", "translate-y-6");
      }, i * 200);
    });
  }
});

// ======================================================
// ANIMASI HEADER
// ======================================================

const heroItems = document.querySelectorAll(".hero-item");

window.addEventListener("load", () => {
  heroItems.forEach((item, i) => {
    setTimeout(() => {
      item.classList.remove("opacity-0", "-translate-x-16");
    }, i * 200);
  });
});

// ======================================================
// ANIMASI KONTAK
// ======================================================

const kontakItems = document.querySelectorAll(".kontak-item");

window.addEventListener("scroll", () => {
  const trigger = window.innerHeight;

  if (footer && footer.getBoundingClientRect().top < trigger - 100) {
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

// ======================================================
// ANIMASI SUARA NAVBAR
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      const text = item.textContent.trim();

      if (!text) {
        return;
      }

      const speech = new SpeechSynthesisUtterance(text);

      speech.lang = "id-ID";
      speech.rate = 1;

      window.speechSynthesis.cancel();

      window.speechSynthesis.speak(speech);
    });
  });
});

// ======================================================
// ANIMASI CARD PUBLIKASI
// SCROLL REVEAL + STAGGER
// ======================================================

function initScrollRevealCards() {
  const cards = document.querySelectorAll(".pub-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    },
  );

  cards.forEach((card, i) => {
    observer.observe(card);

    card.style.transitionDelay = `${i * 0.03}s`;
  });
}

// ======================================================
// HEADER HILANG SAAT SCROLL TURUN, MUNCUL SAAT SCROLL NAIK
// ======================================================

const mainHeader = document.getElementById("mainHeader");

const heroSection = document.getElementById("heroSection");

let lastScrollY = Math.max(window.scrollY, 0);

window.addEventListener(
  "scroll",
  function () {
    const currentScrollY = Math.max(window.scrollY, 0);

    if (currentScrollY <= 0 || currentScrollY < lastScrollY) {
      mainHeader.classList.remove("header-hidden");
      heroSection.classList.remove("hero-top");
    } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
      mainHeader.classList.add("header-hidden");
      heroSection.classList.add("hero-top");
    }

    lastScrollY = currentScrollY;
  },
  { passive: true },
);

// ======================================================
// SCROLL TO TOP
// ======================================================

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
    behavior: "smooth",
  });
});

// ======================================================
// CONTROL KEYBOARD HERO
// ======================================================

document.addEventListener("keydown", (e) => {
  const tag = document.activeElement.tagName.toLowerCase();

  if (tag === "input" || tag === "textarea") {
    return;
  }

  // Slide selanjutnya
  if (e.key === "End") {
    e.preventDefault();

    showSlide(index + 1);
  }

  // Slide sebelumnya
  if (e.key === "Home") {
    e.preventDefault();

    showSlide(index - 1);
  }
});
