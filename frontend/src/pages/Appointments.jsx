import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ResponsiveTable, Pagination } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useSocket } from '../services/socket';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        dateFrom: new Date().toISOString().split('T')[0],
        dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: '',
        doctorId: '',
        patientId: ''
    });
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newAppt, setNewAppt] = useState({ patientId: '', doctorId: '', appointmentDateTime: '', department: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/appointments', { params: { ...filters, page, limit: 10 } });
            setAppointments(data.data || []); 
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAppointments(); }, [filters, page]);

    // Real-time synchronization
    useSocket('appointments', () => fetchAppointments());

    useEffect(() => {
        Promise.all([api.get('/doctors'), api.get('/patients')])
            .then(([docRes, patRes]) => {
                setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
                const patData = patRes.data?.data || patRes.data || [];
                setPatients(Array.isArray(patData) ? patData : []);
            })
            .catch(console.error);
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(1);
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/appointments', newAppt);
            setShowModal(false);
            setNewAppt({ patientId: '', doctorId: '', appointmentDateTime: '', department: '' });
            fetchAppointments();
        } catch (err) {
            alert('Failed to create appointment: ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { header: 'ID', accessor: 'appointmentId', hideOnMobile: true },
        { header: 'Date & Time', accessor: (row) => new Date(row.appointmentDateTime).toLocaleString() },
        { header: 'Patient', accessor: (row) => row.patient?.patientName || 'Unknown' },
        { header: 'Doctor', accessor: (row) => row.doctor?.name || 'Unknown' },
        {
            header: 'Status',
            accessor: 'status',
            cell: (row) => (
                 <Badge variant={
                    row.status === 'completed' ? 'green' : 
                    row.status === 'scheduled' ? 'blue' : 
                    row.status === 'cancelled' ? 'red' : 'gray'
                }>
                    {row.status}
                </Badge>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            cell: (row) => (
                <div className="flex gap-2 justify-end">
                     {row.status === 'scheduled' && (
                        <Button size="sm" variant="ghost" className="text-red-500">Cancel</Button>
                     )}
                     <Button size="sm" variant="ghost">Edit</Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
                <Button className="w-full sm:w-auto" onClick={() => setShowModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                </Button>
            </div>

            {/* Mobile Filters Toggle */}
            <div className="md:hidden">
                <Button 
                    variant="secondary" 
                    className="w-full justify-between"
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                    <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</span>
                    <span className={clsx("transition-transform", mobileFiltersOpen ? "rotate-180" : "")}>▼</span>
                </Button>
            </div>

            {/* Filters Panel */}
            <Card className={clsx("md:block", mobileFiltersOpen ? "block" : "hidden")}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <Input 
                        type="date" 
                        label="From Date" 
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />
                    <Input 
                        type="date" 
                        label="To Date" 
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    />
                    <Select 
                        label="Status" 
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                    </Select>
                 
                    <div className="hidden md:block"></div> 
                </div>
            </Card>

            <ResponsiveTable 
                columns={columns} 
                data={appointments} 
                isLoading={loading}
                keyField="appointmentId"
            />

            {/* New Appointment Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Appointment" size="lg">
                <form onSubmit={handleCreateAppointment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Patient *</label>
                            <select value={newAppt.patientId} onChange={(e) => setNewAppt({ ...newAppt, patientId: e.target.value })} required
                                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">Select Patient</option>
                                {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.patientName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Doctor *</label>
                            <select value={newAppt.doctorId} onChange={(e) => setNewAppt({ ...newAppt, doctorId: e.target.value })} required
                                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">Select Doctor</option>
                                {doctors.map(d => <option key={d.doctorId} value={d.doctorId}>{d.name} — {d.department || 'General'}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Date & Time *</label>
                            <input type="datetime-local" value={newAppt.appointmentDateTime}
                                onChange={(e) => setNewAppt({ ...newAppt, appointmentDateTime: e.target.value })} required
                                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Department</label>
                            <input type="text" value={newAppt.department} placeholder="e.g. Cardiology"
                                onChange={(e) => setNewAppt({ ...newAppt, department: e.target.value })}
                                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Appointment'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Appointments;
