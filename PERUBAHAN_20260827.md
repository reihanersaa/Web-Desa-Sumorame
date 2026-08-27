# Perbaikan Bug 27 Agustus 2026

## Navigasi dan 404

- Semua tautan halaman admin sekarang memakai path absolut `/admin/NamaFile.html`.
- Semua tautan halaman publik sekarang memakai path absolut `/NamaFile.html`.
- Memperbaiki perbedaan kapitalisasi `CmsProfil.html` menjadi `CMSProfil.html`.
- Memperbaiki perbedaan kapitalisasi `CmsProduk.html` menjadi `CMSProduk.html`.
- Memperbaiki `Index.html` menjadi `index.html` pada halaman Informasi publik.
- Redirect JavaScript login dan session guard juga memakai path absolut.

## CMS Informasi

- Mempertahankan API production dari `api-config.js`; tidak memakai URL localhost dari
  file percobaan tim.
- Memulihkan pemilihan tanggal dengan Flatpickr untuk tambah dan edit informasi.
- Mengirim field `tanggal` yang diwajibkan controller backend.
- Menampilkan tanggal pada modal detail dan mengisi tanggal lama saat modal edit dibuka.
- Pencarian sekarang juga mencakup tanggal.
- Data dinamis pada tabel dan dialog konfirmasi tetap di-escape.
- Menambahkan cache version pada `informasi.js` agar browser tidak memuat file lama.

## Login

- Elemen dekoratif dan modal tersembunyi tidak lagi menangkap klik.
- Area klik tautan bantuan, pergantian portal, dan daftar diperbesar.
- Login warga diberi label `Portal Warga` dan tombol `Login Warga`.
- Login admin memakai tema biru, label `Portal Petugas`, keterangan akses terbatas,
  dan tombol `Login ke Dashboard Admin`.
- CSS login diberi cache version baru.

## Pemeriksaan

- Tidak ada lagi link HTML internal relatif.
- Tidak ada referensi `CmsProfil.html`, `CmsProduk.html`, atau `Index.html`.
- Seluruh target link internal ditemukan dengan kapitalisasi yang sesuai.
- Seluruh referensi DOM `informasi.js` tersedia di `Informasi.html`.
- Seluruh JavaScript lulus pemeriksaan sintaks.
