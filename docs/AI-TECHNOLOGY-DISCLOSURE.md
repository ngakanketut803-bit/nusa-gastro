# AI & Technology Disclosure

## Ringkasan

Nusa Gastro adalah aplikasi edukasi perjalanan tentang kesehatan pencernaan dan keamanan pangan. Aplikasi menggunakan komponen perangkat lunak berikut:

- **React** dan **Vite** untuk antarmuka web.
- **Google Gemini API** untuk fitur Nusa Bot dan bantuan identifikasi makanan/minuman dari gambar. Permintaan diproses melalui endpoint server; kredensial provider tidak disimpan di kode frontend.
- **FatSecret API** untuk pencarian katalog atau informasi nutrisi jika kredensial layanan tersebut dikonfigurasi.
- **Vercel Functions** untuk menjalankan endpoint server saat deployment di Vercel. GitHub Pages, bila digunakan, hanya melayani frontend statis dan memerlukan endpoint API eksternal.
- **Neon, Supabase, Firebase, dan Google Sheets** merupakan integrasi yang dapat dikonfigurasi untuk fungsi data tertentu; integrasi hanya digunakan jika dipasang dan diaktifkan pada deployment terkait.

## Peran AI dan data

Gemini menghasilkan jawaban berbasis prompt pengguna untuk Nusa Bot dan membantu menganalisis gambar yang dikirim melalui fitur scan. Hasilnya dapat keliru, tidak lengkap, atau tidak sesuai konteks. Gambar dan prompt yang menggunakan fitur AI dikirim ke backend aplikasi dan dapat diteruskan ke provider AI yang dikonfigurasi untuk pemrosesan.

Jangan gunakan hasil aplikasi untuk mendiagnosis atau mengobati penyakit, menentukan dosis obat, atau menunda pertolongan medis. Informasi herbal dan nutrisi juga bersifat edukatif. Verifikasi informasi penting dengan sumber tepercaya atau tenaga kesehatan.

## Kunci API dan privasi

- Kunci Gemini, FatSecret, dan koneksi database harus berada di secret manager/server environment, bukan di repository atau variabel frontend `VITE_*`.
- `.env.example` hanya berisi nama konfigurasi dengan nilai kosong; jangan menggantinya dengan secret asli sebelum mengunggah ke GitHub.
- Tinjau kebijakan privasi provider dan konfigurasi deployment sebelum menggunakan aplikasi dengan data pribadi atau kesehatan.

## Batasan dan tanggung jawab

Ketersediaan fitur AI dan integrasi eksternal bergantung pada konfigurasi, jaringan, kuota, serta layanan provider. Nusa Gastro tidak menjamin akurasi, kelengkapan, atau ketersediaan hasil. Pengguna tetap bertanggung jawab memeriksa informasi dan mencari bantuan profesional bila diperlukan.
