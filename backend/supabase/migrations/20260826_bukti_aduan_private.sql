-- Bukti aduan mengandung data warga dan tidak boleh tersedia sebagai public URL.
-- Jalankan setelah backend versi ini sudah dideploy.
update storage.buckets
set public = false,
    file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg', 'image/png', 'application/pdf']
where id = 'bukti_aduan';

-- Upload dan pembuatan signed URL dilakukan backend dengan SUPABASE_SECRET_KEY.
-- Tidak dibuat policy untuk anon/authenticated agar browser tidak bisa mengakses langsung.
