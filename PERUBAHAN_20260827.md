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

## Mode Guest dan sesi warga

- Halaman informasi publik tetap dapat dibaca tanpa akun.
- Guest yang membuka `/Aduan.html` atau `/AdminP.html` diarahkan ke login, lalu kembali ke
  layanan yang semula dipilih setelah login berhasil.
- Katalog produk tetap publik untuk membantu promosi UMKM. Tombol `Pasarkan Produk Anda`
  mewajibkan login warga.
- Ikon header menampilkan `login` untuk guest dan `account_circle` untuk warga yang sedang
  login. Menu mobile menampilkan `Masuk Warga` atau `Keluar (Nama)`.
- Token diperiksa role dan waktu kedaluwarsanya. Flag `login=true` tanpa JWT warga yang valid
  tidak lagi dianggap sebagai sesi login.
- Pengajuan produk sekarang dilindungi JWT dan role `warga` pada backend. NIK pengajuan
  harus sama dengan NIK di dalam token.

## Domain dan CORS

- Origin domain utama, `www`, dan domain Vercel dimasukkan ke daftar CORS backend.
- Konfigurasi `FRONTEND_URLS` mendukung daftar URL polos yang dipisahkan koma.
- Nilai origin berformat Markdown atau URL tidak valid akan diabaikan dan dicatat pada log.
