import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useSocket } from '../services/socket';

const STATUS_OPTIONS = ['Present', 'Absent', 'Leave', 'Off'];

const STATUS_STYLES = {
  Present: { bg: 'bg-emerald-500', text: 'text-white', short: 'P' },
  Absent: { bg: 'bg-red-500', text: 'text-white', short: 'A' },
  Leave: { bg: 'bg-amber-400', text: 'text-white', short: 'L' },
  Off: { bg: 'bg-gray-100', text: 'text-gray-400', short: 'O' },
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getWeekStart = (offset = 0) => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const Attendance = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [staffList, setStaffList] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const weekStart = getWeekStart(weekOffset);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/attendance', { params: { weekStart: weekStart.toISOString() } });
      setStaffList(data.staff || []);
      setRecords(data.records || []);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [weekOffset]);

  // Real-time updates
  useSocket('attendance', () => fetchData());
  useSocket('staff', () => fetchData());

  const getStatus = (staffId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const record = records.find(r =>
      r.staffId === staffId && r.date?.substring(0, 10) === dateStr
    );
    return record?.status || null;
  };

  const handleToggle = async (staffId, date) => {
    const currentStatus = getStatus(staffId, date);
    const currentIndex = STATUS_OPTIONS.indexOf(currentStatus);
    const nextStatus = STATUS_OPTIONS[(currentIndex + 1) % STATUS_OPTIONS.length];
    const dateStr = date.toISOString().split('T')[0];

    setSaving(`${staffId}-${dateStr}`);
    try {
      const { data } = await api.post('/attendance', {
        staffId,
        date: dateStr,
        status: nextStatus,
      });
      setRecords(prev => {
        const filtered = prev.filter(r => !(r.staffId === staffId && r.date?.substring(0, 10) === dateStr));
        return [...filtered, data];
      });
    } catch (err) {
      console.error('Failed to update attendance', err);
    } finally {
      setSaving(null);
    }
  };

  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Record and manage employee attendance. Click cells to cycle through statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[180px] text-center">{weekLabel}</span>
          <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <ChevronRight className="h-5 w-5" />
          </button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-primary-600 font-medium hover:underline">Today</button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={clsx("h-3 w-3 rounded-sm", STATUS_STYLES[s].bg)} />
            <span className="text-xs text-gray-500">{s}</span>
          </div>
        ))}
      </div>

      {/* Attendance Grid */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4 min-w-[180px]">Employee</th>
                {weekDates.map((d, i) => {
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <th key={i} className={clsx("text-center text-xs font-semibold uppercase tracking-wide py-3 px-2 min-w-[60px]",
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
                      <td key={j} className="py-3 px-2 text-center"><div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse mx-auto" /></td>
                    ))}
                  </tr>
                ))
              ) : staffList.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No employees found.</td></tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.staffId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-700 flex-shrink-0">
                          {staff.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{staff.name}</p>
                          <p className="text-[10px] text-gray-400">{staff.department || ''}</p>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((d, i) => {
                      const status = getStatus(staff.staffId, d);
                      const style = status ? STATUS_STYLES[status] : { bg: 'bg-gray-50', text: 'text-gray-300', short: '–' };
                      const dateStr = d.toISOString().split('T')[0];
                      const isSaving = saving === `${staff.staffId}-${dateStr}`;
                      const isToday = d.toDateString() === new Date().toDateString();
                      return (
                        <td key={i} className={clsx("py-3 px-2 text-center", isToday && 'bg-primary-50/30')}>
                          <button
                            onClick={() => handleToggle(staff.staffId, d)}
                            disabled={isSaving}
                            title={status || 'Click to set'}
                            className={clsx(
                              "inline-flex items-center justify-center h-8 w-8 rounded-md text-xs font-bold transition-all hover:scale-110",
                              style.bg, style.text,
                              isSaving && 'opacity-50 animate-pulse'
                            )}>
                            {style.short}
                          </button>
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

export default Attendance;
