/* ===================================================
   LOGIKA CMS PROFIL & HERO (CMSProfil.js)
=================================================== */


// ==================================================
// 1. KONFIGURASI API
// ==================================================
const API_URL = "http://localhost:3000/api/cmsprofil";


function getAdminToken() {
  return localStorage.getItem("token");
}


// ==================================================
// 2. ELEMENT CMS PROFIL
// ==================================================

// ================= DATA / HERO =================
const btnTambahCarousel =
  document.getElementById("btnTambahCarousel");

const wadahCarousel =
  document.getElementById("wadahCarousel");


// ================= FORM PROFIL =================
const formCmsProfil =
  document.getElementById("formCmsProfil");

const judulHero =
  document.getElementById("judulHero");

const deskripsiHero =
  document.getElementById("deskripsiHero");

const sambutan =
  document.getElementById("sambutan");

const visi =
  document.getElementById("visi");

const misi =
  document.getElementById("misi");

const inputFotoKades =
  document.getElementById("inputFotoKades");

const previewFotoKades =
  document.getElementById("previewFoto");


// ================= BUTTON =================
const btnSimpanProfil =
  document.getElementById("btnSimpanProfil");

const textBtnSimpanProfil =
  document.getElementById("textBtnSimpanProfil");


// ==================================================
// 3. DATA
// ==================================================
let cmsProfilData = [];

let idCmsProfilEdit = null;


// ==================================================
// 4. HELPER ESCAPE HTML
// ==================================================
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


// ==================================================
// 5. GET DATA CMS PROFIL
// GET /api/cmsprofil
// ==================================================
async function loadCmsProfil() {

  try {

    const response =
      await fetch(API_URL);


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


    if (!response.ok) {

      throw new Error(
        result.message ||
        "Gagal mengambil data CMS Profil."
      );
    }


    cmsProfilData =
      Array.isArray(result.data)
        ? result.data
        : [];


    console.log(
      "CMS Profil:",
      cmsProfilData
    );


    renderCmsProfil();


  } catch (error) {

    console.error(
      "Error load CMS Profil:",
      error
    );


    if (wadahCarousel) {

      wadahCarousel.innerHTML = `
        <div
          class="
            col-span-full
            bg-red-50
            border
            border-red-200
            rounded-lg
            py-8
            text-center
            text-red-500
          "
        >

          <span
            class="
              material-symbols-outlined
              text-4xl
            "
          >
            error
          </span>

          <p class="mt-2 text-sm font-semibold">
            Gagal mengambil data CMS Profil
          </p>

        </div>
      `;
    }


    Swal.fire({
      icon: "error",
      title: "Gagal Mengambil Data",
      text: error.message
    });
  }
}


