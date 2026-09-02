# Perbaikan 29 Agustus 2026

## Produk unggulan

- Gambar produk di beranda dan halaman Produk sekarang membaca `gambar_url`, `gambar`, serta URL alternatif dari backend.
- Backend menormalisasi URL gambar lama maupun baru dan mencoba bucket `produk` serta `produk-images` untuk kompatibilitas data lama.
- Bila objek gambar memang sudah tidak ada di Supabase Storage, kartu tidak lagi tampak putih kosong; pengguna melihat placeholder yang jelas. Unggah ulang gambar melalui CMS untuk memperbaiki objek yang benar-benar hilang.
- Produk unggulan beranda tetap mengikuti pilihan admin (`is_featured`) dan urutan `featured_order`, maksimal lima produk.

## Pengajuan produk oleh warga

- Guest yang menekan **Pasarkan Produk Anda** mendapat popup dengan pilihan **Login warga** atau **Nanti saja**, tanpa langsung dipindahkan halaman.
- Form dibuat lebih ringkas dan nyaman pada layar 1366×768 maupun ponsel.
- Kolom NIK dan nama penjual dihapus dari form warga. Backend mengambil keduanya dari akun/token yang telah diverifikasi sehingga tidak dapat dipalsukan dari browser.
- Admin tetap dapat menambah produk melalui endpoint admin yang dilindungi role admin.

## Hero halaman publik

- Judul hero PPID, Lembaga, Informasi, Persuratan, Aduan, dan Produk memakai pola yang sama: rata kiri, ukuran responsif, dan selalu terlihat.
- Animasi PPID yang membuat judul berada di luar layar selama beberapa detik telah dihapus.
- Judul Persuratan dan PPID tidak lagi bergantung pada JavaScript agar terlihat.

## PPID

- Hero diperjelas dengan judul dan deskripsi layanan publik.
- Menu PPID diperbarui menjadi kartu interaktif yang lebih mudah dipahami.
- Bagian Jam Pelayanan diperbesar, kontras ditingkatkan, dan tabel dibuat lebih mudah dibaca.
- Isi jadwal dan ketentuan 10 hari + perpanjangan 7 hari tetap dipertahankan.

## Catatan teknis

- Konflik Git yang belum terselesaikan pada `frontend/publik/css/Produk.css` telah dibersihkan.
- Nomor WhatsApp pengajuan produk divalidasi 9–15 digit di frontend dan backend.
- Versi cache aset diubah ke `20260829-1`. Setelah deploy Vercel selesai, lakukan hard refresh satu kali bila browser masih menampilkan desain lama.
