Role: You are a senior full-stack engineer specializing in Node.js, Express, PostgreSQL, Prisma ORM, and React (Vite). You build production-grade CRUD systems with authentication, RBAC, validation, and reporting.

Objective:
Build a fully functioning Hospital Management System (pure software) with:
- Backend: Node.js + Express + PostgreSQL + Prisma
- Frontend: React + Vite
- Normalized relational database
- Auth + RBAC (Admin, Doctor, Staff)
- Full CRUD modules + reporting
- Seed data + local run instructions

Non-negotiable Data Model (Normalized):
Use these tables/models ONLY (you may add audit fields like createdAt/updatedAt):
1) patients: patientId (PK), patientName, address, phone, email (unique), gender, age
2) doctors: doctorId (PK), name, department, specialization, phone, email (unique)
3) staff: staffId (PK), name, address, phone, email (unique), department, specialization
4) staffShifts: shiftId (PK), staffId (FK), loginTime, logoutTime
5) appointments: appointmentId (PK), patientId (FK), doctorId (FK), appointmentDateTime, department, status
6) medicalRecords: recordId (PK), appointmentId (FK), patientId (FK), doctorId (FK), diagnosis, treatment, plan, medication, amountPaid, createdAt
7) bills: billingId (PK), patientId (FK), department, totalAmount, amountPaid, paymentStatus, createdAt
8) billItems: itemId (PK), billingId (FK), itemType, description, amount

Critical Normalization Rules:
- DO NOT duplicate patient demographics (name/address/phone/email/gender/age) in medicalRecords or bills.
- Display patient details via JOINs in queries.
- Enforce appointment-medical record consistency: medicalRecords.appointmentId must match the same patientId and doctorId as in appointments.

Backend Requirements:
- Use Express with layered architecture:
  - src/
    - server.js
    - app.js
    - routes/
    - controllers/
    - services/
    - middleware/
    - validators/
    - prisma/
    - utils/
- Use Prisma for schema + migrations.
- Use Zod (or Joi) for request validation.
- Use bcrypt for password hashing.
- Use JWT auth (access token) + refresh token OR simple JWT + short expiry (document decision).
- RBAC middleware:
  - Admin: full access
  - Doctor: can read patients; manage medicalRecords for own appointments; view own appointments
  - Staff: manage patients, appointments, billing; cannot edit medical diagnosis fields

Auth + Users:
Implement a users table for login (this is the only allowed additional table):
- users: userId, email (unique), passwordHash, role (ADMIN|DOCTOR|STAFF), linkedDoctorId (nullable), linkedStaffId (nullable), createdAt
Rules:
- If role=DOCTOR, linkedDoctorId must be set.
- If role=STAFF, linkedStaffId must be set.

API Endpoints (REST):
Auth
- POST /api/auth/login
- POST /api/auth/logout (optional if stateless JWT)
- GET  /api/auth/me

Patients
- GET /api/patients?search=&page=&limit=
- POST /api/patients
- GET /api/patients/:id
- PUT /api/patients/:id
- DELETE /api/patients/:id

Doctors
- GET /api/doctors?department=&specialization=
- POST /api/doctors (Admin only)
- GET /api/doctors/:id
- PUT /api/doctors/:id (Admin only)
- DELETE /api/doctors/:id (Admin only)

Staff
- CRUD (Admin only for create/delete; Staff can view own profile)

Appointments
- GET /api/appointments?dateFrom=&dateTo=&doctorId=&patientId=&status=
- POST /api/appointments
- PUT /api/appointments/:id (reschedule/change status)
- DELETE /api/appointments/:id (cancel)
Rules:
- Prevent double booking per doctor per appointmentDateTime (transactional check).
- Status enum: scheduled, completed, cancelled, no_show

Medical Records
- GET /api/medical-records?patientId=&doctorId=&dateFrom=&dateTo=
- POST /api/medical-records
- PUT /api/medical-records/:id
Rules:
- Doctor can only create/update records for appointments where appointments.doctorId == linkedDoctorId.
- Must verify appointmentId exists and matches patientId/doctorId in request.
- Optionally: only allow creation if appointment status is completed (or set to completed when record finalized).

Billing
- GET /api/bills?patientId=&status=
- POST /api/bills (create bill)
- POST /api/bills/:id/items (add bill item)
- DELETE /api/bills/:id/items/:itemId
- POST /api/bills/:id/payments (record payment)
Rules:
- totalAmount must be computed from billItems (server-side).
- paymentStatus logic:
  - unpaid if amountPaid=0
  - partial if 0<amountPaid<totalAmount
  - paid if amountPaid=totalAmount

Reports (Admin)
- GET /api/reports/summary?dateFrom=&dateTo=
Return:
- totalAppointments, completedAppointments, cancelledAppointments
- revenueTotal, revenueByDay
- topDepartmentsByAppointments
- doctorWorkload

Database / Prisma Requirements:
- Provide prisma/schema.prisma with relations, enums, indexes.
- Use migrations (prisma migrate dev).
- Add indexes:
  - appointments(doctorId, appointmentDateTime)
  - appointments(patientId, appointmentDateTime)
  - bills(patientId, createdAt)
- Use decimal types for money.

Seed Data:
- Create a seed script:
  - 10 patients
  - 5 doctors
  - 5 staff
  - 3 users (admin, doctor, staff) with known passwords (document)
  - 20 appointments across dates
  - 10 bills with billItems and mixed payment statuses

