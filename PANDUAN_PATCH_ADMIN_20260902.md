# Patch login username & sesi admin — 2 September 2026

## Ringkasan

Ini **bukan ZIP seluruh website**. Isinya hanya file autentikasi yang berubah,
file pendukung baru, migration, tes, dan panduan. Dasarnya adalah ZIP terbaru
yang dikirim pada 2 September 2026, bukan versi lama hasil percakapan sebelumnya.

- Login admin memakai **username + password lama**. Login warga tetap NIK.
- Tidak ada password default baru. Akun dan data warga tidak diubah.
- Sesi admin diperpanjang tiap sekitar 10 menit selama halaman digunakan.
- Login ulang diperlukan setelah sekitar 8 jam tidak aktif atau paling lambat
  30 hari sejak login awal. Tab tersembunyi/tidak aktif tidak diperpanjang terus.
- Logout mencabut sesi di server. Password berubah atau role bukan admin lagi
  juga membuat sesi tidak dapat dipakai.
- Gangguan jaringan/503/403 tidak dianggap sebagai alasan menghapus sesi.
- Jika sesi berakhir saat mengetik, banner menyediakan login di tab baru:
  form pada tab lama tidak sengaja dihapus dengan redirect paksa.

**Batas lingkup:** semua 18 file sumber terkait Produk dan Statistik sama persis
dengan ZIP kiriman. Tidak ada file modul tersebut dalam patch. Middleware backend
dan `frontend/privat/js/api-config.js` memang dipakai bersama oleh semua CMS,
jadi cara autentikasi seluruh CMS ikut diperbaiki tanpa mengubah data/fiturnya.

## Penyebab logout yang ditemukan

1. Token admin semula berlaku 2 jam dan tidak diperpanjang otomatis.
2. Admin dan warga memakai key `localStorage.token` yang sama. Kode halaman
   publik menghapus key tersebut bila role bukan warga. Membuka beranda saat
   admin login dapat menghapus token admin sebelum batas 2 jam.
3. Sejumlah modul menyimpan salinan token sejak halaman dimuat. Pengaturan API
   bersama sekarang mengirim token admin terkini untuk request terautentikasi.

Kini sesi admin disimpan di `sumorame_admin_session`, token warga di `warga_token`.
Alias lama `token` tetap tersedia untuk kompatibilitas modul CMS yang tidak diedit.
Token pada browser hanya untuk UI/transport; backend tetap memverifikasi tanda
tangan JWT, kedaluwarsa, role terkini, password akun, dan status sesi di database.

## 1. Pasang perubahan ke branch tim

Simpan dulu perubahan lokal atau commit milik tim. Buat branch tersendiri:

```bash
git switch -c fix/admin-username-session
```

Pilih SATU cara pemasangan:

### Cara A — salin file sesuai folder

Ekstrak ZIP ke folder sementara. Salin folder `backend` dan `frontend` dari patch
ke root repository dengan cara **merge folder**, bukan menghapus folder lama.
Hanya replace file yang tercantum di manifest. Jangan menghapus file Produk,
Statistik, gambar, konfigurasi, atau file lain yang tidak ada di patch.

`MANIFEST_PATCH_ADMIN_20260902.json` memuat hash file lama dan baru. Jika file yang
sama sudah diedit tim setelah ZIP dikirim, lakukan merge perubahan tersebut.

### Cara B — patch Git (lebih cocok bila ada perubahan tim)

Dari root repository, jalankan pengecekan memakai file diff di folder ekstraksi:

```bash
git apply --check PATH_KE_FOLDER_PATCH/PATCH_ADMIN_SESSION_20260902.diff
git apply PATH_KE_FOLDER_PATCH/PATCH_ADMIN_SESSION_20260902.diff
```

Ganti `PATH_KE_FOLDER_PATCH` dengan path sebenarnya. Jangan jalankan Cara B jika
sudah menyalin file dengan Cara A. Jika pengecekan gagal, jangan dipaksa; merge
bagian konflik bersama tim. Diff mencakup semua file yang diperlukan patch.

## 2. Jalankan migration SEBELUM deploy backend

Di Supabase SQL Editor sebagai pemilik project/postgres, jalankan:

`backend/supabase/migrations/20260902_admin_username_sessions.sql`

Migration membuat dua tabel TERPISAH, `admin_accounts` dan `admin_sessions`.
Tidak menambahkan/mengubah kolom pada tabel users, produk, atau statistik.
Hanya akun ber-role admin yang mendapatkan mapping username. Kedua tabel baru
memakai RLS dan tidak dapat dibaca/ditulis oleh role anon maupun authenticated;
backend memakai service-role/secret key yang memang sudah dikonfigurasi.

Hasil query terakhir menampilkan username, nama, dan email admin tanpa password.

- Jika hanya satu admin dan belum memakai username lain, username otomatis
  menjadi **admin.sumorame**.
- Bila admin lebih dari satu, username awal unik berbentuk `petugas_...`.
  Pilih username yang lebih mudah dengan SQL di bawah.
- **Password tetap password admin sebelumnya.**
- Migration aman dijalankan ulang dan tidak menimpa username pilihan sendiri.

Contoh mengganti username berdasarkan email admin yang sudah ada:

