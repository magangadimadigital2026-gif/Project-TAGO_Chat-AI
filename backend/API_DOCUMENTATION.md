# Food AI Backend API

## Base URL

http://192.168.1.34:3000

---

# 1. Authentication

## Register

### Endpoint

POST /api/auth/register

### Request Body

```json
{
  "name": "Rahma",
  "email": "rahma@test.com",
  "password": "password123"
}
Response Berhasil
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": 1,
    "name": "Rahma",
    "email": "rahma@test.com"
  }
}
Error

Jika email sudah terdaftar:

{
  "success": false,
  "message": "Email sudah terdaftar"
}

Jika data tidak valid:

{
  "success": false,
  "message": "Data tidak valid",
  "errors": []
}
2. Login
Endpoint

POST /api/auth/login

Request Body
{
  "email": "rahma@test.com",
  "password": "password123"
}
Response Berhasil
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "Rahma",
      "email": "rahma@test.com"
    },
    "token": "JWT_TOKEN"
  }
}

Token tersebut digunakan untuk mengakses endpoint yang membutuhkan autentikasi.

3. Authentication Token

Untuk endpoint yang membutuhkan login, tambahkan header:

Authorization: Bearer JWT_TOKEN

Contoh:

Authorization: Bearer eyJhbGciOiJIUzI1Ni...
4. Cek User yang Sedang Login
Endpoint

GET /api/auth/me

Header
Authorization: Bearer JWT_TOKEN
Response
{
  "success": true,
  "message": "Token valid",
  "data": {
    "userId": 1,
    "email": "rahma@test.com",
    "exp": 1234567890
  }
}
5. Chat AI
Kirim Pesan
Endpoint

POST /api/chat

Header
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
Request Body
{
  "message": "Rekomendasikan makanan murah dan pedas"
}
Response
{
  "success": true,
  "message": "Chat berhasil",
  "data": {
    "conversationId": 12,
    "userMessage": "Rekomendasikan makanan murah dan pedas",
    "aiReply": "Kamu bisa mencoba Ayam Geprek Sambal Korek..."
  }
}
6. Melanjutkan Percakapan

Untuk melanjutkan percakapan yang sudah ada, kirim conversationId.

Request
{
  "message": "Yang tidak terlalu berminyak",
  "conversationId": 12
}

Backend akan mengambil riwayat percakapan sebelumnya dan mengirimkannya kembali ke AI sebagai konteks.

Dengan begitu, AI dapat memahami percakapan sebelumnya.

7. Riwayat Chat
Endpoint

GET /api/chat

Header
Authorization: Bearer JWT_TOKEN
Response
{
  "success": true,
  "data": [
    {
      "id": 12,
      "title": "Rekomendasikan makanan murah...",
      "userId": 1,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}

Endpoint ini digunakan untuk mengambil semua percakapan milik user yang sedang login.

8. Detail Percakapan
Endpoint

GET /api/chat/:id

Contoh:

GET /api/chat/12
Header
Authorization: Bearer JWT_TOKEN
Response
{
  "success": true,
  "data": {
    "id": 12,
    "title": "Rekomendasikan makanan murah...",
    "userId": 1,
    "createdAt": "...",
    "updatedAt": "...",
    "messages": [
      {
        "id": 1,
        "conversationId": 12,
        "role": "user",
        "content": "Rekomendasikan makanan murah dan pedas",
        "createdAt": "..."
      },
      {
        "id": 2,
        "conversationId": 12,
        "role": "assistant",
        "content": "Kamu bisa mencoba Ayam Geprek Sambal Korek...",
        "createdAt": "..."
      }
    ]
  }
}
9. Food / Menu

Backend menyediakan data makanan yang tersimpan di PostgreSQL.

Data makanan digunakan oleh:

Frontend untuk menampilkan informasi makanan.
AI untuk memberikan rekomendasi makanan berdasarkan menu yang tersedia.
10. Mengambil Semua Makanan
Endpoint

GET /api/foods

Endpoint ini tidak membutuhkan JWT.

Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nasi Goreng Spesial",
      "description": "Nasi goreng dengan berbagai topping",
      "price": 15000,
      "category": "Makanan",
      "subcategory": "Nasi",
      "taste": "Gurih",
      "spicyLevel": 1,
      "servingType": "Piring",
      "tags": [],
      "isAvailable": true,
      "imageUrl": "...",
      "portion": "1 porsi",
      "dietary": "...",
      "ingredients": []
    }
  ]
}

Backend hanya menampilkan makanan yang memiliki:

isAvailable = true
11. Detail Makanan
Endpoint

GET /api/foods/:id

Contoh:

GET /api/foods/1

Endpoint ini tidak membutuhkan JWT.

Response
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nasi Goreng Spesial",
    "description": "Nasi goreng dengan berbagai topping",
    "price": 15000,
    "category": "Makanan",
    "subcategory": "Nasi",
    "taste": "Gurih",
    "spicyLevel": 1,
    "servingType": "Piring",
    "tags": [],
    "isAvailable": true,
    "imageUrl": "...",
    "portion": "1 porsi",
    "dietary": "...",
    "ingredients": []
  }
}
12. Struktur Data Food

Setiap makanan memiliki data:

Field	Keterangan
id	ID makanan
name	Nama makanan
description	Deskripsi makanan
price	Harga makanan
category	Kategori makanan
subcategory	Subkategori makanan
taste	Rasa makanan
spicyLevel	Tingkat kepedasan
servingType	Jenis penyajian
tags	Tag makanan
isAvailable	Status ketersediaan
imageUrl	URL gambar makanan
portion	Ukuran porsi
dietary	Informasi dietary
ingredients	Bahan makanan
13. Integrasi Food Database dengan AI

Backend mengambil data makanan dari PostgreSQL kemudian mengirimkan data tersebut ke API AI.

Endpoint AI yang digunakan:

http://192.168.1.31:3000/api/chat

Data makanan dikirim melalui:

{
  "context": {
    "menus": []
  }
}
14. Data Food yang Dikirim ke AI

Backend mengirim field:

{
  "id": 1,
  "name": "Nasi Goreng Spesial",
  "description": "Nasi goreng dengan berbagai topping",
  "price": 15000,
  "category": "Makanan",
  "subcategory": "Nasi",
  "taste": "Gurih",
  "spicyLevel": 1,
  "tags": [],
  "isAvailable": true,
  "portion": "1 porsi"
}

AI menggunakan data tersebut untuk memberikan rekomendasi berdasarkan menu yang tersedia.

Contohnya user bertanya:

Rekomendasikan makanan murah dan pedas

AI dapat mempertimbangkan:

harga
kategori
rasa
tingkat kepedasan
tag
ketersediaan
porsi
15. Contoh Request Backend ke AI
{
  "messages": [
    {
      "role": "user",
      "content": "Rekomendasikan makanan murah dan pedas"
    }
  ],
  "context": {
    "menus": [
      {
        "id": 1,
        "name": "Nasi Goreng Spesial",
        "description": "Nasi goreng dengan berbagai topping",
        "price": 15000,
        "category": "Makanan",
        "subcategory": "Nasi",
        "taste": "Gurih",
        "spicyLevel": 1,
        "tags": [],
        "isAvailable": true,
        "portion": "1 porsi"
      }
    ]
  }
}

AI kemudian mengembalikan:

{
  "reply": "Kamu bisa mencoba beberapa makanan yang sesuai dengan budget dan tingkat kepedasan yang kamu inginkan."
}

Backend menyimpan response AI tersebut ke database sebagai message dengan:

role = assistant
16. Alur Chat
React Native
     ↓
POST /api/chat
     ↓
JWT Authentication
     ↓
Backend
     ↓
Simpan pesan user
     ↓
Ambil riwayat chat
     ↓
Ambil data makanan dari PostgreSQL
     ↓
Kirim messages + context.menus
     ↓
AI API
     ↓
AI memberikan rekomendasi
     ↓
Backend menerima response AI
     ↓
Simpan response AI ke PostgreSQL
     ↓
Backend mengirim response
     ↓
React Native menampilkan chat
17. Error Response
Token tidak ditemukan

HTTP Status:

401 Unauthorized

Response:

{
  "success": false,
  "message": "Token tidak ditemukan"
}
Token tidak valid / expired

HTTP Status:

401 Unauthorized

Response:

{
  "success": false,
  "message": "Token tidak valid atau sudah expired"
}
Data tidak valid

HTTP Status:

400 Bad Request

Response:

{
  "success": false,
  "message": "Data tidak valid",
  "errors": []
}
Data tidak ditemukan

HTTP Status:

404 Not Found

Response:

{
  "success": false,
  "message": "Makanan tidak ditemukan"
}
18. Daftar Endpoint
Method	Endpoint	Auth	Keterangan
POST	/api/auth/register	❌	Registrasi user
POST	/api/auth/login	❌	Login user
GET	/api/auth/me	✅	Cek user/token
POST	/api/chat	✅	Kirim pesan ke AI
GET	/api/chat	✅	Melihat riwayat chat
GET	/api/chat/:id	✅	Melihat detail chat
GET	/api/foods	❌	Mengambil semua makanan
GET	/api/foods/:id	❌	Mengambil detail makanan
19. Alur Penggunaan API
1. User melakukan register
POST /api/auth/register

↓

2. User melakukan login
POST /api/auth/login

↓

3. Backend memberikan JWT Token
JWT Token

↓

4. Frontend menyimpan token

Token digunakan untuk request yang membutuhkan autentikasi.

↓

5. User mengirim pesan
POST /api/chat

↓

6. Backend memeriksa JWT

↓

7. Backend menyimpan pesan user

↓

8. Backend mengambil data menu makanan
PostgreSQL

↓

9. Backend mengirim data menu + pesan ke AI
AI API

↓

10. AI memberikan jawaban

↓

11. Backend menyimpan jawaban AI

↓

12. Backend mengirim jawaban ke frontend

↓

13. Frontend menampilkan jawaban AI
20. Catatan untuk Frontend

Base URL backend:

http://192.168.1.34:3000

Contoh register:

POST http://192.168.1.34:3000/api/auth/register

Contoh login:

POST http://192.168.1.34:3000/api/auth/login

Contoh chat:

POST http://192.168.1.34:3000/api/chat

Contoh mengambil makanan:

GET http://192.168.1.34:3000/api/foods

Jangan menggunakan:

http://localhost:3000

untuk aplikasi React Native yang berjalan di laptop/HP berbeda dari laptop backend.

Gunakan IP laptop backend:

http://192.168.1.34:3000
21. Logout

Backend tidak memiliki endpoint logout.

Logout dilakukan di frontend dengan menghapus JWT Token yang tersimpan di device.

22. Teknologi Backend
Node.js
Hono
TypeScript
PostgreSQL
Prisma ORM
JWT
bcrypt
Zod
23. Database

Database utama menggunakan PostgreSQL.

Model database:

User
Conversation
Message
Food

Relasi:

User
 │
 └── Conversation
       │
       └── Message

Food berdiri sebagai data menu yang digunakan oleh backend dan AI.
```
