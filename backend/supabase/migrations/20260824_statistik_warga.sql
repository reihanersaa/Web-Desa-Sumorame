create table if not exists public.statistik_warga (
  id uuid not null default gen_random_uuid(),
  user_id uuid unique,
  nik varchar(16) not null unique,
  nama_warga varchar(150) not null,
  jenis_kelamin varchar(10) not null,
  rt varchar(3) not null,
  rw varchar(3) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint statistik_warga_nik_check check (nik ~ '^[0-9]{16}$'),
  constraint statistik_warga_jenis_kelamin_check
    check (jenis_kelamin in ('Laki-laki', 'Perempuan')),
  constraint statistik_warga_rt_check check (rt ~ '^[0-9]{1,3}$'),
  constraint statistik_warga_pkey primary key (id),
  constraint statistik_warga_user_id_fkey
    foreign key (user_id) references public.users(id) on delete cascade,
  constraint statistik_warga_rw_check check (rw ~ '^[0-9]{1,3}$')
);

-- Tetap kompatibel bila tabel statistik_warga pernah dibuat oleh versi lama.
alter table public.statistik_warga
  add column if not exists user_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'statistik_warga_user_id_key'
      and conrelid = 'public.statistik_warga'::regclass
  ) then
    alter table public.statistik_warga
      add constraint statistik_warga_user_id_key unique (user_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'statistik_warga_user_id_fkey'
      and conrelid = 'public.statistik_warga'::regclass
  ) then
    alter table public.statistik_warga
      add constraint statistik_warga_user_id_fkey
      foreign key (user_id) references public.users(id) on delete cascade;
  end if;
end $$;

create index if not exists statistik_warga_nama_idx
  on public.statistik_warga (nama_warga);

create index if not exists statistik_warga_rt_rw_idx
  on public.statistik_warga (rt, rw);

-- Autentikasi dan otorisasi modul ini ditangani backend Express melalui
-- verifyToken + pemeriksaan role admin. Backend saat ini memakai JWT aplikasi
-- sendiri, bukan Supabase Auth, sehingga RLS Supabase tidak dapat mengenali
-- sesi admin tersebut.
alter table public.statistik_warga disable row level security;

notify pgrst, 'reload schema';

-- Contoh data awal (opsional):
-- insert into public.statistik_warga (nik, nama_warga, jenis_kelamin, rt, rw)
-- values ('3515000000000001', 'Nama Warga', 'Laki-laki', '01', '01');

-- Contoh menghubungkan statistik dengan akun warga yang sudah ada:
-- insert into public.statistik_warga (user_id, nik, nama_warga, jenis_kelamin, rt, rw)
-- select id, nik, nama_lengkap, 'Laki-laki', '01', '01'
-- from public.users
-- where role = 'warga'
-- on conflict (nik) do nothing;
