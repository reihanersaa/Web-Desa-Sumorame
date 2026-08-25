-- Schema lengkap fitur Produk Unggulan.
-- Aman dijalankan berulang kali melalui Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.produk_unggulan (
  id uuid primary key default gen_random_uuid(),
  nik varchar(16),
  nama_produk text not null,
  deskripsi text,
  harga numeric(15, 2) not null,
  nama_penjual text not null,
  kontak_penjual text not null,
  gambar text not null,
  status text not null default 'pending',
  dilihat bigint not null default 0,
  is_featured boolean not null default false,
  featured_order smallint,
  created_at timestamptz not null default now()
);

-- Melengkapi tabel lama tanpa menghapus data yang sudah ada.
alter table public.produk_unggulan
  add column if not exists nik varchar(16),
  add column if not exists nama_produk text,
  add column if not exists deskripsi text,
  add column if not exists harga numeric(15, 2),
  add column if not exists nama_penjual text,
  add column if not exists kontak_penjual text,
  add column if not exists gambar text,
  add column if not exists status text default 'pending',
  add column if not exists dilihat bigint default 0,
  add column if not exists is_featured boolean default false,
  add column if not exists featured_order smallint,
  add column if not exists created_at timestamptz default now();

-- Isi nilai default pada data lama sebelum memasang NOT NULL.
update public.produk_unggulan
set
  status = coalesce(status, 'pending'),
  dilihat = coalesce(dilihat, 0),
  is_featured = coalesce(is_featured, false),
  created_at = coalesce(created_at, now());

alter table public.produk_unggulan
  alter column status set default 'pending',
  alter column status set not null,
  alter column dilihat set default 0,
  alter column dilihat set not null,
  alter column is_featured set default false,
  alter column is_featured set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

alter table public.produk_unggulan
  drop constraint if exists produk_unggulan_nik_check,
  drop constraint if exists produk_unggulan_status_check,
  drop constraint if exists produk_unggulan_harga_check,
  drop constraint if exists produk_unggulan_dilihat_check,
  drop constraint if exists produk_unggulan_featured_order_check;

alter table public.produk_unggulan
  add constraint produk_unggulan_nik_check
    check (nik is null or nik ~ '^[0-9]{16}$'),
  add constraint produk_unggulan_status_check
    check (status in ('pending', 'approved', 'rejected')),
  add constraint produk_unggulan_harga_check
    check (harga is null or harga >= 0),
  add constraint produk_unggulan_dilihat_check
    check (dilihat >= 0),
  add constraint produk_unggulan_featured_order_check
    check (
      (is_featured = false and featured_order is null)
      or
      (is_featured = true and featured_order between 1 and 5)
    );

create index if not exists produk_unggulan_status_created_idx
  on public.produk_unggulan (status, created_at desc);

create index if not exists produk_unggulan_dilihat_idx
  on public.produk_unggulan (dilihat desc)
  where status = 'approved';

create unique index if not exists produk_unggulan_featured_order_idx
  on public.produk_unggulan (featured_order)
  where is_featured = true;

-- Meminta PostgREST/Supabase membaca ulang kolom yang baru dibuat.
notify pgrst, 'reload schema';
