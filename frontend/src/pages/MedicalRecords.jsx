import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ResponsiveTable, Pagination } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MedicalRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const canCreate = user?.role === 'DOCTOR';

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/medical-records');
                setRecords(data.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const columns = [
        { header: 'ID', accessor: 'recordId', hideOnMobile: true },
        { header: 'Patient', accessor: (row) => row.appointment?.patient?.patientName || 'Unknown' },
        { header: 'Diagnosis', accessor: 'diagnosis' },
        { header: 'Treatment', accessor: 'treatment', hideOnMobile: true },
        { header: 'Date', accessor: (row) => new Date(row.createdAt).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: 'actions',
            cell: (row) => (
                <Button size="sm" variant="ghost">View</Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Medical Records</h1>
                {canCreate && (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Record
                    </Button>
                )}
            </div>

            <ResponsiveTable 
                columns={columns} 
                data={records} 
                isLoading={loading}
                keyField="recordId"
            />
        </div>
    );
};

export default MedicalRecords;