Frontend Requirements (React + Vite):
- Role-based UI:
  - Admin dashboard (reports + management)
  - Doctor dashboard (today’s appointments + medical records)
  - Staff dashboard (patients + appointments + billing)
- Pages:
  - Login
  - Patients list + patient profile (appointments/records/billing tabs)
  - Doctors list
  - Appointments scheduler (table + create/reschedule)
  - Medical record editor (doctor only)
  - Billing (create bill, add items, accept payment, printable invoice)
  - Reports (Admin only)

Frontend Tech:
- React Router
- Axios
- Form validation (react-hook-form + zod preferred)
- Data tables with pagination and search
- Use a clean, responsive layout

Security + Quality:
- Server-side validation on all routes
- Proper HTTP codes and consistent error format:
  { "error": { "code": "...", "message": "...", "details": [...] } }
- No secret keys in code; use .env
- Provide README with:
  - prerequisites
  - setup steps
  - env sample
  - migration commands
  - seed command
  - run backend + frontend

Deliverables:
1) Prisma schema + migrations
2) Express backend with routes/controllers/services
3) React frontend with all pages
4) Seed script
5) README with run instructions
6) Sample API calls (curl) OR Postman collection

Start by implementing:
- Prisma schema + migrate + seed
- Auth + RBAC middleware
- Patients CRUD
Then proceed with appointments, medical records, billing, reports, and finally frontend.

[// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  DOCTOR
  STAFF
}

enum AppointmentStatus {
  scheduled
  completed
  cancelled
  no_show
}

enum PaymentStatus {
  unpaid
  partial
  paid
}

enum BillItemType {
  consultation
  lab
  procedure
  medicine
  other
}

model User {
  userId        Int      @id @default(autoincrement())
  email         String   @unique
  passwordHash  String
  role          Role

  // Link the account to either a doctor or staff profile (optional for ADMIN).
  linkedDoctorId Int?
  linkedStaffId  Int?

  linkedDoctor  Doctor?  @relation(fields: [linkedDoctorId], references: [doctorId], onDelete: SetNull)
  linkedStaff   Staff?   @relation(fields: [linkedStaffId], references: [staffId], onDelete: SetNull)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([role])
}

model Patient {
  patientId    Int      @id @default(autoincrement())
  patientName  String
  address      String?
  phone        String?
  email        String?  @unique
  gender       String?
  age          Int?

  appointments Appointment[]
  bills        Bill[]

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([patientName])
}

model Doctor {
  doctorId        Int      @id @default(autoincrement())
  name            String
  department      String?
  specialization  String?
  phone           String?
  email           String?  @unique

  appointments    Appointment[]
  users           User[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([department])
  @@index([specialization])
  @@index([name])
}

model Staff {
  staffId         Int      @id @default(autoincrement())
  name            String
  address         String?
  phone           String?
  email           String?  @unique
  department      String?
  specialization  String?

  shifts          StaffShift[]
  users           User[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([department])
  @@index([name])
}

model StaffShift {
  shiftId    Int      @id @default(autoincrement())
  staffId    Int
  loginTime  DateTime
  logoutTime DateTime?

  staff      Staff    @relation(fields: [staffId], references: [staffId], onDelete: Cascade)

  @@index([staffId, loginTime])
}

model Appointment {
  appointmentId      Int               @id @default(autoincrement())
  patientId          Int
  doctorId           Int
  appointmentDateTime DateTime
  department         String?
  status             AppointmentStatus @default(scheduled)

  patient            Patient           @relation(fields: [patientId], references: [patientId], onDelete: Restrict)
  doctor             Doctor            @relation(fields: [doctorId], references: [doctorId], onDelete: Restrict)

  // Normalized medical record: tie records to appointment only.
  // Patient & Doctor for the record are derived through the Appointment relation.
  medicalRecord      MedicalRecord?

  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  // Prevent double-booking: one doctor cannot have two appointments at the same exact date/time.
  @@unique([doctorId, appointmentDateTime])

  @@index([patientId, appointmentDateTime])
  @@index([doctorId, appointmentDateTime])
  @@index([status])
}

model MedicalRecord {
  recordId       Int      @id @default(autoincrement())
  appointmentId  Int      @unique

  diagnosis      String?
  treatment      String?
  plan           String?
  medication     String?

  // If you need to store payment at record level:
  amountPaid     Decimal  @default(0.00) @db.Decimal(12, 2)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  appointment    Appointment @relation(fields: [appointmentId], references: [appointmentId], onDelete: Cascade)
}

model Bill {
  billingId      Int          @id @default(autoincrement())
  patientId      Int
  department     String?

  totalAmount    Decimal      @default(0.00) @db.Decimal(12, 2)
  amountPaid     Decimal      @default(0.00) @db.Decimal(12, 2)
  paymentStatus  PaymentStatus @default(unpaid)

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  patient        Patient      @relation(fields: [patientId], references: [patientId], onDelete: Restrict)
  items          BillItem[]

  @@index([patientId, createdAt])
  @@index([paymentStatus])
}

model BillItem {
  itemId      Int        @id @default(autoincrement())
  billingId   Int
  itemType    BillItemType @default(other)
  description String?
  amount      Decimal    @db.Decimal(12, 2)

  bill        Bill       @relation(fields: [billingId], references: [billingId], onDelete: Cascade)

  @@index([billingId])
}
]
