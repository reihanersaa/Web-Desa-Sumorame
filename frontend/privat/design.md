# Panduan Desain — Panel Privat SIAD Sumorame

Dokumen ini menjadi acuan visual untuk seluruh halaman di folder `frontend/privat`. Tujuannya adalah menyatukan Dashboard, Aduan, Surat Menyurat, Publikasi, Statistik, dan seluruh halaman CMS ke dalam satu aplikasi administrasi yang konsisten dan efisien.

## 1. Karakter desain

Panel privat harus terasa **tegas, ringkas, stabil, dan mudah dipindai oleh petugas**. Kerangka utamanya adalah header putih, sidebar gelap, latar kerja abu-abu terang, dan panel putih. Hijau Desa Sumorame menghubungkan panel ini dengan portal publik dan dipakai sebagai warna aksi utama serta status positif.

Prioritaskan kejelasan data dan kecepatan kerja. Dekorasi, animasi, dan foto tidak boleh mengganggu tabel, formulir, status, atau tindakan petugas.

## 2. Fondasi visual

### Warna utama

| Token | Nilai | Pemakaian |
|---|---:|---|
| `brand` | `#006633` | Tombol utama, focus ring, tautan penting, status berhasil |
| `brand-dark` | `#004B24` | Hover tombol utama dan aksen merek gelap |
| `sidebar` | `#111111` | Latar sidebar |
| `sidebar-hover` | `#374151` | Hover dan grup menu terbuka |
| `sidebar-active` | `#4B5563` | Item halaman aktif |
| `workspace` | `#E5E7EB` | Latar area kerja (`gray-200`) |
| `surface` | `#FFFFFF` | Header, kartu, modal, tabel, formulir |
| `text` | `#111827` | Teks utama |
| `text-muted` | `#6B7280` | Metadata dan teks bantuan |
| `border` | `#D1D5DB` | Batas kontrol dan pemisah |
| `info` | `#3B82F6` | Informasi dan aksi kontekstual sekunder |
| `success` | `#166534` | Status selesai/diterima |
| `warning` | `#F59E0B` | Menunggu atau perlu perhatian |
| `danger` | `#DC2626` | Ditolak, gagal, hapus |

Warna biru tidak menjadi warna merek. Pakai biru hanya untuk informasi atau aksi lokal yang sudah umum, lalu gunakan hijau untuk aksi utama halaman. Jangan memberi warna berbeda pada setiap modul.

### Tipografi

- Semua halaman panel memakai **Poppins**, bobot 400, 500, 600, dan 700.
- Ukuran isi: `14px` untuk antarmuka padat dan `16px` untuk formulir panjang.
- Judul halaman di header: `18px`, bobot 600.
- Judul bagian: `20–24px`, bobot 600–700.
- Judul kartu: `14–18px`, bobot 600.
- Metadata dan bantuan: `12–14px`.
- Material Symbols Outlined menjadi satu-satunya keluarga ikon antarmuka setelah halaman lama dimigrasikan.

### Bentuk, bayangan, dan jarak

- Radius kontrol dan menu: `6–8px`.
- Radius kartu, tabel, dan modal: `12px`.
- Bayangan standar: `0 4px 12px rgba(0,0,0,.08)`.
- Bayangan hover hanya untuk kartu yang dapat diklik: `0 10px 22px rgba(0,0,0,.12)`.
- Gunakan skala jarak `4, 8, 12, 16, 24, 32px`.
- Kepadatan tabel standar: sel vertikal `12px`, horizontal `16px`.

## 3. Kerangka aplikasi wajib

### Header

- Posisi fixed di atas, tinggi `64px`, latar putih, border bawah tipis, `z-index: 50`.
- Area merek selebar sidebar (`256px`) memuat logo SIAD.
- Bagian kanan memuat tombol hamburger, judul halaman, dan Logout.
- Judul harus sesuai modul: “Dashboard”, “Kelola Informasi”, atau “Surat Keterangan Domisili”.

### Sidebar

- Lebar terbuka `256px`, mulai di bawah header, latar hampir hitam, teks putih.
- Urutan menu baku: Dashboard, Aduan, Surat Menyurat, Publikasi, Kelola Website.
- Ikon berukuran `20–24px`; label `14px`.
- Item aktif memakai `sidebar-active` dan indikator kiri putih/hijau. Hover memakai `sidebar-hover`.
- Submenu menjorok `24px`, teks abu-abu terang, dan hanya satu grup perlu terbuka pada satu waktu.
- Pada desktop sidebar selalu terlihat dan konten memiliki padding kiri `256px`. Pada layar `<768px`, sidebar menjadi drawer dengan overlay dan fokus dipindahkan ke menu saat dibuka.

### Area kerja

- Latar `workspace`, tinggi minimal satu viewport, padding atas `64px`, padding isi `24px`.
- Konten memakai lebar penuh yang tersedia; formulir panjang boleh dibatasi `960–1120px` agar mudah dibaca.
- Awali halaman dengan baris judul/penjelasan dan aksi utama. Jangan menaruh tombol “Tambah” tanpa konteks di lokasi yang berubah-ubah.

### Footer

Footer panel bersifat ringkas dan konsisten. Letakkan versi aplikasi atau hak cipta dalam teks redup. Footer tidak boleh mengambil ruang vertikal besar.

## 4. Komponen baku

### Tombol dan aksi

