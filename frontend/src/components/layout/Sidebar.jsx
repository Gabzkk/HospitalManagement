import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_DASHBOARDS } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Activity, 
  LogOut, 
  UserPlus, 
  Stethoscope,
  Settings,
  BarChart3,
  ClipboardList,
  Heart,
  Briefcase,
  UserCheck,
  Clock,
  Syringe,
  Building2,
  Coffee,
  WalletCards,
  PersonStanding,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { Button } from '../ui/Button';

// Per-role navigation configuration
const NAV_CONFIG = {
  ADMIN: {
    menu: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/patients', icon: Users, label: 'Patients' },
      { to: '/appointments', icon: Calendar, label: 'Appointments' },
      { to: '/billing', icon: CreditCard, label: 'Payments' },
      { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
      { to: '/staff', icon: UserPlus, label: 'Employee' },
      { to: '/medical-records', icon: Activity, label: 'Activity' },
    ],
    other: [
      { to: '/reports', icon: FileText, label: 'Reports' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
  DOCTOR: {
    menu: [
      { to: '/doctor-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/patients', icon: Users, label: 'My Patients' },
      { to: '/my-appointments', icon: Calendar, label: 'My Schedule' },
      { to: '/procedures', icon: Syringe, label: 'Procedures' },
    ],
    other: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
  NURSE: {
    menu: [
      { to: '/nurse-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/patients', icon: Users, label: 'My Patients' },
      { to: '/nurse-schedule', icon: Clock, label: 'Shift Schedule' },
      { to: '/vitals', icon: Heart, label: 'Vitals' },
    ],
    other: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
  HR: {
    menu: [
      { to: '/hr-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/staff', icon: Briefcase, label: 'Employees' },
      { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
      { to: '/attendance', icon: UserCheck, label: 'Attendance' },
      { to: '/schedules', icon: Calendar, label: 'Schedules' },
    ],
    other: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
  SECRETARY: {
    menu: [
      { to: '/secretary-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/appointments', icon: Calendar, label: 'Appointments' },
      { to: '/patients', icon: Users, label: 'Patients' },
      { to: '/walk-ins', icon: PersonStanding, label: 'Walk-ins' },
    ],
    other: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
  CASHIER: {
    menu: [
      { to: '/cashier-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/billing', icon: CreditCard, label: 'Billing' },
      { to: '/patients', icon: Users, label: 'Patients' },
      { to: '/reports', icon: BarChart3, label: 'Transactions' },
    ],
    other: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
  STAFF: {
    menu: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/patients', icon: Users, label: 'Patients' },
      { to: '/appointments', icon: Calendar, label: 'Appointments' },
      { to: '/billing', icon: CreditCard, label: 'Payments' },
      { to: '/medical-records', icon: Activity, label: 'Activity' },
    ],
    other: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
};

const NavItem = ({ to, icon: Icon, children, onClick }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    className={({ isActive }) => clsx(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium",
      isActive 
        ? "bg-[#2E7D5E] text-white shadow-sm" 
        : "text-gray-400 hover:bg-primary-900 hover:text-white"
    )}
  >
    <Icon className="h-[18px] w-[18px] flex-shrink-0" />
    {children}
  </NavLink>
);

const SectionLabel = ({ children }) => (
  <div className="pt-5 pb-2 px-3 text-[10px] font-semibold text-primary-700 uppercase tracking-widest">
    {children}
  </div>
);

export const Sidebar = ({ className, onClose }) => {
  const { user, activeRole, logout } = useAuth();
  const navigate = useNavigate();

  const navConfig = NAV_CONFIG[activeRole] || NAV_CONFIG.ADMIN;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={twMerge("flex flex-col h-full bg-primary-950 text-white w-[220px]", className)}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-primary-900/50">
        <div className="h-8 w-8 rounded-lg bg-[#00C97B] flex items-center justify-center">
          <Stethoscope className="h-4 w-4 text-white" />
        </div>
        <h1 className="text-lg font-bold tracking-wide">Medcare</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-0.5 scrollbar-thin">
        <SectionLabel>Menu</SectionLabel>
        {navConfig.menu.map((item) => (
          <NavItem key={item.to + item.label} to={item.to} icon={item.icon} onClick={onClose}>
            {item.label}
          </NavItem>
        ))}

        {navConfig.other.length > 0 && (
          <>
            <SectionLabel>Other Menu</SectionLabel>
            {navConfig.other.map((item) => (
              <NavItem key={item.to + item.label} to={item.to} icon={item.icon} onClick={onClose}>
                {item.label}
              </NavItem>
            ))}
          </>
        )}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-primary-900/50">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="h-9 w-9 rounded-full bg-[#2E7D5E] flex items-center justify-center text-sm font-semibold ring-2 ring-primary-700">
            {user?.name?.charAt(0) || activeRole?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Demo User'}</p>
            <p className="text-xs text-primary-400 truncate capitalize">{activeRole?.toLowerCase()}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-primary-900 text-sm"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};
