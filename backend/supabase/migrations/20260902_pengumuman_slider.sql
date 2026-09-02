BEGIN;

CREATE TABLE IF NOT EXISTS public.pengumuman_beranda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL CHECK (char_length(btrim(judul)) BETWEEN 1 AND 120),
  gambar_url text NOT NULL CHECK (gambar_url ~* '^https?://'),
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pengumuman_beranda_urutan_idx
  ON public.pengumuman_beranda (created_at, id);
ALTER TABLE public.pengumuman_beranda ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.pengumuman_beranda FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pengumuman_beranda TO service_role;

-- One-time import marker prevents deleted legacy announcements returning on rerun.
CREATE TABLE IF NOT EXISTS public.pengumuman_migration_state (
  version text PRIMARY KEY
);
ALTER TABLE public.pengumuman_migration_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.pengumuman_migration_state FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.pengumuman_migration_state TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pengumuman_migration_state WHERE version = '20260902') THEN
    INSERT INTO public.pengumuman_beranda (judul, gambar_url, created_at)
    SELECT 'Pengumuman Pelayanan', btrim(gambar_modal_url), COALESCE(min(created_at), now())
    FROM public.cmsprofil
    WHERE btrim(gambar_modal_url) ~* '^https?://'
    GROUP BY btrim(gambar_modal_url);
    INSERT INTO public.pengumuman_migration_state (version) VALUES ('20260902');
  END IF;
END $$;

COMMIT;
