// sidebar
const burgerBtn = document.getElementById('burgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const mainContent = document.getElementById('mainContent');
const headerLeft = document.getElementById('headerLeft');

flatpickr("#tanggalTanggapan", {
  dateFormat: "Y-m-d", // format: 2026-04-24
  altInput: true,
  altFormat: "d F Y", // tampil: 24 April 2026
  allowInput: true
});

burgerBtn.addEventListener('click', () => {
  if (window.innerWidth < 768) {
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
  } else {
    sidebar.classList.toggle('w-64');
    sidebar.classList.toggle('w-20');
    headerLeft.classList.toggle('w-64');
    headerLeft.classList.toggle('w-20');
    mainContent.classList.toggle('md:pl-64');
    mainContent.classList.toggle('md:pl-20');
  }
});

  // Dropdown Sidebar
  const pemohonToggle = document.getElementById('pemohonToggle');
  const pemohonMenu = document.getElementById('pemohonMenu');
  const pemohonIcon = document.getElementById('pemohonIcon');

  pemohonToggle.addEventListener('click', () => {
    if (pemohonMenu.classList.contains('max-h-0')) {
      pemohonMenu.classList.remove('max-h-0', 'opacity-0');
      pemohonMenu.classList.add('max-h-40', 'opacity-100');
    } else {
      pemohonMenu.classList.remove('max-h-40', 'opacity-100');
      pemohonMenu.classList.add('max-h-0', 'opacity-0');
    }

    pemohonIcon.classList.toggle('rotate-180');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  });

  // ================= VIEW MODAL =================
  const modal = document.getElementById('modalView');
  const modalBox = document.getElementById('modalBox');

  const closeModal = document.getElementById('closeModal');
  const btnClose2 = document.getElementById('btnClose2');

  // ================= EDIT MODAL =================
  const modalEdit = document.getElementById('modalEdit');
  const modalEditBox = document.getElementById('modalEditBox');

  const closeEdit = document.getElementById('closeEdit');
  const btnCloseEdit = document.getElementById('btnCloseEdit');

  // ================= OPEN VIEW =================
  document.querySelectorAll('.btnView').forEach(btn => {
    btn.addEventListener('click', () => {

      modal.classList.remove('hidden');

      modal.classList.add('opacity-0');
      modalBox.classList.add('scale-90', 'opacity-0');

      requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modalBox.classList.remove('scale-90', 'opacity-0');
        modalBox.classList.add('scale-100', 'opacity-100');
      });
    });
  });

  // ================= OPEN EDIT =================
  document.querySelectorAll('.btnEdit').forEach(btn => {
    btn.addEventListener('click', () => {

      modalEdit.classList.remove('hidden');

      modalEdit.classList.add('opacity-0');
      modalEditBox.classList.add('scale-90', 'opacity-0');

      requestAnimationFrame(() => {
        modalEdit.classList.remove('opacity-0');
        modalEditBox.classList.remove('scale-90', 'opacity-0');
        modalEditBox.classList.add('scale-100', 'opacity-100');
      });
    });
  });
  
  // ================= SWEET ALERT DELETE =================
  document.querySelectorAll('.btnCancelDelete').forEach(btn => {
    btn.addEventListener('click', () => {
      Swal.fire({
        title: "Yakin hapus?",
        text: "Data aduan akan dihapus permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, hapus",
        cancelButtonText: "Batal",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        background: "#fff5f5",
        color: "#7f1d1d"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
          title: "Berhasil 🎉",
          text: "Data berhasil dihapus",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "#f0fff4",
          color: "#166534"
          });
        }
      });
    });
  });

  // ================= SWEET ALERT EDIT =================
  document.querySelectorAll('.btnSimpan').forEach(btn => {
  btn.addEventListener('click', () => {

    const tanggapan = document.getElementById('tanggapan').value.trim();
    const tanggal = document.getElementById('tanggalTanggapan').value.trim();
    const gambar = document.getElementById('uploadGambar').files[0];
    const file = document.getElementById('uploadFile').files[0];

    let kosong = [];

    if (!tanggapan) kosong.push("Tanggapan");
    if (!tanggal) kosong.push("Tanggal Tanggapan");
    if (!gambar && !file) kosong.push("Upload (Gambar/File)");

    // ================= VALIDASI =================
    if (kosong.length > 0) {
        Swal.fire({
          title: "Form Belum Lengkap ⚠️",
          html: `
            <div style="text-align:center;">
              <p>Data berikut masih kosong:</p>
              <ul style="list-style-position: inside;">
                ${kosong.map(i => `<li>${i}</li>`).join("")}
              </ul>
            </div>
          `,
          icon: "warning",
          confirmButtonColor: "#f59e0b",
          background: "#fffbeb",
          color: "#92400e"
        });
        return;
      }

    // ================= NAMA FILE =================
    const namaGambar = gambar ? gambar.name : "Tidak ada";
    const namaFile = file ? file.name : "Tidak ada";

    // ================= KONFIRMASI =================
    Swal.fire({
        title: "Konfirmasi Data",
        icon: "question",
        html: `
          <p><b>Tanggapan:</b><br>${tanggapan}</p>
          <p><b>Tanggal Tanggapan:</b><br>${tanggal}</p>
          <p><b>Lampiran:</b><br>
            ${gambar ? "📷 " + namaGambar : ""}
            ${file ? "<br>📄 " + namaFile : ""}
          </p>
        `,
        showCancelButton: true,
        confirmButtonText: "Ya, simpan",
        cancelButtonText: "Batal",
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#6b7280",
        background: "#eff6ff",
        color: "#1e3a8a"
      }).then((result) => {
        if (result.isConfirmed) {

          Swal.fire({
            title: "Berhasil 🎉",
            text: "Data berhasil diperbarui",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            background: "#f0fff4",
            color: "#166534"
          });

          setTimeout(() => {
            closeModalFunc(modalEdit, modalEditBox);
          }, 2000);
        }
      });

    });
  });

  // ================= CLOSE FUNCTION =================
  function closeModalFunc(modal, box) {
    modal.classList.add('opacity-0');
    box.classList.remove('scale-100', 'opacity-100');
    box.classList.add('scale-90', 'opacity-0');

    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }

  // ================= CLOSE VIEW =================
  closeModal.onclick = () => closeModalFunc(modal, modalBox);
  btnClose2.onclick = () => closeModalFunc(modal, modalBox);

  // ================= CLOSE EDIT =================
  closeEdit.onclick = () => closeModalFunc(modalEdit, modalEditBox);
  btnCloseEdit.onclick = () => closeModalFunc(modalEdit, modalEditBox);

  // ================= CLICK OUTSIDE =================
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFunc(modal, modalBox);
  });

  modalEdit.addEventListener('click', (e) => {
    if (e.target === modalEdit) closeModalFunc(modalEdit, modalEditBox);
  });

  const table = document.querySelector("tbody");
  const rows = Array.from(table.querySelectorAll("tr"));

  const searchInput = document.getElementById("searchInput");
  const entriesSelect = document.getElementById("entriesSelect");
  const tableInfo = document.getElementById("tableInfo");

  let currentPage = 1;
  let rowsPerPage = parseInt(entriesSelect.value);

  // FILTER SEARCH
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderTable();
  });

  // CHANGE ENTRIES
  entriesSelect.addEventListener("change", () => {
    rowsPerPage = parseInt(entriesSelect.value);
    currentPage = 1;
    renderTable();
  });

  // RENDER TABLE
  function renderTable() {
    const keyword = searchInput.value.toLowerCase();

    const filtered = rows.filter(row =>
      row.innerText.toLowerCase().includes(keyword)
    );

    const total = filtered.length;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    // sembunyikan semua
    rows.forEach(row => row.style.display = "none");

    // tampilkan sesuai page
    filtered.slice(start, end).forEach(row => {
      row.style.display = "";
    });

    // update info
    tableInfo.innerText =
      `Showing ${start + 1} to ${Math.min(end, total)} of ${total} entries`;
  }

  // PAGINATION
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    const keyword = searchInput.value.toLowerCase();
    const total = rows.filter(row =>
      row.innerText.toLowerCase().includes(keyword)
    ).length;

    if (currentPage * rowsPerPage < total) {
      currentPage++;
      renderTable();
    }
  });

  // INIT
  renderTable();