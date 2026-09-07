-- Migration Posbankum Desa Sumorame - single table
-- Sumber: Data Keluarga Penerima Manfaat BLT DD, Tahap II (43 baris).
-- PENTING: file ini memuat NIK. Jangan commit ke repository publik.
-- Migration ini TIDAK membuat tabel baru.

begin;

create extension if not exists pgcrypto;

-- Satu tabel menyimpan dua jenis baris:
--   pengaduan      = transaksi pengaduan/konsultasi dari formulir publik
--   warga_rujukan  = data awal calon penerima Kartu LBH dari spreadsheet
alter table public.posbankum_pengaduan
  add column if not exists user_id uuid references public.users(id) on delete restrict,
  add column if not exists jenis_layanan text not null default 'non_litigasi',
  add column if not exists tipe_data text not null default 'pengaduan',
  add column if not exists dusun text,
  add column if not exists rt text,
  add column if not exists rw text,
  add column if not exists sumber_data text;

-- Data rujukan tidak mempunyai data perkara, tanggal lahir, nomor HP,
-- ataupun persetujuan formulir. Kolom tersebut dibuat nullable agar tidak
-- perlu diisi dengan data palsu. Constraint kondisional di bawah tetap
-- mewajibkannya untuk setiap baris pengaduan asli.
alter table public.posbankum_pengaduan
  alter column user_id drop not null,
  alter column tempat_lahir drop not null,
  alter column tanggal_lahir drop not null,
  alter column jenis_kelamin drop not null,
  alter column no_hp drop not null,
  alter column pekerjaan drop not null,
  alter column uraian drop not null,
  alter column waktu_kejadian drop not null,
  alter column tempat_kejadian drop not null,
  alter column harapan_pengadu drop not null,
  alter column persetujuan_data drop not null;

alter table public.posbankum_pengaduan
  drop constraint if exists posbankum_pengaduan_jenis_layanan_check,
  drop constraint if exists posbankum_pengaduan_tipe_data_check,
  drop constraint if exists posbankum_pengaduan_dusun_check,
  drop constraint if exists posbankum_pengaduan_rt_check,
  drop constraint if exists posbankum_pengaduan_rw_check,
  drop constraint if exists posbankum_pengaduan_kelengkapan_tipe_data_check;

alter table public.posbankum_pengaduan
  add constraint posbankum_pengaduan_jenis_layanan_check
    check (jenis_layanan in ('non_litigasi', 'litigasi')),
  add constraint posbankum_pengaduan_tipe_data_check
    check (tipe_data in ('pengaduan', 'warga_rujukan')),
  add constraint posbankum_pengaduan_dusun_check
    check (dusun is null or btrim(dusun) <> ''),
  add constraint posbankum_pengaduan_rt_check
    check (rt is null or rt ~ '^[0-9]{1,3}$'),
  add constraint posbankum_pengaduan_rw_check
    check (rw is null or rw ~ '^[0-9]{1,3}$'),
  add constraint posbankum_pengaduan_kelengkapan_tipe_data_check
    check (
      (
        tipe_data = 'pengaduan'
        and tempat_lahir is not null
        and tanggal_lahir is not null
        and jenis_kelamin is not null
        and no_hp is not null
        and pekerjaan is not null
        and uraian is not null
        and waktu_kejadian is not null
        and tempat_kejadian is not null
        and harapan_pengadu is not null
        and persetujuan_data is true
      )
      or
      (
        tipe_data = 'warga_rujukan'
        and dusun is not null and btrim(dusun) <> ''
        and rt is not null
        and rw is not null
        and sumber_data is not null and btrim(sumber_data) <> ''
      )
    );

comment on column public.posbankum_pengaduan.tipe_data is
  'Pembeda transaksi pengaduan dan data warga rujukan Kartu LBH.';
comment on column public.posbankum_pengaduan.sumber_data is
  'Asal administratif data warga rujukan; NULL untuk pengaduan biasa.';

