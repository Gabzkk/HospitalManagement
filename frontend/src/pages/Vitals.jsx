import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Heart, Search, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useSocket } from '../services/socket';

const Vitals = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [vitals, setVitals] = useState({ temperature: '', bloodPressure: '', heartRate: '', oxygenLevel: '' });
  const [saved, setSaved] = useState(false);

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vitals');
      setPatients(data);
    } catch (err) {
      console.error('Failed to fetch vitals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVitals(); }, []);

  // Real-time synchronization
  useSocket('vitals', () => fetchVitals());

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vitals', {
        patientId: selectedPatient,
        temperature: vitals.temperature || null,
        bloodPressure: vitals.bloodPressure || null,
        heartRate: vitals.heartRate || null,
        oxygenLevel: vitals.oxygenLevel || null,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setShowForm(false);
        setVitals({ temperature: '', bloodPressure: '', heartRate: '', oxygenLevel: '' });
        setSelectedPatient('');
        fetchVitals();
      }, 1500);
    } catch (err) {
      console.error('Failed to save vitals', err);
      alert('Failed to save vitals: ' + (err.response?.data?.error || err.message));
    }
  };

  const filtered = patients.filter(p =>
    p.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Vitals</h1>
          <p className="text-sm text-gray-500 mt-0.5">View all patients with their most recent vital signs.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="h-10 bg-primary-950 text-white rounded-lg px-5 text-sm font-semibold hover:bg-primary-900 transition-colors">
          {showForm ? 'Cancel' : '+ Record Vitals'}
        </button>
      </div>

      {/* Record Vitals Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-red-50"><Heart className="h-4 w-4 text-red-500" /></div>
            <h3 className="text-sm font-semibold text-gray-900">Record New Vitals</h3>
          </div>
          {saved ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-emerald-700">Vitals Recorded!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Patient *</label>
                <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required
                  className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.patientName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Temperature (°C)</label>
                <input type="number" step="0.1" placeholder="37.2" value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Blood Pressure</label>
                <input type="text" placeholder="120/80" value={vitals.bloodPressure}
                  onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Heart Rate (bpm)</label>
                <input type="number" placeholder="72" value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">O₂ Level (%)</label>
                  <input type="number" min="0" max="100" placeholder="98" value={vitals.oxygenLevel}
                    onChange={(e) => setVitals({ ...vitals, oxygenLevel: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <button type="submit" className="h-10 bg-primary-950 text-white rounded-lg px-4 text-sm font-semibold hover:bg-primary-900 transition-colors whitespace-nowrap">
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input type="text" placeholder="Search patients..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {/* Patients Vitals Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Patient', 'Age', 'Gender', 'Temp (°C)', 'Blood Pressure', 'Heart Rate', 'O₂ Level', 'Last Recorded'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No patients found.</td></tr>
              ) : (
                filtered.map((patient) => {
                  const v = patient.vitals?.[0];
                  return (
                    <tr key={patient.patientId} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-semibold text-teal-700">
                            {patient.patientName?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{patient.patientName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{patient.age || '–'}</td>
                      <td className="py-3 px-4 text-gray-600">{patient.gender || '–'}</td>
                      <td className="py-3 px-4">
                        <span className={clsx("font-mono", v?.temperature ? 'text-gray-900' : 'text-gray-300')}>
                          {v?.temperature ? Number(v.temperature).toFixed(1) : '–'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={clsx("font-mono", v?.bloodPressure ? 'text-gray-900' : 'text-gray-300')}>
                          {v?.bloodPressure || '–'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={clsx("font-mono", v?.heartRate ? 'text-gray-900' : 'text-gray-300')}>
                          {v?.heartRate || '–'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {v?.oxygenLevel ? (
                          <span className={clsx("font-mono px-2 py-0.5 rounded-full text-xs font-medium",
                            v.oxygenLevel >= 95 ? 'bg-emerald-100 text-emerald-700' :
                            v.oxygenLevel >= 90 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          )}>
                            {v.oxygenLevel}%
                          </span>
                        ) : <span className="text-gray-300">–</span>}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {v?.recordedAt ? (
                          <span>{new Date(v.recordedAt).toLocaleString()}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-500 font-medium">
                            <AlertCircle className="h-3 w-3" /> No records
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vitals;
