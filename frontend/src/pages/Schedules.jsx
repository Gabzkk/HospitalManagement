import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Clock, Search } from 'lucide-react';
import clsx from 'clsx';

const SHIFT_STYLES = {
  morning: { bg: 'bg-blue-100 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Morning', time: '07:00 AM – 03:00 PM' },
  afternoon: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Afternoon', time: '03:00 PM – 11:00 PM' },
  night: { bg: 'bg-purple-100 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Night', time: '11:00 PM – 07:00 AM' },
  off: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-400', dot: 'bg-gray-300', label: 'Day Off', time: '–' },
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Deterministic shift assignment based on staff index and day
const getShiftForDay = (staffIndex, dayIndex) => {
  const shifts = ['morning', 'afternoon', 'night', 'off'];
  return shifts[(staffIndex + dayIndex) % shifts.length];
};

const Schedules = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data } = await api.get('/schedules');
        setStaffList(data);
      } catch (err) {
        console.error('Failed to fetch schedules', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const filtered = staffList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  // Current week dates
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const weekLabel = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Schedules</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and manage weekly work schedules for all staff.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg px-3 py-2 shadow-card border border-gray-100">
          <Calendar className="h-4 w-4 text-primary-500" />
          {weekLabel}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(SHIFT_STYLES).map(([key, s]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={clsx("h-3 w-3 rounded-sm", s.dot)} />
            <span className="text-xs text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input type="text" placeholder="Search employees..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4 min-w-[180px]">Employee</th>
                {weekDates.map((d, i) => {
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <th key={i} className={clsx("text-center text-xs font-semibold uppercase tracking-wide py-3 px-2 min-w-[100px]",
                      isToday ? 'text-primary-600 bg-primary-50/50' : 'text-gray-400'
                    )}>
                      <div>{DAY_LABELS[i]}</div>
                      <div className="text-sm font-bold mt-0.5">{d.getDate()}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></td>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-3 px-2"><div className="h-10 bg-gray-200 rounded-lg animate-pulse mx-auto w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No employees found.</td></tr>
              ) : (
                filtered.map((staff, sIdx) => (
                  <tr key={staff.staffId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
                          {staff.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{staff.name}</p>
                          <p className="text-[10px] text-gray-400">{staff.department || ''}</p>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((d, i) => {
                      const isToday = d.toDateString() === new Date().toDateString();
                      const shift = getShiftForDay(sIdx, i);
                      const style = SHIFT_STYLES[shift];
                      return (
                        <td key={i} className={clsx("py-3 px-2 text-center", isToday && 'bg-primary-50/30')}>
                          <div className={clsx("inline-flex flex-col items-center px-2 py-1.5 rounded-lg border text-center min-w-[80px]", style.bg)}>
                            <span className={clsx("text-[10px] font-bold", style.text)}>{style.label}</span>
                            <span className={clsx("text-[9px] mt-0.5", style.text)}>{style.time}</span>
                          </div>
                        </td>
                      );
                    })}
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

export default Schedules;
