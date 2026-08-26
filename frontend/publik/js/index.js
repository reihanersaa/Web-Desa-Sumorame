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

const mainHeader = document.getElementById("mainHeader");
const heroSection = document.getElementById("heroSection");

window.addEventListener("scroll", function () {
  if (window.scrollY <= 0) {
    mainHeader.classList.add("header-hidden");
    heroSection.classList.add("hero-top");
  } else {
    mainHeader.classList.remove("header-hidden");
    heroSection.classList.remove("hero-top");
  }
});

// =====================================================
// HELPER: Reveal-on-scroll pakai IntersectionObserver
// =====================================================
function revealOnScroll(
  target,
  items,
  removeClasses,
  staggerMs = 200,
  onEach = null,
) {
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

        obs.unobserve(target); 
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -100px 0px" },
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
  [
    "opacity-0",
    "-translate-y-6",
    "-translate-x-10",
    "translate-x-10",
    "translate-y-10",
  ],
  200,
);

// ===== Animasi Sambutan Kepala Desa =====
const sambutan = document.getElementById("sambutan");
const sambutanItems = sambutan.querySelectorAll(".sambutan-item");

revealOnScroll(
  sambutan,
  sambutanItems,
  ["opacity-0", "translate-y-16", "translate-x-16", "scale-90"],
  200,
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
  if(!element) return;
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
if (berita) {
    const beritaItems = berita.querySelectorAll(".berita-item");
    revealOnScroll(
      berita,
      beritaItems,
      [
        "opacity-0",
        "-translate-y-10",
        "translate-y-10",
        "-translate-x-16",
        "translate-x-16",
      ],
      150,
    );
}

// === Animasi Visi Dan Misi ===
const visimisi = document.getElementById("visimisi");
if (visimisi) {
    const visiItems = visimisi.querySelectorAll(".visi-item");
    revealOnScroll(
      visimisi,
      visiItems,
      ["opacity-0", "-translate-x-16", "translate-x-16"],
      200,
    );
}

// === Produk Unggulan pilihan CMS (maksimal 5) ===
const produk = document.getElementById("produk");
const produkUnggulanBeranda = document.getElementById("produkUnggulanBeranda");
const INDEX_API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";

function escapeProdukHTML(value = "") {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

async function muatProdukUnggulanBeranda() {
  if (!produkUnggulanBeranda) return;
  try {
    const response = await fetch(`${INDEX_API_BASE_URL}/publik/produk/unggulan`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Produk gagal dimuat.");
    const items = (result.data || []).slice(0, 5);
    if (!items.length) {
      produkUnggulanBeranda.innerHTML = '<p class="col-span-full text-center text-gray-500">Belum ada produk unggulan yang dipilih.</p>';
      return;
    }

    produkUnggulanBeranda.innerHTML = items.map((item) => {
      const nomor = String(item.kontak_penjual || "").replace(/\D/g, "").replace(/^0/, "62");
      const pesan = encodeURIComponent(`Halo, saya tertarik dengan ${item.nama_produk}`);
      return `<article class="produk-item produk-dynamic group w-full bg-white rounded-md overflow-hidden shadow-lg opacity-0 translate-y-16 transition-all duration-700">
        <div class="overflow-hidden">
          <img src="${escapeProdukHTML(item.gambar)}" alt="${escapeProdukHTML(item.nama_produk)}" class="w-full h-full object-cover">
        </div>
        <div class="produk-info bg-yellow-400/85 px-3 py-2">
          <h3 class="produk-nama font-bold text-lg">${escapeProdukHTML(item.nama_produk)}</h3>
          <div class="flex justify-between items-center mt-2 gap-2">
            <p class="produk-harga text-2xl font-bold text-green-800">${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(item.harga) || 0)}</p>
            <span class="text-sm text-gray-700 text-right">${escapeProdukHTML(item.nama_penjual)}</span>
          </div>
          <a href="https://wa.me/${nomor}?text=${pesan}" target="_blank" rel="noopener" data-product-id="${item.id}" class="btn-beli mt-2 w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition text-center block">Beli</a>
        </div>
      </article>`;
    }).join("");

    const cards = produkUnggulanBeranda.querySelectorAll(".produk-item");
    revealOnScroll(produk, cards, ["opacity-0", "translate-y-16"], 120, (card) => card.classList.add("show"));
  } catch (error) {
    console.error("Gagal memuat produk unggulan beranda:", error.message);
    produkUnggulanBeranda.innerHTML = '<p class="col-span-full text-center text-red-600">Produk unggulan belum dapat dimuat.</p>';
  }
}

produkUnggulanBeranda?.addEventListener("click", (event) => {
  const link = event.target.closest(".btn-beli");
  if (link?.dataset.productId) {
    fetch(`${INDEX_API_BASE_URL}/publik/produk/${link.dataset.productId}/view`, { method: "POST" }).catch(() => {});
  }
});

muatProdukUnggulanBeranda();

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
    card.style.transitionDelay = `${i * 0.15}s`; 
  });
});

