alter table public.produk_unggulan
  add column if not exists nik varchar(16);

alter table public.produk_unggulan
  drop constraint if exists produk_unggulan_nik_check;

alter table public.produk_unggulan
  add constraint produk_unggulan_nik_check
  check (nik is null or nik ~ '^[0-9]{16}$');

notify pgrst, 'reload schema';
