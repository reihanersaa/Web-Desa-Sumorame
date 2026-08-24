alter table public.statistik_warga
  add column if not exists jenis_kelamin varchar(10);

alter table public.statistik_warga
  drop constraint if exists statistik_warga_jenis_kelamin_check;

alter table public.statistik_warga
  add constraint statistik_warga_jenis_kelamin_check
  check (jenis_kelamin is null or jenis_kelamin in ('Laki-laki', 'Perempuan'));

notify pgrst, 'reload schema';
