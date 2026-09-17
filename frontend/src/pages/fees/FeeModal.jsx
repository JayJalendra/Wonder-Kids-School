import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const FeeModal = ({ isOpen, onClose, onSave, fee = null, students = [] }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    paid_amount: '',
    payment_date: '',
    status: 'Pending',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (fee) {
      const billed = fee.amount || '';
      const paid =
        fee.paid_amount !== undefined && fee.paid_amount !== null
          ? String(fee.paid_amount)
          : fee.status === 'Paid'
          ? String(billed)
          : '0';

      setFormData({
        student_id: fee.student_id ? String(fee.student_id) : '',
        amount: billed,
        paid_amount: paid,
        payment_date: fee.payment_date ? fee.payment_date.split('T')[0] : '',
        status: fee.status || 'Pending',
      });
    } else {
      setFormData({
        student_id: students[0] ? String(students[0].student_id) : '',
        amount: '25000',
        paid_amount: '0',
        payment_date: '',
        status: 'Pending',
      });
    }
    setError('');
  }, [fee, isOpen, students]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // If status changed to Paid, auto-fill paid_amount with total amount
      if (name === 'status' && value === 'Paid') {
        next.paid_amount = next.amount;
        if (!next.payment_date) {
          next.payment_date = new Date().toISOString().split('T')[0];
        }
      }

      // If status changed to Overdue, reset paid to 0
      if (name === 'status' && value === 'Overdue') {
        next.paid_amount = '0';
        next.payment_date = '';
      }

      return next;
    });
    if (error) setError('');
  };

  const billedNum = parseFloat(formData.amount || 0);
  const paidNum = parseFloat(formData.paid_amount || 0);
  const dueNum = Math.max(0, billedNum - paidNum);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        student_id: parseInt(formData.student_id, 10),
        amount: parseFloat(formData.amount),
        paid_amount: parseFloat(formData.paid_amount || 0),
        payment_date: formData.payment_date || null,
        status: formData.status,
      };

      if (fee?.fee_id) {
        await api.put(`/fees/${fee.fee_id}`, payload);
      } else {
        await api.post('/fees', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save fee invoice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fee ? 'Edit Fee Invoice' : 'Issue Fee Invoice'}
      maxWidth="max-w-md"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Student <span className="text-rose-500">*</span>
          </label>
          <select
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            required
            disabled={!!fee}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {students.map((st) => (
              <option key={st.student_id} value={st.student_id}>
                {st.name} (ID: #{st.student_id}) {st.class ? `- ${st.class.class_name}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Total Fee (₹)"
            name="amount"
            type="number"
            step="1"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g. 25000"
            required
          />

          <Input
            label="Paid Amount (₹)"
            name="paid_amount"
            type="number"
            step="1"
            min="0"
            max={formData.amount || undefined}
            value={formData.paid_amount}
            onChange={handleChange}
            placeholder="e.g. 15000"
            required
          />
        </div>

        {/* Real-time Due Fee Calculation Card */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block">Remaining Due Fee:</span>
            <span
              className={`text-base font-bold ${
                dueNum > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              ₹{dueNum.toLocaleString('en-IN')}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              dueNum === 0
                ? 'bg-emerald-100 text-emerald-800'
                : paidNum > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {dueNum === 0 ? 'Fully Cleared' : paidNum > 0 ? 'Partial Payment' : 'Unpaid Due'}
          </span>
        </div>

        <Select
          label="Payment Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'Paid', label: 'Paid' },
            { value: 'Overdue', label: 'Overdue' },
          ]}
          required
        />

        <Input
          label="Payment Date (if paid)"
          name="payment_date"
          type="date"
          value={formData.payment_date}
          onChange={handleChange}
          helperText="Date of receipt or bank transaction clearance"
        />

        <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {fee ? 'Update Invoice' : 'Issue Invoice'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
