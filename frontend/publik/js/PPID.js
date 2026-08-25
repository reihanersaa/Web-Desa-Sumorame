/* =========================================================
   PPID.js
   PUBLIK PPID - WEBSITE DESA SUMORAME
========================================================= */


// =========================================================
// 1. KONFIGURASI API
// =========================================================

const API_BASE_URL = "http://localhost:3000";

const API_PPID = {
  struktur: `${API_BASE_URL}/api/ppid`,
  pdf: `${API_BASE_URL}/api/ppid/pdf`
};


// =========================================================
// 2. HELPER RESPONSE API
// =========================================================

async function parseResponse(response) {
  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error(
      "Response dari server tidak valid."
    );
  }


  if (!response.ok) {
    throw new Error(
      result.message ||
      result.error ||
      `HTTP Error ${response.status}`
    );
  }


  return result;
}


// =========================================================
// 3. HELPER URL FILE
// =========================================================

function getFileURL(path) {
  if (!path) {
    return "";
  }


  const filePath =
    String(path).trim();


  // URL lengkap
  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }


  // Path diawali /
  // contoh:
  // /uploads/ppid/file.pdf
  if (filePath.startsWith("/")) {
    return `${API_BASE_URL}${filePath}`;
  }


  // Path biasa
  // contoh:
  // uploads/ppid/file.pdf
  return `${API_BASE_URL}/${filePath}`;
}


// =========================================================
// 4. ESCAPE HTML
// =========================================================

function escapeHTML(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }


  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =========================================================
// 5. FORMAT UKURAN FILE
// =========================================================

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }


  // Jika backend sudah memberikan string
  // contoh: "2.5 MB"
  if (typeof bytes === "string") {
    return bytes;
  }


  const number =
    Number(bytes);


  if (
    Number.isNaN(number) ||
    number <= 0
  ) {
    return "0 KB";
  }


  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB"
  ];


  const index =
    Math.floor(
      Math.log(number) /
      Math.log(1024)
    );


  const size =
    number /
    Math.pow(1024, index);


  return `${
    size.toFixed(
      index === 0 ? 0 : 2
    )
  } ${units[index]}`;
}


