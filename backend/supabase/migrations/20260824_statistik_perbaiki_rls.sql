-- Jalankan ini bila tabel statistik_warga sudah terlanjur dibuat dengan RLS.
-- Endpoint Express /api/statistik tetap dilindungi verifyToken dan role admin.
alter table public.statistik_warga disable row level security;

notify pgrst, 'reload schema';
