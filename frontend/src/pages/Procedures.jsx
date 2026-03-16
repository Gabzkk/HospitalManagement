import React, { useState } from 'react';
import { Syringe, Calendar, Clock, Search, Filter } from 'lucide-react';
import clsx from 'clsx';

const procedures = [
  { id: 1, patient: 'Robert Davis', procedure: 'Bronchoscopy', date: 'Mar 12, 2026', time: '08:00 AM', room: 'OR-2', type: 'surgery', status: 'Scheduled', notes: 'Pre-op labs complete' },
  { id: 2, patient: 'James Carter', procedure: 'Joint Injection', date: 'Mar 13, 2026', time: '10:30 AM', room: 'Proc-1', type: 'procedure', status: 'Scheduled', notes: 'Right knee, cortisone' },
  { id: 3, patient: 'Sarah Johnson', procedure: 'ECG Monitoring', date: 'Mar 14, 2026', time: '09:00 AM', room: 'Cardio-1', type: 'diagnostic', status: 'Scheduled', notes: '24hr Holter monitor' },
  { id: 4, patient: 'Emma Williams', procedure: 'Spirometry', date: 'Mar 10, 2026', time: '02:00 PM', room: 'Pulm-1', type: 'diagnostic', status: 'Completed', notes: 'Baseline assessment' },
  { id: 5, patient: 'Michael Chen', procedure: 'Blood Sugar Panel', date: 'Mar 09, 2026', time: '08:30 AM', room: 'Lab-2', type: 'lab', status: 'Completed', notes: 'Fasting glucose + HbA1c' },
  { id: 6, patient: 'Olivia Brown', procedure: 'MRI Brain', date: 'Mar 08, 2026', time: '11:00 AM', room: 'Imaging-1', type: 'diagnostic', status: 'Completed', notes: 'Chronic migraine evaluation' },
];

const TYPE_STYLES = {
  surgery: 'bg-teal-100 text-teal-700 border border-teal-200',
  procedure: 'bg-blue-100 text-blue-700 border border-blue-200',
  diagnostic: 'bg-purple-100 text-purple-700 border border-purple-200',
  lab: 'bg-amber-100 text-amber-700 border border-amber-200',
};

const STATUS_STYLES = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const FILTER_TABS = ['All', 'Scheduled', 'Completed'];

const Procedures = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = procedures
    .filter(p => statusFilter === 'All' || p.status === statusFilter)
    .filter(p =>
      p.patient.toLowerCase().includes(search.toLowerCase()) ||
      p.procedure.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procedures</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and manage your scheduled and past procedures.</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {FILTER_TABS.map((tab) => (
            <button key={tab} onClick={() => setStatusFilter(tab)}
              className={clsx(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                statusFilter === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input type="text" placeholder="Search by patient or procedure..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {/* Procedures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((proc) => (
          <div key={proc.id} className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50">
                  <Syringe className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{proc.procedure}</h3>
                  <p className="text-xs text-gray-500">{proc.patient}</p>
                </div>
              </div>
              <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full capitalize", TYPE_STYLES[proc.type])}>
                {proc.type}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{proc.date}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{proc.time}</span>
              <span>Room: {proc.room}</span>
            </div>

            {proc.notes && (
              <p className="text-xs text-gray-400 mb-3 italic">"{proc.notes}"</p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <span className={clsx("text-xs font-medium px-2.5 py-1 rounded-full", STATUS_STYLES[proc.status])}>
                {proc.status}
              </span>
              <button className="text-xs text-primary-600 font-medium hover:underline">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Syringe className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No procedures found.</p>
        </div>
      )}
    </div>
  );
};

export default Procedures;
