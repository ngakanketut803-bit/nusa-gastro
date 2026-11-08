# Nusa Gastro

Nusa Gastro adalah aplikasi edukasi kesehatan pencernaan dan keamanan pangan untuk membantu pengguna mempersiapkan perjalanan. Informasi aplikasi bersifat edukatif dan bukan pengganti diagnosis atau saran tenaga kesehatan.

## Fitur

- Prediksi dan informasi risiko kesehatan pencernaan berdasarkan destinasi.
- AyuScan untuk membantu mengenali makanan/minuman dan informasi gizinya.
- Panduan herbal dan kearifan lokal dengan catatan batas bukti serta kewaspadaan.
- Nusa Bot untuk tanya jawab edukatif.
- Pencarian fasilitas kesehatan, kuis, dan mini-game edukasi.

## Menjalankan aplikasi

Persyaratan: Node.js 20 atau lebih baru dan npm.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Isi `.env` hanya dengan nilai yang diperlukan. Jangan pernah mengisi atau mengirim secret asli ke GitHub. Build dan pemeriksaan kode:

```powershell
npm run build
npm run lint
```

## Konfigurasi dan deployment

Salin `.env.example` sebagai daftar nama variabel yang didukung. Kunci provider seperti `GEMINI_API_KEY`, `FATSECRET_CLIENT_ID`, dan `FATSECRET_CLIENT_SECRET` hanya boleh disimpan di environment server atau secret manager, tidak di variabel `VITE_*`.

Untuk deployment lengkap di Vercel, ikuti [panduan deployment](./docs/setup/VERCEL_CHECKLIST.md). Workflow GitHub Pages yang tersedia hanya menyajikan frontend statis dan mengarahkan permintaan API ke deployment eksternal; sesuaikan URL API di workflow sebelum menggunakannya untuk deployment baru.

Panduan integrasi opsional:

- [Supabase](./docs/setup/SUPABASE_SETUP.md)
- [Neon](./docs/setup/NEON_MIGRATION_GUIDE.md)
- [Webhook Google Sheets](./docs/setup/GOOGLE_SHEETS_WEBHOOK_SETUP.md)
- [Environment variables](./docs/setup/ENVIRONMENT.md)

## Struktur repository

| Lokasi | Isi |
| --- | --- |
| `src/` | Kode sumber antarmuka React |
| `api/`, `server/` | Endpoint API untuk deployment dan pengembangan lokal |
| `data/` | Data referensi makanan dan minuman |
| `public/` | Aset statis yang digunakan aplikasi |
| `docs/setup/` | Panduan setup, integrasi, dan deployment |
| `docs/assets/` | Aset desain dan referensi |
| `docs/screenshots/` | Tempat menambahkan screenshot dokumentasi |
| `.env.example` | Contoh konfigurasi tanpa credential |

## AI & Technology Disclosure

Lihat [AI & Technology Disclosure](./docs/AI-TECHNOLOGY-DISCLOSURE.md) untuk penjelasan teknologi, penggunaan AI, layanan pihak ketiga, dan batasan aplikasi.
