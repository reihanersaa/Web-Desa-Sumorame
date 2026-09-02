# Panduan deploy dan pemeriksaan sebelum rilis

## Ringkasan perubahan paket ini

- Beranda tidak lagi menampilkan hero, foto kepala desa, sambutan, visi, misi, atau pengumuman contoh sebelum data CMS diterima.
- Produk contoh di HTML dihapus. Halaman Produk hanya merender produk berstatus layak tampil dari backend.
- Baris aduan dummy admin dihapus.
- Riwayat aduan warga sekarang berasal dari `GET /api/aduan/saya`, difilter memakai `user_id` dari JWT.
- Backend menolak aduan baru jika akun masih mempunyai aduan berstatus `Menunggu` atau `Diproses`. Aturan ini tidak bisa dilewati hanya dengan mengubah HTML/JavaScript.
- Publikasi memakai pagination backend: 6 item pertama, kemudian tombol **Muat lebih banyak** mengambil 6 item berikutnya.
- URL publik dan admin tidak lagi perlu menampilkan `.html`. URL lama tetap dialihkan permanen agar bookmark lama tidak rusak.
- Parallax dimatikan pada HP/perangkat sentuh, animasi dipersingkat, `prefers-reduced-motion` dihormati, gambar dinamis non-hero memakai lazy loading, dan aset gambar statis diberi cache satu hari.
- Kartu publikasi dapat dibuka dengan keyboard (Enter/Spasi), bukan hanya klik.

## Urutan deploy yang aman

1. Deploy folder `backend` lebih dahulu.
2. Di Vercel backend, isi Environment Variables untuk **Production**, **Preview**, dan **Development** bila preview branch ikut dipakai:

   ```env
   SUPABASE_URL=https://PROJECT.supabase.co
   SUPABASE_SECRET_KEY=SERVICE_ROLE_KEY_SUPABASE
   JWT_SECRET=RAHASIA_ACAK_MINIMAL_32_KARAKTER
   FRONTEND_URLS=https://ppid-desasumorame.id,https://www.ppid-desasumorame.id,https://web-desa-sumorame.vercel.app
   ```

   Jangan menulis tanda kurung siku, format Markdown, atau garis miring `/` di akhir origin. `SUPABASE_SECRET_KEY` tidak boleh dipasang pada project frontend.

3. Redeploy backend lalu pastikan `GET https://web-desa-sumorame-backend.vercel.app/api/health` memberi status 200.
4. Deploy folder `frontend`.
5. Uji URL bersih: `/`, `/Publikasi`, `/Produk`, `/Aduan`, `/AdminP`, `/admin/LoginAdmin`, dan `/admin/DashboardAdmin`.
6. Uji satu akun warga dan satu akun admin. Jangan hanya menguji saat akun admin masih tersimpan di browser.

Tidak ada migration SQL baru yang diperlukan oleh perubahan pada paket ini.

## Berkas gambar belum ada di ZIP sumber

ZIP yang diterima tidak berisi folder `frontend/publik/img`. Sebelum mengganti repository secara penuh, salin kembali folder gambar milik tim ke lokasi berikut:

```text
frontend/publik/img/
```

Tanpa folder tersebut, logo, ikon, dan beberapa gambar statis akan 404. Jangan menghapus folder gambar yang sudah ada di repository tim saat melakukan merge.

## Kompres gambar tanpa mengganti format atau nama

Format file tidak perlu diubah. Kompres file asli dan simpan kembali dengan nama yang sama agar HTML tidak perlu diubah.

Prioritas kompresi:

1. `slide1.png`, `slide2.png`, `slide3.png`, `BalaiDesa.jpg`, `sumorame-alun1.jpeg`: target maksimal sekitar 250–350 KB per gambar.
2. `rochmanu-red.jpg`, `StrukturDesa.jpg`, gambar produk, dan foto galeri: target maksimal sekitar 120–220 KB.
3. Ikon PNG/WebP: target maksimal sekitar 20–80 KB.

Gunakan Squoosh atau TinyPNG. Untuk JPG/JPEG pilih kualitas sekitar 75–82. Untuk PNG gunakan kompresi lossless terlebih dahulu. Jangan menaikkan resolusi gambar yang kecil. Setelah kompresi, buka halaman pada HP dan cek apakah teks pada gambar masih terbaca.

## Checklist fungsi utama

- Guest dapat melihat seluruh halaman publik, tetapi tidak dapat mengirim aduan, surat, atau produk.
- Warga login dapat mengirim layanan; token kedaluwarsa mengarahkan kembali ke login.
- Warga hanya melihat riwayat aduan miliknya sendiri.
- Admin CMS tidak dapat dibuka hanya dengan mengetik URL tanpa JWT admin yang valid.
- Publikasi pertama menampilkan maksimal 6 kartu dan tombol **Muat lebih banyak** hilang setelah data terakhir.
- Produk HTML contoh tidak muncul ketika database kosong.
- Hero beranda berubah sesuai data CMS dan tidak menampilkan `slide1.png` sebagai data palsu.
- URL lama seperti `/Publikasi.html` berpindah ke `/Publikasi`.

## Dua catatan yang harus diputuskan tim sebelum rilis

1. Nomor `0812-3456-7890` masih tertulis sebagai kontak pada beberapa footer. Ganti dengan nomor layanan desa yang benar atau hapus baris tersebut. Nomor asli tidak diberikan, jadi paket ini tidak menebaknya.
2. Beberapa hero halaman layanan masih memakai gambar Unsplash sebagai elemen desain. Itu bukan data aplikasi, tetapi tim sebaiknya menggantinya dengan foto desa sendiri jika hak penggunaan/identitas visual ingin lebih konsisten.

## Catatan keamanan

- Menyembunyikan `.html` bukan mekanisme keamanan. Perlindungan CMS tetap berasal dari `verifyToken` dan `requireAdmin` di backend.
- Jangan commit `.env`. Paket hasil perbaikan sengaja tidak menyertakan `backend/.env`; gunakan `.env.example` dan Environment Variables Vercel.
- Service role Supabase hanya boleh berada di backend.
- Setelah rilis, cek Vercel Logs untuk respons 401/403/429/500 dan rotasi `JWT_SECRET` jika pernah dibagikan di chat, screenshot, atau commit.

