# DevOps — TAGO Chat AI

Panduan menjalankan seluruh stack (Backend self-hosted + PostgreSQL) secara lokal maupun di server sendiri.

## Struktur Project

```
TAGOChat-AI/
├── backend/            <- Hono JS (root) + self-hosted-api/ (Hono + Drizzle, INI YANG DIPAKAI)
│   └── self-hosted-api/
│       ├── docker-compose.selfhosted.yml
│       ├── .env.selfhosted.example
│       └── DEVOPS_GUIDE_ID.md   <- panduan detail lengkap
├── ai/                  <- Next.js AI service (referensi awal, memakai Gemini cloud)
├── frontend/             <- Expo/React Native mobile app
└── devops/                <- dokumen ini
```

## Jalankan Stack Self-Hosted

Referensi lengkap ada di `backend/DEVOPS_GUIDE_ID.md`. Ringkasnya:

```bash
cd backend
cp .env.selfhosted.example .env.selfhosted
nano .env.selfhosted   # isi POSTGRES_PASSWORD, JWT_SECRET (alphanumeric saja, hindari karakter /, @, :)

docker compose --env-file .env.selfhosted -f docker-compose.selfhosted.yml up -d --build
```

Cek status:
```bash
docker compose -f docker-compose.selfhosted.yml ps
curl http://localhost:3000/health
```

## Catatan Penting Hasil Eksplorasi (untuk tim)

- **Model AI**: gunakan `qwen3:0.6b` untuk laptop/server dengan RAM ≤8GB. Model `1.7b`/`4b` terbukti timeout saat load di RAM terbatas.
- **Password database**: hindari karakter `/`, `@`, `:` — merusak parsing connection string URL.
- **Port bentrok**: pastikan port `3000` dan `11434` tidak dipakai proses lain sebelum `docker compose up`.

## Siapa Mengerjakan Apa

| Bagian | Folder | Penanggung Jawab |
|---|---|---|
| Backend (Auth, Chat API, Database) | `backend/` | rahmaniafarasya |
| AI Service | `ai/` | Alnovanqt |
| Frontend Mobile | `frontend/` | fardaningrum |
| DevOps / Infrastruktur | `devops/`, `backend/self-hosted-api/docker-compose.selfhosted.yml` | muhammadshodiq20 |
