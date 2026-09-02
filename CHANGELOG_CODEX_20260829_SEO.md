# Perbaikan SEO 29 Agustus 2026

## Tampilan hasil pencarian

- Judul homepage diubah menjadi **Website Resmi Desa Sumorame | Candi, Sidoarjo**.
- Meta description homepage menjelaskan profil desa, informasi publik, persuratan, pengaduan, dan produk UMKM.
- Setiap halaman publik utama memperoleh judul dan deskripsi unik agar tidak saling bersaing di Google.
- Canonical URL menggunakan domain `https://ppid-sumoramedesa.id` yang terlihat pada hasil pencarian pengguna.

## Sinyal mesin pencari

- Ditambahkan `robots.txt` dan `sitemap.xml`.
- Ditambahkan data terstruktur Schema.org untuk Pemerintah Desa Sumorame dan website resminya.
- Ditambahkan Open Graph dan Twitter Card pada homepage untuk tampilan tautan yang lebih baik saat dibagikan.
- Halaman login, registrasi, dan seluruh area admin diberi instruksi `noindex`.

## Koreksi konten

- Nomor contoh `0812-3456-7890` dihapus dari footer karena belum terverifikasi dan sebelumnya ikut terbaca pada cuplikan Google.
- Footer sekarang mengarahkan masyarakat menggunakan menu Aduan.
- Backend mengizinkan domain yang terlihat pada hasil Google tanpa menghapus kompatibilitas domain lama.

## Setelah deploy

1. Buka `https://ppid-sumoramedesa.id/robots.txt` dan pastikan isinya tampil.
2. Buka `https://ppid-sumoramedesa.id/sitemap.xml` dan pastikan XML tampil.
3. Tambahkan properti domain ke Google Search Console jika belum ada.
4. Kirim sitemap `https://ppid-sumoramedesa.id/sitemap.xml`.
5. Gunakan **URL Inspection** pada homepage lalu pilih **Request Indexing**.

Google dapat memilih cuplikan sendiri dan perubahan biasanya tidak langsung muncul. Proses recrawl dapat memerlukan beberapa hari hingga beberapa minggu.
