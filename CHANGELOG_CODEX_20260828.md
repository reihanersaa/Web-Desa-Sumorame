# Changelog Codex — 28 Agustus 2026

## Frontend publik

- `frontend/publik/index.html` dan `frontend/publik/js/index.js`: menghapus fallback CMS palsu, memperbaiki pemuatan hero/pengumuman, escaping data publikasi, dan optimasi gambar.
- `frontend/publik/Produk.html` dan `frontend/publik/js/Produk.js`: menghapus tiga produk contoh dan hanya memakai API.
- `frontend/publik/Publikasi.html` dan `frontend/publik/js/Publikasi.js`: pagination 6 item, tombol load more, lazy image, dan akses keyboard.
- `frontend/publik/js/Aduan.js`: riwayat aduan dari backend dan status tidak lagi dapat diubah lewat browser.
- `frontend/publik/css/layout-responsive.css`: optimasi mobile dan reduced motion.
- Seluruh tautan internal frontend: `.html` dihapus dari URL yang ditampilkan.

## Frontend admin

- `frontend/privat/Pengaduan.html`: menghapus baris dummy.
- Tautan admin diarahkan ke URL bersih.

## Backend

- `backend/src/controllers/aduanController.js` dan `backend/src/routes/aduanRoutes.js`: endpoint aduan milik warga dan validasi satu aduan aktif.
- `backend/src/controllers/publikasiController.js`: dukungan `limit` dan `offset`, tetap kompatibel dengan CMS admin yang meminta semua data.

## Deploy

- `frontend/vercel.json`: redirect URL lama, rewrite URL bersih, serta cache gambar.
- `backend/.env` tidak disertakan dalam hasil akhir untuk mencegah kebocoran rahasia.

