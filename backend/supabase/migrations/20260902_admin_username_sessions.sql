-- Jalankan sekali di Supabase SQL Editor sebagai project owner/postgres.
-- TIDAK mengubah data/kolom warga, produk, atau statistik. Password lama tetap.
BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_accounts (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  CONSTRAINT admin_username_format CHECK (username ~ '^[a-z0-9][a-z0-9._-]{2,39}$')
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  credential_tag text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  absolute_expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  CONSTRAINT admin_session_time_order CHECK (expires_at <= absolute_expires_at)
);
CREATE INDEX IF NOT EXISTS admin_sessions_user_idx ON public.admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON public.admin_sessions(expires_at);

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_accounts, public.admin_sessions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_accounts, public.admin_sessions TO service_role;

-- Username unik untuk admin yang sudah ada; aman dijalankan kembali.
INSERT INTO public.admin_accounts(user_id, username)
SELECT id, 'petugas_' || replace(id::text, '-', '') FROM public.users
WHERE role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

-- Jika hanya satu admin dan belum diberi username sendiri, gunakan nama mudah.
UPDATE public.admin_accounts a SET username = 'admin.sumorame'
WHERE a.username = 'petugas_' || replace(a.user_id::text, '-', '')
AND a.user_id IN (SELECT id FROM public.users WHERE role = 'admin')
AND (SELECT count(*) FROM public.users WHERE role = 'admin') = 1
AND NOT EXISTS (SELECT 1 FROM public.admin_accounts WHERE username = 'admin.sumorame');

COMMIT;

-- Hasil: lihat username yang akan dipakai login (password TIDAK ditampilkan).
SELECT a.username, u.nama_lengkap, u.email
FROM public.admin_accounts a JOIN public.users u ON u.id = a.user_id
WHERE u.role = 'admin' ORDER BY a.username;

-- Opsional: tentukan username per petugas lewat email admin yang benar.
-- UPDATE public.admin_accounts SET username = 'nama.petugas'
-- WHERE user_id = (SELECT id FROM public.users
--   WHERE email = 'GANTI_EMAIL_ADMIN_YANG_BENAR' AND role = 'admin');

-- Mencabut SELURUH sesi admin (darurat atau serah-terima perangkat):
-- UPDATE public.admin_sessions SET revoked_at = now() WHERE revoked_at IS NULL;

-- Opsional pemeliharaan: hapus catatan sesi usang, bukan akun/admin/warga.
-- DELETE FROM public.admin_sessions WHERE absolute_expires_at < now() - interval '7 days';