-- NIK boleh berulang pada pengaduan, tetapi hanya boleh ada satu baris
-- warga_rujukan untuk setiap NIK.
create unique index if not exists posbankum_pengaduan_warga_rujukan_nik_uidx
  on public.posbankum_pengaduan (nik)
  where tipe_data = 'warga_rujukan';

create index if not exists posbankum_pengaduan_tipe_data_idx
  on public.posbankum_pengaduan (tipe_data, tanggal_pengaduan desc);

-- Isi komponen wilayah untuk pengaduan lama jika alamat memakai pola yang sama.
with alamat_lama as (
  select
    id,
    regexp_match(
      alamat,
      '^\s*(.+)\s+RT\s*0*([0-9]{1,3})\s+RW\s*0*([0-9]{1,3})\s*$',
      'i'
    ) as bagian
  from public.posbankum_pengaduan
  where tipe_data = 'pengaduan'
    and alamat is not null
    and (dusun is null or rt is null or rw is null)
)
update public.posbankum_pengaduan as pengaduan
set
  dusun = coalesce(pengaduan.dusun, upper(btrim(alamat_lama.bagian[1]))),
  rt = coalesce(pengaduan.rt, lpad(alamat_lama.bagian[2], 2, '0')),
  rw = coalesce(pengaduan.rw, lpad(alamat_lama.bagian[3], 2, '0'))
from alamat_lama
where pengaduan.id = alamat_lama.id
  and alamat_lama.bagian is not null;

