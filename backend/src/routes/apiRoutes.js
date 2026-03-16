const express = require('express');
const router = express.Router();
const api = require('../controllers/apiControllers');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);

// Dashboard
router.get('/dashboard/stats', api.getDashboardStats);
router.get('/dashboard/analytics', api.getDashboardAnalytics);
router.get('/dashboard/billing-stats', api.getBillingStats);

// Notifications (Admin)
router.get('/notifications', authorizeRole(['ADMIN']), api.getNotifications);

// Appointments
router.get('/appointments', api.getAppointments);
router.post('/appointments', authorizeRole(['ADMIN', 'DOCTOR', 'SECRETARY']), api.createAppointment);

// Medical Records
router.get('/medical-records', api.getMedicalRecords);

// Bills
router.get('/bills', api.getBills);
router.get('/bills/:id', api.getBillById);
router.post('/bills', api.createBill);
router.put('/bills/:id/payment', api.recordPayment);

// Doctors
router.get('/doctors', api.getDoctors);
router.post('/doctors', authorizeRole(['ADMIN', 'HR']), api.createDoctor);

// Staff
router.get('/staff', api.getStaff);
router.post('/staff', authorizeRole(['ADMIN', 'HR']), api.createStaff);

// Vitals (Nurse)
router.get('/vitals', authorizeRole(['NURSE', 'ADMIN', 'DOCTOR']), api.getVitals);
router.post('/vitals', authorizeRole(['NURSE', 'ADMIN', 'DOCTOR']), api.createVital);

// Attendance (HR)
router.get('/attendance', authorizeRole(['HR', 'ADMIN']), api.getAttendance);
router.post('/attendance', authorizeRole(['HR', 'ADMIN']), api.createAttendance);
router.put('/attendance/:id', authorizeRole(['HR', 'ADMIN']), api.updateAttendance);

// Schedules (HR)
router.get('/schedules', authorizeRole(['HR', 'ADMIN']), api.getSchedules);

// Reports
router.get('/reports', api.getReports);

module.exports = router;
