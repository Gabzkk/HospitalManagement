import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Clock, Heart, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

// --- Mock data ---
const assignedPatients = [
  { id: 1, name: 'Sarah Johnson', room: '201A', condition: 'Hypertension', lastVitals: '08:30 AM', status: 'Stable' },
  { id: 2, name: 'Michael Chen', room: '203B', condition: 'Diabetes', lastVitals: '09:00 AM', status: 'Monitoring' },
  { id: 3, name: 'Emma Williams', room: '105', condition: 'Post-surgery', lastVitals: '--', status: 'Pending' },
  { id: 4, name: 'James Carter', room: 'ICU-3', condition: 'COPD', lastVitals: '07:00 AM', status: 'Critical' },
  { id: 5, name: 'Olivia Brown', room: '210A', condition: 'Migraine', lastVitals: '10:15 AM', status: 'Stable' },
];

const shiftSchedule = [
  { day: 'Mon', date: 4, shift: 'Morning', time: '07:00am – 03:00pm', type: 'morning' },
  { day: 'Tue', date: 5, shift: 'Morning', time: '07:00am – 03:00pm', type: 'morning' },
  { day: 'Wed', date: 6, shift: 'Off', time: 'Day Off', type: 'off' },
  { day: 'Thu', date: 7, shift: 'Afternoon', time: '03:00pm – 11:00pm', type: 'afternoon' },
  { day: 'Fri', date: 8, shift: 'Afternoon', time: '03:00pm – 11:00pm', type: 'afternoon' },
  { day: 'Sat', date: 9, shift: 'Night', time: '11:00pm – 07:00am', type: 'night' },
  { day: 'Sun', date: 10, shift: 'Off', time: 'Day Off', type: 'off' },
];

const SHIFT_STYLES = {
  morning: { bg: 'bg-blue-100 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500', label: 'bg-blue-500 text-white' },
  afternoon: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'bg-amber-500 text-white' },
  night: { bg: 'bg-purple-100 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500', label: 'bg-purple-500 text-white' },
  off: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-400', dot: 'bg-gray-300', label: 'bg-gray-200 text-gray-500' },
};

const PATIENT_STATUS = {
  Stable: 'bg-emerald-100 text-emerald-700',
  Monitoring: 'bg-blue-100 text-blue-700',
  Pending: 'bg-amber-100 text-amber-700',
  Critical: 'bg-red-100 text-red-700',
};

const vitalPatients = assignedPatients.map(p => p.name);

const KPICard = ({ icon: Icon, label, value, sub, color = 'text-primary-600', bg = 'bg-primary-50' }) => (
  <div className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <TrendingUp className="h-4 w-4 text-emerald-500" />
    </div>
    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const NurseDashboard = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState({ patient: '', temp: '', bp: '', hr: '', o2: '' });
  const [submitted, setSubmitted] = useState(false);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setVitals({ patient: '', temp: '', bp: '', hr: '', o2: '' }); }, 2500);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* MAIN */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user?.name?.split(' ')[0] || 'Nurse'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Your shift overview and patient assignments for today.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard icon={Users} label="Assigned Patients" value="5" sub="In your ward today" />
          <KPICard icon={Heart} label="Pending Vitals" value="2" sub="Need recording now"
            color="text-red-500" bg="bg-red-50" />
          <KPICard icon={Clock} label="Shift Hours" value="32h" sub="Total this week"
            color="text-purple-600" bg="bg-purple-50" />
        </div>

        {/* Shift Schedule */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Weekly Shift Schedule</h2>
          <div className="space-y-2">
            {shiftSchedule.map((s, i) => {
              const style = SHIFT_STYLES[s.type];
              return (
                <div key={i} className={clsx("flex items-center gap-4 p-3 rounded-xl border transition-colors", style.bg)}>
                  <div className="flex-shrink-0 w-16 text-center">
                    <p className="text-xs font-bold text-gray-700">{s.day}</p>
                    <p className="text-sm font-bold text-gray-900">{s.date}</p>
                  </div>
                  <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${style.dot}`} />
                  <div className="flex-1">
                    <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full", style.label)}>
                      {s.shift}
                    </span>
                    <p className={clsx("text-xs mt-0.5", style.text)}>{s.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 flex-wrap">
            {[
              { label: 'Morning', color: 'bg-blue-500' },
              { label: 'Afternoon', color: 'bg-amber-500' },
              { label: 'Night', color: 'bg-purple-500' },
              { label: 'Off', color: 'bg-gray-300' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
                <span className="text-xs text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Patients Table */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Assigned Patients</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{assignedPatients.length} patients</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Patient', 'Room', 'Condition', 'Last Vitals', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assignedPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-semibold text-teal-700">
                          {p.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 font-mono text-xs">{p.room}</td>
                    <td className="py-3 pr-4 text-gray-600">{p.condition}</td>
                    <td className="py-3 pr-4">
                      <span className={clsx("text-xs", p.lastVitals === '--' ? 'text-red-500 font-semibold flex items-center gap-1' : 'text-gray-500')}>
                        {p.lastVitals === '--' && <AlertCircle className="h-3 w-3" />}
                        {p.lastVitals}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={clsx("text-xs font-medium px-2.5 py-1 rounded-full", PATIENT_STATUS[p.status] || 'bg-gray-100 text-gray-600')}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Vitals Input */}
      <div className="w-full xl:w-[300px] flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-red-50">
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Record Vitals</h3>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-emerald-700">Vitals Recorded!</p>
              <p className="text-xs text-gray-400 mt-1">Saved to patient record</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Patient</label>
                <select
                  value={vitals.patient}
                  onChange={(e) => setVitals({ ...vitals, patient: e.target.value })}
                  required
                  className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select patient...</option>
                  {vitalPatients.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {[
                { key: 'temp', label: 'Temperature (°C)', placeholder: 'e.g. 37.2', type: 'number', step: '0.1' },
                { key: 'bp', label: 'Blood Pressure', placeholder: 'e.g. 120/80', type: 'text' },
                { key: 'hr', label: 'Heart Rate (bpm)', placeholder: 'e.g. 72', type: 'number' },
                { key: 'o2', label: 'Oxygen Level (%)', placeholder: 'e.g. 98', type: 'number', min: '0', max: '100' },
              ].map(({ key, label, ...rest }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
                  <input
                    value={vitals[key]}
                    onChange={(e) => setVitals({ ...vitals, [key]: e.target.value })}
                    required
                    className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...rest}
                  />
                </div>
              ))}

              <button type="submit"
                className="w-full h-10 bg-primary-950 text-white rounded-lg text-sm font-semibold hover:bg-primary-900 transition-colors mt-2">
                Save Vitals
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
