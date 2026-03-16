-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOCTOR', 'STAFF');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'partial', 'paid');

-- CreateEnum
CREATE TYPE "BillItemType" AS ENUM ('consultation', 'lab', 'procedure', 'medicine', 'other');

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "linkedDoctorId" INTEGER,
    "linkedStaffId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Patient" (
    "patientId" SERIAL NOT NULL,
    "patientName" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "gender" TEXT,
    "age" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("patientId")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "doctorId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "specialization" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("doctorId")
);

-- CreateTable
CREATE TABLE "Staff" (
    "staffId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "department" TEXT,
    "specialization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("staffId")
);

-- CreateTable
CREATE TABLE "StaffShift" (
    "shiftId" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL,
    "logoutTime" TIMESTAMP(3),

    CONSTRAINT "StaffShift_pkey" PRIMARY KEY ("shiftId")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "appointmentId" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "appointmentDateTime" TIMESTAMP(3) NOT NULL,
    "department" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("appointmentId")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "recordId" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "plan" TEXT,
    "medication" TEXT,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("recordId")
);

-- CreateTable
CREATE TABLE "Bill" (
    "billingId" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "department" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("billingId")
);

-- CreateTable
CREATE TABLE "BillItem" (
    "itemId" SERIAL NOT NULL,
    "billingId" INTEGER NOT NULL,
    "itemType" "BillItemType" NOT NULL DEFAULT 'other',
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("itemId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Patient_patientName_idx" ON "Patient"("patientName");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- CreateIndex
CREATE INDEX "Doctor_department_idx" ON "Doctor"("department");

-- CreateIndex
CREATE INDEX "Doctor_specialization_idx" ON "Doctor"("specialization");

-- CreateIndex
CREATE INDEX "Doctor_name_idx" ON "Doctor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "Staff_department_idx" ON "Staff"("department");

-- CreateIndex
CREATE INDEX "Staff_name_idx" ON "Staff"("name");

-- CreateIndex
CREATE INDEX "StaffShift_staffId_loginTime_idx" ON "StaffShift"("staffId", "loginTime");

-- CreateIndex
CREATE INDEX "Appointment_patientId_appointmentDateTime_idx" ON "Appointment"("patientId", "appointmentDateTime");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_appointmentDateTime_idx" ON "Appointment"("doctorId", "appointmentDateTime");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_doctorId_appointmentDateTime_key" ON "Appointment"("doctorId", "appointmentDateTime");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_appointmentId_key" ON "MedicalRecord"("appointmentId");

-- CreateIndex
CREATE INDEX "Bill_patientId_createdAt_idx" ON "Bill"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "Bill_paymentStatus_idx" ON "Bill"("paymentStatus");

-- CreateIndex
CREATE INDEX "BillItem_billingId_idx" ON "BillItem"("billingId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_linkedDoctorId_fkey" FOREIGN KEY ("linkedDoctorId") REFERENCES "Doctor"("doctorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_linkedStaffId_fkey" FOREIGN KEY ("linkedStaffId") REFERENCES "Staff"("staffId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffShift" ADD CONSTRAINT "StaffShift_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("staffId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("patientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("doctorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("appointmentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("patientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "Bill"("billingId") ON DELETE CASCADE ON UPDATE CASCADE;
