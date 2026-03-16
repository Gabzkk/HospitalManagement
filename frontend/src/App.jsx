import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLE_DASHBOARDS } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import HRDashboard from './pages/HRDashboard';
import SecretaryDashboard from './pages/SecretaryDashboard';
import CashierDashboard from './pages/CashierDashboard';
import Patients from './pages/Patients';
import PatientForm from './pages/PatientForm';
import PatientDetails from './pages/PatientDetails';
import Doctors from './pages/Doctors';
import Staff from './pages/Staff';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import BillForm from './pages/BillForm';
import BillDetails from './pages/BillDetails';
import MedicalRecords from './pages/MedicalRecords';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Procedures from './pages/Procedures';
import Vitals from './pages/Vitals';
import Attendance from './pages/Attendance';
import Schedules from './pages/Schedules';

// Redirects to the correct dashboard based on active role
const RoleBasedRedirect = () => {
  const { activeRole } = useAuth();
  const route = ROLE_DASHBOARDS[activeRole] || '/dashboard';
  return <Navigate to={route} replace />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              {/* Root redirects to role-specific dashboard */}
              <Route path="/" element={<RoleBasedRedirect />} />

              {/* Admin / Staff Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Role-specific dashboards */}
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/nurse-dashboard" element={<NurseDashboard />} />
              <Route path="/hr-dashboard" element={<HRDashboard />} />
              <Route path="/secretary-dashboard" element={<SecretaryDashboard />} />
              <Route path="/cashier-dashboard" element={<CashierDashboard />} />

              {/* Shared / Admin pages */}
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/new" element={<PatientForm />} />
              <Route path="/patients/:id" element={<PatientDetails />} />
              <Route path="/patients/:id/edit" element={<PatientForm />} />

              <Route path="/doctors" element={<Doctors />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/my-appointments" element={<Appointments />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/billing/new" element={<BillForm />} />
              <Route path="/billing/:id" element={<BillDetails />} />
              <Route path="/medical-records" element={<MedicalRecords />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/procedures" element={<Procedures />} />
              <Route path="/vitals" element={<Vitals />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/schedules" element={<Schedules />} />

              {/* Catch-all for authorized routes */}
              <Route path="*" element={<RoleBasedRedirect />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
