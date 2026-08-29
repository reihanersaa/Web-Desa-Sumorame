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
    mobileMenu.classList.remove("max-h-[500px]", "opacity-100");
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

// === Animasi Header ===
const heroItems = document.querySelectorAll(".hero-item");

window.addEventListener("load", () => {
  heroItems.forEach((item, i) => {
    setTimeout(() => {
      item.classList.remove("opacity-0", "-translate-x-16");
    }, i * 200);
  });
});

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

// ======================================================
// PRODUK
// ======================================================

const produk = document.querySelector("#produk");

let produkItems = [];

// ======================================================
// UPDATE REFERENSI CARD
// ======================================================

function updateProdukItems() {
  produkItems = document.querySelectorAll("#produk .produk-item");

  updateTombolBeli();
}

// ======================================================
// ANIMASI PRODUK
// ======================================================

function animasiProduk() {
  const items = document.querySelectorAll("#produk .produk-item");

  items.forEach((item, i) => {
    setTimeout(() => {
      item.classList.add("show");
    }, i * 120);
  });
}

// ======================================================
// MODAL PASARKAN PRODUK
// ======================================================

const btnProduk = document.getElementById("btnProduk");

const produkModal = document.getElementById("produkModal");

const produkModalContent = document.getElementById("produkModalContent");

const closeProdukModal = document.getElementById("closeProdukModal");

const cancelProduk = document.getElementById("cancelProduk");

const formProduk = document.getElementById("formProduk");
const guestProdukModal = document.getElementById("guestProdukModal");
const guestProdukBox = document.getElementById("guestProdukBox");
const btnNantiProduk = document.getElementById("btnNantiProduk");
const btnLoginProduk = document.getElementById("btnLoginProduk");
const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";

function bukaModalGuestProduk() {
  if (!guestProdukModal) return;
  guestProdukModal.classList.remove("hidden");
  guestProdukModal.classList.add("flex");
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
    guestProdukModal.classList.add("modal-show");
    guestProdukBox?.focus();
  });
}

function tutupModalGuestProduk() {
  if (!guestProdukModal) return;
  guestProdukModal.classList.remove("modal-show");
  window.setTimeout(() => {
    guestProdukModal.classList.add("hidden");
    guestProdukModal.classList.remove("flex");
    document.body.style.overflow = "";
    btnProduk?.focus();
  }, 200);
}

btnNantiProduk?.addEventListener("click", tutupModalGuestProduk);
btnLoginProduk?.addEventListener("click", () => {
  window.AuthSession?.requireLogin("/Produk?action=pasarkan");
});
guestProdukModal?.addEventListener("click", (event) => {
  if (event.target === guestProdukModal) tutupModalGuestProduk();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && guestProdukModal?.classList.contains("flex")) {
    tutupModalGuestProduk();
  }
});

// ======================================================
// CEK ELEMEN MODAL
// ======================================================

