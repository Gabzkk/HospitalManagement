import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';

const schema = z.object({
  patientName: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gender: z.string().optional(),
  age: z.coerce.number().min(0, 'Age must be valid').optional(),
});

const PatientForm = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema)
    });
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    useEffect(() => {
        if (isEdit) {
            api.get(`/patients/${id}`).then(({ data }) => {
                reset({
                    patientName: data.patientName,
                    email: data.email || '',
                    phone: data.phone || '',
                    age: data.age,
                    gender: data.gender || '',
                    address: data.address || ''
                });
            }).catch(() => alert('Failed to fetch patient details'));
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (data) => {
        try {
            if (isEdit) {
                await api.put(`/patients/${id}`, data);
            } else {
                await api.post('/patients', data);
            }
            navigate('/patients');
        } catch (error) {
            console.error(error);
            alert('Failed to save patient: ' + (error.response?.data?.error?.message || error.message));
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>{isEdit ? 'Edit Patient' : 'Add New Patient'}</CardTitle>
                </CardHeader>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Full Name *" 
                            {...register('patientName')} 
                            error={errors.patientName?.message}
                        />

                        <Input 
                            label="Email" 
                            type="email"
                            {...register('email')} 
                            error={errors.email?.message}
                        />

                        <Input 
                            label="Phone" 
                            {...register('phone')} 
                            error={errors.phone?.message}
                        />
                        
                        <Input 
                            label="Age" 
                            type="number"
                            {...register('age')} 
                            error={errors.age?.message}
                        />
                        
                        <Select 
                            label="Gender" 
                            {...register('gender')}
                            error={errors.gender?.message}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </Select>
                    </div>

                    <Textarea 
                        label="Address" 
                        rows="3"
                        {...register('address')} 
                        error={errors.address?.message}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => navigate('/patients')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {isEdit ? 'Update Patient' : 'Create Patient'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default PatientForm;
