import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Map each role to its default dashboard route
export const ROLE_DASHBOARDS = {
  ADMIN: '/dashboard',
  DOCTOR: '/doctor-dashboard',
  NURSE: '/nurse-dashboard',
  HR: '/hr-dashboard',
  SECRETARY: '/secretary-dashboard',
  CASHIER: '/cashier-dashboard',
  STAFF: '/dashboard',
};

// Mock users for instant demo login — no backend needed
const MOCK_USERS = {
  ADMIN:     { id: 1, name: 'Admin User',      email: 'admin@hospital.com',     role: 'ADMIN' },
  DOCTOR:    { id: 2, name: 'Dr. Alex Smith',  email: 'doctor@hospital.com',    role: 'DOCTOR' },
  NURSE:     { id: 3, name: 'Nurse Joy Park',  email: 'nurse@hospital.com',     role: 'NURSE' },
  HR:        { id: 4, name: 'Grace HR Tan',    email: 'hr@hospital.com',        role: 'HR' },
  SECRETARY: { id: 5, name: 'Sam Reception',   email: 'secretary@hospital.com', role: 'SECRETARY' },
  CASHIER:   { id: 6, name: 'Carla Billing',   email: 'cashier@hospital.com',   role: 'CASHIER' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // mockRole overrides user.role for prototyping
  const [mockRole, setMockRole] = useState(() => localStorage.getItem('mockRole') || null);

  useEffect(() => {
    const savedMockRole = localStorage.getItem('mockRole');
    const savedMockUser = localStorage.getItem('mockUser');
    const token = localStorage.getItem('token');

    // If we have a mock session but no token (from old prototype flow), auto-fetch a token
    if (savedMockRole && savedMockUser) {
      if (!token) {
        api.post('/auth/mock-login', { role: savedMockRole })
          .then(({ data }) => {
             localStorage.setItem('token', data.token);
             setUser(data.user);
             setMockRole(savedMockRole);
          })
          .catch(() => {
             try { setUser(JSON.parse(savedMockUser)); } catch (_) {}
             setMockRole(savedMockRole);
          })
          .finally(() => setLoading(false));
        return;
      }

      try {
        setUser(JSON.parse(savedMockUser));
        setMockRole(savedMockRole);
        setLoading(false);
        return;
      } catch (_) {}
    }

    if (token) {
      api.get('/auth/me')
        .then(response => setUser(response.data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Real backend login
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.removeItem('mockRole');
    localStorage.removeItem('mockUser');
    setMockRole(null);
    setUser(data.user);
    return data.user;
  };

  // Instant mock login — calls backend for a real JWT
  const mockLogin = async (role) => {
    const mockUser = MOCK_USERS[role] || MOCK_USERS.ADMIN;
    try {
      const { data } = await api.post('/auth/mock-login', { role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('mockRole', role);
      localStorage.setItem('mockUser', JSON.stringify(data.user));
      setUser(data.user);
      setMockRole(role);
      return data.user;
    } catch (err) {
      // Fallback to client-only mock if backend is unavailable
      console.warn('Mock login backend unavailable, falling back to client-only mock');
      localStorage.removeItem('token');
      localStorage.setItem('mockRole', role);
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setUser(mockUser);
      setMockRole(role);
      return mockUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mockRole');
    localStorage.removeItem('mockUser');
    setUser(null);
    setMockRole(null);
  };

  const updateMockRole = (role) => {
    setMockRole(role);
    if (role) {
      const mockUser = MOCK_USERS[role] || user;
      localStorage.setItem('mockRole', role);
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setUser(mockUser);
    } else {
      localStorage.removeItem('mockRole');
      localStorage.removeItem('mockUser');
    }
  };

  // activeRole is what the UI uses, mockRole always wins if set
  const activeRole = mockRole || user?.role || 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, mockLogin, logout, loading, mockRole, setMockRole: updateMockRole, activeRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
