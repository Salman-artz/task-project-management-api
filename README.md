# Task & Project Management API

REST API untuk manajemen workspace, project, task, dan kolaborasi tim. Project ini merupakan backend aplikasi task management sederhana seperti Trello atau Asana, dibangun dengan Node.js, Express, TypeScript, Sequelize, dan MySQL.

## Fitur

- Register, login, refresh token, profile, dan ganti password
- Multi-workspace dengan invite member dan pengaturan role
- Role-based access control: Owner, Admin, Member, dan Viewer
- CRUD project dengan status active, archived, dan completed
- CRUD task dengan status, prioritas, due date, filter, dan pencarian
- Assignment task ke banyak user
- Komentar dan attachment pada task
- Activity log untuk audit perubahan workspace dan project
- Update task real-time menggunakan Socket.io
- Upload attachment melalui Cloudinary secara opsional
- Dokumentasi API menggunakan Swagger UI

## Tech Stack

| Area | Teknologi |
| --- | --- |
| Runtime | Node.js dan Express 5 |
| Language | TypeScript |
| Database | MySQL |
| ORM | Sequelize 6 |
| Authentication | JWT dan bcryptjs |
| Validation | express-validator |
| Real-time | Socket.io |
| File storage | Cloudinary (opsional) |
| Testing | Jest dan Supertest |

## Prasyarat

- Node.js 18 atau lebih baru
- npm
- MySQL 8 atau kompatibel
- Cloudinary jika upload attachment digunakan

## Instalasi

```bash
git clone git@github.com:Salman-artz/task-project-management-api.git
cd task-project-management-api
npm install
```

Salin `.env.example` menjadi `.env`, kemudian sesuaikan konfigurasi database, JWT, CORS, dan Cloudinary.

```bash
copy .env.example .env
```

## Environment Variables

| Variable | Keterangan |
| --- | --- |
| `APP_PORT` | Port server, default `3000` |
| `NODE_ENV` | Environment aplikasi |
| `DB_HOST`, `DB_PORT` | Host dan port MySQL |
| `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Kredensial dan nama database |
| `JWT_SECRET` | Secret access token |
| `JWT_REFRESH_SECRET` | Secret refresh token |
| `JWT_EXPIRES_IN` | Masa berlaku access token |
| `JWT_REFRESH_EXPIRES_IN` | Masa berlaku refresh token |
| `CORS_ORIGIN` | Origin frontend yang diizinkan |
| `CLOUDINARY_CLOUD_NAME` | Nama cloud Cloudinary |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary |

## Database

Setup database, migration, dan seed sekaligus:

```bash
npm run db:setup
```

Atau jalankan secara terpisah:

```bash
npx sequelize-cli db:create
npm run migrate
npm run seed
```

Undo migration atau seed:

```bash
npm run migrate:undo
npm run seed:undo
```

## Menjalankan Project

Development dengan auto-reload:

```bash
npm run dev
```

Production:

```bash
npm start
```

Testing:

```bash
npm test
```

Server default berjalan di `http://localhost:3000`.

## Endpoint Utama

Base path API: `/api/v1`

| Modul | Endpoint |
| --- | --- |
| Auth | `/auth/register`, `/auth/login`, `/auth/refresh-token`, `/auth/me` |
| Workspace | `/workspaces`, `/workspaces/:id/invite`, `/workspaces/:id/members/:userId` |
| Project | `/workspaces/:id/projects`, `/projects/:id` |
| Task | `/projects/:id/tasks`, `/tasks/:id`, `/tasks/:id/assignees` |
| Collaboration | `/tasks/:id/comments`, `/tasks/:id/attachments` |
| Activity | `/workspaces/:id/activity-log`, `/projects/:id/activity-log` |
| Health | `/health` |

Request yang membutuhkan autentikasi menggunakan header:

```text
Authorization: Bearer <access-token>
```

## Struktur Project

```text
src/
  config/          Konfigurasi database dan environment
  controllers/     Handler request API
  database/        Sequelize models, migrations, dan seeders
  middlewares/     Authentication dan error handling
  routes/          Definisi endpoint
  services/        Business logic
  utils/           Helper dan formatter response
  validators/      Aturan validasi request
  index.js         Entry point server
tests/             Integration dan API tests
scripts/           Script maintenance
```

## Akun Seed

Seeder menyediakan akun demo dengan password `password123`:

| Email | Role |
| --- | --- |
| `owner@example.com` | Owner |
| `admin@example.com` | Admin |
| `member@example.com` | Member |
| `viewer@example.com` | Viewer |

## Repository

https://github.com/Salman-artz/task-project-management-api

## License

MIT
