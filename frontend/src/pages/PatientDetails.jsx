import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ResponsiveTable } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Calendar, CreditCard, Activity, Edit, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

const PatientDetails = () => {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('appointments');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/patients/${id}`)
            .then(({ data }) => setPatient(data))
            .catch((err) => {
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-4"><div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div></div>;
    if (!patient) return <div className="p-4 text-center">Patient not found.</div>;

    const appointmentColumns = [
        { 
            header: 'Date', 
            accessor: (row) => new Date(row.appointmentDateTime).toLocaleString(), 
        },
        { header: 'Department', accessor: 'department', hideOnMobile: true },
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
        { header: 'Diagnosis', accessor: (row) => row.medicalRecord?.diagnosis || '-', hideOnMobile: true }
    ];

    const billColumns = [
        { header: 'ID', accessor: 'billingId' },
        { header: 'Date', accessor: (row) => new Date(row.createdAt).toLocaleDateString() },
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
        }
    ];

    const tabs = [
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'records', label: 'Medical Records', icon: Activity },
        { id: 'bills', label: 'Billing', icon: CreditCard },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/patients">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{patient.patientName}</h2>
                        <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
                            <span>{patient.age} years</span>
                            <span>•</span>
                            <span>{patient.gender}</span>
                            <span>•</span>
                            <span>{patient.phone || 'No phone'}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                           {patient.address || 'No address provided'}
                        </div>
                    </div>
                    <div className="flex items-start">
                        <Link to={`/patients/${id}/edit`}>
                             <Button variant="secondary" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>

            <div>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={clsx(
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                        'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-6">
                    {activeTab === 'appointments' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Appointment History</h3>
                                <Button size="sm">New Appointment</Button>
                            </div>
                            <ResponsiveTable 
                                columns={appointmentColumns} 
                                data={patient.appointments || []} 
                                keyField="appointmentId"
                                emptyMessage="No appointments found."
                            />
                        </div>
                    )}

                    {activeTab === 'bills' && (
                         <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
                                <Button size="sm">Create Bill</Button>
                            </div>
                            <ResponsiveTable 
                                columns={billColumns} 
                                data={patient.bills || []} 
                                keyField="billingId"
                                emptyMessage="No bills found."
                            />
                        </div>
                    )}
                    
                    {activeTab === 'records' && (
                        <div className="text-center py-10 text-gray-500">
                            Medical records UI coming soon.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDetails;
