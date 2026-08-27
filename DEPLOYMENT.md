# Deployment Web Desa Sumorame

Dokumen ini memakai dua Vercel project yang sudah ada:

- Frontend: `https://web-desa-sumorame.vercel.app`
- Backend: `https://web-desa-sumorame-backend.vercel.app`

## 1. Persiapan Supabase

Jalankan file berikut melalui **Supabase Dashboard → SQL Editor** sesuai urutan:

```text
backend/supabase/migrations/20260826_produk_storage.sql
backend/supabase/migrations/20260826_security_enable_rls.sql
```

Migration tersebut membuat bucket publik `produk` dengan batas gambar 2 MB.
Upload tetap dilakukan oleh backend; frontend hanya menerima public URL gambar.

Migration `20260826_security_enable_rls.sql` menutup akses langsung role Supabase
`anon` dan `authenticated` ke tabel aplikasi. Website tetap membaca data melalui backend
yang menggunakan `SUPABASE_SECRET_KEY`.

Setelah backend versi ini sudah berhasil dideploy, jalankan:

```text
backend/supabase/migrations/20260826_bukti_aduan_private.sql
```

Migration tersebut menjadikan lampiran aduan privat. Dashboard admin akan menerima signed
URL yang berlaku satu jam. Jangan jalankan file `DATABASE_SCHEMA_REFERENCE.sql`; file itu
hanya salinan struktur database untuk dokumentasi.

Pastikan bucket lama yang dipakai modul lain juga tersedia:

- `bukti_aduan`
- `cms-profil`
- `informasi`
- `kelembagaan`
- `ppid`
- `publikasi`

## 2. Environment Variables backend

Buka **Vercel → project backend → Settings → Environment Variables**.
Tambahkan variabel berikut untuk Production, Preview, dan Development bila diperlukan:

```env
SUPABASE_URL=https://PROJECT-REF.supabase.co
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxxxxxxx
JWT_SECRET=RANDOM_SECRET_MINIMAL_32_KARAKTER
FRONTEND_URLS=https://web-desa-sumorame.vercel.app
```

`PORT` tidak diperlukan oleh Vercel. Nilai tersebut hanya dipakai saat menjalankan backend lokal.

`SUPABASE_KEY` tidak lagi digunakan backend versi ini. Backend harus memakai
`SUPABASE_SECRET_KEY`, sedangkan secret tersebut tidak boleh berada dalam file frontend,
GitHub, screenshot, atau pesan chat.

JWT secret acak dapat dibuat di komputer yang sudah memiliki Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Jika `JWT_SECRET` diganti, semua token login lama otomatis tidak berlaku dan pengguna
harus login ulang.

## 3. Deploy backend ke Vercel

Pengaturan project:

```text
Root Directory: backend
Framework Preset: Other
Install Command: npm install
```

Push source terbaru, lalu lakukan **Redeploy**. Endpoint pemeriksaan:

```text
https://web-desa-sumorame-backend.vercel.app/api/health
```

Respons yang benar:

```json
{"success":true,"message":"API Desa Sumorame aktif."}
```

## 4. Deploy frontend ke Vercel

Pengaturan project frontend:

```text
Root Directory: frontend
Framework Preset: Other
Build Command: kosong
Output Directory: kosong
```

File `frontend/vercel.json` melakukan routing berikut:

- halaman publik tetap tersedia dari root, misalnya `/`, `/Produk.html`, dan `/Aduan.html`;
- halaman admin tersedia melalui `/admin/...`;
- source publik tetap berada di `frontend/publik`;
- source admin tetap berada di `frontend/privat`.

Pastikan folder gambar repository asli berada pada:

```text
frontend/publik/img
```

Folder gambar tidak terdapat dalam arsip yang diberikan, sehingga jangan menghapus folder
`img` dari repository yang sekarang sudah ter-deploy.

Cara menerapkan ZIP hasil:

