/* ===================================================
   LOGIKA CMS PROFIL & CAROUSEL HERO (CmsProfil.js)
=================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const btnTambah = document.getElementById('btnTambahCarousel');
    const wadahCarousel = document.getElementById('wadahCarousel');
    
    // 1. Fungsi update label urutan slide (Slide 1, Slide 2, dst)
    function updateLabelSlide() {
        const items = wadahCarousel.querySelectorAll('.carousel-item');
        items.forEach((item, index) => {
            const label = item.querySelector('span.absolute');
            if (label) label.innerText = `Slide ${index + 1}`;
        });
    }

    // 2. Fungsi pratinjau (preview) gambar sebelum diunggah
    function setPreviewEvent(inputElemen) {
        inputElemen.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                const imgPreview = this.closest('.carousel-item').querySelector('.preview-img');
                const spanEmpty = this.closest('.carousel-item').querySelector('.empty-text');
                
                reader.onload = function(event) {
                    imgPreview.src = event.target.result;
                    imgPreview.classList.remove('hidden');
                    if (spanEmpty) spanEmpty.classList.add('hidden');
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. Tombol Tambah Item Carousel Baru
    if (btnTambah && wadahCarousel) {
        btnTambah.addEventListener('click', () => {
            const item = document.createElement('div');
            item.className = 'bg-white p-3 rounded-lg shadow-sm border border-gray-200 relative group carousel-item fade-up';
            
            item.innerHTML = `
                <div class="w-full h-32 bg-gray-100 rounded mb-3 overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                   <span class="empty-text text-gray-400 text-xs font-semibold">Preview Gambar</span>
                   <img src="" alt="Preview Carousel" class="hidden w-full h-full object-cover preview-img">
                   <span class="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm">Slide Baru</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <input type="file" accept="image/png, image/jpeg, image/webp" class="input-carousel-file w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition">
                  <button type="button" class="btn-hapus-carousel shrink-0 text-red-500 hover:text-red-700 p-1.5 bg-red-50 hover:bg-red-100 rounded transition" title="Hapus Gambar">
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
            `;
            
            wadahCarousel.appendChild(item);
            
            // Pasang event hapus untuk item baru
            item.querySelector('.btn-hapus-carousel').addEventListener('click', function() {
                item.remove();
                updateLabelSlide();
            });

            // Pasang event preview file untuk item baru
            setPreviewEvent(item.querySelector('.input-carousel-file'));
            updateLabelSlide();
        });
        
        // Pasang event hapus untuk item default HTML
        document.querySelectorAll('.btn-hapus-carousel').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.carousel-item').remove();
                updateLabelSlide();
            });
        });

        // Pasang event file preview untuk item default HTML
        document.querySelectorAll('.input-carousel-file').forEach(input => {
            setPreviewEvent(input);
        });
    }

    // 4. Preview Foto Kades
    const inputFotoKades = document.getElementById('inputFotoKades');
    const previewFotoKades = document.getElementById('previewFoto');

    if (inputFotoKades && previewFotoKades) {
        inputFotoKades.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    previewFotoKades.src = event.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }
});