// === MODAL ===
const modal = document.getElementById("myModal");
const modalBox = document.getElementById("modalBox");

function openModal() {
  if(!modal || !modalBox) return;
  modal.classList.remove("hidden");
  modalBox.classList.add("modal-enter");
  setTimeout(() => {
    modalBox.classList.add("modal-enter-active");
    modalBox.classList.remove("modal-enter");
  }, 10);
}

function closeModal() {
  if(!modal || !modalBox) return;
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

if(modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
}

// === HERO SLIDER ===
const slider = document.getElementById("slider");

let index = 0;
let total = 0;
let autoSlide;

function showSlide(i) {
  if(total === 0) return;
  index = (i + total) % total;
  slider.style.transform = `translateX(-${index * 100}%)`;
}

// Pasang event navigasi jika slider dan tombol tersedia
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

if (slider && nextBtn && prevBtn) {
    nextBtn.onclick = () => showSlide(index + 1);
    prevBtn.onclick = () => showSlide(index - 1);

    autoSlide = setInterval(() => {
      showSlide(index + 1);
    }, 4000);

    slider.addEventListener("mouseenter", () => clearInterval(autoSlide));
    slider.addEventListener("mouseleave", () => {
      autoSlide = setInterval(() => showSlide(index + 1), 4000);
    });

    let startX = 0;
    slider.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", (e) => {
        let endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) showSlide(index + 1);
        else if (endX - startX > 50) showSlide(index - 1);
      },
      { passive: true },
    );
}

// === CONTROL KEYBOARD ===
document.addEventListener("keydown", (e) => {
  if(!slider || total === 0) return;
  const tag = document.activeElement.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select" || document.activeElement.isContentEditable) return;

  if (e.key === "ArrowRight" || e.key === "End") {
    e.preventDefault();
    showSlide(index + 1);
  }
  if (e.key === "ArrowLeft" || e.key === "Home") {
    e.preventDefault();
    showSlide(index - 1);
  }
});

// === Animasi Hover Tombol Selengkapnya ===
const btnProduk = document.getElementById("btnProduk");
if (btnProduk) {
    btnProduk.addEventListener("mouseenter", () => btnProduk.classList.add("pulse-button"));
    btnProduk.addEventListener("mouseleave", () => btnProduk.classList.remove("pulse-button"));
}

// ======================
// SCROLL TO TOP
// ======================
const scrollTopBtn = document.getElementById("scrollTopBtn");
if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) scrollTopBtn.classList.add("show");
      else scrollTopBtn.classList.remove("show");
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// =======================
// CARD STATISTIK (API)
// ======================
const statCards = document.querySelectorAll(".stat-card");
const statistik = document.getElementById("statistik");