1. Buat branch baru dan backup repository.
2. Ekstrak folder `Web-Desa-Sumorame` di atas repository sekarang dengan opsi overwrite.
3. Jangan menghapus file/folder yang tidak ada di ZIP, terutama `frontend/publik/img`,
   `.git`, serta package root milik tim.
4. Periksa perubahan dengan `git diff`, lalu commit jika sudah sesuai.

URL login admin setelah deployment:

```text
https://web-desa-sumorame.vercel.app/admin/LoginAdmin.html
```

## 5. Urutan deployment

1. Jalankan migration bucket produk.
2. Isi environment variables backend.
3. Deploy backend dan uji `/api/health`.
4. Deploy frontend.
5. Buka browser Incognito agar cache dan token lama tidak ikut terpakai.
6. Uji login warga, pengajuan surat, aduan, produk, login admin, dan seluruh operasi CMS.
7. Uji perpindahan Informasi → Profile Desa, Informasi/Kelembagaan/Publikasi → CMS Profil,
   serta CMS Profil ↔ CMS Produk.

## 6. Smoke test sebelum diumumkan

Periksa minimal skenario berikut:

| Skenario | Hasil yang diharapkan |
| --- | --- |
| Beranda tanpa login | Statistik, CMS profil, publikasi, dan produk tampil |
| Registrasi warga | Akun tersimpan dengan role `warga` |
| Login warga | Token tersimpan dan halaman warga dapat digunakan |
| Pengajuan surat | Data tersimpan dengan `created_by` milik warga |
| Pengajuan aduan | Data dan lampiran maksimal 2 MB masuk ke Supabase |
| Pengajuan produk | Gambar masuk bucket `produk`, database menyimpan URL |
| Warga membuka endpoint admin | Backend mengembalikan HTTP 403 |
| Login admin | Dialihkan ke `/admin/DashboardAdmin.html` |
| CMS tambah/edit/hapus | Membutuhkan token admin dan berhasil memperbarui Supabase |
| PDF PPID | Hanya PDF maksimal 4 MB yang diterima |
| File palsu yang diberi ekstensi gambar/PDF | Backend menolak dengan HTTP 400 |
| Percobaan login berulang | Percobaan ke-11 dari IP yang sama dibatasi HTTP 429 |
| Bukti aduan | Bucket privat; admin tetap dapat membuka signed URL |
| Navigasi dari halaman Informasi | Tidak ada 404 dan target memakai kapitalisasi tepat |
| CMS Informasi | Data tampil; tambah, detail, edit, dan hapus dapat digunakan |
| Login desktop/laptop | Seluruh tautan di bawah tombol login dapat diklik tanpa membuka F12 |

## 7. Catatan data produk lama

Produk lama yang gambarnya masih berbentuk `data:image/...;base64,...` tetap dapat ditampilkan.
Saat admin mengganti gambar produk tersebut, versi baru otomatis disimpan di Supabase Storage.
Untuk mengurangi ukuran respons API, sebaiknya produk lama diedit satu per satu dan gambarnya
diunggah ulang sebelum website mendapat banyak pengunjung.

## 8. Batasan keamanan yang masih perlu dijadwalkan

- Token saat ini masih berada di `localStorage`. Risiko utamanya telah dikurangi dengan
  escaping data dinamis, tetapi tahap lanjutan yang lebih kuat adalah cookie `HttpOnly`.
- Rate limit saat ini bekerja per instance serverless. Untuk perlindungan global, gunakan
  penyimpanan terpusat seperti Redis/Upstash setelah rilis pertama stabil.
- Tailwind CDN nyaman untuk tahap KKN, tetapi build Tailwind lokal lebih baik untuk performa
  dan Content Security Policy yang lebih ketat.
- Sebelum publikasi, ganti `JWT_SECRET` jika nilainya pernah masuk screenshot/chat/repository,
  lalu redeploy agar seluruh token lama tidak berlaku.