if (
  btnProduk &&
  produkModal &&
  produkModalContent &&
  closeProdukModal &&
  cancelProduk &&
  formProduk
) {
  // ================================================
  // BUKA MODAL
  // ================================================

  btnProduk.addEventListener("click", () => {
    const session = window.AuthSession?.get();
    if (!session) {
      bukaModalGuestProduk();
      return;
    }

    produkModal.classList.remove("hidden");

    produkModal.classList.add("flex");

    setTimeout(() => {
      produkModal.classList.add("modal-show");
    }, 10);
  });

  // ================================================
  // TUTUP MODAL
  // ================================================

  function tutupModalProduk() {
    produkModal.classList.remove("modal-show");

    setTimeout(() => {
      produkModal.classList.remove("flex");

      produkModal.classList.add("hidden");
    }, 300);
  }

  // ================================================
  // BUTTON CLOSE
  // ================================================

  closeProdukModal.addEventListener("click", tutupModalProduk);

  cancelProduk.addEventListener("click", tutupModalProduk);

  // ================================================
  // KLIK AREA LUAR
  // ================================================

  produkModal.addEventListener("click", (e) => {
    if (e.target === produkModal) {
      tutupModalProduk();
    }
  });

  // ================================================
  // SUBMIT FORM
  // ================================================

  formProduk.addEventListener("submit", async (e) => {
    e.preventDefault();

    const session = window.AuthSession?.get();
    if (!session) {
      tutupModalProduk();
      bukaModalGuestProduk();
      return;
    }

    const nama = document.getElementById("namaProduk").value.trim();

    const harga = document.getElementById("hargaProduk").value;

    const kontak = document.getElementById("kontakProduk").value.trim();

    const deskripsi = document.getElementById("deskripsiProduk").value.trim();

    const file = document.getElementById("gambarProduk").files[0];

    // ========================================
    // VALIDASI
    // ========================================

    if (!nama || !harga || !kontak || !file) {
      Swal.fire({
        icon: "warning",

        title: "Data belum lengkap",

        text: "Silakan lengkapi semua data produk.",

        confirmButtonColor: "#166534",
      });

      return;
    }

    if (!/^\d{9,15}$/.test(kontak.replace(/\D/g, ""))) {
      Swal.fire({
        icon: "warning",
        title: "Nomor WhatsApp tidak valid",
        text: "Masukkan 9 sampai 15 angka tanpa spasi atau tanda baca.",
        confirmButtonColor: "#166534",
      });

      return;
    }

    // ========================================
    // CEK GAMBAR
    // ========================================

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",

        title: "File tidak valid",

        text: "Silakan pilih file gambar.",

        confirmButtonColor: "#166534",
      });

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      return Swal.fire({
        icon: "warning",
        title: "Gambar terlalu besar",
        text: "Ukuran gambar maksimal 2 MB.",
        confirmButtonColor: "#166534",
      });
    }

    try {
      const formData = new FormData();
      formData.append("nama_produk", nama);
      formData.append("deskripsi", deskripsi);
      formData.append("harga", harga);
      formData.append("kontak_penjual", kontak);
      formData.append("gambar", file);

      const response = await fetch(`${API_BASE_URL}/publik/produk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: formData,
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        tutupModalProduk();
        bukaModalGuestProduk();
        return;
      }
      if (!response.ok)
        throw new Error(result.message || "Produk gagal diajukan.");
      formProduk.reset();
      tutupModalProduk();
      Swal.fire({
        icon: "success",
        title: "Produk berhasil diajukan!",
        text: `${nama} akan tampil setelah disetujui admin.`,
        confirmButtonColor: "#166534",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Pengajuan gagal",
        text: error.message,
        confirmButtonColor: "#166534",
      });
    }
  });

  if (
    new URLSearchParams(window.location.search).get("action") === "pasarkan" &&
    window.AuthSession?.isAuthenticated()
  ) {
    btnProduk.click();
    window.history.replaceState({}, "", "/Produk");
  }
}

// ======================================================
// FORMAT RUPIAH
// ======================================================

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text ?? "";

  return div.innerHTML;
}

function isSafeImageUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(String(value), window.location.origin);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getProductImageCandidates(item) {
  const candidates = [
    item.gambar_url,
    item.gambar,
    ...(Array.isArray(item.gambar_alternatif) ? item.gambar_alternatif : []),
  ];
  return [...new Set(candidates.filter(Boolean).map(String))].filter(isSafeImageUrl);
}

function pasangFallbackGambar(img, candidates, label) {
  let nextIndex = 1;
  const gagal = () => {
    if (nextIndex < candidates.length) {
      img.src = candidates[nextIndex++];
      return;
    }
    const fallback = document.createElement("div");
    fallback.className = "produk-image-fallback";
    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "image_not_supported";
    const text = document.createElement("span");
    text.textContent = `Foto ${label} belum tersedia`;
    fallback.append(icon, text);
    img.replaceWith(fallback);
  };
  img.addEventListener("error", gagal);
  if (!candidates.length) gagal();
}

// ======================================================
// RENDER PRODUK
// ======================================================

async function renderProduk() {
  const container = document.getElementById("produk");

  if (!container) return;
  container.setAttribute("aria-busy", "true");
  try {
    const response = await fetch(`${API_BASE_URL}/publik/produk`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Produk gagal dimuat.");

    const items = (result.data || []).map((item) => ({
      id: item.id,
      nama: item.nama_produk,
      harga: item.harga,
      penjual: item.nama_penjual,
      kontak: item.kontak_penjual,
      deskripsi: item.deskripsi,
      gambar: item.gambar,
      gambar_url: item.gambar_url,
      gambar_alternatif: item.gambar_alternatif,
    })).sort((a, b) => a.nama.localeCompare(b.nama, "id", { sensitivity: "base" }));

    container.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "col-span-full py-10 text-center text-gray-500";
      empty.textContent = "Belum ada produk yang disetujui admin.";
      container.appendChild(empty);
      return;
    }

    items.forEach((item) => container.appendChild(buatCardProduk(item)));
    updateProdukItems();
    animasiProduk();
  } catch (error) {
    console.error("Gagal memuat produk:", error.message);
    container.innerHTML = `<p class="col-span-full py-10 text-center text-red-600">${escapeHTML(error.message)}</p>`;
  } finally {
    container.removeAttribute("aria-busy");
  }
}

// ======================================================
// BUAT CARD PRODUK DINAMIS
// ======================================================
function buatCardProduk(item) {
  const card = document.createElement("div");

  card.className =
    "produk-item produk-dynamic group " +
    "w-full bg-white rounded-md " +
    "overflow-hidden shadow-lg";

  const imageCandidates = getProductImageCandidates(item);
  card.innerHTML = `

    <!-- GAMBAR -->
    <div class="produk-image-wrap overflow-hidden">

      <img
        src="${escapeHTML(imageCandidates[0] || "")}"
        alt="${escapeHTML(item.nama)}"
        loading="lazy"
        decoding="async"
        class="w-full h-full object-cover"
      >

    </div>

    <!-- INFORMASI -->
    <div class="produk-info bg-yellow-400/85 px-3 py-2">

      <!-- NAMA -->
      <h3 class="produk-nama font-bold text-lg">
        ${escapeHTML(item.nama)}
      </h3>

      <div
        class="flex justify-between items-center mt-2"
      >

        <!-- HARGA -->
        <p
          class="produk-harga text-2xl font-bold text-green-800"
        >
          ${formatRupiah(item.harga)}
        </p>

        <!-- PENJUAL -->
        <span class="text-sm text-gray-700">
          ${escapeHTML(item.penjual)}
        </span>

      </div>

      <!-- BELI -->
      <button
        type="button"
        class="btn-beli mt-2 w-full
               bg-green-700 text-white
               py-2 rounded-md
               hover:bg-green-800
               transition"
        data-id="${item.id || ""}"
        data-kontak="${escapeHTML(item.kontak || "")}"
      >
        Beli
      </button>

    </div>
  `;

  const productImage = card.querySelector("img");
  if (productImage) pasangFallbackGambar(productImage, imageCandidates, item.nama);

  return card;
}

// ======================================================
// TOMBOL BELI
// ======================================================

function updateTombolBeli() {
  const beliButtons = document.querySelectorAll("#produk .btn-beli");

  beliButtons.forEach((btn) => {
    // Jangan pasang listener dua kali
    if (btn.dataset.listener === "true") {
      return;
    }

    btn.dataset.listener = "true";

    btn.addEventListener("click", async () => {
      const card = btn.closest(".produk-item");

      const namaProduk = card.querySelector("h3").textContent.trim();

      const productId = btn.dataset.id;
      const kontak = btn.dataset.kontak;

      if (productId) {
        fetch(`${API_BASE_URL}/publik/produk/${productId}/view`, {
          method: "POST",
        }).catch(() => {});
      }

      if (kontak) {
        const nomor = kontak.replace(/\D/g, "").replace(/^0/, "62");
        window.open(
          `https://wa.me/${nomor}?text=${encodeURIComponent(`Halo, saya tertarik dengan ${namaProduk}`)}`,
          "_blank",
          "noopener",
        );
        return;
      }

      Swal.fire({
        icon: "success",

        title: "Produk Dipilih",

        html: `
                        <b>
                            ${escapeHTML(namaProduk)}
                        </b>

                        <br><br>

                        Produk berhasil
                        dimasukkan ke daftar
                        pembelian.
                    `,

        confirmButtonColor: "#166534",
      });
    });
  });
}

// ======================================================
// SEARCH
// ======================================================

const searchInput = document.querySelector('input[type="text"]');

if (searchInput) {
  searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase().trim();

    updateProdukItems();

    produkItems.forEach((card) => {
      const namaProduk =
        card.querySelector("h3")?.textContent.toLowerCase() || "";

      const penjual =
        card.querySelector("span")?.textContent.toLowerCase() || "";

      if (namaProduk.includes(keyword) || penjual.includes(keyword)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
}

// ======================================================
// LOAD PRODUK
// ======================================================

window.addEventListener("load", () => {
  renderProduk();
});
