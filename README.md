# [Nusa Gastro]

## Description
Nusa Gastro adalah platform mobile health berbasis web cerdas yang dirancang untuk mendukung ketahanan kesehatan pariwisata di Bali melalui mitigasi diare tropis dan gangguan pencernaan secara proaktif. Platform ini mengintegrasikan pemodelan peramalan statistik iklim (ARIMAX), pemindaian gizi dan higienitas pangan (Food Scan), serta asisten kesehatan virtual berbasis Generative AI (Nusa Bot) dalam satu platform terpadu.

## Problem & Target User
Problem: Bali sebagai destinasi wisata internasional kerap menghadapi ancaman diare tropis akibat perubahan pola makan wisatawan, keterpaparan makanan/minuman yang terkontaminasi, serta pengaruh iklim tropis dengan kelembapan tinggi. Minimnya validasi keamanan pangan mandiri dan keterbatasan informasi lokasi fasilitas kesehatan darurat sering memperburuk komplikasi dehidrasi pada penderita.
Target User: Wisatawan (domestik & internasional), pelaku perjalanan keluarga, serta masyarakat lokal di kawasan pariwisata yang mengakses web secara on-the-go melalui perangkat smartphone maupun desktop.

## Key Features
Nusa Predict: Dasbor peramalan tren kenaikan kasus diare berbasis pemodelan statistik ARIMAX dengan variabel iklim dan data historis.
Food Scan: Fitur pemindai berbasis Visual AI / Computer Vision untuk analisis kandungan gizi dan tingkat keamanan kuliner lokal.
Nusa Bot: Asisten virtual interaktif berbasis Generative AI (LLM) untuk media konsultasi awal dan rekomendasi rehidrasi mandiri.
Herbal & Kearifan Lokal: Ensiklopedia digital edukasi obat tradisional Indonesia (seperti jahe, kunyit, dan temulawak) untuk kenyamanan pencernaan.
Rumah Sakit & Puskesmas Terdekat: Peta interaktif berbasis lokasi (geolocation) untuk melacak faskes darurat di sekitar pengguna.
Educational Games: Permainan edukatif interaktif (Puzzle & Match Game) tentang kesehatan pencernaan.

## Tech Stack
Frontend: HTML5, CSS3, JavaScript (Lightweight / Responsive Web UI)
Backend / Serverless: Node.js / Vercel Serverless Platform
Database / Storage: LocalStorage / Web Storage API
Hosting / Deployment: Vercel Hosting

## AI Implementation
ARIMAX Forecasting Model: Pemodelan deret waktu (time-series) yang menggabungkan data historis kasus diare dengan kovariat eksogen iklim (curah hujan, suhu, kelembapan, tekanan udara) untuk peramalan tren kasus.
Computer Vision & Visual AI: Digunakan pada fitur Food Scan untuk pengenalan gambar makanan/minuman serta ekstraksi informasi nutrisi.
Generative AI / Large Language Model (LLM): Digunakan pada fitur Nusa Bot untuk memproses konsultasi kesehatan pencernaan berbasis teks secara kontekstual dan responsif.

## Architecture / Data Flow
[User Browser (Mobile/Desktop)]
             │
             ▼
[Frontend: HTML5, CSS3, JavaScript (Responsive Web UI)]
             │
             ├──────────────────────────┐
             ▼                          ▼
[Backend Services / Vercel Edge] ──► [Local / Web Storage]
             │
             ├──────────────────────────┬──────────────────────────┐
             ▼                          ▼                          ▼
[ARIMAX Engine / API]       [Computer Vision API]         [Generative AI / LLM]
(Model Peramalan Iklim)      (Analisis Food Scan)          (Nusa Bot Consultation)
             │                          │                          │
             └──────────────────────────┼──────────────────────────┘
                                        ▼
                         [Interactive User Result / UI]

## Installation / Run Instructions
Clone repositori ini:
git clone https://github.com/ngakanketut803-bit/nusa-gastro.git

Masuk ke direktori proyek:
cd nusa-gastro

Jalankan aplikasi:
- Buka file index.html secara langsung di browser, atau
- Gunakan ekstensi Live Server pada VS Code.

Environment Variables:
# Salin file .env.example jika menggunakan API Key eksternal
cp .env.example .env
# Salin file .env.example jika menggunakan API Key eksternal
cp .env.example .env

## Deployment URL
https://nusa-gastro.vercel.app/

## Demo Account (jika diperlukan - jangan simpan password sensitif di public repo)
Tidak diperlukan akun khusus (Akses publik terbuka langsung tanpa proses autentikasi rumit).

## Known Limitations
- Akurasi fitur Nusa Predict sangat bergantung pada kelengkapan pembaruan data historis penyakit dan kondisi iklim wilayah setempat.
- Pemrosesan gambar pada Food Scan dan respons Nusa Bot membutuhkan koneksi internet yang stabil.

## Third-party Resources / Credits
- Leaflet.js: Open-source JavaScript library untuk peta interaktif lokasi fasilitas kesehatan.
- Chart.js: Open-source JavaScript library untuk visualisasi grafik prediksi ARIMAX.
- OpenStreetMap: Penyedia data peta tiles.
- AI Coding Assistant: ChatGPT / GitHub Copilot (sebagai development assistant).

## Team Members
No member, just Ngakan Ketut Adi Haryajna only (individu)
