# FoodMate AI — Panduan DevOps Bertahap

Dokumen ini menjelaskan cara menjalankan **backend Hono + PostgreSQL** dengan AI dari **Gemini API** secara self-hosted. Mobile app yang sedang dipreview memakai React Native/Expo dan backend scaffold terkelola agar bisa langsung diuji; folder `self-hosted-api/` adalah jalur deployment mandiri yang dapat dipindahkan ke laptop atau VPS.

## 1. Arsitektur yang dibuat

```text
React Native / Expo
        |
        | HTTPS JSON API
        v
Hono API :3000 -------- PostgreSQL :5432
        |
        | HTTPS keluar (internet)
        v
Gemini API (generativelanguage.googleapis.com)
```

**Prinsip keamanan:** port PostgreSQL tidak perlu dibuka ke internet. Hanya API yang boleh menerima trafik publik, idealnya melalui reverse proxy HTTPS. Adminer hanya terbuka di `127.0.0.1:8080`. `GEMINI_API_KEY` adalah rahasia dan hanya disimpan di server.

## 2. Pilihan model AI

AI memakai **Gemini API** milik Google. Tidak ada container model lokal, sehingga server tidak butuh GPU dan RAM besar. Konsekuensinya, server harus bisa mengakses internet keluar, pemakaian dibatasi kuota API, dan isi chat pengguna diproses oleh Google.

| Peran | Variabel | Nilai default | Catatan |
|---|---|---|---|
| Model utama | `GEMINI_MODEL` | `gemini-3.5-flash` | Dipakai untuk setiap chat |
| Model cadangan | `GEMINI_FALLBACK_MODEL` | `gemini-3.1-flash-lite` | Dipakai otomatis jika model utama gagal atau kuotanya habis (429) |

Model seri Pro (misalnya `gemini-3.1-pro-preview`) bisa dipakai dengan mengganti nilai di `.env`, tetapi memerlukan tier berbayar. ID model dari Google bisa berubah; cek daftar di dokumentasi Gemini API sebelum mengganti nilainya.

Alur fallback ada di `self-hosted-api/src/lib/gemini.ts`: percobaan ke model utama, ulangi tanpa pengaturan thinking, lalu pindah ke model cadangan.

## 3. Persiapan laptop atau VPS

Pasang Docker Engine dan Compose plugin. Lalu clone project ini ke server. Contoh:

```bash
git clone <URL_REPOSITORY_KAMU> foodmate-ai
cd foodmate-ai
```

Buat environment khusus self-hosted. Jangan commit file berisi password atau key asli:

```bash
cp .env.selfhosted.example .env.selfhosted
nano .env.selfhosted
```

Ganti minimal nilai berikut:

```env
POSTGRES_PASSWORD=kata-sandi-database-yang-kuat
JWT_SECRET=string-acak-minimal-32-karakter
GEMINI_API_KEY=key-dari-google-ai-studio
```

`GEMINI_MODEL` dan `GEMINI_FALLBACK_MODEL` boleh dibiarkan memakai nilai default. Untuk menghasilkan secret acak di Linux:

```bash
openssl rand -hex 32
```

API key dibuat di Google AI Studio. Jangan menempelkannya ke chat, issue, atau commit. Jika bocor, buat key baru dan cabut yang lama.

## 4. Menjalankan di lokal

Perintah utama:

```bash
docker compose --env-file .env.selfhosted -f docker-compose.selfhosted.yml up -d --build
```

Yang terjadi:

1. Container PostgreSQL dibuat dan volume `postgres_data` disimpan persisten.
2. Container API menunggu database sehat, menjalankan schema push, lalu memulai Hono pada port 3000.
3. Container Adminer dibuat untuk melihat isi database di `http://localhost:8080` (hanya dari komputer yang sama).

Jika sebelumnya kamu menjalankan versi lama yang memakai Ollama, tambahkan `--remove-orphans` agar container Ollama lama ikut terhapus.

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

Cek konfigurasi Gemini di dalam container, tanpa menampilkan isi key:

