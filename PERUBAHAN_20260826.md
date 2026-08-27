# Ringkasan Perbaikan 26 Agustus 2026

## Integrasi Vercel

- Mengembalikan `api-config.js` ke seluruh halaman publik dan privat yang memakai API.
- Menghapus URL `localhost` yang tertinggal pada CMS Profil dan Kelembagaan.
- Mempertahankan backend production di
  `https://web-desa-sumorame-backend.vercel.app/api`.
- Menambahkan header keamanan pada frontend dan backend.

## Kontrol akses

- Semua operasi tambah, ubah, dan hapus CMS Profil, Kelembagaan, Publikasi, Informasi,
  PPID, Produk, Statistik, Aduan, dan Persuratan memerlukan role admin di backend.
- Token warga yang mencoba operasi CMS mendapat HTTP 403.
- Pengajuan surat dan aduan hanya menerima token role warga.
- Halaman admin tetap melakukan redirect saat token hilang/kedaluwarsa; ini hanya lapisan UI,
  sedangkan keputusan akses tetap dilakukan backend.

## Keamanan data

- Data aduan yang ditampilkan di tabel sudah di-escape untuk mencegah stored XSS.
- Data dinamis utama pada tabel Informasi, Publikasi, Kelembagaan, dan CMS Profil juga
  di-escape sebelum dimasukkan melalui `innerHTML`.
- File upload diperiksa berdasarkan signature JPEG, PNG, WebP, atau PDF, tidak hanya MIME.
- Bucket `bukti_aduan` disiapkan menjadi privat dan admin memakai signed URL satu jam.
- Login dan registrasi diberi rate limit dasar.
- Admin JWT dipersingkat menjadi dua jam.
- Pesan login dibuat lebih umum untuk mengurangi kebocoran informasi akun.
- Filter registrasi tidak lagi menyusun query `.or()` dari input email mentah.

## Aset yang disesuaikan

- `statistik.webp` dan `statistik.png` menjadi `Statistik.webp`.
- `peta.webp` menjadi `Peta.webp`.
- Fallback pengumuman menjadi `peringatan.png`.
- Fallback foto kepala desa menjadi `kepala.png`.
- Fallback struktur PPID menjadi `StrukturDesa.jpg`.
- Logo statistik admin menjadi `logo3.png`.

Folder gambar tidak disertakan oleh tim dalam ZIP sumber. Pertahankan folder
`frontend/publik/img` yang sudah ada saat melakukan overwrite.

## Pengujian lokal yang lulus

- Seluruh file JavaScript lulus pemeriksaan sintaks.
- Health check: HTTP 200.
- Endpoint admin tanpa token: HTTP 401.
- Token warga ke operasi CMS: HTTP 403.
- Origin asing: HTTP 403.
- Upload PNG palsu: HTTP 400.
- Percobaan login ke-11 dari IP yang sama: HTTP 429.