function animateCounter(counter) {
  const target = parseInt(counter.dataset.target) || 0;
  let current = 0;
  const increment = Math.ceil(target / 180) || 1;

  function update() {
    current += increment;
    if (current >= target) current = target;
    counter.textContent = current.toLocaleString("id-ID");
    if (current < target) requestAnimationFrame(update);
  }
  update();
}

async function loadStatistikPublik() {
  if(!statistik) return;
  try {
    const response = await fetch(`${INDEX_API_BASE_URL}/statistik/publik`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Statistik gagal dimuat.");

    statistik.querySelectorAll(".counter[data-statistik]").forEach((counter) => {
      const value = Number(result.data?.[counter.dataset.statistik]) || 0;
      counter.dataset.target = String(value);
      counter.textContent = "0";
    });

    const rect = statistik.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      statistik.querySelectorAll(".counter[data-statistik]").forEach(animateCounter);
    } else if (rect.bottom <= 0) {
      statistik.querySelectorAll(".counter[data-statistik]").forEach((counter) => {
        counter.textContent = Number(counter.dataset.target).toLocaleString("id-ID");
      });
    }
  } catch (error) {
    console.error("Gagal memuat statistik publik:", error.message);
  }
}

if(statistik) {
    revealOnScroll(
      statistik,
      statCards,
      ["opacity-0", "translate-y-10"],
      200,
      (card) => {
        card.querySelectorAll(".counter").forEach((counter) => animateCounter(counter));
      },
    );
    loadStatistikPublik();
}

// =====================================================
// PARALLAX BACKGROUND
// =====================================================
(function initParallax() {
  const parallaxEls = document.querySelectorAll(".parallax-bg");
  if (!parallaxEls.length) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compactDeviceQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
  const saveData = Boolean(navigator.connection?.saveData);

  if (reduceMotionQuery.matches || saveData) {
    parallaxEls.forEach((bg) => { bg.style.transform = "none"; });
    return;
  }

  const activeEls = new Set();
  let ticking = false;

  function updateParallax() {
    const viewportCenter = window.innerHeight / 2;
    const deviceMultiplier = compactDeviceQuery.matches ? 0.45 : 1;

    activeEls.forEach((bg) => {
      const wrap = bg.parentElement;
      const rect = wrap.getBoundingClientRect();
      const speed = parseFloat(bg.dataset.parallaxSpeed || "0.25") * deviceMultiplier;
      const elCenter = rect.top + rect.height / 2;
      const desiredOffset = (viewportCenter - elCenter) * speed;

      const availableTravel = Math.max(0, (bg.offsetHeight - rect.height) / 2);
      const offset = Math.max(-availableTravel, Math.min(availableTravel, desiredOffset));

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
          entry.target.classList.add("is-parallax-active");
        } else {
          activeEls.delete(entry.target);
          entry.target.classList.remove("is-parallax-active");
        }
      });

      if (activeEls.size > 0) {
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    },
    { rootMargin: "150px 0px 150px 0px" },
  );

  parallaxEls.forEach((el) => io.observe(el));
  window.addEventListener("resize", onScroll, { passive: true });
  window.addEventListener("orientationchange", onScroll, { passive: true });
})();

