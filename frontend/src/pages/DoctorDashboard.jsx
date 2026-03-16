import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users, Calendar, Activity, ChevronLeft, ChevronRight,
  TrendingUp, MoreHorizontal, Clock, Scissors
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import clsx from 'clsx';

// --- Mock data ---
const myPatients = [
  { id: 1, name: 'Sarah Johnson', age: 34, condition: 'Hypertension', lastVisit: 'Mar 10, 2026', status: 'Active' },
  { id: 2, name: 'Michael Chen', age: 58, condition: 'Type 2 Diabetes', lastVisit: 'Mar 9, 2026', status: 'Active' },
  { id: 3, name: 'Emma Williams', age: 45, condition: 'Asthma', lastVisit: 'Mar 8, 2026', status: 'In Review' },
  { id: 4, name: 'James Carter', age: 72, condition: 'Arthritis', lastVisit: 'Mar 7, 2026', status: 'Stable' },
  { id: 5, name: 'Olivia Brown', age: 29, condition: 'Migraine', lastVisit: 'Mar 6, 2026', status: 'Active' },
  { id: 6, name: 'Robert Davis', age: 63, condition: 'COPD', lastVisit: 'Mar 5, 2026', status: 'Critical' },
];

const weeklyPatients = [
  { day: 'Mon', patients: 8 },
  { day: 'Tue', patients: 12 },
  { day: 'Wed', patients: 7 },
  { day: 'Thu', patients: 15 },
  { day: 'Fri', patients: 11 },
  { day: 'Sat', patients: 4 },
  { day: 'Sun', patients: 2 },
];

const scheduleSlots = [
  { time: '09:00 AM', patient: 'Sarah Johnson', type: 'Follow-up', duration: 30 },
  { time: '10:00 AM', patient: 'Michael Chen', type: 'Consultation', duration: 45 },
  { time: '11:30 AM', patient: 'Emma Williams', type: 'Check-up', duration: 30 },
  { time: '02:00 PM', patient: 'James Carter', type: 'Consultation', duration: 60 },
  { time: '03:30 PM', patient: 'Olivia Brown', type: 'Follow-up', duration: 30 },
];

const upcomingProcedures = [
  { id: 1, patient: 'Robert Davis', procedure: 'Bronchoscopy', date: 'Mar 12, 2026', time: '08:00 AM', room: 'OR-2', type: 'surgery' },
  { id: 2, patient: 'James Carter', procedure: 'Joint Injection', date: 'Mar 13, 2026', time: '10:30 AM', room: 'Proc-1', type: 'procedure' },
  { id: 3, patient: 'Sarah Johnson', procedure: 'ECG Monitoring', date: 'Mar 14, 2026', time: '09:00 AM', room: 'Cardio-1', type: 'consultation' },
];

const STATUS_STYLES = {
  Active: 'bg-emerald-100 text-emerald-700',
  Stable: 'bg-blue-100 text-blue-700',
  'In Review': 'bg-amber-100 text-amber-700',
  Critical: 'bg-red-100 text-red-700',
};

const PROCEDURE_PILL = {
  surgery: 'bg-teal-100 text-teal-700 border border-teal-200',
  procedure: 'bg-blue-100 text-blue-700 border border-blue-200',
  consultation: 'bg-purple-100 text-purple-700 border border-purple-200',
};

// Mini calendar strip
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const today = new Date();
const todayDayIdx = (today.getDay() + 6) % 7; // Mon=0

const WeekStrip = ({ selectedDay, onSelect }) => (
  <div className="flex gap-1.5">
    {weekDays.map((d, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - todayDayIdx + i);
      const isToday = i === todayDayIdx;
      const isSelected = i === selectedDay;
      return (
        <button key={d} onClick={() => onSelect(i)}
          className={clsx(
            "flex-1 flex flex-col items-center py-2 rounded-xl text-xs font-medium transition-colors",
            isSelected ? "bg-primary-950 text-white shadow-sm" :
            isToday ? "bg-primary-100 text-primary-800" :
            "text-gray-500 hover:bg-gray-100"
          )}>
          <span className="text-[10px] mb-0.5">{d}</span>
          <span className="font-bold">{date.getDate()}</span>
        </button>
      );
    })}
  </div>
);

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

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(todayDayIdx);
  const [activeTab, setActiveTab] = useState('schedule');

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  })();

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* MAIN */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, Dr. {user?.name?.split(' ').slice(-1)[0] || 'Smith'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's your clinical summary for today.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard icon={Users} label="Total Patients" value="124" sub="Under your care" />
          <KPICard icon={Calendar} label="Appointments Today" value="8" sub="Next at 09:00 AM"
            color="text-blue-600" bg="bg-blue-50" />
          <KPICard icon={Activity} label="Completed Procedures" value="23" sub="This month"
            color="text-teal-600" bg="bg-teal-50" />
        </div>

        {/* My Patients Table */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">My Patients</h2>
            <button className="text-xs text-primary-600 font-medium hover:underline">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Patient</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Age</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Condition</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Last Visit</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700">
                          {p.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{p.age}</td>
                    <td className="py-3 pr-4 text-gray-600">{p.condition}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{p.lastVisit}</td>
                    <td className="py-3">
                      <span className={clsx("text-xs font-medium px-2.5 py-1 rounded-full", STATUS_STYLES[p.status] || 'bg-gray-100 text-gray-600')}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekly Stats Chart */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Patients Seen This Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyPatients} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f0fdf4' }}
              />
              <Bar dataKey="patients" fill="#1A3C34" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full xl:w-[300px] flex-shrink-0 space-y-5">
        {/* Schedule */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">My Schedule</h3>
            <div className="flex gap-1">
              <button className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><ChevronLeft className="h-4 w-4" /></button>
              <button className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <WeekStrip selectedDay={selectedDay} onSelect={setSelectedDay} />
          <div className="mt-4 space-y-2.5">
            {scheduleSlots.map((slot, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100 hover:bg-blue-50 transition-colors">
                <div className="flex-shrink-0 text-center min-w-[52px]">
                  <p className="text-[10px] font-bold text-blue-700 bg-blue-100 rounded-md px-1.5 py-0.5">{slot.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{slot.patient}</p>
                  <p className="text-[10px] text-gray-500">{slot.type} · {slot.duration}min</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Procedures */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Scissors className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-gray-900">Upcoming Procedures</h3>
          </div>
          <div className="space-y-3">
            {upcomingProcedures.map((proc) => (
              <div key={proc.id} className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-gray-900">{proc.procedure}</p>
                  <span className={clsx("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0", PROCEDURE_PILL[proc.type])}>
                    {proc.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{proc.patient}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{proc.date} {proc.time}</span>
                  <span>Room: {proc.room}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
