import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Stethoscope, Clock, TrendingUp, Filter } from 'lucide-react';
import clsx from 'clsx';
import api from '../services/api';
import { useSocket } from '../services/socket';

const ATTENDANCE_STYLES = {
  P: { bg: 'bg-emerald-500', text: 'text-white', label: 'Present' },
  A: { bg: 'bg-red-500', text: 'text-white', label: 'Absent' },
  L: { bg: 'bg-amber-400', text: 'text-white', label: 'Leave' },
  O: { bg: 'bg-gray-100', text: 'text-gray-400', label: 'Off' },
};

const ROLE_FILTER_TABS = ['All', 'Doctor', 'Nurse', 'Admin', 'Support'];

const STATUS_STYLES = {
  Active: 'bg-emerald-100 text-emerald-700',
  'On Leave': 'bg-amber-100 text-amber-700',
};

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

const HRDashboard = () => {
  const { user } = useAuth();
  const [roleFilter, setRoleFilter] = useState('All');
  
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper to fetch data
  const fetchData = async () => {
    try {
      const [{ data: staffData }, { data: doctorsData }, { data: attData }] = await Promise.all([
        api.get('/staff'),
        api.get('/doctors'),
        api.get('/attendance')
      ]);

      const mappedStaff = staffData.map(s => ({
        id: `s-${s.staffId}`,
        name: s.name,
        role: 'Staff',
        dept: s.department || 'General',
        status: 'Active', // Mocked status
        contact: s.phone || s.email || 'N/A',
        rawId: s.staffId
      }));

      const mappedDoctors = doctorsData.map(d => ({
        id: `d-${d.doctorId}`,
        name: d.name,
        role: 'Doctor',
        dept: d.department || 'General',
        status: 'Active', // Mocked status
        contact: d.phone || d.email || 'N/A',
        rawId: d.doctorId
      }));

      setEmployees([...mappedDoctors, ...mappedStaff]);
      setDoctorsCount(doctorsData.length);
      setAttendanceRecords(attData?.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useSocket('staff', () => fetchData());
  useSocket('doctors', () => fetchData());
  useSocket('attendance', () => fetchData());

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  })();

  const filtered = roleFilter === 'All' ? employees : employees.filter(e => e.role === roleFilter);
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {user?.name?.split(' ')[0] || 'HR'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Employee management and workforce overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard icon={Users} label="Total Employees" value={employees.length} sub="Across all departments" />
        <KPICard icon={Stethoscope} label="Doctors Configured" value={doctorsCount} sub="In system"
          color="text-blue-600" bg="bg-blue-50" />
        <KPICard icon={Clock} label="Pending Leave Requests" value="0" sub="All caught up"
          color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Employee Directory */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-900">Employee Directory</h2>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 flex-wrap">
            {ROLE_FILTER_TABS.map((tab) => (
              <button key={tab} onClick={() => setRoleFilter(tab)}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  roleFilter === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                )}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Name', 'Role', 'Department', 'Status', 'Contact'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-700 flex-shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{emp.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{emp.dept}</td>
                  <td className="py-3 pr-4">
                    <span className={clsx("text-xs font-medium px-2.5 py-1 rounded-full", STATUS_STYLES[emp.status])}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500 text-xs font-mono">{emp.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Attendance This Week</h2>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: 'Present', color: 'bg-emerald-500' },
              { label: 'Absent', color: 'bg-red-500' },
              { label: 'Leave', color: 'bg-amber-400' },
              { label: 'Off', color: 'bg-gray-200' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-sm ${l.color}`} />
                <span className="text-xs text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4 min-w-[120px]">Employee</th>
                {weekLabels.map((d) => (
                  <th key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 px-1">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 <tr><td colSpan={8} className="text-center py-6 text-gray-400">Loading...</td></tr>
              ) : employees.filter(e => e.role === 'Staff').length === 0 ? (
                 <tr><td colSpan={8} className="text-center py-6 text-gray-400">No staff configured for attendance yet.</td></tr>
              ) : (
                employees.filter(e => e.role === 'Staff').map((emp, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 text-sm font-medium text-gray-800">{emp.name}</td>
                    {(() => {
                        const date = new Date();
                        const day = date.getDay();
                        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                        const start = new Date(date.setDate(diff));
                        start.setHours(0,0,0,0);
                        
                        return Array.from({length: 7}).map((_, j) => {
                            const d = new Date(start);
                            d.setDate(d.getDate() + j);
                            const ds = d.toISOString().split('T')[0];
                            const record = attendanceRecords.find(r => r.staffId === emp.rawId && r.date?.substring(0, 10) === ds);
                            const st = record?.status ? STATUS_STYLES[record.status] : null;
                            const attCode = record?.status ? (record.status === 'Present' ? 'P' : record.status === 'Absent' ? 'A' : record.status === 'Leave' ? 'L' : 'O') : '–';

                            return (
                                <td key={j} className="py-3 px-1 text-center">
                                  <span title={record?.status || 'Not set'}
                                    className={clsx("inline-flex items-center justify-center h-7 w-7 rounded-md text-xs font-bold", st ? st.bg : 'bg-gray-50', st ? st.text : 'text-gray-400')}>
                                    {attCode}
                                  </span>
                                </td>
                            );
                        });
                    })()}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
