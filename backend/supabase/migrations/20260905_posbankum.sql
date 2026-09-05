-- Jalankan sebagai project owner/postgres melalui Supabase SQL Editor.
-- Aman dijalankan ulang; tidak mengubah tabel Produk atau Statistika.
begin;

create extension if not exists pgcrypto;

create sequence if not exists public.posbankum_register_seq;

create table if not exists public.posbankum_pengaduan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  nomor_register text not null unique default (
    'POS-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.posbankum_register_seq')::text, 6, '0')
  ),
  tanggal_pengaduan timestamptz not null default now(),
  nama_lengkap text not null,
  nik text not null,
  tempat_lahir text not null,
  tanggal_lahir date not null,
  jenis_kelamin text not null check (jenis_kelamin in ('Laki-laki', 'Perempuan')),
  alamat text not null,
  no_hp text not null,
  pekerjaan text not null,
  status_dalam_permasalahan text not null,
  pihak_terkait jsonb not null default '{}'::jsonb,
  jenis_permasalahan jsonb not null default '[]'::jsonb,
  jenis_lainnya text,
  uraian text not null,
  waktu_kejadian text not null,
  tempat_kejadian text not null,
  upaya_dilakukan jsonb not null default '[]'::jsonb,
  hasil_upaya text,
  jenis_dokumen jsonb not null default '[]'::jsonb,
  dokumen jsonb not null default '[]'::jsonb,
  harapan_pengadu text not null,
  persetujuan_data boolean not null check (persetujuan_data = true),
  status text not null default 'Menunggu' check (
    status in ('Menunggu', 'Identifikasi', 'Mediasi', 'Koordinasi', 'Dirujuk', 'Selesai', 'Tidak dapat dilanjutkan')
  ),
  kategori_identifikasi jsonb not null default '[]'::jsonb,
  kategori_lainnya text,
  catatan_petugas text,
  tindak_lanjut jsonb not null default '[]'::jsonb,
  tanggal_tindak_lanjut date,
  petugas_penanggung_jawab text,
  hasil_penanganan text,
  status_akhir text,
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists posbankum_pengaduan_tanggal_idx
  on public.posbankum_pengaduan (tanggal_pengaduan desc);
create index if not exists posbankum_pengaduan_status_idx
  on public.posbankum_pengaduan (status);

alter table public.posbankum_pengaduan enable row level security;
revoke all privileges on table public.posbankum_pengaduan from anon, authenticated;
grant select, insert, update on table public.posbankum_pengaduan to service_role;
revoke all privileges on sequence public.posbankum_register_seq from public, anon, authenticated;
grant usage, select on sequence public.posbankum_register_seq to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'posbankum-bukti', 'posbankum-bukti', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Browser tidak memperoleh akses langsung. Backend membuat signed URL untuk petugas.

do $$
declare role_constraint record;
begin
  for role_constraint in
    select distinct constraint_row.conname
      from pg_constraint as constraint_row
      join pg_attribute as column_row
        on column_row.attrelid = constraint_row.conrelid
       and column_row.attnum = any(constraint_row.conkey)
     where constraint_row.conrelid = 'public.users'::regclass
       and constraint_row.contype = 'c'
       and column_row.attname = 'role'
  loop
    execute format('alter table public.users drop constraint %I', role_constraint.conname);
  end loop;
end $$;

alter table public.users add constraint users_role_check
  check (role in ('warga', 'admin', 'petugas_posbankum'));

notify pgrst, 'reload schema';

commit;
