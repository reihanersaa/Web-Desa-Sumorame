/* ===================================================
   LOGIKA ADMINISTRASI SURAT KETERANGAN DOMISILI (SKD.js)
=================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. PENGATURAN MODAL VIEW
    // ==========================================
    const modalView = document.getElementById('modalView');
    const modalBox = document.getElementById('modalBox');
    
    // Fungsi Buka Modal View
    document.querySelectorAll('.btnView').forEach(btn => {
        btn.addEventListener('click', () => {
            modalView.classList.remove('hidden');
            modalView.classList.add('opacity-0');
            modalBox.classList.add('scale-90', 'opacity-0');

            requestAnimationFrame(() => {
                modalView.classList.remove('opacity-0');
                modalBox.classList.remove('scale-90', 'opacity-0');
                modalBox.classList.add('scale-100', 'opacity-100');
            });
        });
    });

    // Fungsi Tutup Modal View
    function tutupModalView() {
        modalView.classList.add('opacity-0');
        modalBox.classList.remove('scale-100', 'opacity-100');
        modalBox.classList.add('scale-90', 'opacity-0');
        setTimeout(() => modalView.classList.add('hidden'), 300);
    }

    document.getElementById('closeModal').addEventListener('click', tutupModalView);
    document.getElementById('btnCloseView').addEventListener('click', tutupModalView);
    modalView.addEventListener('click', (e) => {
        if (e.target === modalView) tutupModalView();
    });

    // ==========================================
    // 2. PENGATURAN MODAL EDIT (UBAH STATUS)
    // ==========================================
    const modalEdit = document.getElementById('modalEdit');
    const modalEditBox = document.getElementById('modalEditBox');
    const btnEdit = document.getElementById('btnEdit');

    // Buka Modal Edit
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

    // Tutup Modal Edit
    function tutupModalEdit() {
        modalEdit.classList.add('opacity-0');
        modalEditBox.classList.remove('scale-100', 'opacity-100');
        modalEditBox.classList.add('scale-90', 'opacity-0');
        setTimeout(() => modalEdit.classList.add('hidden'), 300);
    }

    document.getElementById('closeEdit').addEventListener('click', tutupModalEdit);
    document.getElementById('btnBatalEdit').addEventListener('click', tutupModalEdit);
    modalEdit.addEventListener('click', (e) => {
        if (e.target === modalEdit) tutupModalEdit();
    });

    // Simpan Perubahan Status
    btnSimpanStatus.addEventListener('click', () => {
        const status = document.getElementById('statusSurat').value;
        const catatan = document.getElementById('catatanAdmin').value;

        Swal.fire({
            title: "Konfirmasi Proses",
            text: `Ubah status permohonan menjadi "${status}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Simpan!"
        }).then((result) => {
            if (result.isConfirmed) {
                // TODO: Hubungkan ke Supabase (Update Row)
                Swal.fire("Tersimpan!", "Status surat berhasil diperbarui.", "success");
                tutupModalEdit();
            }
        });
    });

    // ==========================================
    // 3. LOGIKA HAPUS DATA (DELETE)
    // ==========================================
    document.querySelectorAll('.btnDelete').forEach(btn => {
        btn.addEventListener('click', function() {
            Swal.fire({
                title: "Yakin ingin menghapus?",
                text: "Data permohonan Produk UMKM akan dihapus permanen!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc2626",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Ya, Hapus!"
            }).then((result) => {
                if (result.isConfirmed) {
                    // TODO: Hubungkan ke Supabase (Delete Row)
                    this.closest('tr').remove();
                    Swal.fire("Terhapus!", "Data berhasil dihapus", "success");
                }
            });
        });
    });

    // ================= FUNGSI MODAL UMUM =================
    function openModal(modal, box) {
        modal.classList.remove('hidden');
        modal.classList.add('opacity-0');

        box.classList.remove('scale-100', 'opacity-100');
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

    const inputs = modalTambah.querySelectorAll('input[type="text"]');

    const nik = inputs[0].value.trim();
    const namaProduk = inputs[1].value.trim();
    const penjual = inputs[2].value.trim();
    const harga = inputs[3].value.trim();
    const email = inputs[4].value.trim();

    const alamat = modalTambah.querySelector('textarea').value.trim();

    const gambarInput = modalTambah.querySelector('input[type="file"]');
    const gambar = gambarInput.files[0];

    let kosong = [];

    // ================= VALIDASI FORM =================
    if (!nik) kosong.push("NIK");
    if (!namaProduk) kosong.push("Nama Produk");
    if (!penjual) kosong.push("Nama Penjual");
    if (!harga) kosong.push("Harga");
    if (!email) kosong.push("Email");
    if (!alamat) kosong.push("Alamat");
    if (!gambar) kosong.push("Gambar Produk");

    if (kosong.length > 0) {

        Swal.fire({
            title: "Form Belum Lengkap ⚠️",
            html: `
                <div style="text-align:center;">
                    <p>Data berikut masih kosong:</p>
                    <ul style="list-style-position: inside;">
                        ${kosong.map(item => `<li>${item}</li>`).join("")}
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


    // ================= VALIDASI GAMBAR =================
    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(gambar.type)) {

        Swal.fire({
            title: "Format Gambar Tidak Sesuai",
            text: "Gunakan gambar JPG atau PNG.",
            icon: "warning",
            confirmButtonColor: "#f59e0b"
        });

        return;
    }


    // Maksimal 2 MB
    if (gambar.size > 2 * 1024 * 1024) {

        Swal.fire({
            title: "Ukuran Gambar Terlalu Besar",
            text: "Ukuran gambar maksimal 2MB.",
            icon: "warning",
            confirmButtonColor: "#f59e0b"
        });

        return;
    }


    // ================= KONFIRMASI =================
    Swal.fire({
        title: "Konfirmasi Data",
        icon: "question",

        html: `
            <div style="text-align:left;">
                <p><b>NIK:</b><br>${nik}</p><br>

                <p><b>Nama Produk:</b><br>${namaProduk}</p><br>

                <p><b>Penjual:</b><br>${penjual}</p><br>

                <p><b>Harga:</b><br>${harga}</p><br>

                <p><b>Email:</b><br>${email}</p><br>

                <p><b>Alamat:</b><br>${alamat}</p><br>

                <p><b>Gambar:</b><br>${gambar.name}</p>
            </div>
        `,

        showCancelButton: true,

        confirmButtonText: "Ya, Simpan",
        cancelButtonText: "Batal",

        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#6b7280",

        background: "#eff6ff",
        color: "#1e3a8a"

    }).then(result => {

        if (result.isConfirmed) {

            // ==========================================
            // NANTI DATA KE DATABASE / SUPABASE DI SINI
            // ==========================================


            Swal.fire({
                title: "Berhasil 🎉",
                text: "Produk berhasil ditambahkan",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
                background: "#f0fff4",
                color: "#166534"
            });


            setTimeout(() => {

                // Tutup modal
                closeModalFunc(
                    modalTambah,
                    modalTambahBox
                );

                // Bersihkan form
                inputs.forEach(input => {
                    input.value = "";
                });

                modalTambah.querySelector('textarea').value = "";
                gambarInput.value = "";

            }, 1500);

        }

    });

};

    // ==========================================
    // 4. LOGIKA PENCARIAN & PAGINATION (STATIS)
    // ==========================================
    const table = document.querySelector("tbody");
    const rows = Array.from(table.querySelectorAll("tr"));
    const searchInput = document.getElementById("searchInput");
    const entriesSelect = document.getElementById("entriesSelect");
    const tableInfo = document.getElementById("tableInfo");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    let currentPage = 1;
    let rowsPerPage = parseInt(entriesSelect.value);

    function renderTable() {
        const keyword = searchInput.value.toLowerCase();
        const filtered = rows.filter(row => row.innerText.toLowerCase().includes(keyword));
        const total = filtered.length;
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        rows.forEach(row => row.style.display = "none");
        filtered.slice(start, end).forEach(row => row.style.display = "");

        tableInfo.innerText = `Showing ${total === 0 ? 0 : start + 1} to ${Math.min(end, total)} of ${total} entries`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = end >= total;
    }

    searchInput.addEventListener("input", () => { currentPage = 1; renderTable(); });
    entriesSelect.addEventListener("change", () => { rowsPerPage = parseInt(entriesSelect.value); currentPage = 1; renderTable(); });
    prevBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderTable(); } });
    nextBtn.addEventListener("click", () => { 
        const total = rows.filter(row => row.innerText.toLowerCase().includes(searchInput.value.toLowerCase())).length;
        if (currentPage * rowsPerPage < total) { currentPage++; renderTable(); } 
    });

    // Jalankan tabel saat pertama kali diload
    renderTable();
});