# Product Requirements Document (PRD)
# Task & Project Management API

**Versi:** 1.0
**Penulis:** Putra
**Tanggal:** Juli 2026
**Status:** Draft — untuk proyek portofolio

---

## 1. Latar Belakang & Tujuan

### 1.1 Latar Belakang
Banyak tim kecil/startup membutuhkan alat sederhana untuk mengelola proyek dan tugas tanpa kompleksitas tools enterprise seperti Jira. Proyek ini membangun backend API untuk aplikasi manajemen tugas & proyek (mirip Trello/Asana versi sederhana), dengan fokus pada desain database relasional yang solid, kolaborasi multi-user, dan update real-time.

### 1.2 Tujuan Proyek
- Menunjukkan kemampuan merancang REST API yang scalable dan aman.
- Mendemonstrasikan penanganan relasi data kompleks (many-to-many, role & permission).
- Mengimplementasikan fitur real-time (WebSocket) sebagai nilai tambah teknis.
- Menghasilkan portofolio backend yang production-grade, lengkap dengan dokumentasi dan deployment.

### 1.3 Target Pengguna
- Tim kecil (5–20 orang) yang butuh mengelola proyek & tugas harian.
- Digunakan sebagai studi kasus portofolio, tapi didesain agar bisa dipakai nyata.

---

## 2. Ruang Lingkup (Scope)

### 2.1 In-Scope (MVP)
- Manajemen workspace, project, dan task
- Multi-user dengan role & permission per workspace
- Assignment task ke banyak user (many-to-many)
- Real-time update saat task berubah status
- Activity log / audit trail
- Autentikasi & otorisasi (JWT)

### 2.2 Out of Scope (untuk versi awal)
- Aplikasi frontend/mobile
- Integrasi kalender eksternal (Google Calendar dll.)
- Sistem billing/subscription
- Notifikasi push mobile

---

## 3. Peran & Hak Akses (Roles & Permissions)

| Role | Deskripsi | Hak Akses Utama |
|---|---|---|
| **Owner** | Pembuat workspace | Full access: kelola member, project, billing (future) |
| **Admin** | Diberi akses oleh owner | Kelola project & task, invite/remove member |
| **Member** | Anggota biasa | Buat/edit task yang di-assign, komentar, update status |
| **Viewer** | Akses read-only | Hanya melihat project & task |

---

## 4. Functional Requirements

### 4.1 Autentikasi & User Management
- Register, login, logout
- JWT access token + refresh token
- Update profil, ganti password
- (Opsional) Login via Google OAuth

### 4.2 Workspace Management
- Create/update/delete workspace
- Invite member via email (dengan token invite)
- Assign role member dalam workspace
- List semua workspace milik user

### 4.3 Project Management
- CRUD project di dalam workspace
- Project punya status: `active`, `archived`, `completed`
- Project memiliki banyak task

### 4.4 Task Management
- CRUD task di dalam project
- Task punya: judul, deskripsi, status (`todo`, `in_progress`, `review`, `done`), prioritas (`low`, `medium`, `high`), due date
- Assign task ke satu atau lebih user (many-to-many)
- Sub-task (opsional, nice-to-have)
- Komentar pada task
- Attachment file pada task (upload ke cloud storage)

### 4.5 Real-Time Update
- Saat task diupdate (status/assignment berubah), user lain yang terlibat menerima update real-time via WebSocket (Socket.io)
- Notifikasi in-app saat di-assign task baru

### 4.6 Activity Log
- Setiap perubahan penting (create/update/delete task, ubah role, dll.) tercatat dalam activity log
- Log bisa dilihat per project atau per task

### 4.7 Search & Filter
- Filter task berdasarkan status, prioritas, assignee, due date
- Search task berdasarkan judul/deskripsi

---

## 5. Non-Functional Requirements

| Aspek | Requirement |
|---|---|
| **Security** | Password hashing (bcrypt), JWT dengan expiry, validasi input (prevent SQL injection & XSS) |
| **Performance** | Response time API < 300ms untuk operasi standar (non-search) |
| **Scalability** | Desain database mendukung penambahan workspace/project tanpa perubahan skema besar |
| **Reliability** | Uptime deployment minimal 99% (untuk demo) |
| **Maintainability** | Kode modular (controller-service-repository pattern), linting konsisten |
| **Dokumentasi** | API terdokumentasi lengkap via Swagger/OpenAPI |

---

## 6. Data Model (Ringkasan Entitas)

```
User (id, name, email, password_hash, created_at)
Workspace (id, name, owner_id, created_at)
WorkspaceMember (id, workspace_id, user_id, role)
Project (id, workspace_id, name, description, status, created_at)
Task (id, project_id, title, description, status, priority, due_date, created_by)
TaskAssignee (id, task_id, user_id)   -- many-to-many
Comment (id, task_id, user_id, content, created_at)
Attachment (id, task_id, file_url, uploaded_by)
ActivityLog (id, workspace_id, user_id, action, entity_type, entity_id, created_at)
```

**Relasi kunci:**
- 1 Workspace → banyak Project
- 1 Project → banyak Task
- Task ↔ User = many-to-many (lewat TaskAssignee)
- 1 Task → banyak Comment & Attachment

---

## 7. Contoh Endpoint API (Ringkas)

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh-token

GET    /workspaces
POST   /workspaces
POST   /workspaces/:id/invite
PATCH  /workspaces/:id/members/:userId (ubah role)

GET    /workspaces/:id/projects
POST   /workspaces/:id/projects
PATCH  /projects/:id
DELETE /projects/:id

GET    /projects/:id/tasks?status=todo&assignee=userId
POST   /projects/:id/tasks
PATCH  /tasks/:id
DELETE /tasks/:id
POST   /tasks/:id/assignees
POST   /tasks/:id/comments
POST   /tasks/:id/attachments

GET    /projects/:id/activity-log
```

---

## 8. Tech Stack yang Disarankan

| Layer | Teknologi |
|---|---|
| Runtime | Node.js + Express.js / TypeScript |
| Database | PostgreSQL (relasi kompleks lebih cocok) |
| ORM | Prisma / TypeORM |
| Real-time | Socket.io |
| Auth | JWT (jsonwebtoken) + bcrypt |
| File storage | Cloudinary / AWS S3 |
| Dokumentasi API | Swagger (OpenAPI) |
| Deployment | Railway / Render |
| Testing | Jest + Supertest |

---

## 9. Success Metrics (untuk Portofolio)

- API terdeploy live dan bisa diakses via Postman/Swagger
- Minimal 80% endpoint utama memiliki unit/integration test
- Dokumentasi lengkap (README + ERD + Swagger)
- Demo real-time update berjalan (video/gif di README)

---

## 10. Milestone & Estimasi Waktu

| Fase | Deliverable | Estimasi |
|---|---|---|
| 1 | Setup project, auth, database schema | 3–4 hari |
| 2 | CRUD workspace & project | 3 hari |
| 3 | CRUD task + assignment | 4–5 hari |
| 4 | Real-time (Socket.io) + activity log | 3–4 hari |
| 5 | Testing, dokumentasi, deployment | 3–4 hari |
| **Total** | | **~3 minggu** |
