import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Users, Calendar, CreditCard, Activity, TrendingUp, TrendingDown,
  Clock, MoreHorizontal, ArrowRight, BedDouble, FileText, ChevronLeft, ChevronRight,
  Phone, DollarSign, Bell, X
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import clsx from 'clsx';
import { useSocket } from '../services/socket';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary-950 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
        {payload[0].value.toLocaleString()}
      </div>
    );
  }
  return null;
};

// --- Appointment Capacity KPI ---
const AppointmentCapacityKPI = ({ booked, total, featured }) => {
  const pct = total > 0 ? Math.round((booked / total) * 1000) / 10 : 0;
  const isFullyBooked = pct >= 100;

  const getCapacityColor = (pct) => {
    if (pct >= 91) return { bar: 'bg-red-500', text: 'text-red-600' };
    if (pct >= 71) return { bar: 'bg-amber-400', text: 'text-amber-600' };
    return { bar: 'bg-[#00C97B]', text: 'text-emerald-600' };
  };
  const colors = getCapacityColor(pct);

  return (
    <div className={clsx(
      "rounded-2xl p-5 shadow-card transition-shadow hover:shadow-card-hover",
      featured ? "bg-primary-950 text-white" : "bg-white"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={clsx("p-2.5 rounded-xl", featured ? "bg-white/10" : "bg-primary-50")}>
          <Calendar className={clsx("h-5 w-5", featured ? "text-white" : "text-primary-600")} />
        </div>
        {isFullyBooked ? (
          <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">FULLY BOOKED</span>
        ) : (
          <span className={clsx(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            pct >= 91 ? "bg-red-100 text-red-600" : pct >= 71 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
          )}>
            {pct >= 91 ? 'NEAR FULL' : pct >= 71 ? 'FILLING UP' : 'AVAILABLE'}
          </span>
        )}
      </div>
      <p className={clsx("text-sm font-medium mb-1", featured ? "text-white/70" : "text-gray-500")}>Appointments</p>
      <p className="text-2xl font-bold">{booked.toLocaleString()}</p>

      {/* Capacity bar */}
      <div className="mt-3 space-y-1.5">
        <div className={clsx("flex justify-between text-xs", featured ? "text-white/60" : "text-gray-400")}>
          <span>{booked} / {total} booked</span>
          <span className={featured ? "text-white font-semibold" : `${colors.text} font-semibold`}>{pct}% full</span>
        </div>
        <div className={clsx("h-1.5 rounded-full", featured ? "bg-white/20" : "bg-gray-100")}>
          <div
            className={clsx("h-1.5 rounded-full transition-all", featured ? "bg-[#00C97B]" : colors.bar)}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// --- Standard KPI Card ---
const KPICard = ({ icon: Icon, label, value, trend, trendLabel }) => (
  <div className="bg-white rounded-2xl p-5 shadow-card transition-shadow hover:shadow-card-hover">
    <div className="flex items-start justify-between mb-3">
      <div className="p-2.5 rounded-xl bg-primary-50">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
    </div>
    <p className="text-sm font-medium mb-1 text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    {trend !== undefined && (
      <div className="flex items-center gap-1.5 mt-2">
        <span className={clsx(
          "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full",
          trend >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        )}>
          {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend)}%
        </span>
        <span className="text-xs text-gray-400">{trendLabel || "from last week"}</span>
      </div>
    )}
  </div>
);

// --- Mini Calendar ---
const MiniCalendar = () => {
  const today = new Date();
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = -1; i < 6; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({ name: dayNames[d.getDay()], date: d.getDate(), isToday: i === 0 });
  }

  return (
    <div className="flex items-center justify-between gap-1">
      {days.map((d, i) => (
        <button key={i} className={clsx(
          "flex flex-col items-center py-2 px-2.5 rounded-xl text-xs font-medium transition-colors",
          d.isToday ? "bg-primary-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
        )}>
          <span className="text-[10px] mb-0.5">{d.name}</span>
          <span className="text-sm font-semibold">{d.date}</span>
        </button>
      ))}
    </div>
  );
};

