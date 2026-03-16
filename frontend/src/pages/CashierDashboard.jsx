import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  CreditCard, TrendingUp, TrendingDown, DollarSign,
  Clock, Receipt, Plus, ArrowRight, AlertCircle, CheckCircle2,
  Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import clsx from 'clsx';
import { Badge } from '../components/ui/Badge';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary-950 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
        ${Number(payload[0].value).toLocaleString()}
      </div>
    );
  }
  return null;
};

const KPICard = ({ icon: Icon, label, value, subtitle, color = 'primary' }) => {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className={clsx("p-2.5 rounded-xl", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-sm font-medium mb-1 text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

const CashierDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/billing-stats'),
      api.get(`/dashboard/analytics?period=${chartPeriod}`)
    ])
      .then(([statsRes, analyticsRes]) => {
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Refetch analytics when period changes
  useEffect(() => {
    if (!loading) {
      api.get(`/dashboard/analytics?period=${chartPeriod}`)
        .then(({ data }) => setAnalytics(data))
        .catch(console.error);
    }
  }, [chartPeriod]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const todayStr = useMemo(() => new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }), []);

  const chartData = useMemo(() => {
    if (!analytics) return [];
    return analytics.labels.map((label, i) => ({
      name: label,
      revenue: analytics.revenue[i] || 0,
    }));
  }, [analytics]);

  // Collection rate donut
  const collectionRate = useMemo(() => {
    if (!stats || !stats.totalRevenue) return 0;
    return Math.round((stats.totalPaid / stats.totalRevenue) * 100);
  }, [stats]);

  const donutData = [{ value: collectionRate }, { value: 100 - collectionRate }];

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
              {greeting}, {user?.name?.split(' ')[0] || 'Cashier'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Billing & transactions overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/billing/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Bill
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white rounded-lg px-3 py-2 shadow-card border border-gray-100">
              <Calendar className="h-4 w-4 text-primary-500" />
              {todayStr}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard
            icon={DollarSign}
            label="Today's Collections"
            value={`$${(stats?.todayCollections ?? 0).toLocaleString()}`}
            subtitle={`${stats?.todayBills ?? 0} bills processed today`}
            color="green"
          />
          <KPICard
            icon={AlertCircle}
            label="Pending Bills"
            value={stats?.pendingBills ?? 0}
            subtitle="Awaiting payment"
            color="amber"
          />
          <KPICard
            icon={Receipt}
            label="Total Revenue"
            value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`}
            subtitle={`$${(stats?.totalPaid ?? 0).toLocaleString()} collected`}
            color="primary"
          />
          <KPICard
            icon={CreditCard}
            label="Total Bills"
            value={stats?.totalBills ?? 0}
            subtitle="All-time invoices"
            color="primary"
          />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {['week', 'month', 'year'].map((p) => (
                <button key={p} onClick={() => setChartPeriod(p)} className={clsx(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                  chartPeriod === p ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                )}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={(v) => v >= 1000 ? `$${v / 1000}k` : `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#00C97B" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full xl:w-[320px] flex-shrink-0 space-y-5">
        {/* Collection Rate */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Collection Rate</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-28 h-28">
              <PieChart width={112} height={112}>
                <Pie data={donutData} cx={51} cy={51} innerRadius={38} outerRadius={50}
                  startAngle={90} endAngle={-270} paddingAngle={2} dataKey="value" stroke="none">
                  <Cell fill="#22c55e" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{collectionRate}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Billed</p>
              <p className="text-lg font-bold text-gray-900">${(stats?.totalRevenue ?? 0).toLocaleString()}</p>
              <div className="grid grid-cols-2 gap-3 pt-2 mt-2 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Collected</p>
                  <p className="text-sm font-semibold text-green-600">${(stats?.totalPaid ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Outstanding</p>
                  <p className="text-sm font-semibold text-red-500">${((stats?.totalRevenue ?? 0) - (stats?.totalPaid ?? 0)).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bills */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Bills</h3>
            <button onClick={() => navigate('/billing')} className="text-xs text-primary-600 font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {stats?.recentBills?.length > 0 ? (
              stats.recentBills.slice(0, 6).map((bill) => (
                <button
                  key={bill.billingId}
                  onClick={() => navigate(`/billing/${bill.billingId}`)}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left border border-gray-100"
                >
                  <div className={clsx(
                    "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    bill.paymentStatus === 'paid' ? 'bg-green-50' : bill.paymentStatus === 'partial' ? 'bg-amber-50' : 'bg-red-50'
                  )}>
                    {bill.paymentStatus === 'paid' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {bill.patient?.patientName || 'Patient'}
                    </p>
                    <p className="text-xs text-gray-400">INV-{String(bill.billingId).padStart(4, '0')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${Number(bill.totalAmount).toLocaleString()}</p>
                    <Badge variant={bill.paymentStatus === 'paid' ? 'green' : bill.paymentStatus === 'partial' ? 'yellow' : 'red'}>
                      {bill.paymentStatus}
                    </Badge>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-6">
                <Receipt className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No bills yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
