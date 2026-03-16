import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  ArrowLeft, Printer, DollarSign, Receipt, CheckCircle2,
  Clock, AlertCircle, FileText
} from 'lucide-react';
import clsx from 'clsx';

const ITEM_TYPE_LABELS = {
  consultation: 'Consultation',
  lab: 'Lab Test',
  procedure: 'Procedure',
  medicine: 'Medicine',
  other: 'Other',
};

const BillDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const fetchBill = () => {
    api.get(`/bills/${id}`)
      .then(({ data }) => setBill(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBill(); }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setPayError('');
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return setPayError('Enter a valid amount');

    setPaying(true);
    try {
      const { data } = await api.put(`/bills/${id}/payment`, { amount });
      setBill(data);
      setPaymentAmount('');
    } catch (err) {
      setPayError(err?.response?.data?.error || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse max-w-4xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-20">
        <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-lg text-gray-500">Bill not found</p>
        <Button variant="ghost" onClick={() => navigate('/billing')} className="mt-4">Back to Billing</Button>
      </div>
    );
  }

  const totalAmount = Number(bill.totalAmount);
  const amountPaid = Number(bill.amountPaid);
  const balance = totalAmount - amountPaid;
  const isPaid = bill.paymentStatus === 'paid';

  const statusConfig = {
    paid: { icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Paid in Full' },
    partial: { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Partially Paid' },
    unpaid: { icon: AlertCircle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Unpaid' },
  };
  const status = statusConfig[bill.paymentStatus] || statusConfig.unpaid;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice INV-{String(bill.billingId).padStart(4, '0')}</h1>
            <p className="text-sm text-gray-500">
              Created {new Date(bill.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" /> Print
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={clsx("flex items-center gap-3 p-4 rounded-xl border", status.bg, status.border)}>
        <StatusIcon className={clsx("h-5 w-5", status.text)} />
        <div>
          <p className={clsx("text-sm font-semibold", status.text)}>{status.label}</p>
          <p className="text-xs text-gray-500">
            {isPaid ? 'This invoice has been fully settled' : `Balance remaining: $${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Info */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Name</p>
                <p className="text-sm font-medium text-gray-900">{bill.patient?.patientName || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Patient ID</p>
                <p className="text-sm font-medium text-gray-900">{bill.patientId}</p>
              </div>
              {bill.department && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Department</p>
                  <p className="text-sm font-medium text-gray-900">{bill.department}</p>
                </div>
              )}
              {bill.patient?.phone && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{bill.patient.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Invoice Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 pr-4">#</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 pr-4">Type</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 pr-4">Description</th>
                    <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items?.map((item, index) => (
                    <tr key={item.itemId} className="border-b border-gray-50">
                      <td className="py-3 pr-4 text-sm text-gray-400">{index + 1}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="default">{ITEM_TYPE_LABELS[item.itemType] || item.itemType}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-700">{item.description || '—'}</td>
                      <td className="py-3 text-sm font-medium text-gray-900 text-right">${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan="3" className="py-4 text-sm font-semibold text-gray-900 text-right pr-4">Total</td>
                    <td className="py-4 text-lg font-bold text-gray-900 text-right">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  {amountPaid > 0 && (
                    <>
                      <tr>
                        <td colSpan="3" className="py-1 text-sm text-green-600 text-right pr-4">Paid</td>
                        <td className="py-1 text-sm font-semibold text-green-600 text-right">-${amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="py-2 text-sm font-semibold text-gray-900 text-right pr-4">Balance Due</td>
                        <td className="py-2 text-lg font-bold text-red-600 text-right">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </>
                  )}
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Panel */}
        <div className="space-y-5 print:hidden">
          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Amount</span>
                <span className="text-sm font-semibold text-gray-900">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount Paid</span>
                <span className="text-sm font-semibold text-green-600">${amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Balance Due</span>
                <span className={clsx("text-sm font-bold", isPaid ? "text-green-600" : "text-red-600")}>
                  ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Record Payment */}
          {!isPaid && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Record Payment</h3>
              <form onSubmit={handlePayment} className="space-y-3">
                {payError && (
                  <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg">{payError}</div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={balance}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Max: $${balance.toFixed(2)}`}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPaymentAmount(String(balance.toFixed(2)))}
                    className="text-xs text-primary-600 font-medium hover:underline">
                    Pay Full Balance
                  </button>
                </div>
                <Button type="submit" className="w-full" isLoading={paying}>
                  <DollarSign className="h-4 w-4 mr-1.5" /> Record Payment
                </Button>
              </form>
            </div>
          )}

          {isPaid && (
            <div className="bg-green-50 rounded-2xl p-5 border border-green-200 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-green-700">Fully Paid</p>
              <p className="text-xs text-green-600 mt-1">This invoice has been settled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillDetails;
