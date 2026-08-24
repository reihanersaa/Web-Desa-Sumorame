alter table public.produk_unggulan
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_order smallint;

alter table public.produk_unggulan
  drop constraint if exists produk_unggulan_featured_order_check;

alter table public.produk_unggulan
  add constraint produk_unggulan_featured_order_check
  check (featured_order is null or featured_order between 1 and 5);

create index if not exists produk_unggulan_featured_idx
  on public.produk_unggulan (is_featured, featured_order)
  where is_featured = true;
