# Upload dan kompresi gambar

Jalankan backend:

```bash
cd backend
npm install
npm start
```

Endpoint `POST /api/upload` menerima `multipart/form-data` dengan field bernama `image`. Format yang diterima adalah JPG, PNG, dan WebP dengan ukuran maksimal 10 MB. Hasil default dikonversi ke WebP, kualitas 82, diperkecil hingga lebar maksimal 1920 piksel tanpa mengubah aspect ratio, lalu disimpan ke Supabase Storage.

Siapkan bucket Supabase yang bersifat **public**. Nama default-nya `images`; nama lain dapat ditentukan melalui environment variable:

```env
SUPABASE_URL=https://project-id.supabase.co
SUPABASE_SECRET_KEY=service-role-key
IMAGE_UPLOAD_BUCKET=images
```

`SUPABASE_SECRET_KEY` hanya boleh berada di backend dan tidak boleh dikirim ke browser.

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "image=@/path/ke/foto-desa.jpg"
```

Untuk mempertahankan format asli sebagai fallback kompatibilitas:

```bash
curl -X POST "http://localhost:3000/api/upload?format=original" \
  -F "image=@/path/ke/foto-desa.png"
```

Contoh respons sukses:

```json
{
  "success": true,
  "message": "Gambar berhasil diunggah dan dikompresi.",
  "data": {
    "url": "https://project-id.supabase.co/storage/v1/object/public/images/uploads/550e8400-e29b-41d4-a716-446655440000.webp",
    "bucket": "images",
    "path": "uploads/550e8400-e29b-41d4-a716-446655440000.webp",
    "filename": "550e8400-e29b-41d4-a716-446655440000.webp",
    "mimeType": "image/webp",
    "width": 1920,
    "height": 1080,
    "size": {
      "beforeKb": 2840.5,
      "afterKb": 614.2,
      "savingPercent": 78.38
    }
  }
}
```

Di Postman, pilih metode `POST`, buka **Body → form-data**, buat key `image` bertipe **File**, lalu pilih gambar. File hasil dapat dibuka langsung melalui public URL pada `data.url`. Penyimpanan tidak bergantung pada filesystem Vercel.
