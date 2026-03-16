import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ResponsiveTable } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useSocket } from '../services/socket';

const Staff = () => {
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', department: '', specialization: '', phone: '', email: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/staff');
            setStaffMembers(data); 
        } catch (error) {
            console.error('Failed to fetch staff', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    // Real-time sync
    useSocket('staff', () => fetchStaff());

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/staff', newStaff);
            setShowModal(false);
            setNewStaff({ name: '', department: '', specialization: '', phone: '', email: '' });
            fetchStaff();
        } catch (err) {
            alert('Failed to add staff: ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStaff = staffMembers.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.department?.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        { header: 'ID', accessor: 'staffId', hideOnMobile: true },
        { header: 'Name', accessor: 'name' },
        { header: 'Department', accessor: 'department' },
        { header: 'Role', accessor: 'specialization', hideOnMobile: true },
        { header: 'Phone', accessor: 'phone' },
        {
            header: 'Actions',
            accessor: 'actions',
            cell: (row) => (
                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-1">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-1">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Staff</h1>
                <Button className="w-full sm:w-auto" onClick={() => setShowModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                </Button>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                    type="text" 
                    placeholder="Search by name or department..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            <ResponsiveTable 
                columns={columns} 
                data={filteredStaff} 
                isLoading={loading}
                keyField="staffId"
            />

            {/* Add Staff Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Staff" size="lg">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Full Name *</label>
                            <input type="text" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} required
                                placeholder="John Doe"
                                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Department</label>
                            <input type="text" value={newStaff.department} onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                                placeholder="e.g. Administration"
                                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Role / Specialization</label>
                            <input type="text" value={newStaff.specialization} onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
                                placeholder="e.g. Receptionist"
                                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Phone</label>
                            <input type="text" value={newStaff.phone} onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                placeholder="+1 555-0100"
                                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
                            <input type="email" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                placeholder="staff@hospital.com"
                                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Staff'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Staff;
