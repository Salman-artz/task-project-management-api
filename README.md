# Task & Project Management API

Backend API untuk aplikasi manajemen tugas & proyek (mirip Trello/Asana versi sederhana). Dibangun dengan Node.js, Express, MySQL, dan Sequelize ORM.

## Fitur

- **Autentikasi JWT** — Register, login, refresh token, ganti password
- **Multi-Workspace** — Buat workspace, invite member, atur role
- **Manajemen Project** — CRUD project dengan status (active, archived, completed)
- **Manajemen Task** — CRUD task dengan status, prioritas, due date, filter & search
- **Assignment** — Assign task ke multiple user (many-to-many)
- **Komentar** — Komentar pada task
- **Attachment** — Upload attachment pada task
- **Activity Log** — Audit trail untuk setiap perubahan
- **Role-based Access Control** — Owner, Admin, Member, Viewer
- **Real-time (Socket.io)** — Update real-time saat task berubah (opsional)

## Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | Node.js + Express.js |
| Database | MySQL |
| ORM | Sequelize |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validasi | express-validator |
| Real-time | Socket.io |
| File storage | Cloudinary (opsional) |

## Prerequisites

- **Node.js v18+** — Download dari [nodejs.org](https://nodejs.org/)
- **MySQL 8.0+** — Sudah running di `localhost:3306`
- **npm** atau **yarn** — Biasanya sudah terinstall dengan Node.js

### Verifikasi Instalasi

```bash
# Cek Node.js
node --version

# Cek npm
npm --version

# Cek MySQL (pastikan MySQL service berjalan)
mysql --version
```

---

## Cara Install (Step-by-Step)

### 1️⃣ Clone Repository

```bash
# Gunakan SSH
git clone git@github.com:Salman-artz/task-project-management-api.git
cd task-project-management-api

# Atau gunakan HTTPS
git clone https://github.com/Salman-artz/task-project-management-api.git
cd task-project-management-api
```

### 2️⃣ Install Dependencies

```bash
npm install
```

Ini akan menginstall semua package yang didefinisikan di `package.json` (Express, Sequelize, JWT, Socket.io, dll).

### 3️⃣ Setup Environment Variables

```bash
# Copy .env.example menjadi .env
cp .env.example .env
```

Atau manual:
- Salin file `.env.example`
- Rename menjadi `.env`
- Edit sesuai konfigurasi lokal Anda

### 4️⃣ Konfigurasi Database

Edit file `.env` dengan kredensial MySQL Anda:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=task_project_db
```

**Pastikan MySQL service sudah running!**

### 5️⃣ Setup Database & Migration

```bash
# Pilihan 1: Jalankan semua sekaligus
npm run db:setup

# Pilihan 2: Jalankan step-by-step
npx sequelize-cli db:create        # Buat database
npx sequelize-cli db:migrate       # Jalankan migration
npx sequelize-cli db:seed:all      # (Opsional) Tambah data dummy
```

**Output yang diharapkan:**
```
✓ Database 'task_project_db' created
✓ Migrations applied successfully
✓ Seeds inserted
```

---

## Menjalankan Aplikasi

### 🚀 Development Mode (dengan Auto-Reload)

```bash
npm run dev
```

**Output yang diharapkan:**
```
Server running on http://localhost:3000
Database connected
✓ Ready for requests
```

Aplikasi akan **auto-reload** jika ada perubahan kode.

### 📦 Production Mode

```bash
npm start
```

Server akan berjalan di `http://localhost:3000` tanpa auto-reload.

### 🧪 Testing

```bash
npm test
```

---

## Troubleshooting

| Error | Solusi |
|-------|--------|
| **"Port 3000 already in use"** | Ubah `APP_PORT` di `.env` atau kill process yang menggunakan port 3000 |
| **"Unable to connect to database"** | Pastikan MySQL service running dan kredensial `.env` benar |
| **"EACCES: permission denied"** | Jalankan dengan `sudo` atau ubah permission folder |
| **"Module not found"** | Jalankan `npm install` ulang atau hapus `node_modules` dan jalankan `npm install` lagi |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `APP_PORT` | 3000 | Port server |
| `NODE_ENV` | development | Environment |
| `DB_HOST` | 127.0.0.1 | Host database |
| `DB_PORT` | 3306 | Port database |
| `DB_USERNAME` | root | Username database |
| `DB_PASSWORD` | (empty) | Password database |
| `DB_DATABASE` | task_project_db | Nama database |
| `JWT_SECRET` | (required) | Secret key untuk JWT |
| `JWT_EXPIRES_IN` | 15m | Expiry access token |
| `JWT_REFRESH_SECRET` | (required) | Secret key untuk refresh token |
| `JWT_REFRESH_EXPIRES_IN` | 7d | Expiry refresh token |
| `CORS_ORIGIN` | * | Origin CORS yang diizinkan |

## API Endpoints

### Autentikasi

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register user baru | No |
| POST | `/api/v1/auth/login` | Login | No |
| POST | `/api/v1/auth/refresh-token` | Refresh access token | No |
| GET | `/api/v1/auth/me` | Get profile | Yes |
| PATCH | `/api/v1/auth/me` | Update profile | Yes |
| POST | `/api/v1/auth/change-password` | Ganti password | Yes |

### Workspace

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/workspaces` | List workspace user | Yes |
| POST | `/api/v1/workspaces` | Buat workspace | Yes |
| GET | `/api/v1/workspaces/:id` | Detail workspace | Yes |
| PATCH | `/api/v1/workspaces/:id` | Update workspace | Yes |
| DELETE | `/api/v1/workspaces/:id` | Hapus workspace | Yes |
| POST | `/api/v1/workspaces/:id/invite` | Invite member | Yes |
| PATCH | `/api/v1/workspaces/:id/members/:userId` | Ubah role member | Yes |
| DELETE | `/api/v1/workspaces/:id/members/:userId` | Hapus member | Yes |

### Project

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/workspaces/:id/projects` | List project | Yes |
| POST | `/api/v1/workspaces/:id/projects` | Buat project | Yes |
| GET | `/api/v1/projects/:id` | Detail project | Yes |
| PATCH | `/api/v1/projects/:id` | Update project | Yes |
| DELETE | `/api/v1/projects/:id` | Hapus project | Yes |

### Task

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/projects/:id/tasks?status=&priority=&assignee=&search=` | Filter tasks | Yes |
| POST | `/api/v1/projects/:id/tasks` | Buat task | Yes |
| GET | `/api/v1/tasks/:id` | Detail task + comments + attachments | Yes |
| PATCH | `/api/v1/tasks/:id` | Update task | Yes |
| DELETE | `/api/v1/tasks/:id` | Hapus task | Yes |
| POST | `/api/v1/tasks/:id/assignees` | Assign users | Yes |
| POST | `/api/v1/tasks/:id/comments` | Tambah komentar | Yes |
| POST | `/api/v1/tasks/:id/attachments` | Tambah attachment | Yes |

### Activity Log

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/workspaces/:id/activity-log` | Log aktivitas workspace | Yes |
| GET | `/api/v1/projects/:id/activity-log` | Log aktivitas project | Yes |

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Health check |

## Struktur Folder

```
src/
├── config/           # Konfigurasi database
├── controllers/      # Controller (request handling)
├── database/
│   ├── migrations/   # Migration files (9 tabel)
│   ├── models/       # Sequelize models
│   └── seeders/      # Data dummy
├── middlewares/       # Auth, error handler
├── routes/           # Route definitions
├── services/         # Business logic
├── utils/            # Helper, response formatter, custom errors
├── validators/       # Input validation rules
└── index.js          # Entry point
```

## Data Dummy

Seeder yang tersedia (password semua user: `password123`):

| Email | Role | Deskripsi |
|---|---|---|
| owner@example.com | Owner | Pemilik workspace |
| admin@example.com | Admin | Admin workspace |
| member@example.com | Member | Anggota biasa |
| viewer@example.com | Viewer | Akses read-only |

## License

MIT
