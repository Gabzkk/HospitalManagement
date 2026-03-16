import React from 'react';
import { Menu, Search, Bell, Plus, ChevronDown, UserCog } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth, ROLE_DASHBOARDS } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const ALL_ROLES = ['ADMIN', 'DOCTOR', 'NURSE', 'HR', 'SECRETARY', 'CASHIER'];

const ROLE_LABELS = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  HR: 'HR Staff',
  SECRETARY: 'Secretary',
  CASHIER: 'Cashier',
  STAFF: 'Staff',
};

const ROLE_COLORS = {
  ADMIN: 'bg-primary-950',
  DOCTOR: 'bg-blue-700',
  NURSE: 'bg-teal-600',
  HR: 'bg-purple-700',
  SECRETARY: 'bg-amber-600',
  CASHIER: 'bg-emerald-600',
  STAFF: 'bg-gray-700',
};

export const TopBar = ({ onMenuClick }) => {
  const { user, activeRole, mockLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // "+ Add Patient" button only shows on the Dashboard page
  const isDashboard = location.pathname === '/dashboard';

  const handleRoleSwitch = async (role) => {
    await mockLogin(role);
    const dashRoute = ROLE_DASHBOARDS[role] || '/dashboard';
    navigate(dashRoute);
  };

  return (
    <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left side */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search bar */}
        <div className="relative max-w-md w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search here..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* "+ Add Patient" — only on Dashboard */}
        {isDashboard && (
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => navigate('/patients/new')}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Patient
          </Button>
        )}

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Role Switcher (prototyping) */}
        <div className="relative group pl-3 border-l border-gray-200">
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className={`h-8 w-8 rounded-full ${ROLE_COLORS[activeRole] || 'bg-primary-950'} text-white flex items-center justify-center text-sm font-semibold`}>
              {user?.name?.charAt(0) || activeRole?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-xs font-semibold text-gray-800">{user?.name?.split(' ')[0] || 'User'}</span>
              <span className="text-[10px] text-gray-400">{ROLE_LABELS[activeRole] || activeRole}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-dropdown border border-gray-100 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="px-3 py-1.5 mb-1 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                <UserCog className="h-3 w-3" />
                Switch Role (Prototype)
              </div>
            </div>
            {ALL_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${activeRole === role ? 'text-primary-700 font-semibold' : 'text-gray-700'}`}
              >
                <span className={`h-5 w-5 rounded-full ${ROLE_COLORS[role]} flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0`}>
                  {ROLE_LABELS[role].charAt(0)}
                </span>
                <span>{ROLE_LABELS[role]}</span>
                {activeRole === role && <span className="ml-auto text-primary-600">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
