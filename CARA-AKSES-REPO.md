# Cara Akses Repo Project TAGO Chat AI

## 1. Terima undangan
Cek email atau notifikasi GitHub (ikon lonceng di kanan atas github.com), klik **Accept invitation**.

## 2. Install Git (kalau belum ada)
Download di: https://git-scm.com/downloads
Setelah install, buka **Git Bash** (Windows) atau Terminal (Mac/Linux).

## 3. Clone repo
```bash
git clone https://github.com/magangadimadigital2026-gif/Project-TAGO_Chat-AI.git
cd Project-TAGO_Chat-AI
```

## 4. Masuk ke folder sesuai jobdesk kamu

**Kalau kamu pegang AI Service:**
```bash
cd ai
npm install
npm run dev
```

**Kalau kamu pegang Backend:**
```bash
cd backend/self-hosted-api
npm install
npm run dev
```
(Catatan: backend ini butuh PostgreSQL & Ollama jalan dulu — tanya DevOps (Shodiq) untuk setup awal kalau belum ada)

**Kalau kamu pegang Frontend:**
```bash
cd frontend
npm install
npx expo start
```

## 5. Cara kerja sehari-hari (WAJIB diikuti, biar gak saling tabrakan)

Sebelum mulai kerja, selalu tarik perubahan terbaru dulu:
```bash
git pull origin main
```

Setelah selesai ubah kode, commit & push HANYA folder kamu sendiri:
```bash
git add nama-folder-kamu/
git commit -m "jelaskan singkat apa yang diubah"
git push
```

**Contoh kalau kamu di frontend:**
```bash
git add frontend/
git commit -m "frontend: perbaiki tampilan halaman login"
git push
```

## Aturan Penting

- **JANGAN** commit folder `node_modules/` atau file `.env` — ini sudah otomatis di-ignore, tapi kalau ada yang aneh, jangan paksa `git add -f`.
- **JANGAN** edit folder jobdesk orang lain tanpa koordinasi dulu (kalau memang perlu, chat dulu di grup).
- Kalau ragu-ragu atau error yang gak dimengerti, screenshot & tanya di grup — jangan dipaksa asal jalan, nanti malah rusak punya orang lain.

## Siapa Pegang Apa

| Folder | Jobdesk | Penanggung Jawab |
|---|---|---|
| `backend/` | Backend (Auth, Chat API, Database) | rahmaniafarasya |
| `ai/` | AI Service | Alnovanqt |
| `frontend/` | Frontend Mobile | fardaningrum |
| `devops/` | Infrastruktur & Deployment | muhammadshodiq20 |
