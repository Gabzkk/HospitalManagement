-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('Present', 'Absent', 'Leave', 'Off');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'NURSE';
ALTER TYPE "Role" ADD VALUE 'HR';
ALTER TYPE "Role" ADD VALUE 'SECRETARY';
ALTER TYPE "Role" ADD VALUE 'CASHIER';

-- CreateTable
CREATE TABLE "Vital" (
    "vitalId" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "temperature" DECIMAL(4,1),
    "bloodPressure" TEXT,
    "heartRate" INTEGER,
    "oxygenLevel" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT,

    CONSTRAINT "Vital_pkey" PRIMARY KEY ("vitalId")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "attendanceId" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'Present',
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("attendanceId")
);

-- CreateIndex
CREATE INDEX "Vital_patientId_recordedAt_idx" ON "Vital"("patientId", "recordedAt");

-- CreateIndex
CREATE INDEX "Attendance_staffId_date_idx" ON "Attendance"("staffId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_staffId_date_key" ON "Attendance"("staffId", "date");

-- AddForeignKey
ALTER TABLE "Vital" ADD CONSTRAINT "Vital_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("patientId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("staffId") ON DELETE CASCADE ON UPDATE CASCADE;
