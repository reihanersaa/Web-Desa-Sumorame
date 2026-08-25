// ======================================================
// LEMBAGA.JS
// WEBSITE DESA SUMORAME
// ======================================================


// ======================================================
// 1. NAVBAR MOBILE
// ======================================================

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

let isOpen = false;

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    isOpen = !isOpen;

    if (isOpen) {
      mobileMenu.classList.remove(
        "max-h-0",
        "opacity-0"
      );

      mobileMenu.classList.add(
        "max-h-[600px]",
        "opacity-100"
      );

      menuBtn.textContent = "close";
    } else {
      mobileMenu.classList.remove(
        "max-h-[600px]",
        "opacity-100"
      );

      mobileMenu.classList.add(
        "max-h-0",
        "opacity-0"
      );

      menuBtn.textContent = "menu";
    }
  });


  // Tutup menu jika klik di luar
  document.addEventListener("click", (e) => {
    const isClickInsideMenu = mobileMenu.contains(e.target);
    const isClickButton = menuBtn.contains(e.target);

    if (
      isOpen &&
      !isClickInsideMenu &&
      !isClickButton
    ) {
      mobileMenu.classList.remove(
        "max-h-[600px]",
        "opacity-100"
      );

      mobileMenu.classList.add(
        "max-h-0",
        "opacity-0"
      );

      menuBtn.textContent = "menu";
      isOpen = false;
    }
  });
}


// ======================================================
// 2. ANIMASI NAVBAR
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
// 3. ANIMASI FOOTER
// ======================================================

const footer = document.getElementById("footer");
const footerItems = document.querySelectorAll(".footer-item");

window.addEventListener("scroll", () => {
  if (!footer) return;

  const trigger = window.innerHeight;

  if (
    footer.getBoundingClientRect().top <
    trigger - 100
  ) {
    footer.classList.remove(
      "opacity-0",
      "translate-y-10"
    );

    footerItems.forEach((item, i) => {
      setTimeout(() => {
        item.classList.remove(
          "opacity-0",
          "translate-y-6"
        );
      }, i * 200);
    });
  }
});


// ======================================================
// 4. ANIMASI HERO
// ======================================================

const heroItems = document.querySelectorAll(".hero-item");

window.addEventListener("load", () => {
  heroItems.forEach((item, i) => {
    setTimeout(() => {
      item.classList.remove(
        "opacity-0",
        "-translate-x-16"
      );
    }, i * 200);
  });
});


// ======================================================
// 5. ANIMASI KONTAK
// ======================================================

const kontakItems = document.querySelectorAll(".kontak-item");

window.addEventListener("scroll", () => {
  if (!footer) return;

  const trigger = window.innerHeight;

  if (
    footer.getBoundingClientRect().top <
    trigger - 100
  ) {
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


// ======================================================
// 6. ANIMASI SUARA NAVBAR
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      const text = item.textContent.trim();

      if (!text) return;

      const speech =
        new SpeechSynthesisUtterance(text);

      speech.lang = "id-ID";
      speech.rate = 1;

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(speech);
    });
  });
});


// ======================================================
// 7. HEADER HILANG HANYA DI PALING ATAS
// ======================================================

const mainHeader =
  document.getElementById("mainHeader");

const heroSection =
  document.getElementById("heroSection");

window.addEventListener("scroll", () => {
  if (!mainHeader || !heroSection) return;

  if (window.scrollY <= 0) {
    mainHeader.classList.add("header-hidden");
    heroSection.classList.add("hero-top");
  } else {
    mainHeader.classList.remove("header-hidden");
    heroSection.classList.remove("hero-top");
  }
});


// ======================================================
// 8. SCROLL TO TOP
// ======================================================

const scrollTopBtn =
  document.getElementById("scrollTopBtn");

if (scrollTopBtn) {
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
}


// ======================================================
// 9. ANIMASI CARD PUBLIKASI
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  const cards =
    document.querySelectorAll(".pub-card");

  if (cards.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    {
      threshold: 0.2
    }
  );

  cards.forEach((card, i) => {
    observer.observe(card);

    card.style.transitionDelay =
      `${i * 0.15}s`;
  });
});


// ======================================================
// 10. GET DATA KELEMBAGAAN DARI BACKEND
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  getKelembagaan();
});


// ======================================================
// 11. FUNGSI GET KELEMBAGAAN
// ======================================================

