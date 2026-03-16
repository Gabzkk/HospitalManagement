import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, Stethoscope, TrendingUp, Check, RefreshCw, X, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

// --- Mock data ---
const APPT_BOOKED = 63;
const APPT_TOTAL = 75;
const WALK_INS = 7;
const AVAILABLE_DOCTORS = 4;

const upcomingAppointments = [
  { id: 1, time: '09:00 AM', patient: 'Sarah Johnson', doctor: 'Dr. Wilson', type: 'Consultation', status: 'Confirmed' },
  { id: 2, time: '09:30 AM', patient: 'Michael Chen', doctor: 'Dr. Lee', type: 'Follow-up', status: 'Pending' },
  { id: 3, time: '10:00 AM', patient: 'Emma Williams', doctor: 'Dr. Brown', type: 'Check-up', status: 'Confirmed' },
  { id: 4, time: '10:30 AM', patient: 'James Carter', doctor: 'Dr. Wilson', type: 'Consultation', status: 'Pending' },
  { id: 5, time: '11:00 AM', patient: 'Olivia Brown', doctor: 'Dr. Lee', type: 'Follow-up', status: 'Confirmed' },
  { id: 6, time: '11:30 AM', patient: 'Robert Davis', doctor: 'Dr. Smith', type: 'Procedure', status: 'Pending' },
  { id: 7, time: '02:00 PM', patient: 'Linda Anderson', doctor: 'Dr. Brown', type: 'Check-up', status: 'Cancelled' },
];

const TYPE_STYLES = {
  Consultation: 'bg-blue-100 text-blue-700',
  'Follow-up': 'bg-purple-100 text-purple-700',
  'Check-up': 'bg-teal-100 text-teal-700',
  Procedure: 'bg-amber-100 text-amber-700',
};