// ==================================================
// 6. RENDER DATA CMS PROFIL
// ==================================================
function renderCmsProfil() {

  if (!wadahCarousel) {
    return;
  }


  wadahCarousel.innerHTML = "";


  if (
    !cmsProfilData ||
    cmsProfilData.length === 0
  ) {

    wadahCarousel.innerHTML = `
      <div
        class="
          col-span-full
          bg-white
          border
          border-dashed
          border-gray-300
          rounded-lg
          py-10
          text-center
          text-gray-400
        "
      >

        <span
          class="
            material-symbols-outlined
            text-5xl
          "
        >
          image_not_supported
        </span>

        <p class="mt-2 text-sm">
          Belum ada data CMS Profil
        </p>

        <p class="mt-1 text-xs">
          Klik tombol "Data Baru" untuk menambahkan data.
        </p>

      </div>
    `;

    return;
  }


  cmsProfilData.forEach(
    (item, index) => {

      const card =
        document.createElement("div");


      card.className =
        "bg-white p-3 rounded-lg shadow-sm border border-gray-200 relative group carousel-item fade-up";


      card.style.animationDelay =
        `${index * 0.1}s`;


      const gambar =
        item.gambar_url
          ? escapeHTML(item.gambar_url)
          : "";


      const judul =
        escapeHTML(
          item.judul_hero ||
          "Tanpa Judul"
        );


      const deskripsi =
        escapeHTML(
          item.deskripsi_hero ||
          "-"
        );


      card.innerHTML = `

        <div
          class="
            w-full
            h-36
            bg-gray-100
            rounded-lg
            mb-3
            overflow-hidden
            border
            border-gray-200
            relative
          "
        >

          ${
            gambar

              ? `
                <img
                  src="${gambar}"
                  alt="${judul}"
                  class="
                    w-full
                    h-full
                    object-cover
                    preview-img
                  "
                >
              `

              : `
                <div
                  class="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    text-gray-400
                  "
                >

                  <span
                    class="
                      material-symbols-outlined
                      text-4xl
                    "
                  >
                    image
                  </span>

                </div>
              `
          }


          <span
            class="
              absolute
              top-2
              left-2
              bg-black/60
              text-white
              text-xs
              px-2
              py-0.5
              rounded
              backdrop-blur-sm
            "
          >
            Slide ${index + 1}
          </span>

        </div>


        <div class="mb-3">

          <p
            class="
              font-semibold
              text-sm
              text-gray-800
              truncate
            "
          >
            ${judul}
          </p>


          <p
            class="
              text-xs
              text-gray-500
              mt-1
              line-clamp-2
            "
          >
            ${deskripsi}
          </p>

        </div>


        <div
          class="
            flex
            justify-end
            items-center
            gap-1
            pt-2
            border-t
          "
        >

          <!-- VIEW -->
          <button
            type="button"
            class="
              btnView
              bg-purple-500
              hover:bg-purple-600
              text-white
              p-2
              rounded
              hover:shadow-lg
              active:scale-90
              transition-all
              duration-150
            "
            data-id="${item.id}"
            title="Lihat"
          >

            <span
              class="
                material-symbols-outlined
                text-sm
              "
            >
              visibility
            </span>

          </button>


          <!-- EDIT -->
          <button
            type="button"
            class="
              btnEdit
              bg-green-500
              hover:bg-green-600
              text-white
              p-2
              rounded
              hover:shadow-lg
              active:scale-90
              transition-all
              duration-150
            "
            data-id="${item.id}"
            title="Edit"
          >

            <span
              class="
                material-symbols-outlined
                text-sm
              "
            >
              edit_document
            </span>

          </button>


          <!-- DELETE -->
          <button
            type="button"
            class="
              btnDelete
              bg-red-500
              hover:bg-red-600
              text-white
              p-2
              rounded
              hover:shadow-lg
              active:scale-90
              transition-all
              duration-150
            "
            data-id="${item.id}"
            title="Hapus"
          >

            <span
              class="
                material-symbols-outlined
                text-sm
              "
            >
              delete
            </span>

          </button>

        </div>
      `;


      wadahCarousel.appendChild(
        card
      );
    }
  );


  pasangEventAction();
}


// ==================================================
// 7. TOMBOL DATA BARU
// ==================================================
if (
  btnTambahCarousel &&
  wadahCarousel
) {

  btnTambahCarousel.addEventListener(
    "click",
    () => {

      idCmsProfilEdit = null;


      resetFormProfil();


      if (
        textBtnSimpanProfil
      ) {

        textBtnSimpanProfil.innerText =
          "Simpan";
      }


      judulHero?.focus();


      formCmsProfil?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  );
}


// ==================================================
// 8. PREVIEW GAMBAR
// ==================================================
if (
  inputFotoKades &&
  previewFotoKades
) {

  inputFotoKades.addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files[0];


      if (!file) {
        return;
      }


      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];


      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        Swal.fire({
          icon: "warning",
          title: "Format Gambar Tidak Valid",
          text:
            "Gunakan JPG, JPEG, PNG, atau WEBP."
        });


        inputFotoKades.value = "";

        return;
      }


      const maksimalUkuran =
        2 * 1024 * 1024;


      if (
        file.size >
        maksimalUkuran
      ) {

        Swal.fire({
          icon: "warning",
          title:
            "Ukuran Gambar Terlalu Besar",
          text:
            "Ukuran gambar maksimal 2 MB."
        });


        inputFotoKades.value = "";

        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        function (event) {

          previewFotoKades.src =
            event.target.result;
        };


      reader.readAsDataURL(
        file
      );
    }
  );
}


