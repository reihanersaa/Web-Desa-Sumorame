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

function formatTanggal(tanggal) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const escapeHTML = (value = "") => {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
};

// === AMBIL & RENDER DATA PUBLIKASI DARI BACKEND ===
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

    if (!items.length) {
      publikasiGrid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">Belum ada publikasi kegiatan.</p>`;
      return;
    }

    publikasiGrid.innerHTML = items
      .map(
        (item) => `
      <div class="pub-card opacity-0 translate-y-10 md:translate-y-16 transition-all duration-700" data-id="${item.id}">
        <img src="${item.gambar_url}" class="w-full h-48 object-cover" alt="${escapeHTML(item.judul)}">
        <div class="bg-green-50 p-5 shadow-md rounded-b-xl">
          <h4 class="text-lg font-bold text-green-800 mb-2">${escapeHTML(item.judul)}</h4>
          <p class="text-gray-600 text-sm">${escapeHTML(item.deskripsi)}</p>
          <p class="text-xs text-gray-400 mt-3">${formatTanggal(item.waktu_kegiatan)}</p>
        </div>
      </div>`,
      )
      .join("");

    // Pasang klik-buka-modal ke tiap card yang baru dirender
    publikasiGrid.querySelectorAll(".pub-card").forEach((card) => {
      card.addEventListener("click", () => {
        const item = items.find((i) => String(i.id) === card.dataset.id);
        if (item) bukaModal(item);
      });
    });

    // Nyalakan lagi animasi scroll-reveal untuk card yang baru masuk ke DOM
    initScrollRevealCards();
  } catch (error) {
    console.error("Gagal memuat publikasi:", error);
    publikasiGrid.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">${escapeHTML(error.message)}</p>`;
  }
}

loadPublikasi();

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
          "translate-y-10",
        );
      }, i * 200);
    });
  }
});

// === Animasi Suara Untuk Navbar ===
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
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
// Dipanggil ulang tiap habis loadPublikasi() render card baru,
// karena card sekarang muncul belakangan (fetch async), bukan
// udah ada dari awal kayak dulu waktu masih hardcoded di HTML.
function initScrollRevealCards() {
  const cards = document.querySelectorAll(".pub-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    {
      threshold: 0.2,
    },
  );

  cards.forEach((card, i) => {
    observer.observe(card);
    card.style.transitionDelay = `${i * 0.03}s`; // ini yang bikin urut
  });
}

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

slider.addEventListener(
  "touchstart",
  (e) => {
    startX = e.touches[0].clientX;
  },
  { passive: true },
);

slider.addEventListener(
  "touchend",
  (e) => {
    let endX = e.changedTouches[0].clientX;

    if (startX - endX > 50) {
      showSlide(index + 1);
    } else if (endX - startX > 50) {
      showSlide(index - 1);
    }
  },
  { passive: true },
);

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
    behavior: "smooth",
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
