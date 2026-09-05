# Panduan hasil merge akun Petugas Posbankum

Patch ini dibuat dari ZIP hasil merge terbaru tanggal 5 September 2026. Modul Produk dan Statistika tidak diubah.

## Masalah yang ditemukan

1. Conflict `adminAuthController.js` terpilih ke versi yang menerima role baru, tetapi membuang dummy bcrypt comparison dan `rejectLogin()`. Akibatnya kegagalan tidak tercatat oleh rate limiter dan waktu respons dapat membedakan username yang ada/tidak ada.
2. `petugas_posbankum` dapat login, tetapi endpoint renewal dan logout masih memakai `requireAdmin`. Akun petugas akan gagal memperpanjang atau mencabut sesi.
3. Migration Posbankum mencari constraint dengan teks `%role%`. Cara tersebut terlalu luas. Patch menggantinya dengan pemeriksaan constraint yang benar-benar terhubung ke kolom `users.role`.
4. Hak tabel dan sequence Posbankum untuk `service_role` sebelumnya tidak dinyatakan secara eksplisit.
5. Sidebar petugas masih memperlihatkan menu admin yang pasti ditolak backend. Patch menyembunyikannya untuk mengurangi kebingungan; keamanan tetap ditegakkan oleh backend.

## File yang diperbaiki

- `backend/src/controllers/adminAuthController.js`
- `backend/src/routes/authRoutes.js`
- `backend/supabase/migrations/20260905_posbankum.sql`
- `frontend/privat/js/api-config.js`
- `backend/tests/admin-session.test.js`
- `backend/tests/login-security.test.js`

## Urutan migration

Gunakan Supabase SQL Editor sebagai project owner. Lakukan backup database terlebih dahulu apabila production sudah berisi data.

Urutan dependensi yang benar:

1. `20260902_admin_username_sessions.sql` — wajib sudah pernah dijalankan karena menyediakan `admin_accounts` dan `admin_sessions`.
2. `20260905_login_throttle.sql` — wajib untuk pembatas login terdistribusi.
3. `20260905_posbankum.sql` versi dari patch ini — membuat tabel, bucket privat, role baru, hak service role, dan constraint.

Cek cepat sebelum melanjutkan:

```sql
select
  to_regclass('public.admin_accounts') as admin_accounts,
  to_regclass('public.admin_sessions') as admin_sessions,
  to_regclass('public.login_throttle') as login_throttle,
  to_regclass('public.posbankum_pengaduan') as posbankum_pengaduan;
```

Keempat kolom harus berisi nama tabel, bukan `null`.

## Membuat akun Petugas Posbankum

Jangan membagikan akun/password admin utama. Buat akun khusus untuk setiap petugas agar sesi dapat dicabut per orang.

1. Daftarkan calon petugas melalui halaman Registrasi agar password otomatis di-hash oleh backend.
2. Jalankan migration Posbankum terlebih dahulu agar role baru diizinkan constraint database.
3. Ganti `NIK_PETUGAS` dan username pada query berikut, lalu jalankan:

```sql
begin;

update public.users
set role = 'petugas_posbankum'
where nik = 'NIK_PETUGAS';

insert into public.admin_accounts (user_id, username)
select id, 'posbankum.sumorame'
from public.users
where nik = 'NIK_PETUGAS'
on conflict (user_id) do update
set username = excluded.username;

update public.admin_sessions
set revoked_at = now()
where user_id = (
  select id from public.users where nik = 'NIK_PETUGAS'
)
and revoked_at is null;

commit;
```

Pastikan query `update` benar-benar menemukan tepat satu akun. Verifikasi tanpa menampilkan password:

```sql
select a.username, u.nama_lengkap, u.role
from public.admin_accounts a
join public.users u on u.id = a.user_id
where u.nik = 'NIK_PETUGAS';
```

Hasil harus menunjukkan role `petugas_posbankum`.

## Deployment

1. Salin file patch ke branch hasil merge dengan struktur folder yang sama.
2. Pastikan tidak ada marker `<<<<<<<`, `=======`, atau `>>>>>>>`.
3. Jalankan migration sesuai urutan di atas.
4. Push dan redeploy backend Vercel.
5. Push dan redeploy frontend Vercel.
6. Tidak ada environment variable baru untuk role Posbankum. Pertahankan environment Turnstile dan rate limit yang sudah dibuat sebelumnya.

## Checklist pengujian

- Admin lama tetap dapat login, renew, logout, serta membuka seluruh CMS.
- Petugas Posbankum dapat login dan diarahkan ke `/admin/Posbankum`.
- Sesi petugas dapat renew dan logout.
- Petugas dapat membuka endpoint `/api/posbankum/admin`.
- Petugas mendapat HTTP 403 saat mencoba endpoint khusus admin seperti Statistik, Produk CMS, atau pengelolaan website.
- Warga tidak dapat membuka endpoint Posbankum internal.
- Password salah tetap dihitung oleh rate limit; setelah lima kegagalan akun diblokir sementara.
- Bucket `posbankum-bukti` di Supabase harus berstatus private.

## Temuan keamanan yang belum diubah dalam patch ini

Form publik Posbankum menerima data identitas dan upload tanpa Turnstile. Rate limiter pengiriman saat ini masih berupa memory lokal proses Node.js, sehingga tidak konsisten di lingkungan serverless Vercel. Sebelum fitur Posbankum disebarkan luas, prioritas berikutnya adalah menambahkan Turnstile khusus submit dan rate limit terdistribusi untuk endpoint `POST /api/posbankum`.

Ukuran form saat ini juga mengizinkan sampai 10 file × 5 MB. Batas tersebut perlu diuji langsung pada deployment Vercel; kegagalan akibat batas request platform dapat terjadi sebelum Express menerima request. Untuk jangka panjang, upload langsung ke private bucket memakai signed upload URL akan lebih tahan untuk berkas besar, tetapi membutuhkan desain tambahan dan tidak dimasukkan ke patch merge kecil ini.
