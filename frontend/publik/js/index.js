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

// =====================================================
// HELPER: Reveal-on-scroll pakai IntersectionObserver
// =====================================================
// Kenapa diganti dari `window.addEventListener("scroll", ...)`:
// - listener scroll lama memanggil getBoundingClientRect() di SETIAP
//   event scroll (bisa puluhan kali/detik) -> memaksa browser
//   menghitung ulang layout berkali-kali (layout thrashing) -> berat.
// - beberapa section (footer, sambutan, berita, visimisi, kontak)
//   tidak punya flag "sudah dianimasikan", jadi selama section itu
//   masih kelihatan di layar, setiap event scroll membuat setTimeout
//   BARU untuk semua item di dalamnya -> ribuan timer menumpuk saat
//   scroll -> inilah penyebab utama scroll terasa patah-patah.
// IntersectionObserver hanya memberi tahu browser sekali saat elemen
// benar-benar masuk/keluar viewport, tanpa perlu polling tiap scroll.
function revealOnScroll(target, items, removeClasses, staggerMs = 200, onEach = null) {
  if (!target) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        items.forEach((item, i) => {
          setTimeout(() => {
            item.classList.remove(...removeClasses);
            if (onEach) onEach(item);
          }, i * staggerMs);
        });

        obs.unobserve(target); // hanya jalan sekali
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -100px 0px" }
  );

  observer.observe(target);
}

// ===== Animasi Footer (+ Kontak) =====
const footer = document.getElementById("footer");
const footerItems = document.querySelectorAll(".footer-item");
const kontakItems = document.querySelectorAll(".kontak-item");

revealOnScroll(footer, [footer], ["opacity-0", "translate-y-10"]);
revealOnScroll(footer, footerItems, ["opacity-0", "translate-y-6"], 200);
revealOnScroll(
  footer,
  kontakItems,
  ["opacity-0", "-translate-y-6", "-translate-x-10", "translate-x-10", "translate-y-10"],
  200
);

// ===== Animasi Sambutan Kepala Desa =====
const sambutan = document.getElementById("sambutan");
const sambutanItems = sambutan.querySelectorAll(".sambutan-item");

revealOnScroll(
  sambutan,
  sambutanItems,
  ["opacity-0", "translate-y-16", "translate-x-16", "scale-90"],
  200
);

// === Animasi Header ===
const heroItems = document.querySelectorAll(".hero-item");

window.addEventListener("load", () => {
  heroItems.forEach((item, i) => {
    setTimeout(() => {
      item.classList.remove("opacity-0", "-translate-x-16");
    }, i * 200);
  });
});

// === Animasi Statistik Desa (teks huruf per huruf) ===
document.addEventListener("DOMContentLoaded", function () {
  const element = document.getElementById("teks-animasi");
  const text = element.innerText.trim();
  element.innerHTML = "";

  const delayGap = 0.15;

  text.split("").forEach((char, index) => {
    const span = document.createElement("span");

    if (char === " ") {
      span.innerHTML = "&nbsp;";
      span.className = "inline-block w-3";
    } else {
      span.innerText = char;
      span.className = "animate-flip-y";
      span.style.animationDelay = `${index * delayGap}s`;
    }

    element.appendChild(span);
  });
});

// === Animasi Berita Terkini ===
const berita = document.getElementById("berita");
const beritaItems = berita.querySelectorAll(".berita-item");

revealOnScroll(
  berita,
  beritaItems,
  ["opacity-0", "-translate-y-10", "translate-y-10", "-translate-x-16", "translate-x-16"],
  150
);

// === Animasi Visi Dan Misi ===
const visimisi = document.getElementById("visimisi");
const visiItems = visimisi.querySelectorAll(".visi-item");

revealOnScroll(visimisi, visiItems, ["opacity-0", "-translate-x-16", "translate-x-16"], 200);

// === Animasi Produk Unggulan ===
const produk = document.getElementById("produk");
const produkItems = produk.querySelectorAll(".produk-item");

revealOnScroll(produk, produkItems, ["opacity-0", "translate-y-16"], 200);

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
document.addEventListener("DOMContentLoaded", () => {
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

slider.addEventListener(
  "touchstart",
  (e) => {
    startX = e.touches[0].clientX;
  },
  { passive: true }
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
  { passive: true }
);

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

// =======================
// CARD STATISTIK
// ======================

const statCards = document.querySelectorAll(".stat-card");

function animateCounter(counter) {
  const target = parseInt(counter.dataset.target);
  let current = 0;

  const increment = Math.ceil(target / 180);

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

const statistik = document.getElementById("statistik");

revealOnScroll(statistik, statCards, ["opacity-0", "translate-y-10"], 200, (card) => {
  card.querySelectorAll(".counter").forEach((counter) => animateCounter(counter));
});

// =====================================================
// PARALLAX BACKGROUND (JELAJAH + STATISTIK)
// =====================================================
// Prinsip performa:
// 1. Gerakkan background pakai `transform` (translate3d), BUKAN
//    `background-position`/`background-attachment: fixed` -> transform
//    di-composite GPU, tidak memicu repaint/layout.
// 2. Listener scroll hanya AKTIF selagi elemen parallax terlihat di
//    layar (dikontrol via IntersectionObserver), bukan selalu nyala.
// 3. Perhitungan posisi dibungkus requestAnimationFrame supaya
//    maksimal 1x update per frame, tidak numpuk seperti masalah lama.
(function initParallax() {
  const parallaxEls = document.querySelectorAll(".parallax-bg");
  if (!parallaxEls.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return; // biarkan CSS yang menonaktifkan gerak

  const activeEls = new Set();
  let ticking = false;

  function updateParallax() {
    const viewportCenter = window.innerHeight / 2;

    activeEls.forEach((bg) => {
      const wrap = bg.parentElement;
      const rect = wrap.getBoundingClientRect();
      const speed = parseFloat(bg.dataset.parallaxSpeed || "0.25");
      const elCenter = rect.top + rect.height / 2;
      const offset = (viewportCenter - elCenter) * speed;

      bg.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeEls.add(entry.target);
        } else {
          activeEls.delete(entry.target);
        }
      });

      // hanya dengarkan scroll saat minimal 1 elemen parallax terlihat
      if (activeEls.size > 0) {
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    },
    { rootMargin: "150px 0px 150px 0px" }
  );

  parallaxEls.forEach((el) => io.observe(el));
})();