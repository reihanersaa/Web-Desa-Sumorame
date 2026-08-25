alter table public.statistik_warga
  drop constraint if exists statistik_warga_no_hp_check;

alter table public.statistik_warga
  drop column if exists no_hp;

notify pgrst, 'reload schema';
