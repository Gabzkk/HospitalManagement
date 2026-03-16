import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ResponsiveTable, Pagination } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({});
    const { user } = useAuth();
    const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';
    const navigate = useNavigate();

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/patients`, {
                params: { search, page, limit: 10 }
            });
            setPatients(data.data);
            setMeta(data.meta);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(fetchPatients, 300);
        return () => clearTimeout(debounce);
    }, [search, page]);

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent row click
        if (!window.confirm('Are you sure you want to delete this patient?')) return;
        try {
            await api.delete(`/patients/${id}`);
            fetchPatients();
        } catch (error) {
            alert('Failed to delete patient');
        }
    };

    const columns = [
        { header: 'ID', accessor: 'patientId', hideOnMobile: true }, // Hide ID on mobile cards if redundant
        { header: 'Name', accessor: 'patientName' },
        { 
            header: 'Age/Gender', 
            accessor: (row) => `${row.age} / ${row.gender}`,
        },
        { header: 'Phone', accessor: 'phone' },
        {
            header: 'Actions',
            accessor: 'actions',
            cell: (row) => (
                <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/patients/${row.patientId}`}>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-1">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    {canEdit && (
                        <>
                            <Link to={`/patients/${row.patientId}/edit`}>
                                <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700 p-1">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-1" onClick={(e) => handleDelete(row.patientId, e)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
                {canEdit && (
                    <Link to="/patients/new">
                        <Button className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Patient
                        </Button>
                    </Link>
                )}
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                    type="text" 
                    placeholder="Search by name or phone..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            <ResponsiveTable 
                columns={columns} 
                data={patients} 
                isLoading={loading}
                keyField="patientId"
                onRowClick={(row) => navigate(`/patients/${row.patientId}`)}
            />

            <Pagination 
                currentPage={page} 
                totalPages={meta.last_page || 1} 
                onPageChange={setPage} 
            />
        </div>
    );
};

export default Patients;