// =========================================================
// 6. DOM CONTENT LOADED
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // =====================================================
    // LOAD DATA BACKEND
    // =====================================================

    loadStrukturPPID();
    loadDaftarPDFPPID();


    // =====================================================
    // ANIMASI CARD + MAP + BANNER
    // =====================================================

    const cards =
      document.querySelectorAll(
        ".ppid-menu, .ppid-card, .map-card"
      );

    const banners =
      document.querySelectorAll(
        ".banner-item"
      );


    const observer =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              entry.target.classList.remove(
                "opacity-0",
                "translate-y-10"
              );


              entry.target.classList.add(
                "opacity-100",
                "translate-y-0"
              );


              // =========================
              // ANIMASI BANNER MAP
              // =========================

              if (
                entry.target.classList.contains(
                  "map-card"
                )
              ) {

                banners.forEach(
                  (banner, i) => {

                    setTimeout(() => {

                      banner.classList.remove(
                        "opacity-0",
                        "translate-y-4"
                      );


                      banner.classList.add(
                        "opacity-100",
                        "translate-y-0"
                      );

                    }, i * 150);
                  }
                );
              }


              observer.unobserve(
                entry.target
              );
            }
          });
        },

        {
          threshold: 0,

          rootMargin:
            "0px 0px -100px 0px"
        }
      );


    cards.forEach((card) => {
      observer.observe(card);
    });


    // =====================================================
    // NAVBAR MOBILE
    // =====================================================

    const menuBtn =
      document.getElementById(
        "menuBtn"
      );

    const mobileMenu =
      document.getElementById(
        "mobileMenu"
      );


    let isOpen = false;


    if (
      menuBtn &&
      mobileMenu
    ) {

      menuBtn.addEventListener(
        "click",
        () => {

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


      // Klik di luar menu
      document.addEventListener(
        "click",
        (event) => {

          if (
            isOpen &&
            !mobileMenu.contains(
              event.target
            ) &&
            !menuBtn.contains(
              event.target
            )
          ) {

            mobileMenu.classList.add(
              "max-h-0",
              "opacity-0"
            );


            mobileMenu.classList.remove(
              "max-h-[600px]",
              "opacity-100"
            );


            menuBtn.textContent =
              "menu";


            isOpen = false;
          }
        }
      );
    }


    // =====================================================
    // NAVBAR ANIMATION
    // =====================================================

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


    // =====================================================
    // HERO ANIMATION
    // =====================================================

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


    // =====================================================
    // HEADER HILANG HANYA DI PALING ATAS
    // =====================================================

    const mainHeader =
      document.getElementById(
        "mainHeader"
      );

    const heroSection =
      document.getElementById(
        "heroSection"
      );


    window.addEventListener(
      "scroll",
      () => {

        if (
          !mainHeader ||
          !heroSection
        ) {
          return;
        }


        if (window.scrollY <= 0) {

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
    );


    // =====================================================
    // FOOTER + KONTAK ANIMATION
    // =====================================================

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


    window.addEventListener(
      "scroll",
      () => {

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
    );


    // =====================================================
    // SOUND NAVBAR
    // =====================================================

    navItems.forEach((item) => {

      item.addEventListener(
        "mouseenter",
        () => {

          const text =
            item.textContent.trim();


          if (!text) {
            return;
          }


          const speech =
            new SpeechSynthesisUtterance(
              text
            );


          speech.lang =
            "id-ID";

          speech.rate =
            1;


          window
            .speechSynthesis
            .cancel();


          window
            .speechSynthesis
            .speak(speech);
        }
      );
    });
  }
);


// =========================================================
// 7. GET STRUKTUR / PROFILE PPID
// GET /api/ppid
// =========================================================

async function loadStrukturPPID() {

  /*
    Mendukung dua kondisi:

    1. HTML sudah diberi:
       id="gambarStrukturPPID"

    2. HTML lama Anda masih menggunakan:
       #modalPengumuman img
  */

  const gambar =
    document.getElementById(
      "gambarStrukturPPID"
    ) ||
    document.querySelector(
      "#modalPengumuman img"
    );


  if (!gambar) {

    console.warn(
      "Element gambar struktur PPID tidak ditemukan."
    );

    return;
  }


  try {

    const response =
      await fetch(
        API_PPID.struktur,
        {
          method: "GET"
        }
      );


    const result =
      await parseResponse(
        response
      );


    console.log(
      "======================================"
    );

    console.log(
      "RESPONSE STRUKTUR PPID:"
    );

    console.log(result);

    console.log(
      "======================================"
    );


    // =====================================================
    // SESUAI RESPONSE ADMIN YANG SUDAH ADA
    // =====================================================

    const struktur =
      result.struktur ||
      result.gambar_struktur ||
      result.data?.struktur ||
      result.data?.gambar_struktur ||
      result.data?.file;


    if (!struktur) {

      console.warn(
        "File struktur PPID tidak ditemukan pada response API."
      );


      gambar.style.display =
        "none";


      return;
    }


    const fileURL =
      getFileURL(
        struktur
      );


    console.log(
      "URL Struktur PPID:",
      fileURL
    );


    gambar.src =
      fileURL;


    gambar.alt =
      "Struktur PPID Desa Sumorame";


    gambar.style.display =
      "block";


    gambar.onerror = () => {

      console.error(
        "Gambar struktur PPID gagal dimuat:",
        gambar.src
      );
    };


  } catch (error) {

    console.error(
      "Gagal mengambil struktur PPID:",
      error
    );


    gambar.style.display =
      "none";
  }
}


// =========================================================
// 8. GET DAFTAR PDF PPID
// GET /api/ppid/pdf
// =========================================================

async function loadDaftarPDFPPID() {

  /*
    Jika HTML mempunyai:
    id="daftarPDFPublik"

    maka akan digunakan.

    Jika belum, JavaScript menggunakan
    slideContainer lama Anda.
  */

  const containerKhusus =
    document.getElementById(
      "daftarPDFPublik"
    );


  const slideContainer =
    document.getElementById(
      "slideContainer"
    );


  const container =
    containerKhusus ||
    slideContainer;


  if (!container) {

    console.warn(
      "Container daftar PDF PPID tidak ditemukan."
    );

    return;
  }


  // =====================================================
  // LOADING
  // =====================================================

  container.innerHTML = `
    <div
      class="
        w-full
        min-w-full
        p-6
        bg-gray-50
      "
    >

      <div
        class="
          py-12
          flex
          flex-col
          items-center
          justify-center
          text-gray-500
        "
      >

        <span
          class="
            material-symbols-outlined
            animate-spin
            text-4xl
            text-green-600
          "
        >
          progress_activity
        </span>

        <p class="mt-3">
          Memuat daftar informasi...
        </p>

      </div>

    </div>
  `;


  try {

    const response =
      await fetch(
        API_PPID.pdf,
        {
          method: "GET"
        }
      );


    const result =
      await parseResponse(
        response
      );


    console.log(
      "======================================"
    );

    console.log(
      "RESPONSE PDF PPID:"
    );

    console.log(result);

    console.log(
      "======================================"
    );


    // =====================================================
    // NORMALISASI RESPONSE
    // Sama seperti admin PPID Anda
    // =====================================================

    let data = [];


    if (Array.isArray(result)) {

      data =
        result;

    } else if (
      Array.isArray(
        result.data
      )
    ) {

      data =
        result.data;

    } else if (
      Array.isArray(
        result.pdf
      )
    ) {

      data =
        result.pdf;
    }


    console.log(
      "Jumlah PDF PPID:",
      data.length
    );


    // =====================================================
    // JIKA KOSONG
    // =====================================================

    if (data.length === 0) {

      container.innerHTML = `
        <div
          class="
            w-full
            min-w-full
            p-6
            bg-gray-50
          "
        >

          <div
            class="
              py-12
              text-center
              text-gray-500
            "
          >

            <span
              class="
                material-symbols-outlined
                text-5xl
                text-gray-300
              "
            >
              folder_off
            </span>

            <p
              class="
                font-semibold
                mt-2
              "
            >
              Belum ada dokumen informasi publik.
            </p>

          </div>

        </div>
      `;


      return;
    }


    // =====================================================
    // RENDER DATA PDF
    // =====================================================

    container.innerHTML = `
      <div
        class="
          w-full
          min-w-full
          p-6
          overflow-y-auto
          bg-gray-50
        "
      >

        <h3
          class="
            text-xl
            font-bold
            text-green-900
            mb-6
          "
        >
          Daftar Informasi Publik
        </h3>


        <div
          id="gridPDFPublik"
          class="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          "
        >
        </div>

      </div>
    `;


    const grid =
      document.getElementById(
        "gridPDFPublik"
      );


    if (!grid) {
      return;
    }


    data.forEach(
      (item, index) => {

        // ================================================
        // FIELD SESUAI ADMIN PPID
        // ================================================

        const judul =
          item.judul ||
          item.nama_laporan ||
          item.nama ||
          "Tanpa Judul";


        const file =
          item.file ||
          item.file_pdf ||
          item.path ||
          item.url ||
          "";


        const ukuran =
          item.ukuran ??
          item.size ??
          item.file_size ??
          0;


        const fileURL =
          getFileURL(
            file
          );


        const ukuranTampil =
          typeof ukuran === "string"
            ? ukuran
            : formatFileSize(
                Number(ukuran)
              );


        console.log(
          `PDF ke-${index + 1}:`,
          {
            judul,
            file,
            fileURL,
            ukuran: ukuranTampil
          }
        );


        // ================================================
        // CARD PDF
        // ================================================

        const card =
          document.createElement(
            "div"
          );


        card.className = `
          flex
          items-center
          gap-4
          bg-gray-100
          p-4
          rounded-xl
          hover:bg-gray-200
          hover:shadow-md
          hover:-translate-y-1
          transition
          duration-300
          cursor-pointer
        `;


        card.innerHTML = `

          <!-- ICON PDF -->
          <div
            class="
              flex-shrink-0
              w-14
              h-14
              rounded-xl
              bg-red-100
              flex
              items-center
              justify-center
            "
          >

            <span
              class="
                material-symbols-outlined
                text-red-500
                text-4xl
              "
            >
              picture_as_pdf
            </span>

          </div>


          <!-- INFORMASI FILE -->
          <div
            class="
              text-left
              flex-1
              min-w-0
            "
          >

            <h4
              class="
                text-blue-500
                font-semibold
                transition
                duration-300
                hover:text-blue-700
              "
            >
              ${escapeHTML(judul)}
            </h4>


            <p
              class="
                text-sm
                text-gray-600
                mt-1
              "
            >
              Ukuran :
              ${escapeHTML(
                ukuranTampil
              )}
            </p>


            <p
              class="
                text-xs
                text-green-700
                mt-2
                flex
                items-center
                gap-1
              "
            >

              <span
                class="
                  material-symbols-outlined
                  text-sm
                "
              >
                visibility
              </span>

              Klik untuk melihat dokumen

            </p>

          </div>

        `;


        // ================================================
        // BUKA PDF
        // ================================================

        card.addEventListener(
          "click",
          () => {

            if (!fileURL) {

              console.warn(
                "URL PDF tidak tersedia:",
                item
              );


              alert(
                "File PDF tidak tersedia."
              );


              return;
            }


            window.open(
              fileURL,
              "_blank",
              "noopener,noreferrer"
            );
          }
        );


        grid.appendChild(
          card
        );
      }
    );


  } catch (error) {

    console.error(
      "Gagal mengambil daftar PDF PPID:",
      error
    );


    container.innerHTML = `
      <div
        class="
          w-full
          min-w-full
          p-6
          bg-gray-50
        "
      >

        <div
          class="
            py-12
            text-center
            text-red-500
          "
        >

          <span
            class="
              material-symbols-outlined
              text-5xl
            "
          >
            error
          </span>


          <p
            class="
              font-semibold
              mt-2
            "
          >
            Gagal memuat daftar informasi.
          </p>


          <p
            class="
              text-xs
              text-gray-500
              mt-1
            "
          >
            ${escapeHTML(
              error.message
            )}
          </p>

        </div>

      </div>
    `;
  }
}


// =========================================================
// 9. MODAL TIMELINE
// =========================================================

const modal =
  document.getElementById(
    "modalTimeline"
  );

const modalBox =
  document.getElementById(
    "modalBox"
  );


function openModal() {

  if (
    !modal ||
    !modalBox
  ) {
    return;
  }


  modal.classList.remove(
    "hidden"
  );


  modal.classList.add(
    "opacity-0"
  );


  modalBox.classList.remove(
    "scale-100",
    "opacity-100"
  );


  modalBox.classList.add(
    "scale-90",
    "opacity-0"
  );


  requestAnimationFrame(() => {

    modal.classList.remove(
      "opacity-0"
    );


    modalBox.classList.remove(
      "scale-90",
      "opacity-0"
    );


    modalBox.classList.add(
      "scale-100",
      "opacity-100"
    );
  });
}


function closeModal() {

  if (
    !modal ||
    !modalBox
  ) {
    return;
  }


  modal.classList.add(
    "opacity-0"
  );


  modalBox.classList.remove(
    "scale-100",
    "opacity-100"
  );


  modalBox.classList.add(
    "scale-90",
    "opacity-0"
  );


  setTimeout(() => {

    modal.classList.add(
      "hidden"
    );

  }, 300);
}


// Klik di luar modal
modal?.addEventListener(
  "click",
  (event) => {

    if (
      event.target === modal
    ) {
      closeModal();
    }
  }
);


// =========================================================
// 10. MODAL PROFILE PPID
// =========================================================

function openModalPengumuman() {

  const modalPengumuman =
    document.getElementById(
      "modalPengumuman"
    );

  const box =
    document.getElementById(
      "modalBoxPengumuman"
    );


  if (
    !modalPengumuman ||
    !box
  ) {
    return;
  }


  modalPengumuman.classList.remove(
    "hidden"
  );


  modalPengumuman.classList.add(
    "flex",
    "opacity-0"
  );


  box.classList.remove(
    "scale-100",
    "opacity-100"
  );


  box.classList.add(
    "scale-90",
    "opacity-0"
  );


  requestAnimationFrame(() => {

    modalPengumuman.classList.remove(
      "opacity-0"
    );


    box.classList.remove(
      "scale-90",
      "opacity-0"
    );


    box.classList.add(
      "scale-100",
      "opacity-100"
    );
  });
}


function closeModalPengumuman() {

  const modalPengumuman =
    document.getElementById(
      "modalPengumuman"
    );

  const box =
    document.getElementById(
      "modalBoxPengumuman"
    );


  if (
    !modalPengumuman ||
    !box
  ) {
    return;
  }


  modalPengumuman.classList.add(
    "opacity-0"
  );


  box.classList.remove(
    "scale-100",
    "opacity-100"
  );


  box.classList.add(
    "scale-90",
    "opacity-0"
  );


  setTimeout(() => {

    modalPengumuman.classList.add(
      "hidden"
    );


    modalPengumuman.classList.remove(
      "flex"
    );

  }, 300);
}


// Klik luar modal Profile PPID
const modalPengumuman =
  document.getElementById(
    "modalPengumuman"
  );


modalPengumuman?.addEventListener(
  "click",
  (event) => {

    if (
      event.target === modalPengumuman
    ) {
      closeModalPengumuman();
    }
  }
);


// =========================================================
// 11. RIPPLE EFFECT
// =========================================================

function ripple(event) {

  const button =
    event.currentTarget;


  if (!button) {
    return;
  }


  const circle =
    document.createElement(
      "span"
    );


  const diameter =
    Math.max(
      button.clientWidth,
      button.clientHeight
    );


  const rect =
    button.getBoundingClientRect();


  circle.style.width =
    `${diameter}px`;

  circle.style.height =
    `${diameter}px`;


  circle.style.left =
    `${
      event.clientX -
      rect.left -
      diameter / 2
    }px`;


  circle.style.top =
    `${
      event.clientY -
      rect.top -
      diameter / 2
    }px`;


  circle.classList.add(
    "ripple"
  );


  const oldRipple =
    button.querySelector(
      ".ripple"
    );


  if (oldRipple) {
    oldRipple.remove();
  }


  button.appendChild(
    circle
  );
}


// =========================================================
// 12. MODAL LAYANAN INFORMASI
// =========================================================

function openModalLayanan() {

  const modalLayanan =
    document.getElementById(
      "modalLayanan"
    );

  const box =
    document.getElementById(
      "modalBoxLayanan"
    );


  if (
    !modalLayanan ||
    !box
  ) {
    return;
  }


  modalLayanan.classList.remove(
    "hidden"
  );


  modalLayanan.classList.add(
    "flex",
    "opacity-0"
  );


  box.classList.remove(
    "scale-100",
    "opacity-100"
  );


  box.classList.add(
    "scale-90",
    "opacity-0"
  );


  requestAnimationFrame(() => {

    modalLayanan.classList.remove(
      "opacity-0"
    );


    box.classList.remove(
      "scale-90",
      "opacity-0"
    );


    box.classList.add(
      "scale-100",
      "opacity-100"
    );
  });
}


function closeModalLayanan() {

  const modalLayanan =
    document.getElementById(
      "modalLayanan"
    );

  const box =
    document.getElementById(
      "modalBoxLayanan"
    );


  if (
    !modalLayanan ||
    !box
  ) {
    return;
  }


  modalLayanan.classList.add(
    "opacity-0"
  );


  box.classList.remove(
    "scale-100",
    "opacity-100"
  );


  box.classList.add(
    "scale-90",
    "opacity-0"
  );


  setTimeout(() => {

    modalLayanan.classList.add(
      "hidden"
    );


    modalLayanan.classList.remove(
      "flex"
    );

  }, 300);
}


// Klik luar modal
const modalLayanan =
  document.getElementById(
    "modalLayanan"
  );


modalLayanan?.addEventListener(
  "click",
  function (event) {

    if (
      event.target === this
    ) {
      closeModalLayanan();
    }
  }
);


// =========================================================
// 13. SLIDE
// Tetap dipertahankan jika suatu saat digunakan lagi
// =========================================================

function goToSlide(index) {

  const container =
    document.getElementById(
      "slideContainer"
    );


  if (!container) {
    return;
  }


  container.style.transform =
    `translateX(-${index * 100}%)`;
}


// =========================================================
// 14. SCROLL TO TOP
// =========================================================

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