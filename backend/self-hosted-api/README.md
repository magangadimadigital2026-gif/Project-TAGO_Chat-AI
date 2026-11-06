# FoodMate Self-hosted API

REST API Hono untuk deployment mandiri dengan PostgreSQL dan Gemini.

## Local run tanpa Docker

```bash
cp ../.env.selfhosted.example .env
# edit DATABASE_URL menjadi PostgreSQL lokal dan isi GEMINI_API_KEY
pnpm install --no-frozen-lockfile --ignore-scripts
./node_modules/.bin/tsc --noEmit
pnpm db:push
pnpm start
```

## Endpoint

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/health` | Tidak | Health check |
| POST | `/api/auth/register` | Tidak | `{ name, email, password }` |
| POST | `/api/auth/login` | Tidak | `{ email, password }` |
| GET | `/api/auth/me` | Bearer JWT | Profil user |
| GET | `/api/chat/history` | Bearer JWT | Riwayat chat |
| POST | `/api/chat` | Bearer JWT | `{ message }`, diteruskan ke Gemini |

## Environment

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_FALLBACK_MODEL`
- `PORT`
