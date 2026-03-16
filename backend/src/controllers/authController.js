const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getAuthErrorResponse = (error) => {
  const code = error?.code;
  const isDev = process.env.NODE_ENV !== 'production';

  if (code === 'P1001') {
    return {
      status: 503,
      body: { error: { message: 'Database is not reachable. Start PostgreSQL and retry.' } },
    };
  }

  if (code === 'P1003') {
    return {
      status: 500,
      body: { error: { message: 'Database does not exist. Run Prisma migrations.' } },
    };
  }

  if (code === 'P2021' || code === 'P2022') {
    return {
      status: 500,
      body: { error: { message: 'Database schema is out of date. Run Prisma migrations and seed.' } },
    };
  }

  if (isDev) {
    return {
      status: 500,
      body: {
        error: {
          message: 'Internal server error',
          details: error?.message || 'Unknown error',
        },
      },
    };
  }

  return { status: 500, body: { error: { message: 'Internal server error' } } };
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: { message: 'Email and password are required' } });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { linkedDoctor: true, linkedStaff: true }
    });

    if (!user) return res.status(401).json({ error: { message: 'Invalid credentials' } });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: { message: 'Invalid credentials' } });

    const payload = { 
        userId: user.userId, 
        role: user.role,
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: { 
      userId: user.userId, 
      email: user.email, 
      role: user.role,
      name: user.linkedDoctor?.name || user.linkedStaff?.name || 'Admin',
      modelId: user.linkedDoctorId || user.linkedStaffId || null
    }});
  } catch (error) {
    console.error(error);
    const response = getAuthErrorResponse(error);
    res.status(response.status).json(response.body);
  }
};

exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      include: { linkedDoctor: true, linkedStaff: true }
    });
    
    if (!user) return res.sendStatus(404);
    
    res.json({
        userId: user.userId,
        email: user.email,
        role: user.role,
        name: user.linkedDoctor?.name || user.linkedStaff?.name || 'Admin',
        details: user.linkedDoctor || user.linkedStaff || {}
    });
  } catch (error) {
    console.error(error);
    const response = getAuthErrorResponse(error);
    res.status(response.status).json(response.body);
  }
};

// Mock login — generates a real JWT for demo/prototyping without DB
const MOCK_USERS = {
  ADMIN:     { userId: 1, name: 'Admin User',      email: 'admin@hospital.com',     role: 'ADMIN' },
  DOCTOR:    { userId: 2, name: 'Dr. Alex Smith',   email: 'doctor@hospital.com',    role: 'DOCTOR' },
  NURSE:     { userId: 3, name: 'Nurse Joy Park',   email: 'nurse@hospital.com',     role: 'NURSE' },
  HR:        { userId: 4, name: 'Grace HR Tan',     email: 'hr@hospital.com',        role: 'HR' },
  SECRETARY: { userId: 5, name: 'Sam Reception',    email: 'secretary@hospital.com', role: 'SECRETARY' },
  CASHIER:   { userId: 6, name: 'Carla Billing',    email: 'cashier@hospital.com',   role: 'CASHIER' },
};

exports.mockLogin = (req, res) => {
  const { role } = req.body;
  const mockUser = MOCK_USERS[role] || MOCK_USERS.ADMIN;
  const payload = { userId: mockUser.userId, role: mockUser.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: mockUser });
};
