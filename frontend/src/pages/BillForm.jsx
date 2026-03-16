import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react';
import clsx from 'clsx';

const ITEM_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'lab', label: 'Lab Test' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'other', label: 'Other' },
];

const emptyItem = () => ({ itemType: 'consultation', description: '', amount: '' });

const BillForm = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [department, setDepartment] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/patients')
      .then(({ data }) => setPatients(data.data || data || []))
      .catch(console.error);
  }, []);

  const filteredPatients = patients.filter(p =>
    p.patientName?.toLowerCase().includes(patientSearch.toLowerCase())
  ).slice(0, 8);

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleAddItem = () => setItems([...items, emptyItem()]);

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedPatient) return setError('Please select a patient');
    const validItems = items.filter(item => item.amount && Number(item.amount) > 0);
    if (validItems.length === 0) return setError('Add at least one item with an amount');

    setSubmitting(true);
    try {
      const { data } = await api.post('/bills', {
        patientId: selectedPatient.patientId,
        department: department || null,
        items: validItems.map(item => ({
          itemType: item.itemType,
          description: item.description,
          amount: Number(item.amount)
        }))
      });
      navigate(`/billing/${data.billingId}`);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Bill</h1>
          <p className="text-sm text-gray-500">Generate an invoice for a patient</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Patient & Department */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
              {selectedPatient ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-primary-200 bg-primary-50">
                  <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                    {selectedPatient.patientName?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{selectedPatient.patientName}</p>
                    <p className="text-xs text-gray-500">ID: {selectedPatient.patientId}</p>
                  </div>
                  <button type="button" onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium">Change</button>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => { setPatientSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search patient by name..."
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {showDropdown && patientSearch && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl shadow-dropdown border border-gray-100 py-1 max-h-60 overflow-auto">
                      {filteredPatients.length > 0 ? filteredPatients.map((p) => (
                        <button key={p.patientId} type="button"
                          onClick={() => { setSelectedPatient(p); setShowDropdown(false); setPatientSearch(p.patientName); }}
                          className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                            {p.patientName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{p.patientName}</p>
                            <p className="text-xs text-gray-400">{p.email || `ID: ${p.patientId}`}</p>
                          </div>
                        </button>
                      )) : (
                        <p className="px-3 py-2 text-sm text-gray-400">No patients found</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Cardiology"
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Bill Items</h2>
            <button type="button" onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <div className="col-span-3">Type</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-3">Amount ($)</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="col-span-3">
                  <select
                    value={item.itemType}
                    onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {ITEM_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Description"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    placeholder="0.00"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <button type="button" onClick={() => handleRemoveItem(index)}
                    disabled={items.length <= 1}
                    className={clsx(
                      "p-2 rounded-lg transition-colors",
                      items.length <= 1 ? "text-gray-300 cursor-not-allowed" : "text-red-400 hover:text-red-600 hover:bg-red-50"
                    )}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={submitting} className="min-w-[160px]">
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BillForm;
