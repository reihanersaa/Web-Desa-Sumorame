# Panduan Patch Posbankum

Patch ini memakai tabel yang sudah ada, yaitu `public.posbankum_pengaduan`. Tidak ada tabel Posbankum baru.

## Penyebab error `jenis_layanan does not exist`

Query lama langsung melakukan `INSERT` ke kolom `jenis_layanan`, sementara kolom itu belum ada pada database yang sedang dipakai. Migration baru mengatasi urutan tersebut dengan menambahkan seluruh kolom terlebih dahulu, baru mengimpor 43 data Kartu LBH.

Jika query lama dijalankan sebagai satu transaksi `BEGIN ... COMMIT`, kegagalan tadi membatalkan transaksi tersebut. Jalankan migration baru dari awal di SQL Editor baru.

## Urutan pemasangan

1. Backup tabel `public.posbankum_pengaduan` melalui Supabase sebelum menjalankan migration.
2. Buka Supabase **SQL Editor** dan buat query baru.
3. Salin seluruh isi `backend/supabase/migrations/20260907_posbankum_warga_rujukan.sql` tanpa memotong bagian `BEGIN` atau `COMMIT`, lalu jalankan satu kali.
4. Hasil verifikasi paling bawah seharusnya menunjukkan:
   - `jumlah_baris = 43`
   - `nik_unik = 43`
   - `nik_tidak_valid = 0`
5. Push/deploy file backend, lalu tunggu deployment backend selesai.
6. Push/deploy file frontend, lalu lakukan hard refresh browser (`Ctrl+Shift+R`).

Tidak ada environment variable baru untuk patch ini.

## Yang berubah

- Data Kartu LBH disimpan sebagai baris `tipe_data = 'warga_rujukan'` pada tabel `posbankum_pengaduan`.
- Pengaduan biasa disimpan sebagai `tipe_data = 'pengaduan'`, sehingga tidak tercampur di tabel CMS.
- Alamat pengadu dan data Kartu LBH mempunyai komponen `dusun`, `rt`, dan `rw`.
- CMS Posbankum mempunyai tab **Data Kartu LBH** untuk melihat, mencari, menambah, dan mengedit lima data utama: nama, NIK, dusun, RT, dan RW.
- NIK warga rujukan dihubungkan ke `users.id` bila akun warga dengan NIK tersebut sudah ada.
- Layanan litigasi hanya dapat diajukan oleh NIK yang tercatat sebagai warga rujukan. Konsultasi non-litigasi tetap terbuka bagi akun warga lain.
- Endpoint CMS hanya dapat dipakai oleh role yang lolos `requirePosbankumStaff`; menyembunyikan tombol di frontend bukan satu-satunya pengamanan.

## Tes setelah deploy

1. Login ke CMS sebagai admin/petugas Posbankum.
2. Buka menu Posbankum, lalu tab **Data Kartu LBH**. Pastikan 43 data tampil.
3. Cari salah satu NIK/nama, edit RT atau RW, simpan, lalu refresh halaman.
4. Tambahkan satu data percobaan dengan NIK 16 digit yang belum ada. NIK duplikat harus ditolak.
5. Login sebagai warga yang NIK-nya ada dalam Data Kartu LBH dan kirim layanan litigasi.
6. Login sebagai warga yang NIK-nya tidak ada; layanan litigasi harus ditolak, sedangkan non-litigasi tetap dapat dikirim.
7. Pastikan tab **Pengaduan & Konsultasi** hanya memuat pengaduan, bukan 43 data Kartu LBH.

## Catatan privasi

Migration berisi nama dan NIK asli. Jangan commit file migration ini ke repository publik. Setelah berhasil dijalankan, simpan hanya pada repository privat/arsip internal dengan akses terbatas. Jangan menampilkan NIK pada halaman publik.