// ==================================================
// 9. EVENT ACTION
// VIEW - EDIT - DELETE
// ==================================================
function pasangEventAction() {


  // ==================================================
  // VIEW
  // ==================================================
  document
    .querySelectorAll(
      ".btnView"
    )
    .forEach(btn => {

      btn.onclick = () => {

        const id =
          btn.dataset.id;


        const item =
          cmsProfilData.find(
            data =>
              String(data.id) ===
              String(id)
          );


        if (!item) {

          Swal.fire({
            icon: "error",
            title:
              "Data Tidak Ditemukan",
            text:
              "Data CMS Profil tidak ditemukan."
          });

          return;
        }


        const gambar =
          item.gambar_url
            ? escapeHTML(
                item.gambar_url
              )
            : "";


        Swal.fire({

          title:
            "Detail CMS Profil",

          width: 750,

          confirmButtonText:
            "Tutup",

          confirmButtonColor:
            "#3b82f6",

          html: `

            <div
              style="
                text-align:left;
                max-height:65vh;
                overflow-y:auto;
                padding-right:5px;
              "
            >

              ${
                gambar

                  ? `
                    <div
                      style="
                        width:100%;
                        height:250px;
                        overflow:hidden;
                        border-radius:10px;
                        margin-bottom:20px;
                        background:#f3f4f6;
                      "
                    >

                      <img
                        src="${gambar}"
                        alt="CMS Profil"
                        style="
                          width:100%;
                          height:100%;
                          object-fit:contain;
                        "
                      >

                    </div>
                  `

                  : ""
              }


              <p>
                <b>Judul Hero:</b>
              </p>

              <p
                style="
                  margin-bottom:15px;
                "
              >
                ${
                  escapeHTML(
                    item.judul_hero
                  ) || "-"
                }
              </p>


              <p>
                <b>Deskripsi Hero:</b>
              </p>

              <p
                style="
                  margin-bottom:15px;
                  white-space:pre-line;
                "
              >
                ${
                  escapeHTML(
                    item.deskripsi_hero
                  ) || "-"
                }
              </p>


              <p>
                <b>Sambutan:</b>
              </p>

              <p
                style="
                  margin-bottom:15px;
                  white-space:pre-line;
                "
              >
                ${
                  escapeHTML(
                    item.sambutan
                  ) || "-"
                }
              </p>


              <p>
                <b>Visi:</b>
              </p>

              <p
                style="
                  margin-bottom:15px;
                  white-space:pre-line;
                "
              >
                ${
                  escapeHTML(
                    item.visi
                  ) || "-"
                }
              </p>


              <p>
                <b>Misi:</b>
              </p>

              <p
                style="
                  white-space:pre-line;
                "
              >
                ${
                  escapeHTML(
                    item.misi
                  ) || "-"
                }
              </p>

            </div>
          `
        });
      };
    });


  // ==================================================
  // EDIT
  // ==================================================
  document
    .querySelectorAll(
      ".btnEdit"
    )
    .forEach(btn => {

      btn.onclick = () => {

        const id =
          btn.dataset.id;


        const item =
          cmsProfilData.find(
            data =>
              String(data.id) ===
              String(id)
          );


        if (!item) {

          Swal.fire({
            icon: "error",
            title:
              "Data Tidak Ditemukan",
            text:
              "Data CMS Profil tidak ditemukan."
          });

          return;
        }


        // ================= SIMPAN ID =================
        idCmsProfilEdit =
          item.id;


        // ================= ISI DATA LAMA =================
        if (judulHero) {

          judulHero.value =
            item.judul_hero || "";
        }


        if (deskripsiHero) {

          deskripsiHero.value =
            item.deskripsi_hero || "";
        }


        if (sambutan) {

          sambutan.value =
            item.sambutan || "";
        }


        if (visi) {

          visi.value =
            item.visi || "";
        }


        if (misi) {

          misi.value =
            item.misi || "";
        }


        // ================= RESET FILE =================
        if (inputFotoKades) {

          inputFotoKades.value = "";
        }


        // ================= GAMBAR LAMA =================
        if (previewFotoKades) {

          if (item.gambar_url) {

            previewFotoKades.src =
              item.gambar_url;

          } else {

            previewFotoKades.src =
              "../img/default-avatar.png";
          }
        }


        if (
          textBtnSimpanProfil
        ) {

          textBtnSimpanProfil.innerText =
            "Simpan Perubahan";
        }


        formCmsProfil?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      };
    });


  // ==================================================
  // DELETE
  // DELETE /api/cmsprofil/:id
  // ==================================================
  document
    .querySelectorAll(
      ".btnDelete"
    )
    .forEach(btn => {

      btn.onclick =
        async () => {

          const id =
            btn.dataset.id;


          const item =
            cmsProfilData.find(
              data =>
                String(data.id) ===
                String(id)
            );


          if (!item) {

            Swal.fire({
              icon: "error",
              title:
                "Data Tidak Ditemukan",
              text:
                "Data CMS Profil tidak ditemukan."
            });

            return;
          }


          const token =
            getAdminToken();


          if (!token) {

            Swal.fire({
              icon: "warning",
              title:
                "Token Admin Tidak Ditemukan",
              text:
                "Silakan login sebagai admin terlebih dahulu."
            });

            return;
          }


          const konfirmasi =
            await Swal.fire({

              title:
                "Yakin Hapus?",

              html: `
                <div
                  style="
                    text-align:center;
                  "
                >

                  <p>
                    Data CMS Profil berikut
                    akan dihapus:
                  </p>

                  <p
                    style="
                      margin-top:10px;
                    "
                  >
                    <b>
                      ${
                        escapeHTML(
                          item.judul_hero
                        ) ||
                        "CMS Profil"
                      }
                    </b>
                  </p>

                  <p
                    style="
                      margin-top:10px;
                      color:#dc2626;
                    "
                  >
                    Data yang sudah dihapus
                    tidak dapat dikembalikan.
                  </p>

                </div>
              `,

              icon: "warning",

              showCancelButton:
                true,

              confirmButtonText:
                "Ya, Hapus",

              cancelButtonText:
                "Batal",

              confirmButtonColor:
                "#dc2626",

              cancelButtonColor:
                "#6b7280"
            });


          if (
            !konfirmasi.isConfirmed
          ) {

            return;
          }


          try {

            Swal.fire({

              title:
                "Menghapus...",

              text:
                "Data CMS Profil sedang dihapus.",

              allowOutsideClick:
                false,

              allowEscapeKey:
                false,

              showConfirmButton:
                false,

              didOpen: () => {

                Swal.showLoading();
              }
            });


            const response =
              await fetch(
                `${API_URL}/${id}`,
                {
                  method:
                    "DELETE",

                  headers: {
                    "Authorization":
                      `Bearer ${token}`
                  }
                }
              );


            const result =
              await response.json();


            if (!response.ok) {

              throw new Error(
                result.message ||
                "Gagal menghapus CMS Profil."
              );
            }


            await Swal.fire({

              title:
                "Berhasil 🎉",

              text:
                "CMS Profil berhasil dihapus.",

              icon:
                "success",

              timer:
                1500,

              showConfirmButton:
                false
            });


            if (
              String(
                idCmsProfilEdit
              ) ===
              String(id)
            ) {

              resetFormProfil();
            }


            await loadCmsProfil();


          } catch (error) {

            console.error(
              "Error delete CMS Profil:",
              error
            );


            Swal.fire({
              icon: "error",
              title:
                "Gagal Menghapus",
              text:
                error.message
            });
          }
        };
    });
}


