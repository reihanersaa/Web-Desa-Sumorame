-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nik character varying NOT NULL UNIQUE,
  no_kk character varying NOT NULL,
  nama_lengkap character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  no_hp character varying NOT NULL,
  provinsi character varying,
  kabupaten character varying,
  kecamatan character varying,
  kelurahan character varying,
  password text NOT NULL,
  role character varying DEFAULT 'warga'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.surat (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nomor_surat character varying UNIQUE,
  judul_surat character varying NOT NULL,
  jenis_surat character varying NOT NULL,
  tanggal_surat date NOT NULL,
  pengirim character varying,
  penerima character varying,
  deskripsi text,
  file_url text,
  status USER-DEFINED DEFAULT 'draft'::status_surat_enum,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  data_form jsonb,
  CONSTRAINT surat_pkey PRIMARY KEY (id),
  CONSTRAINT surat_created_by_fkey1 FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.aduan (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  nama_pelapor character varying,
  email_pelapor character varying,
  judul_aduan character varying NOT NULL,
  isi_aduan text NOT NULL,
  file_bukti_url text,
  status character varying DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  no_wa text,
  tanggapan_admin text,
  tanggal_tanggapan text,
  lampiran_gambar_url text,
  lampiran_file_url text,
  CONSTRAINT aduan_pkey PRIMARY KEY (id),
  CONSTRAINT aduan_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.publikasi (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid,
  judul character varying NOT NULL,
  deskripsi text NOT NULL,
  gambar_url text NOT NULL,
  waktu_kegiatan date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT publikasi_pkey PRIMARY KEY (id),
  CONSTRAINT publikasi_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id)
);
CREATE TABLE public.produk_unggulan (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  nama_produk character varying NOT NULL,
  harga integer NOT NULL CHECK (harga IS NULL OR harga >= 0),
  deskripsi text,
  gambar text NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nama_penjual text,
  kontak_penjual character varying NOT NULL,
  dilihat integer NOT NULL DEFAULT 0 CHECK (dilihat >= 0),
  is_featured boolean NOT NULL DEFAULT false,
  featured_order smallint,
  nik character varying CHECK (nik IS NULL OR nik::text ~ '^[0-9]{16}$'::text),
  CONSTRAINT produk_unggulan_pkey PRIMARY KEY (id),
  CONSTRAINT produk_unggulan_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.kelembagaan (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid,
  nama character varying NOT NULL,
  pengertian text NOT NULL,
  tugas text NOT NULL,
  tujuan text NOT NULL,
  gambar_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT kelembagaan_pkey PRIMARY KEY (id),
  CONSTRAINT kelembagaan_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id)
);
CREATE TABLE public.ppid (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid,
  struktur text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ppid_pkey PRIMARY KEY (id),
  CONSTRAINT ppid_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id)
);
CREATE TABLE public.ppid_pdf (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid,
  judul character varying NOT NULL,
  file text NOT NULL,
  ukuran bigint NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ppid_pdf_pkey PRIMARY KEY (id),
  CONSTRAINT ppid_pdf_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id)
);
CREATE TABLE public.cmsprofil (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  judul_hero text NOT NULL,
  deskripsi_hero text NOT NULL,
  sambutan text NOT NULL,
  visi text NOT NULL,
  misi text NOT NULL,
  gambar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  admin_id uuid,
  foto_kades_url text,
  nama_kades text,
  gambar_modal_url text,
  peraturan_judul text,
  peraturan_isi text,
  CONSTRAINT cmsprofil_pkey PRIMARY KEY (id)
);
CREATE TABLE public.statistik_warga (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  nik character varying NOT NULL UNIQUE CHECK (nik::text ~ '^[0-9]{16}$'::text),
  nama_warga character varying NOT NULL,
  rt character varying NOT NULL CHECK (rt::text ~ '^[0-9]{1,3}$'::text),
  rw character varying NOT NULL CHECK (rw::text ~ '^[0-9]{1,3}$'::text),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  jenis_kelamin character varying CHECK (jenis_kelamin IS NULL OR (jenis_kelamin::text = ANY (ARRAY['Laki-laki'::character varying, 'Perempuan'::character varying]::text[]))),
  CONSTRAINT statistik_warga_pkey PRIMARY KEY (id),
  CONSTRAINT statistik_warga_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.informasi (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid,
  judul character varying NOT NULL,
  isi text NOT NULL,
  penjelasan text NOT NULL,
  tanggal date NOT NULL,
  gambar_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT informasi_pkey PRIMARY KEY (id),
  CONSTRAINT informasi_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id)
);