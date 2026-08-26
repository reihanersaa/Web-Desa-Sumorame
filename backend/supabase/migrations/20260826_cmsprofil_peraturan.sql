alter table public.cmsprofil
  add column if not exists peraturan_judul text,
  add column if not exists peraturan_isi text;

comment on column public.cmsprofil.peraturan_judul is
  'Judul modal Peraturan pada halaman beranda publik.';

comment on column public.cmsprofil.peraturan_isi is
  'Isi modal Peraturan pada halaman beranda publik.';
