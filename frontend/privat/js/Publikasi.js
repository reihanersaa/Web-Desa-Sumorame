// ================= SIDEBAR =================
const burgerBtn = document.getElementById('burgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const mainContent = document.getElementById('mainContent');
const headerLeft = document.getElementById('headerLeft');

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

    document.querySelectorAll('.menu-text').forEach(el => {
      el.classList.toggle('hidden');
    });
  }
});

overlay.addEventListener('click', () => {
  sidebar.classList.add('-translate-x-full');
  overlay.classList.add('hidden');
});

// ================= DROPDOWN =================
const permohonanToggle = document.getElementById('permohonanToggle');
const permohonanMenu = document.getElementById('permohonanMenu');
const permohonanIcon = document.getElementById('permohonanIcon');

permohonanToggle.addEventListener('click', () => {
  permohonanMenu.classList.toggle('hidden');
  permohonanIcon.classList.toggle('rotate-180');
});

// ================= TABLE =================
const table = document.querySelector("tbody");
const rows = Array.from(table.querySelectorAll("tr"));

const searchInput = document.getElementById("searchInput");
const entriesSelect = document.getElementById("entriesSelect");
const tableInfo = document.getElementById("tableInfo");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentPage = 1;
let rowsPerPage = parseInt(entriesSelect.value);

// SEARCH
searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});

// ENTRIES
entriesSelect.addEventListener("change", () => {
  rowsPerPage = parseInt(entriesSelect.value);
  currentPage = 1;
  renderTable();
});

  // RENDER
    function renderTable() {
    const keyword = searchInput.value.toLowerCase();

    const filtered = rows.filter(row =>
      row.innerText.toLowerCase().includes(keyword)
    );

    const total = filtered.length;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    rows.forEach(row => row.style.display = "none");

    filtered.slice(start, end).forEach(row => {
      row.style.display = "";
    });

    tableInfo.innerText =
      `Showing ${start + 1} to ${Math.min(end, total)} of ${total} entries`;

    // 🔥 TAMBAHKAN INI
    resetAnimation();
  }

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  function resetAnimation() {
  document.querySelectorAll("tbody tr").forEach((row, i) => {
    row.classList.remove("fade-up");

    void row.offsetWidth; // trigger reflow

    row.classList.add("fade-up");
    row.style.animationDelay = (i * 0.1) + "s";
  });
}

nextBtn.addEventListener("click", () => {
  const keyword = searchInput.value.toLowerCase();
  const total = rows.filter(row =>
    row.innerText.toLowerCase().includes(keyword)
  ).length;

  if (currentPage * rowsPerPage < total) {
    currentPage++;
    renderTable();
  }
});

renderTable();

// ================= FLATPICKR =================
flatpickr("#tanggalTambah", {
  dateFormat: "Y-m-d",
  altInput: true,
  altFormat: "d F Y"
});

flatpickr("#tanggalEdit", {
  dateFormat: "Y-m-d",
  altInput: true,
  altFormat: "d F Y"
});

// ================= MODAL FUNCTION =================
function openModal(modal, box) {
  modal.classList.remove('hidden');

  modal.classList.add('opacity-0');
  box.classList.add('scale-90', 'opacity-0');

  requestAnimationFrame(() => {
    modal.classList.remove('opacity-0');
    box.classList.remove('scale-90', 'opacity-0');
    box.classList.add('scale-100', 'opacity-100');
  });
}