async function getKelembagaan() {
  const container =
    document.getElementById(
      "kelembagaanContainer"
    );

  if (!container) {
    console.error(
      "Element #kelembagaanContainer tidak ditemukan."
    );

    return;
  }


  try {

    // ==================================================
    // LOADING
    // ==================================================

    container.innerHTML = `
      <div
        class="
          py-16
          flex
          flex-col
          items-center
          justify-center
          gap-3
          text-gray-500
        "
      >

        <span
          class="
            material-symbols-outlined
            text-4xl
            animate-spin
          "
        >
          progress_activity
        </span>

        <p class="text-base md:text-lg">
          Memuat data kelembagaan...
        </p>

      </div>
    `;


    // ==================================================
    // REQUEST GET KE BACKEND
    // ==================================================

    const response = await fetch(
      "http://localhost:3000/api/kelembagaan"
    );


    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status}`
      );
    }


    const result =
      await response.json();


    // ==================================================
    // DEBUG RESPONSE BACKEND
    // ==================================================

    console.log(
      "================================"
    );

    console.log(
      "RESPONSE API KELEMBAGAAN:"
    );

    console.log(result);

    console.log(
      "================================"
    );


    if (!result.success) {
      throw new Error(
        result.message ||
        "Gagal mengambil data kelembagaan."
      );
    }


    const data = result.data;


    // ==================================================
    // CEK DATA
    // ==================================================

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      container.innerHTML = `
        <div
          class="
            py-16
            text-gray-500
            text-base
            md:text-lg
          "
        >
          Data kelembagaan belum tersedia.
        </div>
      `;

      return;
    }


    // ==================================================
    // DEBUG FIELD DATABASE
    // ==================================================

    console.log(
      "JUMLAH DATA:",
      data.length
    );


    data.forEach((item, index) => {

      console.log(
        `DATA KELEMBAGAAN KE-${index + 1}:`,
        item
      );

      console.log(
        "Nama:",
        item.nama
      );

      console.log(
        "Gambar:",
        item.gambar
      );

      console.log(
        "Logo:",
        item.logo
      );

      console.log(
        "Pengertian:",
        item.pengertian
      );

      console.log(
        "Tugas:",
        item.tugas
      );

      console.log(
        "Tujuan:",
        item.tujuan
      );

      console.log(
        "--------------------------------"
      );
    });


    // ==================================================
    // KOSONGKAN CONTAINER
    // ==================================================

    container.innerHTML = "";


    // ==================================================
    // TAMPILKAN DATA
    // ==================================================

    data.forEach((item) => {

      const section =
        document.createElement("section");

      section.className =
        "mb-16 kelembagaan-item";


      section.innerHTML = `

        <!-- ====================================== -->
        <!-- JUDUL -->
        <!-- ====================================== -->

        <h1
          class="
            text-2xl
            md:text-3xl
            font-bold
            text-black
            mb-2
          "
        >
          ${escapeHTML(
            item.nama || "-"
          )}
        </h1>


        <!-- ====================================== -->
        <!-- GARIS -->
        <!-- ====================================== -->

        <div class="flex justify-center mb-8">

          <div
            class="
              w-20
              h-1
              bg-yellow-400
              rounded
            "
          ></div>

        </div>


        <!-- ====================================== -->
        <!-- GAMBAR UTAMA -->
        <!-- ====================================== -->

        ${buatGambarUtama(item)}


        <!-- ====================================== -->
        <!-- LOGO -->
        <!-- ====================================== -->

        ${buatLogo(item)}


        <!-- ====================================== -->
        <!-- PENGERTIAN -->
        <!-- ====================================== -->

        ${
          item.pengertian
            ? `
              <div
                class="
                  text-green-700
                  text-base
                  md:text-lg
                  leading-relaxed
                  mb-7
                "
              >

                <p>
                  ${formatText(
                    item.pengertian
                  )}
                </p>

              </div>
            `
            : ""
        }


        <!-- ====================================== -->
        <!-- TUGAS -->
        <!-- ====================================== -->

        ${
          item.tugas
            ? `
              <div
                class="
                  text-green-700
                  text-base
                  md:text-lg
                  leading-relaxed
                  mb-7
                "
              >

                <h3
                  class="
                    font-bold
                    text-green-800
                    mb-3
                  "
                >
                  Tugas ${escapeHTML(
                    item.singkatan ||
                    item.nama ||
                    ""
                  )}
                </h3>

                <p>
                  ${formatText(
                    item.tugas
                  )}
                </p>

              </div>
            `
            : ""
        }


        <!-- ====================================== -->
        <!-- TUJUAN -->
        <!-- ====================================== -->

        ${
          item.tujuan
            ? `
              <div
                class="
                  text-green-700
                  text-base
                  md:text-lg
                  leading-relaxed
                "
              >

                <h3
                  class="
                    font-bold
                    text-green-800
                    mb-3
                  "
                >
                  Tujuan ${escapeHTML(
                    item.singkatan ||
                    item.nama ||
                    ""
                  )}
                </h3>

                <p>
                  ${formatText(
                    item.tujuan
                  )}
                </p>

              </div>
            `
            : ""
        }

      `;


      container.appendChild(section);
    });


  } catch (error) {

    console.error(
      "Error mengambil data kelembagaan:",
      error
    );


    container.innerHTML = `
      <div
        class="
          py-12
          px-6
          bg-red-50
          border
          border-red-200
          rounded-xl
          text-red-600
        "
      >

        <span
          class="
            material-symbols-outlined
            text-4xl
            mb-2
          "
        >
          error
        </span>

        <p class="font-semibold">
          Gagal memuat data kelembagaan.
        </p>

        <p class="text-sm mt-2">
          Silakan coba kembali beberapa saat lagi.
        </p>

      </div>
    `;
  }
}


// ======================================================
// 12. FUNGSI MEMBUAT PATH GAMBAR
// ======================================================

function buatPathGambar(file) {

  if (!file) {
    return "";
  }


  let src =
    String(file).trim();


  // ====================================================
  // URL LENGKAP
  // ====================================================

  if (
    src.startsWith("http://") ||
    src.startsWith("https://")
  ) {
    return src;
  }


  // ====================================================
  // BASE64
  // ====================================================

  if (
    src.startsWith("data:image/")
  ) {
    return src;
  }


  // ====================================================
  // PATH RELATIF / ABSOLUT SUDAH ADA
  // ====================================================

  if (
    src.startsWith("../") ||
    src.startsWith("./") ||
    src.startsWith("/")
  ) {
    return src;
  }


  // ====================================================
  // DATABASE HANYA SIMPAN NAMA FILE
  // Contoh:
  // lpm.png
  // foto_lpm.jpg
  // pkk.webp
  // ====================================================

  return `../img/${src}`;
}


// ======================================================
// 13. GAMBAR UTAMA
// ======================================================

function buatGambarUtama(item) {

  const gambar =
    item.gambar ||
    item.foto ||
    item.gambar_url ||
    item.foto_lembaga ||
    item.gambar_path ||
    item.foto_bukti;


  if (!gambar) {

    console.warn(
      `Gambar utama tidak tersedia untuk: ${item.nama}`
    );

    return "";
  }


  const src =
    buatPathGambar(gambar);


  console.log(
    `PATH GAMBAR ${item.nama}:`,
    src
  );


  return `
    <div
      class="
        flex
        justify-center
        mb-8
      "
    >

      <img
        src="${escapeAttribute(src)}"

        alt="Gambar ${escapeAttribute(
          item.nama ||
          "Kelembagaan"
        )}"

        class="
          w-full
          max-w-[200px]
          h-auto
          object-cover
          rounded-xl
        "

        onerror="
          console.error(
            'Gambar utama gagal dimuat:',
            this.src
          );
        "
      >

    </div>
  `;
}


// ======================================================
// 14. LOGO KELEMBAGAAN
// ======================================================

function buatLogo(item) {

  const logo =
    item.logo;


  if (!logo) {

    console.warn(
      `Logo tidak tersedia untuk: ${item.nama}`
    );

    return "";
  }


  const src =
    buatPathGambar(logo);


  console.log(
    `PATH LOGO ${item.nama}:`,
    src
  );


  return `
    <div
      class="
        flex
        justify-center
        mb-8
      "
    >

      <img
        src="${escapeAttribute(src)}"

        alt="Logo ${escapeAttribute(
          item.nama ||
          "Kelembagaan"
        )}"

        class="
          w-40
          h-auto
          object-contain
        "

        onerror="
          console.error(
            'Logo gagal dimuat:',
            this.src
          );
        "
      >

    </div>
  `;
}


// ======================================================
// 15. FORMAT TEXT DATABASE
// ======================================================

function formatText(text) {

  if (!text) {
    return "";
  }


  return escapeHTML(
    String(text)
  ).replace(
    /\r?\n/g,
    "<br>"
  );
}


// ======================================================
// 16. ESCAPE HTML
// ======================================================

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ======================================================
// 17. ESCAPE ATTRIBUTE
// ======================================================

function escapeAttribute(value) {

  return escapeHTML(value);
}