// ==================================================
// 10. VALIDASI FORM
// ==================================================
function validasiFormCmsProfil() {

  const kosong = [];


  if (
    !judulHero ||
    !judulHero.value.trim()
  ) {

    kosong.push(
      "Judul Hero"
    );
  }


  if (
    !deskripsiHero ||
    !deskripsiHero.value.trim()
  ) {

    kosong.push(
      "Deskripsi Hero"
    );
  }


  if (
    !sambutan ||
    !sambutan.value.trim()
  ) {

    kosong.push(
      "Sambutan"
    );
  }


  if (
    !visi ||
    !visi.value.trim()
  ) {

    kosong.push(
      "Visi"
    );
  }


  if (
    !misi ||
    !misi.value.trim()
  ) {

    kosong.push(
      "Misi"
    );
  }


  if (
    kosong.length > 0
  ) {

    Swal.fire({

      title:
        "Form Belum Lengkap ⚠️",

      html: `
        <div
          style="
            text-align:center;
          "
        >

          <p>
            Data berikut masih kosong:
          </p>

          <ul
            style="
              list-style-position:inside;
              margin-top:10px;
            "
          >

            ${
              kosong
                .map(
                  item =>
                    `<li>${escapeHTML(item)}</li>`
                )
                .join("")
            }

          </ul>

        </div>
      `,

      icon:
        "warning",

      confirmButtonColor:
        "#f59e0b"
    });


    return false;
  }


  return true;
}


