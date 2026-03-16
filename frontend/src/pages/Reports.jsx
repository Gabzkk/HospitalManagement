import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { BarChart3, Users, Calendar, DollarSign, Download, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0ea5e9', '#14b8a6', '#f59e0b', '#8b5cf6'];

const mockRevenueData = [
  { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 }, { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 59000 }, { month: 'Jun', revenue: 67000 },
];

const mockPatientDemo = [
  { name: 'Pediatrics', value: 35 },
  { name: 'Cardiology', value: 25 },
  { name: 'Neurology', value: 20 },
  { name: 'Orthopedics', value: 20 },
];

const Reports = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reports')
            .then(res => setSummary(res.data.summary))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statCards = [
        { title: 'Total Revenue', value: summary ? `$${summary.revenue.toLocaleString()}` : '-', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { title: 'Total Patients', value: summary?.patients || '-', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Total Appointments', value: summary?.totalAppointments || '-', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: 'Appointments (This Month)', value: summary?.monthAppointments || '-', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hospital Reports</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Comprehensive analytics and reporting summary.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="gap-2"><Filter className="h-4 w-4" /> Filter</Button>
                    <Button className="gap-2"><Download className="h-4 w-4" /> Export PDF</Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Revenue Trends (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <div className="p-6 pt-0 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockRevenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10}
                                    tickFormatter={(val) => `$${val/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Demographics Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Departments (Traffic)</CardTitle>
                    </CardHeader>
                    <div className="p-6 pt-0 h-80 flex flex-col justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockPatientDemo}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {mockPatientDemo.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
