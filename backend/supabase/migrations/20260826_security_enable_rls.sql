-- Semua akses data aplikasi dilakukan lewat backend yang memakai
-- SUPABASE_SECRET_KEY. Browser tidak memerlukan akses langsung ke tabel.

alter table public.users enable row level security;
alter table public.surat enable row level security;
alter table public.aduan enable row level security;
alter table public.publikasi enable row level security;
alter table public.produk_unggulan enable row level security;
alter table public.kelembagaan enable row level security;
alter table public.ppid enable row level security;
alter table public.ppid_pdf enable row level security;
alter table public.cmsprofil enable row level security;
alter table public.statistik_warga enable row level security;
alter table public.informasi enable row level security;

-- JWT aplikasi ini diverifikasi Express, bukan Supabase Auth. Karena itu
-- anon/authenticated tidak diberi akses langsung ke tabel-tabel di atas.
revoke all privileges on table
  public.users,
  public.surat,
  public.aduan,
  public.publikasi,
  public.produk_unggulan,
  public.kelembagaan,
  public.ppid,
  public.ppid_pdf,
  public.cmsprofil,
  public.statistik_warga,
  public.informasi
from anon, authenticated;

notify pgrst, 'reload schema';