// ==================================================
// 11. SIMPAN DATA
//
// POST : /api/cmsprofil
// PUT  : /api/cmsprofil/:id
// ==================================================
if (formCmsProfil) {

  formCmsProfil.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      // ==================================================
      // VALIDASI FORM
      // ==================================================
      if (
        !validasiFormCmsProfil()
      ) {

        return;
      }


      const gambar =
        inputFotoKades
          ?.files[0];


      // ==================================================
      // GAMBAR WAJIB SAAT POST
      // ==================================================
      if (
        !idCmsProfilEdit &&
        !gambar
      ) {

        Swal.fire({
          icon: "warning",
          title:
            "Gambar Belum Dipilih",
          text:
            "Gambar wajib dipilih untuk data baru."
        });

        return;
      }


      // ==================================================
      // VALIDASI GAMBAR
      // ==================================================
      if (gambar) {

        const maksimalUkuran =
          2 * 1024 * 1024;


        if (
          gambar.size >
          maksimalUkuran
        ) {

          Swal.fire({
            icon: "warning",
            title:
              "Ukuran Gambar Terlalu Besar",
            text:
              "Ukuran gambar maksimal 2 MB."
          });

          return;
        }


        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp"
        ];


        if (
          !allowedTypes.includes(
            gambar.type
          )
        ) {

          Swal.fire({
            icon: "warning",
            title:
              "Format Gambar Tidak Valid",
            text:
              "Gunakan JPG, JPEG, PNG, atau WEBP."
          });

          return;
        }
      }


      // ==================================================
      // TOKEN ADMIN
      // ==================================================
      const token =
        getAdminToken();


      if (!token) {

        Swal.fire({
          icon: "warning",
          title:
            "Token Admin Tidak Ditemukan",
          text:
            "Silakan login sebagai admin terlebih dahulu."
        });

        return;
      }


      // ==================================================
      // KONFIRMASI
      // ==================================================
      const konfirmasi =
        await Swal.fire({

          title:
            idCmsProfilEdit
              ? "Konfirmasi Perubahan"
              : "Konfirmasi Data",

          html: `
            <div
              style="
                text-align:left;
              "
            >

              <p>
                <b>Judul Hero:</b>
                ${escapeHTML(
                  judulHero.value.trim()
                )}
              </p>

              <p>
                <b>Deskripsi:</b>
                ${escapeHTML(
                  deskripsiHero.value.trim()
                )}
              </p>

              <p>
                <b>Visi:</b>
                ${escapeHTML(
                  visi.value.trim()
                )}
              </p>

              <p>
                <b>Gambar:</b>

                ${
                  gambar
                    ? escapeHTML(
                        gambar.name
                      )
                    : "Tetap menggunakan gambar lama"
                }
              </p>

            </div>
          `,

          icon:
            "question",

          showCancelButton:
            true,

          confirmButtonText:
            "Ya, Simpan",

          cancelButtonText:
            "Batal",

          confirmButtonColor:
            "#3b82f6",

          cancelButtonColor:
            "#6b7280"
        });


      if (
        !konfirmasi.isConfirmed
      ) {

        return;
      }


      try {

        Swal.fire({

          title:
            idCmsProfilEdit
              ? "Menyimpan Perubahan..."
              : "Menyimpan...",

          text:
            "Data CMS Profil sedang diproses.",

          allowOutsideClick:
            false,

          allowEscapeKey:
            false,

          showConfirmButton:
            false,

          didOpen: () => {

            Swal.showLoading();
          }
        });


        // ==================================================
        // FORM DATA
        // ==================================================
        const formData =
          new FormData();


        formData.append(
          "judul_hero",
          judulHero.value.trim()
        );


        formData.append(
          "deskripsi_hero",
          deskripsiHero.value.trim()
        );


        formData.append(
          "sambutan",
          sambutan.value.trim()
        );


        formData.append(
          "visi",
          visi.value.trim()
        );


        formData.append(
          "misi",
          misi.value.trim()
        );


        // ==================================================
        // GAMBAR
        // POST wajib
        // PUT opsional
        // ==================================================
        if (gambar) {

          formData.append(
            "gambar",
            gambar
          );
        }


        // ==================================================
        // POST / PUT
        // ==================================================
        let url =
          API_URL;

        let method =
          "POST";


        if (
          idCmsProfilEdit
        ) {

          url =
            `${API_URL}/${idCmsProfilEdit}`;

          method =
            "PUT";
        }


        // ==================================================
        // REQUEST
        // ==================================================
        const response =
          await fetch(
            url,
            {

              method:
                method,

              headers: {

                "Authorization":
                  `Bearer ${token}`
              },

              body:
                formData
            }
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


        if (!response.ok) {

          throw new Error(

            result.message ||

            (
              method === "POST"

                ? "Gagal menambahkan CMS Profil."

                : "Gagal memperbarui CMS Profil."
            )
          );
        }


        // ==================================================
        // SUCCESS
        // ==================================================
        await Swal.fire({

          title:
            "Berhasil 🎉",

          text:
            method === "POST"

              ? "CMS Profil berhasil ditambahkan."

              : "CMS Profil berhasil diperbarui.",

          icon:
            "success",

          timer:
            1500,

          showConfirmButton:
            false
        });


        // ==================================================
        // RESET FORM
        // ==================================================
        resetFormProfil();


        // ==================================================
        // AMBIL DATA TERBARU
        // ==================================================
        await loadCmsProfil();


      } catch (error) {

        console.error(
          "Error simpan CMS Profil:",
          error
        );


        Swal.fire({
          icon: "error",
          title:
            "Gagal Menyimpan",
          text:
            error.message
        });
      }
    }
  );
}


// ==================================================
// 12. RESET FORM
// ==================================================
function resetFormProfil() {

  idCmsProfilEdit =
    null;


  if (formCmsProfil) {

    formCmsProfil.reset();
  }


  if (
    previewFotoKades
  ) {

    previewFotoKades.src =
      "../img/default-avatar.png";
  }


  if (
    textBtnSimpanProfil
  ) {

    textBtnSimpanProfil.innerText =
      "Simpan";
  }
}


// ==================================================
// 13. LOAD DATA SAAT HALAMAN DIBUKA
// ==================================================
loadCmsProfil();