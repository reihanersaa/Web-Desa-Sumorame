/* ===================================================
   LOGIKA ADMINISTRASI SURAT KETERANGAN TIDAK MAMPU (SKTM.js)
=================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. PENGATURAN MODAL VIEW
    // ==========================================
    const modalView = document.getElementById('modalView');
    const modalBox = document.getElementById('modalBox');
    
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
    const btnSimpanStatus = document.getElementById('btnSimpanStatus');

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
                Swal.fire("Tersimpan!", "Status surat SKTM berhasil diperbarui.", "success");
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
                text: "Data permohonan SKTM ini akan dihapus permanen!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc2626",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Ya, Hapus!"
            }).then((result) => {
                if (result.isConfirmed) {
                    this.closest('tr').remove();
                    Swal.fire("Terhapus!", "Data berhasil dihapus dari sistem.", "success");
                }
            });
        });
    });

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

    renderTable();
});