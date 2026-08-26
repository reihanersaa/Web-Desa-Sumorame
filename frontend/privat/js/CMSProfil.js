/* ===================================================
   LOGIKA CMS PROFIL & SLIDER DINAMIS (CMSProfil.js)
=================================================== */

const API_URL = "http://localhost:3000/api/cmsprofil";

function getAdminToken() {
  return localStorage.getItem("token");
}

const wadahSlideDynamic = document.getElementById("wadahSlideDynamic");
const btnTambahSlide = document.getElementById("btnTambahSlide");
const formCmsProfil = document.getElementById("formCmsProfil");

const inputFotoKadesAsli = document.getElementById("inputFotoKadesAsli");
const previewFotoKades = document.getElementById("previewFotoKades");

// ==================================================
// FUNGSI: MENGHITUNG ULANG NOMOR SLIDE
// ==================================================
function updatePenomoranSlide() {
  const cards = document.querySelectorAll(".slide-card");
  cards.forEach((card, index) => {
    const judulHeader = card.querySelector(".judul-nomor-slide");
    if (judulHeader) {
      judulHeader.innerText = `Slide #${index + 1}`;
    }
  });
}

// ==================================================
// 1. LOAD DATA DARI DATABASE
// ==================================================
async function loadCmsProfil() {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();

    wadahSlideDynamic.innerHTML = ""; 

    if (result.success && result.data.length > 0) {
      let data = result.data;
      
      data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      // 🚨 MENGISI INPUT NAMA KADES DARI DATABASE
      const inputNamaKades = document.getElementById("namaKades");
      if(inputNamaKades) inputNamaKades.value = data[0].nama_kades || "";
      
      document.getElementById("sambutan").value = data[0].sambutan || "";
      document.getElementById("visi").value = data[0].visi || "";
      document.getElementById("misi").value = data[0].misi || "";
      
      if (data[0].foto_kades_url) previewFotoKades.src = data[0].foto_kades_url;

      data.forEach(item => {
        buatKartuSlide(item);
      });
    } else {
      buatKartuSlide(null);
    }
  } catch (error) {
    wadahSlideDynamic.innerHTML = `<p class="text-red-500 text-center">Gagal memuat data!</p>`;
  }
}

// ==================================================
// 2. FUNGSI MENCETAK KARTU SLIDE BARU
// ==================================================
function buatKartuSlide(data) {
  const idDb = data ? data.id : "";
  const judul = data && data.judul_hero ? data.judul_hero : "";
  const desk = data && data.deskripsi_hero ? data.deskripsi_hero : "";
  const imgUrl = data && data.gambar_url ? data.gambar_url : "../img/default-avatar.png";

  const card = document.createElement("div");
  card.className = "slide-card bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative fade-up";
  card.setAttribute("data-id", idDb);

  card.innerHTML = `
    <button type="button" class="btn-hapus-slide absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-90" title="Hapus Slide">
      <span class="material-symbols-outlined text-sm">delete</span>
    </button>
    
    <h4 class="judul-nomor-slide font-bold text-gray-700 mb-3 border-b pb-2">Slide #</h4>
    
    <div class="flex flex-col md:flex-row gap-5">
      <div class="w-full md:w-1/3">
        <div class="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden mb-3">
          <img class="preview-img w-full h-full object-cover" src="${imgUrl}">
        </div>
        <input type="file" class="input-file w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*">
        <p class="text-[10px] text-gray-400 mt-1">*Abaikan jika tidak ingin mengubah gambar.</p>
      </div>

      <div class="w-full md:w-2/3 space-y-3">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Judul Hero</label>
          <input type="text" class="input-judul w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value="${judul}" placeholder="Tuliskan judul slide..." required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Deskripsi Hero</label>
          <textarea class="input-deskripsi w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-y" rows="3" placeholder="Tuliskan deskripsi singkat..." required>${desk}</textarea>
        </div>
      </div>
    </div>
  `;

  const fileInput = card.querySelector(".input-file");
  const previewImg = card.querySelector(".preview-img");
  fileInput.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("Peringatan", "Gambar Slider maksimal 2 MB!", "warning");
        fileInput.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => { previewImg.src = e.target.result; };
      reader.readAsDataURL(file);
    }
  });

  const btnHapus = card.querySelector(".btn-hapus-slide");
  btnHapus.addEventListener("click", async () => {
    if (idDb) {
      const konfirmasi = await Swal.fire({
        title: "Hapus Permanen?",
        text: "Slide ini akan dihapus dari sistem.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Hapus",
        confirmButtonColor: "#dc2626"
      });
      
      if (konfirmasi.isConfirmed) {
        try {
          Swal.fire({ title: "Menghapus...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
          const response = await fetch(`${API_URL}/${idDb}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${getAdminToken()}` }
          });
          if (!response.ok) throw new Error("Gagal menghapus!");
          Swal.close();
          card.remove(); 
          updatePenomoranSlide(); 
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    } else {
      card.remove();
      updatePenomoranSlide(); 
    }
  });

  wadahSlideDynamic.appendChild(card);
  updatePenomoranSlide(); 
}

// ==================================================
// 3. EVENT TOMBOL BIRU (TAMBAH SLIDE)
// ==================================================
btnTambahSlide.addEventListener("click", () => {
  buatKartuSlide(null);
});

// ==================================================
// 4. EVENT PREVIEW FOTO KADES LOKAL
// ==================================================
inputFotoKadesAsli.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Peringatan", "Foto Kepala Desa maksimal 2 MB!", "warning");
      inputFotoKadesAsli.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => { previewFotoKades.src = e.target.result; };
    reader.readAsDataURL(file);
  }
});