const STATUS_STYLES = {
  Confirmed: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const getCapacityColor = (pct) => {
  if (pct >= 91) return { bar: 'bg-red-500', text: 'text-red-600', ring: 'text-red-500', badge: 'NEAR FULL', badgeBg: 'bg-red-100 text-red-700' };
  if (pct >= 71) return { bar: 'bg-amber-400', text: 'text-amber-600', ring: 'text-amber-500', badge: 'FILLING UP', badgeBg: 'bg-amber-100 text-amber-700' };
  return { bar: 'bg-[#00C97B]', text: 'text-emerald-600', ring: 'text-emerald-500', badge: 'AVAILABLE', badgeBg: 'bg-emerald-100 text-emerald-700' };
};

const AppointmentCapacityCard = ({ booked, total }) => {
  const pct = Math.round((booked / total) * 1000) / 10;
  const isFullyBooked = pct >= 100;
  const colors = getCapacityColor(pct);

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 col-span-1 sm:col-span-2 xl:col-span-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Appointment Capacity</h3>
        {isFullyBooked ? (
          <span className="text-xs font-bold bg-red-500 text-white px-2.5 py-1 rounded-full">FULLY BOOKED</span>
        ) : (
          <span className={clsx("text-xs font-bold px-2.5 py-1 rounded-full", colors.badgeBg)}>{colors.badge}</span>
        )}
      </div>

      {/* Big percentage */}
      <div className="flex items-end gap-3 mb-4">
        <span className={clsx("text-5xl font-black", colors.text)}>{pct}%</span>
        <span className="text-sm text-gray-400 mb-2">Full</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div
          className={clsx("h-3 rounded-full transition-all", colors.bar)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{booked} of {total} slots booked</span>
        <span className={clsx("font-semibold", colors.text)}>{total - booked} remaining</span>
      </div>
    </div>
  );
};

const KPICard = ({ icon: Icon, label, value, sub, color = 'text-primary-600', bg = 'bg-primary-50', featured }) => (
  <div className={clsx(
    "rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow",
    featured ? "bg-primary-950 text-white" : "bg-white"
  )}>
    <div className="flex items-start justify-between mb-3">
      <div className={clsx("p-2.5 rounded-xl", featured ? "bg-white/10" : bg)}>
        <Icon className={clsx("h-5 w-5", featured ? "text-white" : color)} />
      </div>
      <TrendingUp className={clsx("h-4 w-4", featured ? "text-white/50" : "text-emerald-500")} />
    </div>
    <p className={clsx("text-sm font-medium mb-1", featured ? "text-white/70" : "text-gray-500")}>{label}</p>
    <p className={clsx("text-2xl font-bold", featured ? "text-white" : "text-gray-900")}>{value}</p>
    {sub && <p className={clsx("text-xs mt-1", featured ? "text-white/50" : "text-gray-400")}>{sub}</p>}
  </div>
);

const SecretaryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apptStatuses, setApptStatuses] = useState(
    Object.fromEntries(upcomingAppointments.map(a => [a.id, a.status]))
  );

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  })();

  const handleAction = (id, action) => {
    setApptStatuses(prev => ({
      ...prev,
      [id]: action === 'confirm' ? 'Confirmed' : action === 'cancel' ? 'Cancelled' : 'Pending'
    }));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* MAIN */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user?.name?.split(' ')[0] || 'Reception'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Front desk overview — today's appointments and walk-ins.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-primary-950 rounded-2xl p-5 shadow-card">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-white/10">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full">
                {Math.round((APPT_BOOKED / APPT_TOTAL) * 1000) / 10}% full
              </span>
            </div>
            <p className="text-sm font-medium text-white/70 mb-1">Appointments Today</p>
            <p className="text-2xl font-bold text-white">{APPT_BOOKED}</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-white/60">
                <span>{APPT_BOOKED} / {APPT_TOTAL} booked</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full">
                <div className="h-1.5 bg-[#00C97B] rounded-full" style={{ width: `${(APPT_BOOKED / APPT_TOTAL) * 100}%` }} />
              </div>
            </div>
          </div>
          <KPICard icon={Users} label="Walk-ins Waiting" value={WALK_INS} sub="In waiting area now"
            color="text-amber-600" bg="bg-amber-50" />
          <KPICard icon={Stethoscope} label="Available Doctors" value={AVAILABLE_DOCTORS} sub="Ready to see patients"
            color="text-teal-600" bg="bg-teal-50" />
        </div>

        {/* Large capacity card */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-1">
            <AppointmentCapacityCard booked={APPT_BOOKED} total={APPT_TOTAL} />
          </div>
          <div className="sm:col-span-3 bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-xs text-gray-400 mt-0.5">Common front desk tasks</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Appointment', icon: Calendar, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100', action: () => navigate('/appointments') },
                { label: 'Add Patient', icon: UserPlus, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', action: () => navigate('/patients/new') },
                { label: 'View Patients', icon: Users, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100', action: () => navigate('/patients') },
                { label: 'Walk-in Check-in', icon: Check, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100', action: () => {} },
              ].map((btn) => (
                <button key={btn.label} onClick={btn.action}
                  className={clsx("flex items-center gap-3 p-4 rounded-xl font-medium text-sm transition-colors text-left", btn.color)}>
                  <btn.icon className="h-5 w-5 flex-shrink-0" />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Upcoming Appointments</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{upcomingAppointments.length} today</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Time', 'Patient', 'Doctor', 'Type', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upcomingAppointments.map((appt) => {
                  const currentStatus = apptStatuses[appt.id] || appt.status;
                  return (
                    <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 text-xs font-mono font-medium text-gray-700">{appt.time}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700 flex-shrink-0">
                            {appt.patient.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{appt.patient}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 text-xs">{appt.doctor}</td>
                      <td className="py-3 pr-4">
                        <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full", TYPE_STYLES[appt.type] || 'bg-gray-100 text-gray-600')}>
                          {appt.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={clsx("text-xs font-medium px-2.5 py-1 rounded-full", STATUS_STYLES[currentStatus] || 'bg-gray-100 text-gray-600')}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAction(appt.id, 'confirm')}
                            title="Confirm"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          ><Check className="h-3.5 w-3.5" /></button>
                          <button
                            onClick={() => handleAction(appt.id, 'reschedule')}
                            title="Reschedule"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          ><RefreshCw className="h-3.5 w-3.5" /></button>
                          <button
                            onClick={() => handleAction(appt.id, 'cancel')}
                            title="Cancel"
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          ><X className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretaryDashboard;
