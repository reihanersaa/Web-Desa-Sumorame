begin;

alter table public.posbankum_pengaduan
  add column if not exists jenis_layanan text not null default 'non_litigasi';

alter table public.posbankum_pengaduan
  drop constraint if exists posbankum_pengaduan_jenis_layanan_check;

alter table public.posbankum_pengaduan
  add constraint posbankum_pengaduan_jenis_layanan_check
  check (jenis_layanan in ('non_litigasi', 'litigasi'));

commit;
