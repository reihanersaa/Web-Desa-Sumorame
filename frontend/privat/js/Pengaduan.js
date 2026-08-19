/* ===================================================
   LOGIKA ADMINISTRASI PENGADUAN (Pengaduan.js)
=================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ================= 1. INISIALISASI FLATPICKR =================
  flatpickr("#tanggalTanggapan", {
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d F Y",
    allowInput: true
  });

  // ================= 2. VARIABEL GLOBAL =================
  const tableBody = document.querySelector("tbody");
  const searchInput = document.getElementById("searchInput");
  const entriesSelect = document.getElementById("entriesSelect");
  const tableInfo = document.getElementById("tableInfo");

  let rows = [];
  let currentPage = 1;
  let rowsPerPage = parseInt(entriesSelect.value);
  
  let globalDataAduan = []; 
  let aduanIdYangDiedit = null;

  // ================= 3. FUNGSI TARIK DATA (GET) =================
  async function fetchDataAduan() {
    try {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Memuat data aduan...</td></tr>';
      
      // Sesuaikan URL ini dengan port Backend Node.js Anda (misal: 3000)
      const response = await fetch("http://localhost:3000/api/aduan");
      if (!response.ok) throw new Error('Gagal mengambil data dari server');
      
      const result = await response.json();
      globalDataAduan = result.data || []; 

      tableBody.innerHTML = ''; 
      
      if (globalDataAduan.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">Belum ada data pengaduan masuk.</td></tr>';
        return;
      }

      globalDataAduan.forEach((item, index) => {
        let statusBadge = '';
        if(item.status === 'Menunggu') statusBadge = 'bg-yellow-100 text-yellow-700';
        else if(item.status === 'Diproses') statusBadge = 'bg-blue-100 text-blue-700';
        else statusBadge = 'bg-green-100 text-green-700';

        const row = `
          <tr class="hover:bg-blue-50 transition-colors border-b">
            <td class="px-4 py-3 text-center border-r">${index + 1}</td>
            <td class="px-4 py-3 font-semibold text-gray-800 border-r">${item.nama_pelapor}</td>
            <td class="px-4 py-3 text-gray-700 border-r">${item.judul_aduan}</td>
            <td class="px-4 py-3 text-gray-600 border-r truncate max-w-xs">${item.isi_aduan}</td>
            <td class="px-4 py-3 text-center border-r">
              <span class="${statusBadge} px-2 py-1 rounded-full text-xs font-bold">${item.status}</span>
            </td>
            <td class="px-4 py-3 text-center">
              <div class="inline-flex gap-1">
                <button onclick="bukaModalView('${item.id}')" class="bg-purple-500 hover:bg-purple-600 text-white p-1.5 rounded transition shadow-sm" title="Lihat Detail">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                </button>
                <button onclick="bukaModalEdit('${item.id}')" class="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded transition shadow-sm" title="Tanggapi">
                  <span class="material-symbols-outlined text-sm">edit_document</span>
                </button>
                <button onclick="hapusAduan('${item.id}')" class="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition shadow-sm" title="Hapus">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });

      rows = Array.from(tableBody.querySelectorAll("tr"));
      renderTable(); 

    } catch (error) {
      console.error("Gagal menarik data:", error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-500">${error.message}</td></tr>`;
    }
  }

  // Panggil data saat halaman pertama kali dimuat
  fetchDataAduan();

  // ================= 4. LOGIKA PAGINATION & SEARCH =================
  searchInput.addEventListener("input", () => { currentPage = 1; renderTable(); });
  entriesSelect.addEventListener("change", () => { rowsPerPage = parseInt(entriesSelect.value); currentPage = 1; renderTable(); });

  function renderTable() {
    if(rows.length === 0) return;
    const keyword = searchInput.value.toLowerCase();
    const filtered = rows.filter(row => row.innerText.toLowerCase().includes(keyword));
    const total = filtered.length;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    rows.forEach(row => row.style.display = "none");
    filtered.slice(start, end).forEach(row => row.style.display = "");

    tableInfo.innerText = `Showing ${total === 0 ? 0 : start + 1} to ${Math.min(end, total)} of ${total} entries`;
  }

  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; renderTable(); }
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    const keyword = searchInput.value.toLowerCase();
    const total = rows.filter(row => row.innerText.toLowerCase().includes(keyword)).length;
    if (currentPage * rowsPerPage < total) { currentPage++; renderTable(); }
  });

  // ================= 5. FUNGSI MODAL VIEW =================
  window.bukaModalView = function(id) {
    const aduan = globalDataAduan.find(item => item.id === id);
    if (!aduan) return;

    // TODO: Anda bisa memasukkan data aduan ke elemen HTML modal di sini nantinya
    // document.getElementById('viewNama').innerText = aduan.nama_pelapor;

    const modalView = document.getElementById('modalView');
    const modalBox = document.getElementById('modalBox');
    
    modalView.classList.remove('hidden');
    modalView.classList.add('opacity-0');
    modalBox.classList.add('scale-90', 'opacity-0');

    requestAnimationFrame(() => {
      modalView.classList.remove('opacity-0');
      modalBox.classList.remove('scale-90', 'opacity-0');
      modalBox.classList.add('scale-100', 'opacity-100');
    });
  };

  // ================= 6. FUNGSI MODAL EDIT =================
  window.bukaModalEdit = function(id) {
    const aduan = globalDataAduan.find(item => item.id === id);
    if (!aduan) return;

    aduanIdYangDiedit = id; 

    // Kosongkan form tanggapan
    document.getElementById('tanggapan').value = '';
    document.getElementById('tanggalTanggapan').value = '';
    document.getElementById('uploadGambar').value = '';
    document.getElementById('uploadFile').value = '';

    const modalEdit = document.getElementById('modalEdit');
    const modalEditBox = document.getElementById('modalEditBox');

    modalEdit.classList.remove('hidden');
    modalEdit.classList.add('opacity-0');
    modalEditBox.classList.add('scale-90', 'opacity-0');

    requestAnimationFrame(() => {
      modalEdit.classList.remove('opacity-0');
      modalEditBox.classList.remove('scale-90', 'opacity-0');
      modalEditBox.classList.add('scale-100', 'opacity-100');
    });
  };

  // ================= 7. FUNGSI TUTUP MODAL =================
  function closeModalFunc(modal, box) {
    modal.classList.add('opacity-0');
    box.classList.remove('scale-100', 'opacity-100');
    box.classList.add('scale-90', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
  }

  document.getElementById('closeModal').onclick = () => closeModalFunc(document.getElementById('modalView'), document.getElementById('modalBox'));
  document.getElementById('btnClose2').onclick = () => closeModalFunc(document.getElementById('modalView'), document.getElementById('modalBox'));
  document.getElementById('closeEdit').onclick = () => closeModalFunc(document.getElementById('modalEdit'), document.getElementById('modalEditBox'));
  document.getElementById('btnCloseEdit').onclick = () => closeModalFunc(document.getElementById('modalEdit'), document.getElementById('modalEditBox'));

  document.getElementById('modalView').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalView')) closeModalFunc(document.getElementById('modalView'), document.getElementById('modalBox'));
  });
  document.getElementById('modalEdit').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalEdit')) closeModalFunc(document.getElementById('modalEdit'), document.getElementById('modalEditBox'));
  });

  // ================= 8. KIRIM TANGGAPAN (PUT) =================
  document.querySelector('.btnSimpan').addEventListener('click', async () => {
    if (!aduanIdYangDiedit) return;

    const tanggapan = document.getElementById('tanggapan').value.trim();
    const tanggal = document.getElementById('tanggalTanggapan').value.trim();
    const gambar = document.getElementById('uploadGambar').files[0];
    const file = document.getElementById('uploadFile').files[0];

    if (!tanggapan || !tanggal || (!gambar && !file)) {
      Swal.fire({
        title: "Form Belum Lengkap",
        text: "Tanggapan, Tanggal, dan minimal 1 Lampiran wajib diisi!",
        icon: "warning",
        confirmButtonColor: "#f59e0b"
      });
      return;
    }

    Swal.fire({
      title: "Kirim Tanggapan?",
      text: "Aduan ini akan ditandai sebagai Selesai/Diproses.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Kirim",
      cancelButtonText: "Batal",
      confirmButtonColor: "#16a34a"
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
          const formData = new FormData();
          formData.append("tanggapan_admin", tanggapan);
          formData.append("tanggal_tanggapan", tanggal);
          formData.append("status", "Selesai"); 
          
          if (gambar) formData.append("lampiran_gambar", gambar);
          if (file) formData.append("lampiran_file", file);

          const response = await fetch(`http://localhost:3000/api/aduan/${aduanIdYangDiedit}`, {
            method: "PUT",
            body: formData
          });

          if (!response.ok) throw new Error("Gagal menyimpan tanggapan.");

          Swal.fire("Berhasil!", "Tanggapan berhasil dikirim.", "success");
          closeModalFunc(document.getElementById('modalEdit'), document.getElementById('modalEditBox'));
          fetchDataAduan(); // Muat ulang tabel

        } catch (error) {
          console.error("Error:", error);
          Swal.fire("Gagal!", error.message, "error");
        }
      }
    });
  });

  // ================= 9. HAPUS ADUAN (DELETE) =================
  window.hapusAduan = function(id) {
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data aduan akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Lakukan request DELETE ke backend
          const response = await fetch(`http://localhost:3000/api/aduan/${id}`, { method: 'DELETE' });
          if (!response.ok) throw new Error("Gagal menghapus data.");
          
          Swal.fire("Berhasil", "Data berhasil dihapus", "success");
          fetchDataAduan(); // Muat ulang tabel setelah dihapus
        } catch (error) {
          Swal.fire("Gagal", error.message, "error");
        }
      }
    });
  };

});