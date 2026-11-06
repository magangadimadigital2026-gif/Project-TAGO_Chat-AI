# DevOps — TAGO Chat AI

Panduan menjalankan seluruh stack (Backend self-hosted + PostgreSQL) secara lokal maupun di server sendiri. AI memakai Gemini API, tidak ada model lokal.

## Struktur Project

```
TAGOChat-AI/
├── backend/            <- Hono JS (root) + self-hosted-api/ (Hono + Drizzle, INI YANG DIPAKAI)
│   ├── docker-compose.selfhosted.yml
│   ├── .env.selfhosted.example
│   ├── DEVOPS_GUIDE_ID.md   <- panduan detail lengkap
│   └── self-hosted-api/     <- kode API (Hono + Drizzle)
├── ai/                  <- Next.js AI service (referensi awal, memakai Gemini cloud)
├── frontend/             <- Expo/React Native mobile app
└── devops/                <- dokumen ini
```

## Jalankan Stack Self-Hosted

Referensi lengkap ada di `backend/DEVOPS_GUIDE_ID.md`. Ringkasnya:

```bash
cd backend
cp .env.selfhosted.example .env.selfhosted
nano .env.selfhosted   # isi POSTGRES_PASSWORD (alphanumeric saja, hindari karakter /, @, :), JWT_SECRET, dan GEMINI_API_KEY

docker compose --env-file .env.selfhosted -f docker-compose.selfhosted.yml up -d --build
```

Jika sebelumnya pernah menjalankan versi lama yang memakai Ollama, tambahkan `--remove-orphans` agar container Ollama lama ikut terhapus.

Cek status:
```bash
docker compose -f docker-compose.selfhosted.yml ps
curl http://localhost:3000/health
```

## Catatan Penting Hasil Eksplorasi (untuk tim)

- **Model AI**: memakai Gemini API (`gemini-3.5-flash`, cadangan `gemini-3.1-flash-lite`). `GEMINI_API_KEY` wajib diisi di `.env.selfhosted` dan tidak boleh di-commit. Isi chat pengguna diproses oleh Google dan ada batas kuota API.
- **Password database**: hindari karakter `/`, `@`, `:` — merusak parsing connection string URL.
- **Password database tidak cocok dengan volume lama**: `POSTGRES_PASSWORD` hanya berlaku saat volume database pertama kali dibuat. Jika nilainya berbeda dengan yang tersimpan, API gagal login ke database (log `drizzle-kit push` gagal dan container restart terus). Samakan lewat `ALTER USER` di dalam container Postgres, jangan menghapus volume yang masih berisi data. Detail ada di `backend/DEVOPS_GUIDE_ID.md` bagian 9.
- **Port bentrok**: pastikan port `3000` (API) dan `8080` (Adminer, hanya di 127.0.0.1) tidak dipakai proses lain sebelum `docker compose up`.

## Siapa Mengerjakan Apa

| Bagian | Folder | Penanggung Jawab |
|---|---|---|
| Backend (Auth, Chat API, Database) | `backend/` | rahmaniafarasya |
| AI Service | `ai/` | Alnovanqt |
| Frontend Mobile | `frontend/` | fardaningrum |
| DevOps / Infrastruktur | `devops/`, `backend/docker-compose.selfhosted.yml` | muhammadshodiq20 |