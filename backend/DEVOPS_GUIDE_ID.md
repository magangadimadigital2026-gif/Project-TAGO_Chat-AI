# FoodMate AI — Panduan DevOps Bertahap

Dokumen ini menjelaskan cara menjalankan **backend Hono + PostgreSQL + Ollama** secara self-hosted. Mobile app yang sedang dipreview memakai React Native/Expo dan backend scaffold terkelola agar bisa langsung diuji; folder `self-hosted-api/` adalah jalur deployment mandiri yang dapat dipindahkan ke laptop atau VPS.

## 1. Arsitektur yang dibuat

```text
React Native / Expo
        |
        | HTTPS JSON API
        v
Hono API :3000 -------- PostgreSQL :5432
        |
        | jaringan Docker internal
        v
Ollama :11434 -------- Qwen3 1.7B / 4B
```

**Prinsip keamanan:** port PostgreSQL dan Ollama tidak perlu dibuka ke internet. Hanya API yang boleh menerima trafik publik, idealnya melalui reverse proxy HTTPS.

## 2. Pilihan model lokal

Stack menggunakan **Ollama** karena tersedia sebagai image Docker resmi, menyediakan REST API, dan dapat berjalan CPU-only maupun dengan GPU NVIDIA di Linux. Rujukan resmi: [Ollama Docker image](https://ollama.com/blog/ollama-is-now-available-as-an-official-docker-image).

Model default adalah `qwen3:4b`. Halaman resmi Qwen3 di Ollama mencantumkan ukuran sekitar 2,5 GB untuk 4B, 1,4 GB untuk 1.7B, dan 5,2 GB untuk 8B. Qwen3 juga mendukung banyak bahasa termasuk bahasa Indonesia. Rujukan: [Ollama Qwen3 library](https://ollama.com/library/qwen3).

| Kondisi server | Model awal | Alasan |
|---|---|---|
| Laptop/VPS kecil, RAM 4–8 GB | `qwen3:1.7b` | Lebih ringan, cocok untuk proof of concept |
| VPS 8–16 GB RAM | `qwen3:4b` | Kualitas dan latency lebih seimbang |
| GPU atau server besar | `qwen3:8b` atau lebih | Jawaban lebih kaya, kebutuhan resource lebih tinggi |

Jangan langsung memilih model 30B/235B pada VPS kecil. Ukuran model bukan satu-satunya kebutuhan; context, concurrency, dan overhead runtime juga memakai RAM.

## 3. Persiapan laptop atau VPS

Pasang Docker Engine dan Compose plugin. Lalu clone project ini ke server. Contoh:

```bash
git clone <URL_REPOSITORY_KAMU> foodmate-ai
cd foodmate-ai
```

Buat environment khusus self-hosted. Jangan commit file berisi password asli:

```bash
cp .env.selfhosted.example .env.selfhosted
nano .env.selfhosted
```

Ganti minimal nilai berikut:

```env
POSTGRES_PASSWORD=kata-sandi-database-yang-kuat
JWT_SECRET=string-acak-minimal-32-karakter
OLLAMA_MODEL=qwen3:4b
```

Untuk menghasilkan secret acak di Linux:

```bash
openssl rand -hex 32
```

## 4. Menjalankan di lokal

Perintah utama:

```bash
docker compose --env-file .env.selfhosted -f docker-compose.selfhosted.yml up -d --build
```

Yang terjadi:

1. Container PostgreSQL dibuat dan volume `postgres_data` disimpan persisten.
2. Container Ollama dibuat dan model disimpan pada volume `ollama_data`.
3. `ollama-init` menarik model sesuai `OLLAMA_MODEL`.
4. Container API menunggu database dan Ollama sehat, menjalankan schema push, lalu memulai Hono pada port 3000.

Cek status:

```bash
docker compose --env-file .env.selfhosted -f docker-compose.selfhosted.yml ps
curl http://localhost:3000/health
```

Output health yang benar:

```json
{"status":"ok","service":"foodmate-api"}
```

Lihat log:

```bash
docker compose -f docker-compose.selfhosted.yml logs -f api
```

Cek model yang tersedia:

```bash
docker compose -f docker-compose.selfhosted.yml exec ollama ollama list
```

## 5. Menguji register, login, dan chat

Daftar user:

```bash
curl -s http://localhost:3000/api/auth/register \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"Demo User","email":"demo@example.com","password":"password-demo-123"}'
```

Simpan nilai `token` dari response. Login:

```bash
curl -s http://localhost:3000/api/auth/login \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"demo@example.com","password":"password-demo-123"}'
```

Tes chat dengan token:

```bash
curl -s http://localhost:3000/api/chat \\
  -H "Authorization: Bearer TOKEN_DARI_LOGIN" \\
  -H 'Content-Type: application/json' \\
  -d '{"message":"Saya ingin makan malam hangat, budget 30 ribu, dan tidak terlalu pedas."}'
```

Jika response `503 AI model is unavailable`, cek dua hal:

```bash
docker compose -f docker-compose.selfhosted.yml logs ollama

docker compose -f docker-compose.selfhosted.yml exec ollama ollama list
```

## 6. Menjalankan di VPS

Gunakan VPS tanpa GPU terlebih dahulu untuk belajar alur DevOps. Untuk tahap awal, pilih minimal **2 vCPU dan 8 GB RAM** bila memakai `qwen3:4b`; gunakan `qwen3:1.7b` jika resource lebih kecil. GPU bukan syarat, tetapi CPU inference akan lebih lambat.

Langkah operasional:

```bash
# 1. Firewall: buka SSH dan HTTPS; jangan buka 5432 atau 11434
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 2. Jalankan stack
cd /opt/foodmate-ai
docker compose --env-file .env.selfhosted -f docker-compose.selfhosted.yml up -d --build

# 3. Pastikan restart otomatis bekerja
docker compose -f docker-compose.selfhosted.yml ps
```

Untuk produksi, pasang reverse proxy seperti Caddy atau Nginx di depan API, gunakan domain `api.domainkamu.com`, aktifkan TLS, dan teruskan hanya ke `127.0.0.1:3000`. Jangan mem-publish Ollama ke `0.0.0.0` karena endpoint model tidak memiliki kebutuhan untuk diakses publik.

## 7. Backup PostgreSQL

Backup manual:

```bash
docker compose -f docker-compose.selfhosted.yml exec -T postgres \\
  pg_dump -U foodmate -d foodmate > backup-$(date +%F).sql
```

Restore hanya setelah memastikan target database benar:

```bash
cat backup-2026-09-10.sql | docker compose -f docker-compose.selfhosted.yml exec -T postgres \\
  psql -U foodmate -d foodmate
```

Untuk produksi, jadwalkan backup ke storage terpisah. Jangan menganggap volume Docker sebagai backup.

## 8. Cara mobile app diarahkan ke API VPS

Preview saat ini memakai tRPC bawaan project agar layar chat bisa langsung diuji di lingkungan Manus. Backend Hono self-hosted memakai REST JSON, sehingga ada dua langkah integrasi yang sengaja dipisah:

1. Tambahkan API client Expo untuk `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/chat/history`, dan `/api/chat`.
2. Ganti `useAuth` dan mutation chat dari tRPC ke API client tersebut. Token JWT disimpan memakai `expo-secure-store`.

Jangan menaruh `JWT_SECRET`, `DATABASE_URL`, atau kredensial model di aplikasi mobile. Mobile hanya mengetahui URL API publik dan menerima JWT.

## 9. Checklist troubleshooting

| Gejala | Perintah pemeriksaan | Kemungkinan |
|---|---|---|
| API tidak hidup | `docker compose logs api` | Env atau schema database salah |
| Database connection refused | `docker compose ps` | PostgreSQL belum healthy |
| Model belum ada | `docker compose exec ollama ollama list` | Pull model belum selesai |
| Chat lambat | `docker stats` | CPU/RAM tidak cukup atau model terlalu besar |
| Login selalu 401 | Periksa token dan `JWT_SECRET` | Secret berubah setelah token diterbitkan |
| Data hilang setelah recreate | `docker volume ls` | Volume dihapus; jangan memakai `down -v` sembarangan |

## 10. Urutan belajar DevOps yang disarankan

**Tahap 1 — Local development:** jalankan Compose, health check, register/login, dan chat memakai curl.

**Tahap 2 — Observability:** baca log, gunakan `docker stats`, tambahkan log request dan error tracking.

**Tahap 3 — Security:** secret dari environment/secret manager, firewall, HTTPS, rate limit login, validasi input, dan backup terjadwal.

**Tahap 4 — Deployment:** push image ke registry, gunakan CI/CD, deploy ke VPS, lalu lakukan smoke test otomatis.

**Tahap 5 — AI Agent:** tambahkan tool cuaca, lokasi, katalog menu, dan integrasi TAGO hanya setelah kontrak API dan autentikasi stabil. Semua tool harus punya timeout, retry terbatas, logging, dan validasi output model.

## 11. Catatan perbedaan preview dan self-hosted

| Area | Preview sekarang | Self-hosted VPS |
|---|---|---|
| Mobile | Expo/React Native | Expo/React Native |
| UI chat | Sudah aktif | Client REST perlu diarahkan ke URL VPS |
| Auth preview | OAuth bawaan platform | Email/password + JWT |
| API preview | tRPC server scaffold | Hono REST |
| Database preview | Database terkelola scaffold | PostgreSQL Docker |
| Model AI preview | LLM server-side bawaan | Ollama + Qwen3 lokal |

Dengan pemisahan ini, kamu bisa belajar DevOps tanpa menunggu seluruh aplikasi mobile selesai dimigrasikan. Setelah stack VPS sehat, migrasi client dilakukan sebagai pekerjaan terukur, bukan perubahan besar sekaligus.
