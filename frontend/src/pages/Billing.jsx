import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ResponsiveTable, Pagination } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Billing = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBills = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/bills');
                setBills(data.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, []);

    const columns = [
        { header: 'ID', accessor: 'billingId' },
        { header: 'Patient', accessor: (row) => row.patient?.patientName || 'Unknown' },
        { header: 'Department', accessor: 'department', hideOnMobile: true },
        { header: 'Total', accessor: (row) => `$${Number(row.totalAmount).toFixed(2)}` },
        { header: 'Paid', accessor: (row) => `$${Number(row.amountPaid).toFixed(2)}`, hideOnMobile: true },
        { 
            header: 'Status', 
            accessor: 'paymentStatus',
            cell: (row) => (
                <Badge variant={
                    row.paymentStatus === 'paid' ? 'green' : 
                    row.paymentStatus === 'partial' ? 'yellow' : 'red'
                }>
                    {row.paymentStatus}
                </Badge>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            cell: (row) => (
                <Button size="sm" variant="ghost" onClick={() => navigate(`/billing/${row.billingId}`)}>
                    View
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Billing & Invoices</h1>
                <Button onClick={() => navigate('/billing/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bill
                </Button>
            </div>

            <ResponsiveTable 
                columns={columns} 
                data={bills} 
                isLoading={loading}
                keyField="billingId"
            />
        </div>
    );
};

export default Billing;
