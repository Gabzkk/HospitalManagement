# Hospital Management System

A full-stack Hospital Management System built with Node.js, Express, PostgreSQL, Prisma, and React (Vite).

## Features

- **Role-Based Access Control (RBAC)**: Admin, Doctor, Staff roles.
- **Authentication**: JWT-based login securely hashed with bcrypt.
- **Patient Management**: Full CRUD for patients with search and pagination.
- **Dashboard**: Role-specific dashboard views.
- **Database**: Normalized PostgreSQL schema with Prisma ORM.

## Prerequisites

- Node.js (v18+)
- Docker (for PostgreSQL database) or a local PostgreSQL instance.

## Setup Instructions

### 1. Database Setup

Start the PostgreSQL container:

```bash
docker run --name hospital-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

(Or configure your local Postgres in `backend/.env`)

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev --name init # Create DB tables
node -r dotenv/config prisma/seed.js # Seed initial data
npm run dev # Start server on port 3000
```

**Default Users:**

- Admin: `admin@hospital.com` / `admin123`
- Doctor: `doctor1@hospital.com` / `doctor123`
- Staff: `staff1@hospital.com` / `staff123`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev # Start client on http://localhost:5173
```

### 4. Run Both Services From Root

```bash
# from repository root
npm run dev
```

This starts:
- Backend API on `http://localhost:3000`
- Frontend on `http://localhost:5173`

If demo logins fail, reseed the DB:

```bash
cd backend
node -r dotenv/config prisma/seed.js
```

If login returns a server error, run:

```bash
cd backend
npx prisma migrate dev --name init
node -r dotenv/config prisma/seed.js
```

## API Documentation

The backend runs on `http://localhost:3000/api`.

- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user profile
- `GET /api/patients` - List patients (Paginated, Searchable)

## Project Structure

- `backend/` - Express API & Prisma Schema
- `frontend/` - React Vite Application
