# Patch keamanan login dan persuratan

Patch ini dibuat dari ZIP repo tanggal 5 September 2026. Isinya terbatas pada file yang berhubungan dengan Turnstile, pembatasan percobaan login, dan validasi persuratan. Modul **Produk** dan **Statistika** tidak diubah.

## Perilaku setelah patch

- Login warga dan admin wajib melewati Cloudflare Turnstile.
- Lima password salah untuk akun yang sama akan memblokir percobaan akun tersebut selama 2 menit.
- Lima password salah untuk pasangan akun + IP juga memicu blokir 2 menit.
- Batas IP dibuat 25 kegagalan per 2 menit, bukan 5, agar satu warga tidak mudah memblokir semua orang yang memakai Wi-Fi kantor/desa yang sama.
- Percobaan yang berhasil menghapus hitungan akun dan pasangan akun + IP. Riwayat IP bersama tidak dihapus oleh satu akun.
- Data pembatas login disimpan di Supabase, sehingga tetap konsisten pada beberapa instance/serverless Vercel.
- NIK pengajuan surat harus sama dengan NIK pada JWT warga. Jenis surat, daftar kolom, enum, panjang, tanggal, nomor telepon, email, dan karakter berbahaya diperiksa lagi oleh backend.
- Judul surat dibuat oleh backend; nilai judul dari browser tidak dipercaya.

## 1. Buat widget Cloudflare Turnstile

1. Buka Cloudflare Dashboard, pilih **Turnstile**, lalu **Add widget**.
2. Nama yang disarankan: `Login Website Desa Sumorame`.
3. Tambahkan hostname berikut (tanpa `https://` dan tanpa path):
   - `ppid-sumoramedesa.id`
   - `www.ppid-sumoramedesa.id`
   - `web-desa-sumorame.vercel.app` — pertahankan hanya jika URL Vercel masih dipakai untuk pengujian produksi.
4. Pilih mode **Managed**.
5. Simpan **Site Key** dan **Secret Key** yang diberikan. Site key boleh diketahui browser; secret key harus tetap di backend.

## 2. Jalankan migration Supabase

Buka **Supabase Dashboard → SQL Editor → New query**, salin seluruh isi:

`backend/supabase/migrations/20260905_login_throttle.sql`

kemudian tekan **Run** satu kali. Migration aman dijalankan ulang. Tabel menyimpan HMAC identifier, bukan IP, NIK, atau username mentah. Akses tabel/RPC ditutup untuk role `anon` dan `authenticated` serta hanya diberikan kepada `service_role`.

## 3. Tambahkan environment variable di project BACKEND Vercel

Buka project **web-desa-sumorame-backend** di Vercel, lalu **Settings → Environment Variables**. Tambahkan ke environment **Production**:

```env
TURNSTILE_SITE_KEY=site_key_dari_cloudflare
TURNSTILE_SECRET_KEY=secret_key_dari_cloudflare
TURNSTILE_ALLOWED_HOSTNAMES=ppid-sumoramedesa.id,www.ppid-sumoramedesa.id,web-desa-sumorame.vercel.app
AUTH_THROTTLE_SECRET=rahasia_acak_minimal_32_byte
```

Buat `AUTH_THROTTLE_SECRET` satu kali dengan Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Catatan penting:

- Semua variabel di atas masuk ke **project backend**, bukan frontend.
- Jangan memakai Site Key sebagai Secret Key.
- Jangan menaruh `TURNSTILE_SECRET_KEY`, `AUTH_THROTTLE_SECRET`, `SUPABASE_SECRET_KEY`, atau `JWT_SECRET` di HTML/JS frontend maupun GitHub.
- Pertahankan nilai `AUTH_THROTTLE_SECRET`; menggantinya akan membuat kunci rate limit lama tidak terpakai lagi.
- Jika Preview Deployment perlu diuji, centang environment **Preview** juga dan masukkan nilai yang sesuai.
- File `.env.example` hanya daftar nama variabel. Nilai rahasia sebenarnya tetap di Vercel atau `.env` lokal yang tidak di-commit.

Untuk pengujian lokal, gunakan test keys resmi Cloudflare dan tambahkan `localhost` pada `TURNSTILE_ALLOWED_HOSTNAMES`. Jangan gunakan test secret pada Vercel Production.

## 4. Urutan deploy

1. Jalankan migration Supabase.
2. Isi keempat environment variable backend.
3. Push file backend, lalu redeploy project backend agar environment baru terbaca.
4. Pastikan endpoint berikut mengembalikan site key dan status 200:
   - `https://web-desa-sumorame-backend.vercel.app/api/auth/security-config`
5. Push file frontend dan redeploy project frontend.
6. Buka login warga dan admin dari domain produksi, lalu pastikan widget tampil.

Patch sengaja **fail closed**: jika migration, secret, hostname, Supabase, atau Siteverify belum benar, login mengembalikan 503 alih-alih melewati pemeriksaan keamanan.

## 5. Checklist uji setelah deploy

- Login warga dengan data benar berhasil setelah Turnstile selesai.
- Login admin dengan username/password benar berhasil.
- Request login tanpa `turnstileToken` ditolak.
- Lima password salah pada satu akun memicu blokir; request berikutnya mendapat HTTP 429 dan `Retry-After`.
- Setelah sekitar 2 menit, akun dapat mencoba lagi.
- Login akun lain dari jaringan yang sama tidak langsung ikut terblokir.
- Pengajuan surat dengan NIK berbeda dari akun login ditolak.
- Field tambahan, tanggal mustahil, HTML seperti `<script>`, dan token komentar SQL ditolak.
- Nama sah yang memiliki apostrof, misalnya `D'Agus`, tetap diterima.

## Catatan tentang SQL injection

Menghapus semua tanda `'` atau `;` bukan pertahanan SQL injection yang tepat dan akan merusak data sah, termasuk nama serta alamat. Query di project menggunakan Supabase query builder (nilai dikirim sebagai parameter/JSON, bukan digabung menjadi string SQL). Patch menambahkan validasi allowlist per field, batas panjang, normalisasi Unicode, penolakan markup/control character/comment token, kecocokan NIK dengan JWT, dan tetap menggunakan query builder. Password juga tidak boleh "dibersihkan" karena setiap karakter merupakan bagian dari password sebelum dibandingkan dengan hash bcrypt.

## Jika terjadi masalah

- Widget tidak muncul: periksa console browser, Site Key, hostname widget Cloudflare, dan endpoint `security-config`.
- Respons `TURNSTILE_INVALID`: pastikan domain aktif tercantum di widget dan `TURNSTILE_ALLOWED_HOSTNAMES`, lalu selesaikan challenge baru.
- Respons `LOGIN_SECURITY_UNAVAILABLE`: pastikan migration sudah dijalankan, `SUPABASE_SECRET_KEY` adalah key backend yang benar, dan `AUTH_THROTTLE_SECRET` minimal 32 byte.
- Setelah mengubah environment variable di Vercel, selalu lakukan redeploy.

## File yang termasuk patch

Daftar lengkap ada di `DAFTAR_FILE_PATCH.txt` di dalam ZIP. Jangan menyalin folder `node_modules`; jalankan `npm ci` jika dependency backend belum terpasang.
