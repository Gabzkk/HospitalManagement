const prisma = require('../prisma/client');
const { broadcast } = require('../socket');

// ── Helper: build date ranges ─────────────────────────────────────
const getStartOfWeek = (d) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const start = new Date(d);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
};

const getStartOfYear = (d) => new Date(d.getFullYear(), 0, 1);

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Dashboard Stats (KPIs) ────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const [
            totalPatients,
            patientsLastWeek,
            patientsWeekBefore,
            todayAppointments,
            appointmentsLastWeek,
            appointmentsWeekBefore,
            pendingBills,
            totalRevenueAgg,
            totalPaidAgg,
            recentPatients,
            upcomingAppointments
        ] = await prisma.$transaction([
            prisma.patient.count(),
            prisma.patient.count({ where: { createdAt: { gte: weekAgo } } }),
            prisma.patient.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
            prisma.appointment.count({ where: { appointmentDateTime: { gte: today, lt: tomorrow } } }),
            prisma.appointment.count({ where: { appointmentDateTime: { gte: weekAgo, lt: today } } }),
            prisma.appointment.count({ where: { appointmentDateTime: { gte: twoWeeksAgo, lt: weekAgo } } }),
            prisma.bill.count({ where: { paymentStatus: { not: 'paid' } } }),
            prisma.bill.aggregate({ _sum: { totalAmount: true } }),
            prisma.bill.aggregate({ _sum: { amountPaid: true } }),
            prisma.patient.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { patientId: true, patientName: true, age: true, gender: true, phone: true, createdAt: true } }),
            prisma.appointment.findMany({
                where: { appointmentDateTime: { gte: today }, status: 'scheduled' },
                take: 5,
                orderBy: { appointmentDateTime: 'asc' },
                include: { patient: { select: { patientName: true } }, doctor: { select: { name: true, department: true } } }
            })
        ]);

        const totalRevenue = Number(totalRevenueAgg._sum.totalAmount || 0);
        const totalPaid = Number(totalPaidAgg._sum.amountPaid || 0);
        const totalUnpaid = totalRevenue - totalPaid;

        // Trend calculations (week-over-week percentage change)
        const patientTrend = patientsWeekBefore > 0 ? Math.round(((patientsLastWeek - patientsWeekBefore) / patientsWeekBefore) * 100) : (patientsLastWeek > 0 ? 100 : 0);
        const appointmentTrend = appointmentsWeekBefore > 0 ? Math.round(((appointmentsLastWeek - appointmentsWeekBefore) / appointmentsWeekBefore) * 100) : (appointmentsLastWeek > 0 ? 100 : 0);

        res.json({
            totalPatients,
            patientsLastWeek,
            patientTrend,
            todayAppointments,
            appointmentsLastWeek,
            appointmentTrend,
            pendingBills,
            totalRevenue,
            totalPaid,
            totalUnpaid,
            recentPatients,
            upcomingAppointments
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// ── Dashboard Analytics (time-series) ─────────────────────────────
exports.getDashboardAnalytics = async (req, res) => {
    try {
        const period = req.query.period || 'month'; // week | month | year
        const now = new Date();
        let labels, startDate, groupBy;

        if (period === 'week') {
            startDate = getStartOfWeek(now);
            labels = [...DAY_NAMES];
            groupBy = 'day_of_week';
        } else if (period === 'year') {
            const startYear = now.getFullYear() - 4;
            startDate = new Date(startYear, 0, 1);
            labels = [];
            for (let y = startYear; y <= now.getFullYear(); y++) labels.push(String(y));
            groupBy = 'year';
        } else {
            // month (default) — show all 12 months of current year
            startDate = getStartOfYear(now);
            labels = [...MONTH_NAMES];
            groupBy = 'month';
        }

        // Patient registrations over time
        const patients = await prisma.patient.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true }
        });

        // Appointments over time
        const appointments = await prisma.appointment.findMany({
            where: { appointmentDateTime: { gte: startDate } },
            select: { appointmentDateTime: true }
        });

        // Revenue over time (from bills)
        const bills = await prisma.bill.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true, totalAmount: true, amountPaid: true }
        });

        // Group into buckets
        const patientCounts = new Array(labels.length).fill(0);
        const appointmentCounts = new Array(labels.length).fill(0);
        const revenueTotals = new Array(labels.length).fill(0);

        const getIndex = (date) => {
            const d = new Date(date);
            if (groupBy === 'day_of_week') {
                let day = d.getDay(); // 0=Sun
                return day === 0 ? 6 : day - 1; // Convert to Mon=0
            } else if (groupBy === 'month') {
                return d.getMonth(); // 0-11
            } else {
                return d.getFullYear() - (now.getFullYear() - 4);
            }
        };

        patients.forEach(p => {
            const idx = getIndex(p.createdAt);
            if (idx >= 0 && idx < labels.length) patientCounts[idx]++;
        });

        appointments.forEach(a => {
            const idx = getIndex(a.appointmentDateTime);
            if (idx >= 0 && idx < labels.length) appointmentCounts[idx]++;
        });

        bills.forEach(b => {
            const idx = getIndex(b.createdAt);
            if (idx >= 0 && idx < labels.length) revenueTotals[idx] += Number(b.totalAmount || 0);
        });

        res.json({
            labels,
            totalPatients: patientCounts,
            appointments: appointmentCounts,
            revenue: revenueTotals
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// ── Billing Stats (Cashier KPIs) ──────────────────────────────────
exports.getBillingStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            totalBills,
            pendingBills,
            todayBills,
            totalRevenueAgg,
            totalPaidAgg,
            todayRevenueAgg,
            recentBills
        ] = await prisma.$transaction([
            prisma.bill.count(),
            prisma.bill.count({ where: { paymentStatus: { not: 'paid' } } }),
            prisma.bill.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
            prisma.bill.aggregate({ _sum: { totalAmount: true } }),
            prisma.bill.aggregate({ _sum: { amountPaid: true } }),
            prisma.bill.aggregate({ where: { createdAt: { gte: today, lt: tomorrow } }, _sum: { amountPaid: true } }),
            prisma.bill.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { patient: { select: { patientName: true } }, items: true }
            })
        ]);

        res.json({
            totalBills,
            pendingBills,
            todayBills,
            totalRevenue: Number(totalRevenueAgg._sum.totalAmount || 0),
            totalPaid: Number(totalPaidAgg._sum.amountPaid || 0),
            todayCollections: Number(todayRevenueAgg._sum.amountPaid || 0),
            recentBills
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// ── Appointments ──────────────────────────────────────────────────
exports.getAppointments = async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    try {
        const [data, count] = await prisma.$transaction([
            prisma.appointment.findMany({
                where: {},
                skip,
                take: parseInt(limit),
                include: { patient: true, doctor: true, medicalRecord: true },
                orderBy: { appointmentDateTime: 'desc' }
            }),
            prisma.appointment.count()
        ]);
        res.json({ data, meta: { total: count, page, last_page: Math.ceil(count / limit) } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// ── Medical Records ───────────────────────────────────────────────
exports.getMedicalRecords = async (req, res) => {
    try {
        const data = await prisma.medicalRecord.findMany({
            include: { appointment: { include: { patient: true, doctor: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ data, meta: { total: data.length } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// ── Bills (list) ──────────────────────────────────────────────────
exports.getBills = async (req, res) => {
    try {
        const data = await prisma.bill.findMany({
            include: { patient: true, items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ data, meta: { total: data.length } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// ── Bill by ID ────────────────────────────────────────────────────
exports.getBillById = async (req, res) => {
    try {
        const bill = await prisma.bill.findUnique({
            where: { billingId: parseInt(req.params.id) },
            include: { patient: true, items: true }
        });
        if (!bill) return res.status(404).json({ error: 'Bill not found' });
        res.json(bill);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// ── Create Bill ───────────────────────────────────────────────────
exports.createBill = async (req, res) => {
    try {
        const { patientId, department, items } = req.body;
        if (!patientId || !items || !items.length) {
            return res.status(400).json({ error: 'patientId and at least one item are required' });
        }

        const totalAmount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const bill = await prisma.bill.create({
            data: {
                patientId: parseInt(patientId),
                department: department || null,
                totalAmount,
                amountPaid: 0,
                paymentStatus: 'unpaid',
                items: {
                    create: items.map(item => ({
                        itemType: item.itemType || 'other',
                        description: item.description || null,
                        amount: Number(item.amount || 0)
                    }))
                }
            },
            include: { patient: true, items: true }
        });

        broadcast('bills', { action: 'created', bill });
        res.status(201).json(bill);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// ── Record Payment ────────────────────────────────────────────────
exports.recordPayment = async (req, res) => {
    try {
        const { amount } = req.body;
        const billingId = parseInt(req.params.id);
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'A positive payment amount is required' });
        }

        const bill = await prisma.bill.findUnique({ where: { billingId } });
        if (!bill) return res.status(404).json({ error: 'Bill not found' });

        const newAmountPaid = Number(bill.amountPaid) + Number(amount);
        const totalAmount = Number(bill.totalAmount);
        let paymentStatus = 'partial';
        if (newAmountPaid >= totalAmount) paymentStatus = 'paid';
        else if (newAmountPaid <= 0) paymentStatus = 'unpaid';

        const updated = await prisma.bill.update({
            where: { billingId },
            data: {
                amountPaid: Math.min(newAmountPaid, totalAmount),
                paymentStatus
            },
            include: { patient: true, items: true }
        });

        broadcast('bills', { action: 'payment', bill: updated });
        res.json(updated);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// ── Doctors ───────────────────────────────────────────────────────
exports.getDoctors = async (req, res) => {
    try {
        const data = await prisma.doctor.findMany();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// ── Staff ─────────────────────────────────────────────────────────
exports.getStaff = async (req, res) => {
    try {
        const data = await prisma.staff.findMany();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// ── Reports ───────────────────────────────────────────────────────
exports.getReports = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const [totalAppointments, monthAppointments, totalRevAgg, totalPatients] = await prisma.$transaction([
            prisma.appointment.count(),
            prisma.appointment.count({ where: { appointmentDateTime: { gte: monthStart } } }),
            prisma.bill.aggregate({ _sum: { totalAmount: true } }),
            prisma.patient.count()
        ]);

        res.json({
            summary: {
                totalAppointments,
                monthAppointments,
                revenue: Number(totalRevAgg._sum.totalAmount || 0),
                patients: totalPatients
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// ── Create Doctor ─────────────────────────────────────────────────
exports.createDoctor = async (req, res) => {
    try {
        const { name, department, specialization, phone, email } = req.body;
        if (!name) return res.status(400).json({ error: 'Doctor name is required' });
        const doctor = await prisma.doctor.create({
            data: { name, department: department || null, specialization: specialization || null, phone: phone || null, email: email || null }
        });
        broadcast('doctors', { action: 'created', doctor });
        res.status(201).json(doctor);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// ── Create Staff ──────────────────────────────────────────────────
exports.createStaff = async (req, res) => {
    try {
        const { name, department, specialization, phone, email, address } = req.body;
        if (!name) return res.status(400).json({ error: 'Staff name is required' });
        const staff = await prisma.staff.create({
            data: { name, department: department || null, specialization: specialization || null, phone: phone || null, email: email || null, address: address || null }
        });
        broadcast('staff', { action: 'created', staff });
        res.status(201).json(staff);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// ── Create Appointment ────────────────────────────────────────────
exports.createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, appointmentDateTime, department, status } = req.body;
        if (!patientId || !doctorId || !appointmentDateTime) {
            return res.status(400).json({ error: 'patientId, doctorId, and appointmentDateTime are required' });
        }
        const appointment = await prisma.appointment.create({
            data: {
                patientId: parseInt(patientId),
                doctorId: parseInt(doctorId),
                appointmentDateTime: new Date(appointmentDateTime),
                department: department || null,
                status: status || 'scheduled'
            },
            include: { patient: true, doctor: true }
        });
        broadcast('appointments', { action: 'created', appointment });
        res.status(201).json(appointment);
    } catch (e) {
        console.error(e);
        if (e.code === 'P2002') {
            return res.status(409).json({ error: 'Doctor already has an appointment at this date/time' });
        }
        res.status(500).json({ error: e.message });
    }
};

// ── Notifications (Admin) ─────────────────────────────────────────
exports.getNotifications = async (req, res) => {
    try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [recentPatients, recentAppointments, recentBills] = await prisma.$transaction([
            prisma.patient.findMany({ where: { createdAt: { gte: yesterday } }, take: 10, orderBy: { createdAt: 'desc' }, select: { patientName: true, createdAt: true } }),
            prisma.appointment.findMany({ where: { createdAt: { gte: yesterday } }, take: 10, orderBy: { createdAt: 'desc' }, include: { patient: { select: { patientName: true } }, doctor: { select: { name: true } } } }),
            prisma.bill.findMany({ where: { createdAt: { gte: yesterday } }, take: 10, orderBy: { createdAt: 'desc' }, include: { patient: { select: { patientName: true } } } })
        ]);

        const notifications = [
            ...recentPatients.map(p => ({ type: 'patient', message: `New patient registered: ${p.patientName}`, time: p.createdAt })),
            ...recentAppointments.map(a => ({ type: 'appointment', message: `Appointment: ${a.patient?.patientName || 'Patient'} with ${a.doctor?.name || 'Doctor'}`, time: a.createdAt })),
            ...recentBills.map(b => ({ type: 'bill', message: `New bill created for ${b.patient?.patientName || 'Patient'}: $${Number(b.totalAmount)}`, time: b.createdAt }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 20);

        res.json(notifications);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// ── Vitals ────────────────────────────────────────────────────────
exports.getVitals = async (req, res) => {
    try {
        // Get the most recent vital per patient
        const patients = await prisma.patient.findMany({
            select: {
                patientId: true, patientName: true, age: true, gender: true,
                vitals: { orderBy: { recordedAt: 'desc' }, take: 1 }
            },
            orderBy: { patientName: 'asc' }
        });
        res.json(patients);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createVital = async (req, res) => {
    try {
        const { patientId, temperature, bloodPressure, heartRate, oxygenLevel, recordedBy } = req.body;
        if (!patientId) return res.status(400).json({ error: 'patientId is required' });
        const vital = await prisma.vital.create({
            data: {
                patientId: parseInt(patientId),
                temperature: temperature ? parseFloat(temperature) : null,
                bloodPressure: bloodPressure || null,
                heartRate: heartRate ? parseInt(heartRate) : null,
                oxygenLevel: oxygenLevel ? parseInt(oxygenLevel) : null,
                recordedBy: recordedBy || null
            },
            include: { patient: { select: { patientName: true } } }
        });
        broadcast('vitals', { action: 'created', vital });
        res.status(201).json(vital);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// ── Attendance ────────────────────────────────────────────────────
exports.getAttendance = async (req, res) => {
    try {
        const { weekStart } = req.query;
        let startDate;
        if (weekStart) {
            startDate = new Date(weekStart);
        } else {
            startDate = new Date();
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
            startDate.setDate(diff);
        }
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const [staff, records] = await prisma.$transaction([
            prisma.staff.findMany({ orderBy: { name: 'asc' }, select: { staffId: true, name: true, department: true } }),
            prisma.attendance.findMany({
                where: { date: { gte: startDate, lt: endDate } },
                orderBy: { date: 'asc' }
            })
        ]);

        res.json({ staff, records, weekStart: startDate.toISOString() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createAttendance = async (req, res) => {
    try {
        const { staffId, date, status, notes, recordedBy } = req.body;
        if (!staffId || !date || !status) return res.status(400).json({ error: 'staffId, date, and status are required' });
        const record = await prisma.attendance.upsert({
            where: { staffId_date: { staffId: parseInt(staffId), date: new Date(date) } },
            update: { status, notes: notes || null, recordedBy: recordedBy || null },
            create: { staffId: parseInt(staffId), date: new Date(date), status, notes: notes || null, recordedBy: recordedBy || null }
        });
        broadcast('attendance', { action: 'updated', record });
        res.status(201).json(record);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const record = await prisma.attendance.update({
            where: { attendanceId: parseInt(req.params.id) },
            data: { status, notes: notes || null }
        });
        broadcast('attendance', { action: 'updated', record });
        res.json(record);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

// ── Schedules (HR) ────────────────────────────────────────────────
exports.getSchedules = async (req, res) => {
    try {
        const staff = await prisma.staff.findMany({
            include: { shifts: { orderBy: { loginTime: 'desc' }, take: 7 } },
            orderBy: { name: 'asc' }
        });
        res.json(staff);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
