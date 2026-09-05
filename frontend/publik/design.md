# Panduan Desain — Portal Publik Desa Sumorame

Dokumen ini menjadi acuan visual untuk seluruh halaman di folder `frontend/publik`. Tujuannya adalah membuat halaman Profil Desa, PPID, Lembaga, Informasi, Administrasi Persuratan, Aduan, Publikasi, Produk, autentikasi warga, dan halaman publik baru terasa sebagai satu portal yang sama.

## 1. Karakter desain

Portal publik harus terasa **resmi, ramah, bersih, mudah dipercaya, dan dekat dengan warga**. Identitas utamanya adalah hijau Desa Sumorame, permukaan putih hangat, foto kegiatan atau lingkungan desa, serta bahasa Indonesia yang singkat dan mudah dipahami.

Gunakan ruang kosong yang cukup. Hindari tampilan dashboard yang terlalu padat, warna mencolok dalam jumlah besar, ornamen berlebihan, dan gaya komponen yang berubah-ubah antarlaman.

## 2. Fondasi visual

### Warna utama

| Token | Nilai | Pemakaian |
|---|---:|---|
| `primary` | `#004B24` | Hero gelap, judul utama, teks navigasi, elemen merek |
| `primary-container` | `#006633` | Tombol utama, tautan aktif, ikon utama, aksen |
| `primary-hover` | `#004D26` | Hover tombol hijau |
| `primary-soft` | `#ECFDF5` | Latar badge, panel informasi, status positif |
| `secondary` | `#745B00` | Teks pada aksen kuning |
| `secondary-container` | `#FECB00` | Sorotan penting yang bukan aksi utama |
| `background` | `#FBF9F8` | Latar halaman |
| `surface` | `#FFFFFF` | Kartu, modal, formulir, menu seluler |
| `text` | `#1B1C1C` | Teks utama |
| `text-muted` | `#3F4940` | Deskripsi dan metadata |
| `border` | `#E5E7EB` | Garis pemisah dan batas input |
| `danger` | `#DC2626` | Kesalahan dan aksi berbahaya |
| `warning` | `#F59E0B` | Peringatan |

Hijau harus menjadi aksen dominan. Biru hanya dipakai jika maknanya benar-benar informasional. Merah dan kuning dipakai berdasarkan status, bukan sebagai dekorasi.

### Tipografi

- Judul dan heading: **Plus Jakarta Sans**, bobot 600–800.
- Isi dan teks antarmuka: **Inter**, bobot 400–600.
- Label kecil atau metadata: **Work Sans**; jika tidak dimuat, gunakan Inter.
- Gunakan Poppins hanya pada halaman lama selama proses migrasi. Halaman baru wajib mengikuti susunan font di atas.
- Ukuran dasar isi: `16px`, line-height `1.6`.
- Judul halaman: `32–48px` di desktop dan `28–36px` di seluler.
- Judul bagian: `24–32px`; judul kartu: `18–24px`; label: `12–14px`.

Gunakan kapitalisasi kalimat, misalnya “Informasi dan berita desa”. Jangan menulis seluruh judul dengan huruf kapital.

### Bentuk, bayangan, dan jarak

- Radius kecil: `8px` untuk tombol, input, dan badge.
- Radius standar: `12px` untuk kartu dan panel.
- Radius besar: `16–20px` hanya untuk kartu sorotan atau autentikasi.
- Bayangan kartu standar: `0 4px 12px rgba(0,0,0,.08)`.
- Bayangan hover: `0 12px 25px rgba(0,0,0,.14)`.
- Gunakan skala jarak `4, 8, 12, 16, 24, 32, 48, 64px`.
- Lebar konten maksimum: `1280px` (`max-w-7xl`), dengan padding horizontal `24px`; pada seluler `16px`.

## 3. Struktur halaman

### Header dan navigasi

Semua halaman konten publik memakai header tetap setinggi `64px` dengan urutan dan nama menu yang sama:

`Profil Desa · PPID · Lembaga · Informasi · Administrasi Persuratan · Aduan · Publikasi`

- Logo berada di kiri, diikuti teks “Desa Sumorame”.
- Gunakan latar terang semi-transparan dengan blur, bayangan lembut, dan teks hijau tua.
- Tautan aktif harus terlihat melalui warna/garis bawah; jangan memakai `href="#"` sebagai penanda aktif jika halaman memiliki URL.
- Di bawah breakpoint `768px`, gunakan tombol menu dan panel vertikal penuh selebar layar.
- Header tidak boleh menutupi isi; beri offset atas minimal `64px`.

### Hero

- Halaman konten memakai hero konsisten dengan foto relevan, overlay hijau tua atau hitam, judul putih, dan satu deskripsi singkat.
- Tinggi acuan: `420–520px` desktop dan `320–400px` seluler.
- Konten hero mengikuti lebar kontainer utama dan rata kiri. Pusat hanya boleh dipakai pada halaman kampanye atau autentikasi.
- Overlay harus menjaga kontras teks minimal 4.5:1.
- Jangan memakai foto acak yang tidak berkaitan dengan desa atau layanan halaman.