```sql
UPDATE public.admin_accounts a
SET username = 'nama.petugas'
FROM public.users u
WHERE a.user_id = u.id
  AND u.role = 'admin'
  AND u.email = 'GANTI_DENGAN_EMAIL_ADMIN_YANG_BENAR'
RETURNING a.username;
```

Username harus unik, huruf kecil, panjang 3–40 karakter; boleh huruf, angka,
titik, garis bawah, dan tanda hubung. Frontend/backend menormalkan huruf besar.
Gunakan akun masing-masing petugas; hindari berbagi satu password.

Jika admin BARU ditambahkan setelah migration, tambahkan mappingnya:

```sql
INSERT INTO public.admin_accounts(user_id, username)
SELECT id, 'petugas.baru'
FROM public.users
WHERE email = 'GANTI_EMAIL_ADMIN_BARU' AND role = 'admin';
```

## 3. Deploy

1. Jalankan migration dan catat username hasilnya.
2. Deploy backend yang berisi SEMUA file backend dari patch.
3. Deploy frontend yang berisi SEMUA file frontend dari patch.
4. Tutup tab situs lama lalu buka ulang, atau hard refresh `Ctrl+F5`.
5. Login ulang admin satu kali dengan username dan password lama.

Admin yang masih memakai token versi lama akan diminta login ulang setelah
backend diperbarui. Ini disengaja: token lama tidak memiliki sesi server yang
bisa dicabut. Lakukan deployment pada waktu layanan admin sedang sepi.

Tidak perlu environment variable baru dan tidak perlu dependency baru.
Jangan mengganti `JWT_SECRET` saat deploy rutin, karena akan membatalkan token.
Jangan menaruh `SUPABASE_SECRET_KEY` atau JWT secret di frontend.

## 4. Tes setelah deploy

- Login admin dengan username dan password lama; input NIK bukan metode login admin lagi.
- Buka beranda/public dalam tab kedua: CMS tetap bekerja.
- Login/logout warga pada tab kedua: sesi admin tetap ada.
- Gunakan CMS lebih dari 10 menit. Di Network akan ada POST
  `/api/auth/admin/session/renew`; token baru tersimpan otomatis.
- Putuskan internet sementara: tidak terjadi redirect logout otomatis karena gangguan jaringan.
- Logout admin: POST `/api/auth/admin/session/logout` harus sukses. Token sesi
  sebelumnya harus mendapat 401 jika dicoba kembali pada API admin.
- Coba admin tanpa token dan dengan token warga: ditolak, termasuk API CMS.
- Periksa modul Produk/Statistik bersama tim: tidak ada perubahan UI/data,
  hanya lapisan autentikasi bersama yang diperbarui.

## Tes otomatis yang disertakan

Dari folder backend, sesudah dependency terpasang:

```bash
node --test tests/*.test.js
```

Hasil pemeriksaan saat patch dibuat: **26 tes lulus**, termasuk HTTP lokal
Express, validasi JWT nyata, login username, renewal, pencabutan sesi, batas 30
hari, role/password berubah, jaringan gagal, session lintas tab, dan form upload.
Tes menggunakan database tiruan; tidak mengakses data warga atau Supabase produksi.
Semua JavaScript lolos `node --check`. Seluruh 18 file Produk/Statistik identik
dengan sumber. SQL dan tampilan browser produksi masih perlu diverifikasi saat
deployment; tidak ada klaim bahwa migration sudah dijalankan di project Supabase.

## Pencabutan akses darurat

Untuk mencabut semua sesi admin (misalnya perangkat hilang/serah-terima):

```sql
UPDATE public.admin_sessions
SET revoked_at = now()
WHERE revoked_at IS NULL;
```

Ini tidak menghapus akun atau data warga. Admin bisa login lagi menggunakan
kredensial yang benar. Jika password diduga bocor, ganti password juga.

## Catatan keamanan dan pemeliharaan

- Token masih berada di localStorage untuk kompatibilitas modul CMS tim.
  Karena itu keamanan terhadap XSS tetap penting; patch ini bukan audit keamanan menyeluruh.
  Migrasi cookie HttpOnly memerlukan pekerjaan terpisah pada alur API lintas domain.
- Rate limit login yang sudah ada tetap dipertahankan. Penyimpanan limit masih
  per-instance, sehingga belum menjadi pembatas global yang kuat di Vercel serverless.
  Pertimbangkan rate limit tersentralisasi sebelum trafik meningkat.
- Baris sesi usang dapat dibersihkan berkala. Contoh SQL opsional tersedia pada
  bagian komentar migration; tidak ada penghapusan otomatis data lain.
- ZIP sumber memuat `backend/.env`; isinya sengaja tidak dibuka dan tidak disertakan
  dalam patch. Jangan sertakan lagi. Jika secret pernah masuk GitHub atau dibagikan
  ke pihak yang tidak berwenang, lakukan rotasi secret terkait.

## Rollback

Kembalikan perubahan kode melalui commit branch patch bersama tim. Tabel baru
dapat dibiarkan karena tidak mengubah tabel lama; tidak perlu menghapus data untuk
rollback. Admin perlu login ulang. Jangan menghapus tabel users atau menjalankan
`DATABASE_SCHEMA_REFERENCE.sql` sebagai migration.