```bash
docker compose -f docker-compose.selfhosted.yml exec api sh -c 'if [ -z "$GEMINI_API_KEY" ]; then echo KOSONG; else echo TERISI; fi'
docker compose -f docker-compose.selfhosted.yml exec api printenv GEMINI_MODEL GEMINI_FALLBACK_MODEL
```

Hasil pertama harus `TERISI`. Jika `KOSONG`, isi `GEMINI_API_KEY` di file env, lalu buat ulang container API dengan `up -d --force-recreate api`.

## 5. Menguji register, login, dan chat

Pastikan `GEMINI_API_KEY` sudah terisi, lalu cek bahwa container membacanya tanpa menampilkan isinya:

```bash
docker compose -f docker-compose.selfhosted.yml exec api sh -c 'if [ -z "$GEMINI_API_KEY" ]; then echo KOSONG; else echo TERISI; fi'
```

Daftar user:

```bash
curl -s http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Demo User","email":"demo@example.com","password":"password-demo-123"}'
```

Simpan nilai `token` dari response. Login:

```bash
curl -s http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"password-demo-123"}'
```

Tes chat dengan token:

```bash
curl -s http://localhost:3000/api/chat \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN" \
  -H 'Content-Type: application/json' \
  -d '{"message":"Saya ingin makan malam hangat, budget 30 ribu, dan tidak terlalu pedas."}'
```

Response berisi `answer`, `quick_replies`, `model`, dan `conversationId`.

Jika response `AI model is unavailable`, lihat log API:

```bash
docker compose -f docker-compose.selfhosted.yml logs api --tail 20
```

Cari baris `gemini model=... status=...` dan cocokkan dengan tabel di bagian 9.

Setelah mengubah `.env`, container harus dibuat ulang agar membaca nilai baru:

```bash
docker compose -f docker-compose.selfhosted.yml up -d --force-recreate api
```

## 6. Menjalankan di VPS

AI berjalan di layanan Gemini, jadi VPS hanya menjalankan API dan PostgreSQL. Spesifikasi kecil cukup untuk tahap awal (perkiraan: 1 sampai 2 vCPU dan 2 GB RAM). VPS harus bisa mengakses internet keluar lewat HTTPS ke `generativelanguage.googleapis.com`.

Siapkan `.env.selfhosted` berisi `GEMINI_API_KEY`, `POSTGRES_PASSWORD` yang kuat, dan `JWT_SECRET` minimal 32 karakter acak.

Langkah operasional:

```bash
# 1. Firewall: buka SSH dan HTTPS; jangan buka 5432
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

Jika VPS sebelumnya menjalankan versi lama yang masih memakai Ollama, bersihkan sisanya:

```bash
docker compose -f docker-compose.selfhosted.yml up -d --build --remove-orphans
docker volume rm foodmate-ai_ollama_data
```

Nama volume bergantung pada nama folder proyek; cek dulu dengan `docker volume ls`.

Untuk produksi, pasang reverse proxy seperti Caddy atau Nginx di depan API, gunakan domain `api.domainkamu.com`, aktifkan TLS, dan teruskan hanya ke `127.0.0.1:3000`. Port PostgreSQL tidak di-publish, dan Adminer hanya terbuka di `127.0.0.1:8080` (akses lewat SSH tunnel).

**Catatan keamanan untuk Gemini:**

- `GEMINI_API_KEY` adalah rahasia: simpan hanya di `.env` server, jangan di repo atau aplikasi mobile. Jika bocor, buat key baru dan cabut yang lama di Google AI Studio.
- Isi chat pengguna dikirim ke Google untuk diproses. Beri tahu pengguna dan pastikan ini sesuai kebijakan privasi aplikasi.
- Kuota API terbatas. Saat model utama mengembalikan 429, kode otomatis memakai `GEMINI_FALLBACK_MODEL`. Pantau pemakaian di Google AI Studio.

## 7. Backup PostgreSQL

Backup manual:

```bash
docker compose -f docker-compose.selfhosted.yml exec -T postgres \
  pg_dump -U foodmate -d foodmate > backup-$(date +%F).sql