### Konten utama

- Jarak hero ke bagian pertama: `48–64px`.
- Satu bagian memiliki judul, deskripsi opsional, lalu isi. Jarak antarbagian `64–96px`.
- Kartu menggunakan latar putih, radius `12px`, border tipis atau satu bayangan lembut.
- Gunakan grid 1 kolom pada seluler, 2 kolom pada tablet, dan maksimal 3–4 kolom pada desktop sesuai jenis konten.

### Footer

Setiap halaman memakai footer yang sama: identitas desa, alamat/kontak, tautan layanan penting, dan hak cipta. Latar hijau tua, teks putih atau putih redup, dan fokus keyboard yang jelas.

## 4. Komponen baku

### Tombol

- Primer: latar `#006633`, teks putih, tinggi minimal `44px`, padding horizontal `20–24px`.
- Sekunder: latar putih, border `#006633`, teks `#004B24`.
- Tersier: tautan teks hijau dengan ikon opsional.
- Bahaya: merah dan hanya untuk tindakan yang merusak atau membatalkan data.
- Hover boleh menggelapkan warna dan mengangkat maksimal `2px`; active kembali ke posisi awal.
- Tombol harus memiliki kata kerja yang jelas: “Kirim aduan”, “Ajukan surat”, “Baca selengkapnya”.

### Formulir

- Label selalu terlihat di atas input; placeholder bukan pengganti label.
- Tinggi kontrol minimal `44px`, radius `8px`, border abu-abu, dan focus ring hijau.
- Pesan validasi diletakkan tepat di bawah field terkait.
- Kelompokkan field berdasarkan kebutuhan warga dan beri penjelasan singkat untuk data yang sensitif.
- Pada seluler, field dan tombol utama memenuhi lebar kontainer.

### Kartu, badge, dan tabel

- Satu kartu hanya memiliki satu tujuan utama.
- Susunan kartu: media opsional → label/kategori → judul → ringkasan → metadata/aksi.
- Badge memakai warna lembut dan teks gelap; tinggi `24–28px`, radius penuh.
- Tabel harus berada dalam pembungkus `overflow-x-auto`; pada layar kecil, data kompleks dapat berubah menjadi kartu berlabel.
- Status harus ditulis dengan teks dan warna, misalnya “Diproses”, bukan warna saja.

### Modal dan notifikasi

- Lebar modal maksimal `560px`, radius `16px`, overlay hitam 50%, judul jelas, tombol tutup berlabel aksesibel.
- Gunakan toast untuk hasil aksi singkat dan panel inline untuk kesalahan yang perlu diperbaiki.
- Hindari lebih dari satu modal terbuka pada saat yang sama.

### Ikon dan gambar

- Gunakan **Material Symbols Outlined** untuk ikon antarmuka dengan ukuran umum `20–24px`.
- Jangan mencampur beberapa keluarga ikon pada halaman yang sama kecuali halaman autentikasi lama belum dimigrasikan.
- Semua gambar wajib memiliki `alt` yang bermakna, rasio konsisten, `object-fit: cover`, dan ukuran sumber yang wajar.

## 5. Interaksi, aksesibilitas, dan responsivitas

- Breakpoint acuan: seluler `<768px`, tablet `768–1023px`, desktop `≥1024px`.
- Target sentuh minimal `44 × 44px`.
- Semua kontrol dapat digunakan dengan keyboard dan memiliki focus ring yang terlihat.
- Animasi berlangsung `150–300ms`; perpindahan hero dapat sampai `700ms`.
- Hormati `prefers-reduced-motion: reduce` dengan mematikan transformasi dan animasi dekoratif.
- Jangan menyembunyikan scrollbar pada area yang memang perlu digulir.
- Gunakan HTML semantik: satu `h1`, urutan heading yang benar, `button` untuk aksi, dan `a` untuk navigasi.

## 6. Halaman autentikasi warga

Login dan registrasi tetap memakai nuansa hijau serta kartu terpusat, tetapi identitasnya mengikuti token portal publik. Di desktop kartu boleh terbagi dua: panel merek di kiri dan formulir di kanan. Di seluler gunakan satu kolom. Gunakan font portal, tombol primer hijau, logo yang sama, dan radius besar `20px`.

## 7. Larangan dan checklist implementasi

Hindari nilai warna hijau baru di luar token, font Arial pada halaman baru, header/menu dengan urutan berbeda, radius campur aduk, teks sangat kecil, animasi masuk pada setiap elemen, dan style inline untuk aturan yang dipakai berulang.

Sebelum halaman dianggap selesai, pastikan:

- header, menu aktif, hero, dan footer mengikuti pola portal;
- warna dan font berasal dari token panduan;
- tampilan diuji pada lebar `375px`, `768px`, `1024px`, dan `1440px`;
- tidak ada overflow horizontal;
- focus, hover, loading, kosong, berhasil, dan gagal memiliki tampilan yang jelas;
- kontras teks, label formulir, alt gambar, dan target sentuh memenuhi aksesibilitas dasar.