with sumber (nama_lengkap, nik, dusun, rt, rw) as (
  values
    ('KASUN', '3515070101400042', 'SUMOTUWO', '01', '01'),
    ('MISTRI', '3515074101490019', 'SUMOTUWO', '01', '01'),
    ('PARDI', '3515070101320025', 'SUMOTUWO', '01', '01'),
    ('WINARDI PAIJO', '3515070101570079', 'SUMOTUWO', '02', '01'),
    ('MARIYAM', '3515074101430012', 'SUMOTUWO', '02', '01'),
    ('GENAH', '3515074101560101', 'SUMOTUWO', '01', '02'),
    ('AKOP JAENAL', '3515060407780001', 'SUMOTUWO', '01', '02'),
    ('YASAK', '3515072106760000', 'SUMOTUWO', '02', '02'),
    ('MI''ANA', '3515074101530029', 'SUMOTUWO', '02', '02'),
    ('WAGIMAN', '3576211001510001', 'SUMOTUWO', '02', '02'),
    ('JAMIATI', '3515074101680010', 'SUMOTUWO', '02', '03'),
    ('MUJIONO', '3519022007750004', 'SUMOTUWO', '02', '03'),
    ('NGATMANI', '3515075202640000', 'SUMOTUWO', '01', '04'),
    ('AMAH', '3515074101590001', 'SUMOTUWO', '01', '04'),
    ('MUKMINAH', '3515074101630076', 'SUMOTUWO', '01', '04'),
    ('ACHMAD ROZAQ', '3515071305090002', 'SUMOTUWO', '02', '04'),
    ('MESRAN', '3515070601670005', 'SUMOTUWO', '02', '04'),
    ('SUGIATEM', '3515074601700000', 'SUMOTUWO', '02', '04'),
    ('SUPRIADI', '3515070105820004', 'SUMOTUWO', '02', '04'),
    ('FATIMAH', '3515074101580012', 'SUMOTUWO', '01', '05'),
    ('ABD. AJIS', '3515072306710001', 'SUMOTUWO', '02', '05'),
    ('ABDUL KHOHAR', '3515072801690000', 'SUMOTUWO', '02', '05'),
    ('SATUMAN HARIYANTO', '3515072102650003', 'SUMOTUWO', '02', '05'),
    ('SUDIONO', '3515071612590003', 'SUMOTUWO', '02', '05'),
    ('MISNAH', '3515074101600053', 'SUMOTUWO', '02', '05'),
    ('NGATENI', '3515077009600002', 'KERAMEAN', '01', '06'),
    ('ASLUKAH', '3515076810770001', 'KERAMEAN', '01', '06'),
    ('MISIAH', '3515074403650000', 'KERAMEAN', '02', '06'),
    ('SIAMAH', '3515074609450001', 'KERAMEAN', '03', '06'),
    ('M. BASORI', '3515070205750011', 'KERAMEAN', '01', '07'),
    ('FAJERING PAMUNGKAS', '3515071012880001', 'KERAMEAN', '01', '07'),
    ('KHUSAINI', '3515072101700003', 'KERAMEAN', '01', '08'),
    ('ISWATUN CHASANAH', '3515074903700001', 'KERAMEAN', '01', '08'),
    ('SUHARTATIK', '3515075409630001', 'KERAMEAN', '01', '09'),
    ('ENDANG SUKAPTI', '3578126701640001', 'PERUM MCA', '02', '10'),
    ('MARMI''AH', '3515075703630002', 'PERUM MCA', '04', '10'),
    ('DESY NURFIANTI', '3515075012820007', 'PERUM MCA', '04', '10'),
    ('BAMBANG HANDJOJO', '3515160306570001', 'PERUM MCA', '01', '11'),
    ('ENDAH RUSMAYANTI', '3515075805730001', 'PERUM MCA', '05', '14'),
    ('MUHAMMAD DAFFA AS''AD', '3515072002000002', 'PERUM MCA', '05', '14'),
    ('RETNO RACHMAWATI', '3578055104860003', 'PERUM MCA', '04', '14'),
    ('SUBANDI', '3515071708630005', 'GRIYA NIRWANA', '01', '15'),
    ('KARTINI', '3515046112690001', 'PERUM MCA', '02', '17')
)
insert into public.posbankum_pengaduan (
  tipe_data,
  user_id,
  nomor_register,
  tanggal_pengaduan,
  nama_lengkap,
  nik,
  alamat,
  dusun,
  rt,
  rw,
  sumber_data,
  status_dalam_permasalahan,
  jenis_permasalahan,
  jenis_layanan,
  status
)
select
  'warga_rujukan',
  pengguna.id,
  'KLBH-' || upper(substr(encode(digest(sumber.nik, 'sha256'), 'hex'), 1, 16)),
  now(),
  sumber.nama_lengkap,
  sumber.nik,
  sumber.dusun || ' RT ' || sumber.rt || ' RW ' || sumber.rw,
  sumber.dusun,
  sumber.rt,
  sumber.rw,
  'BLT DD Tahap II',
  'Data rujukan calon penerima Kartu LBH',
  '["Data rujukan Kartu LBH"]'::jsonb,
  'litigasi',
  'Identifikasi'
from sumber
left join public.users as pengguna
  on pengguna.nik::text = sumber.nik
on conflict (nik) where tipe_data = 'warga_rujukan'
do update set
  user_id = coalesce(excluded.user_id, posbankum_pengaduan.user_id),
  nama_lengkap = excluded.nama_lengkap,
  alamat = excluded.alamat,
  dusun = excluded.dusun,
  rt = excluded.rt,
  rw = excluded.rw,
  sumber_data = excluded.sumber_data,
  status_dalam_permasalahan = excluded.status_dalam_permasalahan,
  jenis_permasalahan = excluded.jenis_permasalahan,
  jenis_layanan = excluded.jenis_layanan,
  updated_at = now();

notify pgrst, 'reload schema';

commit;

-- Verifikasi setelah migration. Hasil yang diharapkan:
-- jumlah_baris = 43, nik_unik = 43, nik_tidak_valid = 0.
select
  count(*) as jumlah_baris,
  count(distinct nik) as nik_unik,
  count(*) filter (where nik !~ '^[0-9]{16}$') as nik_tidak_valid,
  count(*) filter (where user_id is not null) as sudah_terhubung_ke_users
from public.posbankum_pengaduan
where tipe_data = 'warga_rujukan'
  and sumber_data = 'BLT DD Tahap II';
