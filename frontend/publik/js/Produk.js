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
const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";

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
      window.AuthSession?.requireLogin("/Produk.html?action=pasarkan");
      return;
    }

    const nikInput = document.getElementById("NIK");
    if (nikInput && session.nik) {
      nikInput.value = session.nik;
      nikInput.readOnly = true;
      nikInput.title = "NIK berasal dari akun warga yang sedang login.";
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
      window.AuthSession?.requireLogin("/Produk.html?action=pasarkan");
      return;
    }

    const nik = document.getElementById("NIK").value.trim();

    const nama = document.getElementById("namaProduk").value.trim();

    const harga = document.getElementById("hargaProduk").value;

    const penjual = document.getElementById("penjualProduk").value.trim();

    const kontak = document.getElementById("kontakProduk").value.trim();

    const deskripsi = document.getElementById("deskripsiProduk").value.trim();

    const file = document.getElementById("gambarProduk").files[0];

    // ========================================
    // VALIDASI
    // ========================================

    if (!nik || !nama || !harga || !penjual || !kontak || !file) {
      Swal.fire({
        icon: "warning",

        title: "Data belum lengkap",

        text: "Silakan lengkapi semua data produk.",

        confirmButtonColor: "#166534",
      });

      return;
    }

    if (!/^\d{16}$/.test(nik)) {
      Swal.fire({
        icon: "warning",
        title: "NIK tidak valid",
        text: "NIK harus terdiri dari tepat 16 angka.",
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
      formData.append("nik", nik);
      formData.append("nama_produk", nama);
      formData.append("deskripsi", deskripsi);
      formData.append("harga", harga);
      formData.append("nama_penjual", penjual);
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
        window.AuthSession?.requireLogin("/Produk.html?action=pasarkan");
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
    window.history.replaceState({}, "", "/Produk.html");
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

  div.textContent = text;

  return div.innerHTML;
}

// ======================================================
// RENDER PRODUK
// ======================================================

async function renderProduk() {
  const container = document.getElementById("produk");

  if (!container) return;

  // ================================================
  // AMBIL PRODUK TAMBAHAN
  // ================================================

  let produkTambahan = [];
  try {
    const response = await fetch(`${API_BASE_URL}/publik/produk`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Produk gagal dimuat.");
    container
      .querySelectorAll(".produk-item:not(.produk-dynamic)")
      .forEach((item) => item.remove());
    produkTambahan = (result.data || []).map((item) => ({
      id: item.id,
      nama: item.nama_produk,
      harga: item.harga,
      penjual: item.nama_penjual,
      kontak: item.kontak_penjual,
      deskripsi: item.deskripsi,
      gambar: item.gambar,
    }));
  } catch (error) {
    console.error("Gagal memuat produk:", error.message);
  }

  // ================================================
  // HAPUS CARD DINAMIS LAMA
  // ================================================

  container.querySelectorAll(".produk-dynamic").forEach((item) => {
    item.remove();
  });

  // ================================================
  // AMBIL PRODUK HTML
  // ================================================

  const produkHTML = Array.from(container.querySelectorAll(".produk-item"));

  const semuaProduk = [];

  // ================================================
  // PRODUK BAWAAN HTML
  // ================================================

  produkHTML.forEach((card) => {
    if (card.classList.contains("produk-dynamic")) {
      return;
    }

    const nama = card.querySelector("h3")?.textContent.trim() || "";

    const penjual = card.querySelector("span")?.textContent.trim() || "";

    const hargaText = card.querySelector("p")?.textContent || "";

    const harga = parseInt(hargaText.replace(/\D/g, "")) || 0;

    semuaProduk.push({
      nama: nama,

      harga: harga,

      penjual: penjual,

      element: card,

      dynamic: false,
    });
  });

  // ================================================
  // PRODUK DARI LOCAL STORAGE
  // ================================================

  produkTambahan.forEach((item) => {
    semuaProduk.push({
      nama: item.nama,

      harga: item.harga,

      penjual: item.penjual,

      gambar: item.gambar,

      id: item.id,

      dynamic: true,
    });
  });

  // ================================================
  // SORTING A-Z
  // ================================================

  semuaProduk.sort((a, b) => {
    return a.nama.localeCompare(b.nama, "id", {
      sensitivity: "base",
    });
  });

  // ================================================
  // TAMPILKAN
  // ================================================

  semuaProduk.forEach((item) => {
    if (item.dynamic) {
      const card = buatCardProduk(item);

      container.appendChild(card);
    } else {
      container.appendChild(item.element);
    }
  });

  // ================================================
  // UPDATE
  // ================================================

  updateProdukItems();

  animasiProduk();
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

  card.innerHTML = `

    <!-- GAMBAR -->
    <div class="overflow-hidden">

      <img
        src="${item.gambar}"
        alt="${escapeHTML(item.nama)}"
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