// =====================================================
// TARIK DATA DARI CMS PROFIL (HERO, SAMBUTAN, VISI MISI)
// =====================================================
async function loadDataBeranda() {
  try {
    const response = await fetch(`${INDEX_API_BASE_URL}/cmsprofil`);
    const result = await response.json();
    
    if (result.success && result.data && result.data.length > 0) {
      const dataCMS = result.data;
      const dataUtama = dataCMS[0]; 

      // 1. UPDATE SLIDER / HERO
      const sliderEl = document.getElementById("slider");
      if (sliderEl) {
        sliderEl.innerHTML = ""; 
        
        dataCMS.forEach(item => {
          if (item.gambar_url) {
            sliderEl.innerHTML += `
              <div class="min-w-full relative">
               <img alt="${escapeProdukHTML(item.judul_hero || 'Hero')}" class="hero-image object-cover w-full h-[100vh]" src="${item.gambar_url}"/>
              </div>
            `;
          }
        });
        
        const slidesBaru = document.querySelectorAll("#slider > div");
        total = slidesBaru.length;
        index = 0;
        
        // Render slide pertama agar tidak kosong
        if(total > 0) showSlide(0);
      }

      // 2. UPDATE SAMBUTAN, FOTO & NAMA KADES
      const fotoKades = document.getElementById("fotoKadesPublik");
      const sambutanTeks = document.getElementById("sambutanPublik");
      const namaKadesEl = document.getElementById("namaKadesPublik");
      
      if (fotoKades && dataUtama.foto_kades_url) fotoKades.src = dataUtama.foto_kades_url;
      if (sambutanTeks && dataUtama.sambutan) sambutanTeks.innerText = dataUtama.sambutan;
      if (namaKadesEl && dataUtama.nama_kades) namaKadesEl.innerText = dataUtama.nama_kades;

      // 3. UPDATE VISI & MISI
      const visiTeks = document.getElementById("visiPublik");
      const misiList = document.getElementById("misiPublik");
      
      if (visiTeks && dataUtama.visi) visiTeks.innerText = `"${dataUtama.visi}"`;
      if (misiList && dataUtama.misi) {
        misiList.innerHTML = ""; 
        const poinMisi = dataUtama.misi.split('\n'); 
        poinMisi.forEach(poin => {
          if(poin.trim() !== "") {
            misiList.innerHTML += `<li class="mb-2">${escapeProdukHTML(poin.trim())}</li>`;
          }
        });
      }

      // 4. UPDATE GAMBAR MODAL PENGUMUMAN
      const imgModalEl = document.getElementById("gambarModalPublik");
      if (imgModalEl && dataUtama.gambar_modal_url) {
        imgModalEl.src = dataUtama.gambar_modal_url;
      }

      // 5. UPDATE TEKS MODAL PERATURAN
      const judulPeraturanEl = document.getElementById("peraturanModalJudul");
      const isiPeraturanEl = document.getElementById("peraturanModalIsi");

      if (judulPeraturanEl && dataUtama.peraturan_judul) {
        judulPeraturanEl.textContent = dataUtama.peraturan_judul;
      }
      if (isiPeraturanEl && dataUtama.peraturan_isi) {
        isiPeraturanEl.textContent = dataUtama.peraturan_isi;
      }

    }
  } catch (error) {
    console.error("Gagal menarik data CMS Beranda:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDataBeranda();
});

// ==========================================
// FUNGSI BUKA/TUTUP MODAL PERATURAN
// ==========================================
function bukaModalPeraturan() {
  const modal = document.getElementById("peraturanModal");
  const modalBox = document.getElementById("peraturanModalBox");
  if (modal && modalBox) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    // Animasi muncul
    setTimeout(() => {
      modalBox.classList.remove("opacity-0", "scale-95");
      modalBox.classList.add("opacity-100", "scale-100");
    }, 10);
  }
}

function tutupModalPeraturan() {
  const modal = document.getElementById("peraturanModal");
  const modalBox = document.getElementById("peraturanModalBox");
  if (modal && modalBox) {
    // Animasi hilang
    modalBox.classList.remove("opacity-100", "scale-100");
    modalBox.classList.add("opacity-0", "scale-95");
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }, 200); // Menunggu transisi CSS selesai
  }
}

// Daftarkan tombol tutup (X) dan tombol "Tutup" di bawah
const btnTutupAtas = document.getElementById("tutupPeraturan");
const btnTutupBawah = document.getElementById("tutupPeraturanBawah");
if (btnTutupAtas) btnTutupAtas.addEventListener("click", tutupModalPeraturan);
if (btnTutupBawah) btnTutupBawah.addEventListener("click", tutupModalPeraturan);