- Primer: hijau `brand`, teks putih, tinggi minimal `40px`; satu tombol primer utama per area.
- Sekunder: putih, border abu-abu, teks gelap.
- Informasional: biru untuk lihat/detail/unduh bila diperlukan.
- Bahaya: merah untuk hapus, tolak, atau keluar dari proses; minta konfirmasi pada aksi yang tidak dapat dipulihkan.
- Ukuran tombol tabel boleh `36px`, tetapi target sentuh tetap minimal `40 × 40px`.
- Ikon harus disertai label kecuali maknanya sangat umum dan tersedia `aria-label`/tooltip.

### Kartu statistik

- Gunakan grid responsif: 1 kolom seluler, 2 tablet, 3–4 desktop.
- Tiap kartu memuat ikon, label, angka utama, dan konteks/perubahan jika tersedia.
- Gunakan warna aksen pada ikon atau garis kecil, bukan pada seluruh latar kartu.
- Semua kartu dalam satu baris memiliki tinggi dan padding yang sama.

### Panel dan formulir CMS

- Panel memakai header netral atau hijau tua dengan judul singkat; jangan memakai header hitam pada sebagian modul dan warna acak pada modul lain.
- Label berada di atas field. Tinggi input minimal `40px`, textarea minimal `120px`, radius `8px`.
- Focus ring memakai hijau brand. Teks bantuan berada di bawah field.
- Susun field satu kolom pada seluler dan maksimal dua kolom untuk data yang saling berkaitan.
- Tombol Simpan berada di akhir formulir dan tetap konsisten: primer di kanan, Batal di sebelah kirinya.

### Tabel data

- Header tabel memiliki latar abu-abu sangat terang, teks gelap, bobot 600.
- Baris memakai border bawah, hover ringan, dan tidak bergantung pada zebra striping yang kuat.
- Kolom aksi selalu paling kanan dan urutan aksinya konsisten: Lihat/Edit lalu Hapus/Tolak.
- Tabel dibungkus `overflow-x-auto`. Pada seluler, pertahankan kolom penting dan sembunyikan detail sekunder atau ubah menjadi kartu data berlabel.
- Sediakan keadaan loading, kosong, gagal, pencarian tanpa hasil, dan pagination.

### Status

Gunakan badge berbentuk pil dengan label teks:

| Status | Warna |
|---|---|
| Selesai / Diterima / Aktif | hijau lembut + teks `success` |
| Menunggu / Diproses | kuning lembut + teks cokelat gelap |
| Ditolak / Gagal / Nonaktif | merah lembut + teks `danger` |
| Informasi / Draf | biru atau abu-abu lembut |

Istilah status harus sama di seluruh modul. Jangan menggunakan “Pending” pada satu halaman dan “Menunggu” pada halaman lain untuk keadaan yang sama.

### Modal, notifikasi, dan konfirmasi

- Modal maksimal `640px`, latar putih, radius `12px`, overlay hitam 50%.
- Modal edit besar boleh sampai `900px`; isi harus dapat digulir tanpa menghilangkan header dan tombol aksi.
- Gunakan notifikasi singkat untuk berhasil. Tampilkan kesalahan validasi di dekat field dan ringkasan kesalahan di atas formulir jika jumlahnya banyak.
- Aksi hapus/tolak menampilkan objek yang akan terdampak dalam pesan konfirmasi.

## 5. Interaksi dan gerak

- Transisi hover/focus `150–250ms`; buka/tutup sidebar atau submenu `250–350ms`.
- Hover menu boleh bergeser maksimal `4px`. Kartu boleh terangkat maksimal `4px` hanya jika dapat diklik.
- Animasi masuk bertahap hanya dipakai saat dashboard pertama tampil, bukan setiap kali data difilter atau tabel diperbarui.
- Hormati `prefers-reduced-motion: reduce`.
- Loading tombol mencegah klik ganda dan mempertahankan lebar tombol.

## 6. Aksesibilitas dan responsivitas

- Breakpoint acuan: seluler `<768px`, tablet `768–1023px`, desktop `≥1024px`.
- Semua kontrol dapat digunakan dengan keyboard; focus ring tidak boleh dihapus.
- Gunakan satu `h1` per halaman dan struktur heading berurutan.
- Tombol ikon memiliki `aria-label`; drawer dan modal mengelola fokus dan dapat ditutup dengan `Escape`.
- Status, error, dan pilihan aktif tidak disampaikan melalui warna saja.
- Jangan menyembunyikan scrollbar pada tabel, sidebar, modal, atau form yang perlu digulir.
- Pastikan sidebar, modal, dan tabel tidak menyebabkan overflow halaman pada lebar `375px`.

## 7. Halaman login petugas

Login Admin menjadi pintu masuk SIAD dan tetap terhubung dengan merek desa. Gunakan gradien hijau, kartu putih terpusat, logo SIAD/Desa, badge “Portal Petugas”, dan satu tombol hijau utama. Di desktop kartu boleh dua panel; di seluler satu kolom. Migrasikan font Arial ke Poppins agar sesuai dengan panel privat.

## 8. Larangan dan checklist implementasi

Hindari salinan header/sidebar yang berbeda antarfile, posisi aksi utama yang berubah, warna modul acak, heading panel hitam yang tidak konsisten, style inline berulang, scrollbar yang disembunyikan, dan animasi berlebihan pada tabel.

Sebelum halaman dianggap selesai, pastikan:

- header, sidebar, urutan menu, item aktif, dan area kerja sama dengan halaman lain;
- komponen memakai token warna, font Poppins, radius, dan jarak dari panduan;
- tabel/form memiliki loading, kosong, berhasil, dan gagal;
- aksi utama, sekunder, dan berbahaya mudah dibedakan;
- tampilan diuji pada `375px`, `768px`, `1024px`, dan `1440px`;
- navigasi keyboard, focus ring, label formulir, kontras, modal, dan drawer bekerja baik.