```

Restore hanya setelah memastikan target database benar:

```bash
cat backup-2026-09-10.sql | docker compose -f docker-compose.selfhosted.yml exec -T postgres \
  psql -U foodmate -d foodmate
```

Untuk produksi, jadwalkan backup ke storage terpisah. Jangan menganggap volume Docker sebagai backup.

## 8. Cara mobile app diarahkan ke API VPS

Preview saat ini memakai tRPC bawaan project agar layar chat bisa langsung diuji di lingkungan Manus. Backend Hono self-hosted memakai REST JSON, sehingga ada dua langkah integrasi yang sengaja dipisah:

1. Tambahkan API client Expo untuk `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/chat/history`, dan `/api/chat`.
2. Ganti `useAuth` dan mutation chat dari tRPC ke API client tersebut. Token JWT disimpan memakai `expo-secure-store`.

Jangan menaruh `JWT_SECRET`, `DATABASE_URL`, atau `GEMINI_API_KEY` di aplikasi mobile. Mobile hanya mengetahui URL API publik dan menerima JWT.

## 9. Checklist troubleshooting

| Gejala | Perintah pemeriksaan | Kemungkinan |
|---|---|---|
| API tidak hidup | `docker compose logs api` | Env atau schema database salah |
| API restart terus, `drizzle-kit push` gagal | tes login Postgres dari container lain (lihat bawah) | Password database tidak cocok dengan volume lama |
| Database connection refused | `docker compose ps` | PostgreSQL belum healthy |
| `AI model is unavailable`, log `status=400` | `docker compose logs api --tail 20` | `GEMINI_API_KEY` kosong, salah, atau masih placeholder (`API_KEY_INVALID`) |
| Log `gemini ... status=404` | `docker compose logs api --tail 20` | Nama model salah di `GEMINI_MODEL` |
| Log `gemini ... status=403` | `docker compose logs api --tail 20` | Key belum diizinkan untuk Generative Language API |
| Log `gemini ... status=429` | `docker compose logs api --tail 20` | Kuota habis; kode otomatis memakai model cadangan |
| Nilai `.env` tidak berubah | `docker compose exec api printenv GEMINI_MODEL` | Container belum dibuat ulang (`up -d --force-recreate api`) |
| Login selalu 401 | Periksa token dan `JWT_SECRET` | Secret berubah setelah token diterbitkan |
| Data hilang setelah recreate | `docker volume ls` | Volume dihapus; jangan memakai `down -v` sembarangan |

Tes password PostgreSQL dari luar container (menyerupai cara API terhubung):

```bash
docker run --rm --network <nama-project>_default -e PGPASSWORD=<password> postgres:16-alpine \
  psql -h postgres -U foodmate -d foodmate -c "select 1"
```

Password `POSTGRES_PASSWORD` hanya berlaku saat volume pertama kali dibuat. Jika berbeda dengan `.env` sekarang, samakan lewat `ALTER USER foodmate WITH PASSWORD '...'` di dalam container Postgres, jangan menghapus volume yang masih berisi data.

## 10. Urutan belajar DevOps yang disarankan

**Tahap 1 — Local development:** jalankan Compose, health check, register/login, dan chat memakai curl.

**Tahap 2 — Observability:** baca log, gunakan `docker stats`, tambahkan log request dan error tracking.

**Tahap 3 — Security:** secret dari environment/secret manager, rotasi `GEMINI_API_KEY`, firewall, HTTPS, rate limit login, validasi input, dan backup terjadwal.

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
| Model AI preview | LLM server-side bawaan | Gemini (`gemini-3.5-flash`, cadangan `gemini-3.1-flash-lite`) |

Dengan pemisahan ini, kamu bisa belajar DevOps tanpa menunggu seluruh aplikasi mobile selesai dimigrasikan. Setelah stack VPS sehat, migrasi client dilakukan sebagai pekerjaan terukur, bukan perubahan besar sekaligus.