// --- Appointment Slot ---
const AppointmentSlot = ({ appointment }) => {
  const time = new Date(appointment.appointmentDateTime);
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(time.getTime() + 30 * 60000);
  const endStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50/50 border border-primary-100 hover:bg-primary-50 transition-colors">
      <div className="w-1 h-10 rounded-full bg-primary-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {appointment.patient?.patientName || 'Patient'}
        </p>
        <p className="text-xs text-gray-500">{timeStr} – {endStr}</p>
      </div>
      <button className="p-1 text-gray-400 hover:text-gray-600">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
};

// --- Balance Donut ---
const BalanceDonut = ({ percentage = 0 }) => {
  const data = [{ value: percentage }, { value: 100 - percentage }];
  return (
    <div className="relative w-28 h-28">
      <PieChart width={112} height={112}>
        <Pie data={data} cx={51} cy={51} innerRadius={38} outerRadius={50}
          startAngle={90} endAngle={-270} paddingAngle={2} dataKey="value" stroke="none">
          <Cell fill="#22c55e" />
          <Cell fill="#e5e7eb" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900">{percentage}%</span>
      </div>
    </div>
  );
};

// --- Main Dashboard ---
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('month');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // Initial data load
  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get(`/dashboard/analytics?period=${chartPeriod}`)
    ])
      .then(([statsRes, analyticsRes]) => {
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Refetch analytics when period changes (skip initial load)
  useEffect(() => {
    if (!loading) {
      api.get(`/dashboard/analytics?period=${chartPeriod}`)
        .then(({ data }) => setAnalytics(data))
        .catch(console.error);
    }
  }, [chartPeriod]);

  const fetchNotifications = () => {
    setNotifLoading(true);
    api.get('/notifications')
      .then(({ data }) => setNotifications(data || []))
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time synchronization
  useSocket('patients', () => {
    api.get(`/dashboard/analytics?period=${chartPeriod}`).then(({ data }) => setAnalytics(data));
    api.get('/dashboard/stats').then(({ data }) => setStats(data));
    fetchNotifications();
  });
  useSocket('appointments', () => {
    api.get(`/dashboard/analytics?period=${chartPeriod}`).then(({ data }) => setAnalytics(data));
    api.get('/dashboard/stats').then(({ data }) => setStats(data));
    fetchNotifications();
  });
  useSocket('bills', () => {
    api.get(`/dashboard/analytics?period=${chartPeriod}`).then(({ data }) => setAnalytics(data));
    api.get('/dashboard/stats').then(({ data }) => setStats(data));
    fetchNotifications();
  });

  const todayStr = useMemo(() => new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }), []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Build chart data from analytics API
  const chartData = useMemo(() => {
    if (!analytics) return [];
    return analytics.labels.map((label, i) => ({
      label,
      total: analytics.totalPatients[i] || 0,
      appointments: analytics.appointments[i] || 0,
    }));
  }, [analytics]);

  // Collection rate for balance donut
  const collectionRate = useMemo(() => {
    if (!stats || !stats.totalRevenue) return 0;
    return Math.round((stats.totalPaid / stats.totalRevenue) * 100);
  }, [stats]);

  // Max appointment capacity (75 is the daily target)
  const APPT_TOTAL = 75;

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-80 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-5">
      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting}, {user?.name?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Here is the latest update for the last 7 days. Check now
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-elevated border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
                    <button onClick={() => setShowNotifications(false)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                          <p className="text-sm text-gray-700">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(n.time).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white rounded-lg px-3 py-2 shadow-card border border-gray-100">
              <Calendar className="h-4 w-4 text-primary-500" />
              {todayStr}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Appointments with capacity */}
          <AppointmentCapacityKPI booked={stats?.todayAppointments ?? 0} total={APPT_TOTAL} featured />
          <KPICard icon={CreditCard} label="Pending Bills" value={stats?.pendingBills ?? 0} trend={stats?.appointmentTrend} trendLabel="from last week" />
          <KPICard icon={DollarSign} label="Total Revenue" value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`} />
          <KPICard icon={Users} label="Total Patients" value={stats?.totalPatients ?? 0} trend={stats?.patientTrend} trendLabel="from last week" />
        </div>

        {/* Patient Statistics Chart */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Patient Statistics</h2>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {['week', 'month', 'year'].map((p) => (
                  <button key={p} onClick={() => setChartPeriod(p)} className={clsx(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                    chartPeriod === p ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                  )}>{p}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary-950" />
              <span className="text-gray-500">Patient registrations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00C97B]" />
              <span className="text-gray-500">Appointments</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" stroke="#1A3C34" strokeWidth={2.5}
                dot={false} activeDot={{ r: 5, fill: '#1A3C34', stroke: '#fff', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="appointments" stroke="#00C97B" strokeWidth={2.5}
                dot={false} activeDot={{ r: 5, fill: '#00C97B', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Balance Card */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Balance</h3>
              <button onClick={() => navigate('/billing')} className="text-xs text-primary-600 font-medium hover:underline">Open</button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <BalanceDonut percentage={collectionRate} />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total Transaction Revenue</p>
                <p className="text-lg font-bold text-gray-900">${(stats?.totalRevenue ?? 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Collected</p>
                <p className="text-sm font-semibold text-green-600">${(stats?.totalPaid ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Outstanding</p>
                <p className="text-sm font-semibold text-red-500">${(stats?.totalUnpaid ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Room Occupancy (static for now, no model) */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Room Occupancy</h3>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-4xl font-bold text-gray-900">52</span>
              <span className="text-xs font-medium bg-green-100 text-green-600 px-2 py-0.5 rounded-full">+124</span>
            </div>
            <div className="space-y-3">
              {[
                { icon: BedDouble, color: 'text-primary-600', label: 'General room', count: 124 },
                { icon: BedDouble, color: 'text-amber-500', label: 'Private room', count: 52 },
              ].map((room, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2.5">
                    <room.icon className={`h-4 w-4 ${room.color}`} />
                    <span className="text-sm text-gray-700">{room.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{room.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reports Feed */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Reports</h3>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Monthly patient report submitted', time: '1 minute ago' },
                { title: 'Quarterly revenue analysis ready', time: '3 hours ago' },
              ].map((report, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{report.time}</p>
                    <button onClick={() => navigate('/reports')}
                      className="text-xs text-primary-600 font-medium hover:underline mt-1 inline-flex items-center gap-1">
                      View report <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full xl:w-[280px] flex-shrink-0 space-y-5">
        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Schedule</h3>
            <div className="flex gap-1">
              <button className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><ChevronLeft className="h-4 w-4" /></button>
              <button className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <MiniCalendar />
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Upcoming</h3>
            <button onClick={() => navigate('/appointments')} className="text-xs text-primary-600 font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {stats?.upcomingAppointments?.length > 0 ? (
              stats.upcomingAppointments.map((apt) => (
                <AppointmentSlot key={apt.appointmentId} appointment={apt} />
              ))
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Patients</h3>
            <button onClick={() => navigate('/patients')} className="text-xs text-primary-600 font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {stats?.recentPatients?.map((patient) => (
              <button key={patient.patientId} onClick={() => navigate(`/patients/${patient.patientId}`)}
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700 flex-shrink-0">
                  {patient.patientName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{patient.patientName}</p>
                  <p className="text-xs text-gray-400">
                    {patient.age ? `${patient.age}y` : ''}{patient.gender ? ` · ${patient.gender}` : ''}
                  </p>
                </div>
              </button>
            ))}
            {(!stats?.recentPatients || stats.recentPatients.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">No patients yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
