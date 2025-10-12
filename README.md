# 🌿 Civica – Aplikasi Pembelajaran Pancasila

**Civica** adalah aplikasi web pembelajaran interaktif berbasis **Pancasila dan Kewarganegaraan (PKWN)**.  
Aplikasi ini dirancang agar proses belajar menjadi lebih menarik dan menyenangkan melalui kombinasi **modul belajar, kuis interaktif, dan mini games**.  

---

## 🚀 Fitur Utama
- 🔐 **Autentikasi & Profil:** Register, Login, Logout, ubah nama, foto, dan bio pengguna.  
- 🏠 **Dashboard:** Menampilkan progres modul, skor kuis rata-rata, statistik game, serta quotes harian motivasi.  
- 📘 **Modul Pembelajaran:** 9 modul PKWN sesuai kurikulum dalam format PDF interaktif.  
- 🧠 **Kuis Interaktif:** Soal **Pilihan Ganda (PG)** dan **Benar/Salah** dengan penilaian otomatis.  
- 🎮 **Mini Games:**  
  - *Memory Card* – mencocokkan pasangan kartu sila–simbol atau tokoh–peran.  
  - *Fortune Wheel* – menjawab soal singkat dengan sistem roda keberuntungan.  

---

## ⚙️ Teknologi yang Digunakan
**Frontend:** HTML, CSS, JavaScript, TailwindCSS  
**Backend:** FastAPI (Python)  
**Database:** SQLite / PostgreSQL (SQLAlchemy ORM)  
**Autentikasi:** JWT (JSON Web Token)  
**Hosting:** Frontend di **Vercel**, Backend di **Railway**

---

## 🌐 Akses Aplikasi
Aplikasi Civica dapat digunakan langsung tanpa instalasi lokal:

- **Frontend (Vercel):** [https://civica-web.vercel.app](https://civica-web.vercel.app)  
- **Backend API (Railway):** [https://civicaweb-production.up.railway.app](https://civicaweb-production.up.railway.app)

---

## 📡 API Endpoint Utama

| Endpoint | Method | Deskripsi |
|-----------|---------|-----------|
| `/auth/register` | POST | Registrasi pengguna baru |
| `/auth/login` | POST | Login dan mendapatkan token |
| `/users/me` | GET | Mendapatkan data pengguna saat ini |
| `/profile` | GET / PUT | Mengambil dan memperbarui profil pengguna |
| `/stats` | GET / PUT | Mengambil dan memperbarui progres belajar |
| `/games/memory-progress` | POST | Menyimpan progres permainan memory |
| `/games/highscore` | POST | Menyimpan skor tertinggi pengguna |

**Contoh Login:**
```json
POST /auth/login
{
  "username": "user@email.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## 🧱 Struktur Proyek
```
Civica_Web/
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── index.html
    ├── css/
    ├── js/
    │   ├── config.js
    │   ├── auth.js
    │   ├── dashboard.js
    │   ├── modules.js
    │   └── games.js
    └── pages/
        ├── login.html
        ├── register.html
        ├── dashboard.html
        ├── profile.html
        ├── modules.html
        └── games.html
```

---

## 👩‍💻 Pengembang

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/StefanyJosefina">
        <img src="https://avatars.githubusercontent.com/StefanyJosefina" width="120px" alt="Stefany Josefina"/><br/>
        <sub><b>Stefany Josefina</b></sub>
      </a>
      <br/>
      💻 Fullstack Developer & Creator of Civica Web App
    </td>
  </tr>
</table>

📬 **GitHub:** [@StefanyJosefina](https://github.com/StefanyJosefina)  
🌐 **Portfolio / Project:** [https://civica-web.vercel.app](https://civica-web.vercel.app)