function closeModalFunc(modal, box) {
  modal.classList.add('opacity-0');
  box.classList.remove('scale-100', 'opacity-100');
  box.classList.add('scale-90', 'opacity-0');

  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

// ================= MODAL TAMBAH =================
const modalTambah = document.getElementById('modalTambah');
const modalTambahBox = document.getElementById('modalTambahBox');

document.getElementById('btnTambah').onclick = () =>
  openModal(modalTambah, modalTambahBox);

document.getElementById('closeTambah').onclick = () =>
  closeModalFunc(modalTambah, modalTambahBox);

document.getElementById('btnCloseTambah').onclick = () =>
  closeModalFunc(modalTambah, modalTambahBox);

// ================= MODAL VIEW =================
const modalView = document.getElementById('modalView');
const modalBox = document.getElementById('modalBox');

document.querySelectorAll('.btnView').forEach(btn => {
  btn.onclick = () => openModal(modalView, modalBox);
});

document.getElementById('closeModal').onclick = () =>
  closeModalFunc(modalView, modalBox);

document.getElementById('btnClose2').onclick = () =>
  closeModalFunc(modalView, modalBox);

// ================= MODAL EDIT =================
const modalEdit = document.getElementById('modalEdit');
const modalEditBox = document.getElementById('modalEditBox');

document.querySelectorAll('.btnEdit').forEach(btn => {
  btn.onclick = () => openModal(modalEdit, modalEditBox);
});

document.getElementById('closeEdit').onclick = () =>
  closeModalFunc(modalEdit, modalEditBox);

document.getElementById('btnCloseEdit').onclick = () =>
  closeModalFunc(modalEdit, modalEditBox);

// ================= DELETE =================
document.querySelectorAll('.btnDelete').forEach(btn => {
  btn.onclick = () => {
    Swal.fire({
    title: "Yakin hapus?",
    text: "Data publikasi akan dihapus permanen!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    background: "#fff5f5",
    color: "#7f1d1d"
    }).then(result => {
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
  };
});

  // ================= OUTSIDE CLICK =================
  function enableOutsideClick(modal, box) {
    modal.addEventListener('click', (e) => {
      if (!box.contains(e.target)) {
        closeModalFunc(modal, box);
      }
    });
  }

  // 🔥 TARUH DI SINI (SETELAH DECLARE)
  enableOutsideClick(modalTambah, modalTambahBox);
  enableOutsideClick(modalView, modalBox);
  enableOutsideClick(modalEdit, modalEditBox);

  // ================= SIMPAN TAMBAH =================
  document.getElementById('btnSimpanTambah').onclick = () => {

  const judul = document.querySelector('#modalTambah input[type="text"]').value.trim();
  const isi = document.querySelector('#modalTambah textarea').value.trim();
  const tanggal = document.getElementById('tanggalTambah').value;
  const gambar = document.querySelector('#modalTambah input[type="file"]').files[0];

  let kosong = [];

  if (!judul) kosong.push("Judul");
  if (!isi) kosong.push("Isi Kegiatan");
  if (!tanggal) kosong.push("Tanggal");
  if (!gambar) kosong.push("Gambar");

  // VALIDASI
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

    // KONFIRMASI
    Swal.fire({
      title: "Konfirmasi Data",
      icon: "question",
      html: `
        <p><b>Judul:</b><br>${judul}</p>
        <p><b>Isi:</b><br>${isi}</p>
        <p><b>Tanggal:</b><br>${tanggal}</p>
        <p><b>Gambar:</b><br>${gambar.name}</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      background: "#eff6ff",
      color: "#1e3a8a"
  }).then(result => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Berhasil 🎉",
        text: "Data berhasil ditambahkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#f0fff4",
        color: "#166534"
      });

      setTimeout(() => {
        closeModalFunc(modalTambah, modalTambahBox);
      }, 1500);
    }
  });
};

// ================= SIMPAN EDIT =================
document.getElementById('btnSimpanEdit').onclick = () => {

  const judul = document.querySelector('#modalEdit input[type="text"]').value.trim();
  const isi = document.querySelector('#modalEdit textarea').value.trim();
  const tanggal = document.getElementById('tanggalEdit').value;
  const gambar = document.querySelector('#modalEdit input[type="file"]').files[0];

  let kosong = [];

  if (!judul) kosong.push("Judul");
  if (!isi) kosong.push("Isi Kegiatan");
  if (!tanggal) kosong.push("Tanggal");
  if (!gambar) kosong.push("Gambar");

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

  Swal.fire({
    title: "Konfirmasi Data",
    icon: "question",
    html: `
      <p><b>Judul:</b><br>${judul}</p>
      <p><b>Isi:</b><br>${isi}</p>
      <p><b>Tanggal:</b><br>${tanggal}</p>
      <p><b>Gambar:</b><br>${gambar ? gambar.name : "Tidak ada perubahan"}</p>
    `,
    showCancelButton: true,
    confirmButtonText: "Ya, simpan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    background: "#eff6ff",
    color: "#1e3a8a"
  }).then(result => {
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
      }, 1500);
    }
  });
};