const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.staffShift.deleteMany();
  await prisma.user.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.patient.deleteMany();

  console.log('Cleaned database');

  // Create Admin User (no linked profile)
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@hospital.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create Doctors
  const doctors = [];
  const departments = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General'];
  for (let i = 0; i < 5; i++) {
    const doctor = await prisma.doctor.create({
      data: {
        name: `Dr. Smith ${i + 1}`,
        department: departments[i % departments.length],
        specialization: 'Surgeon',
        email: `doctor${i + 1}@hospital.com`,
        phone: `555-010${i}`,
      },
    });
    doctors.push(doctor);
  }

  // Create Doctor User
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  await prisma.user.create({
    data: {
      email: doctors[0].email,
      passwordHash: doctorPassword,
      role: 'DOCTOR',
      linkedDoctorId: doctors[0].doctorId,
    },
  });

  // Create Staff
  const staffMembers = [];
  for (let i = 0; i < 5; i++) {
    const staff = await prisma.staff.create({
      data: {
        name: `Nurse Joy ${i + 1}`,
        department: departments[i % departments.length],
        specialization: 'Nurse',
        email: `staff${i + 1}@hospital.com`,
        phone: `555-020${i}`,
      },
    });
    staffMembers.push(staff);
  }

  // Create Staff User
  const staffPassword = await bcrypt.hash('staff123', 10);
  await prisma.user.create({
    data: {
      email: staffMembers[0].email,
      passwordHash: staffPassword,
      role: 'STAFF',
      linkedStaffId: staffMembers[0].staffId,
    },
  });

  // Create Patients
  const patients = [];
  for (let i = 0; i < 10; i++) {
    const patient = await prisma.patient.create({
      data: {
        patientName: `Patient Zero ${i + 1}`,
        address: '123 Hospital St',
        phone: `555-030${i}`,
        email: `patient${i + 1}@gmail.com`,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        age: 20 + i * 2,
      },
    });
    patients.push(patient);
  }

  // Create Appointments
  for (let i = 0; i < 20; i++) {
    const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
    const randomPatient = patients[Math.floor(Math.random() * patients.length)];
    // Ensure unique time for doctor
    const date = new Date();
    date.setDate(date.getDate() + (i % 5)); // Spread over 5 days
    date.setHours(9 + (i % 8), 0, 0, 0); // 9 AM to 5 PM

    try {
        await prisma.appointment.create({
            data: {
              patientId: randomPatient.patientId,
              doctorId: randomDoctor.doctorId,
              appointmentDateTime: date,
              department: randomDoctor.department,
              status: 'scheduled',
            },
          });
    } catch (e) {
        // Ignore unique constraint violations for random seed
    }
  }

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