// ==================================================
// 5. EVENT SUBMIT FORM (SIMPAN MASSAL)
// ==================================================
formCmsProfil.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getAdminToken();
  if (!token) return Swal.fire("Akses Ditolak", "Anda belum login!", "warning");

  const cards = document.querySelectorAll(".slide-card");
  if (cards.length === 0) {
    return Swal.fire("Peringatan", "Anda harus menyisakan minimal 1 Slider!", "warning");
  }

  // 🚨 PENANGKAP DATA: Pastikan ID elemen di HTML sesuai dengan ini
  const elementNamaKades = document.getElementById("namaKades");
  const valNamaKades = elementNamaKades ? elementNamaKades.value.trim() : "";
  const valSambutan = document.getElementById("sambutan").value.trim();
  const valVisi = document.getElementById("visi").value.trim();
  const valMisi = document.getElementById("misi").value.trim();
  const fileFotoKades = inputFotoKadesAsli.files[0];

  // Cegat jika Nama Kades kosong sebelum dikirim ke server (mencegah error 400)
  if (!valNamaKades) {
    return Swal.fire("Peringatan", "Kolom Nama Kepala Desa wajib diisi!", "warning");
  }

  Swal.fire({ title: "Menyimpan Data...", html: "Mohon tunggu sebentar...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  let successCount = 0;
  let errors = [];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const id = card.getAttribute("data-id");
    const judul = card.querySelector(".input-judul").value.trim();
    const desk = card.querySelector(".input-deskripsi").value.trim();
    const file = card.querySelector(".input-file").files[0];

    if (!id && !file) {
      errors.push(`Slide #${i+1} batal disimpan: Gambar Slider wajib diisi.`);
      continue;
    }

    const formData = new FormData();
    formData.append("judul_hero", judul);
    formData.append("deskripsi_hero", desk);
    formData.append("nama_kades", valNamaKades); // 🚨 DATA DIKIRIM KE BACKEND
    formData.append("sambutan", valSambutan);
    formData.append("visi", valVisi);
    formData.append("misi", valMisi);
    if (file) formData.append("gambar", file);
    if (fileFotoKades) formData.append("foto_kades", fileFotoKades);

    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, headers: { "Authorization": `Bearer ${token}` }, body: formData });
      
      // Tangkap pesan error spesifik dari backend jika gagal
      if (!res.ok) {
          const resData = await res.json();
          throw new Error(resData.message || `Gagal menyimpan slide #${i+1}`);
      }
      successCount++;
    } catch (err) {
      errors.push(err.message);
    }
  }

  if (errors.length > 0) {
    Swal.fire("Selesai dengan Catatan", `Berhasil menyimpan: ${successCount} slide.<br>Gagal: ${errors.join(", ")}`, "warning");
  } else {
    Swal.fire("Berhasil", "Seluruh data Beranda berhasil diperbarui!", "success");
    inputFotoKadesAsli.value = ""; 
  }

  loadCmsProfil(); 
});

// Load awal
loadCmsProfil();