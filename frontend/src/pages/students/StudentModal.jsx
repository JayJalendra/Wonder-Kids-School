import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const StudentModal = ({ isOpen, onClose, onSave, student = null, classes = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
    class_id: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        dob: student.dob ? student.dob.split('T')[0] : '',
        gender: student.gender || 'Male',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        class_id: student.class_id ? String(student.class_id) : '',
      });
    } else {
      setFormData({
        name: '',
        dob: '',
        gender: 'Male',
        email: '',
        phone: '',
        address: '',
        class_id: '',
      });
    }
    setError('');
  }, [student, isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        class_id: formData.class_id ? parseInt(formData.class_id, 10) : null,
      };

      if (student?.student_id) {
        await api.put(`/students/${student.student_id}`, payload);
      } else {
        await api.post('/students', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? 'Edit Student' : 'Add New Student'}
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Alex Turner"
            required
          />

          <Input
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            required
          />

          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
            required
          />

          <Select
            label="Class & Section"
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            options={classes.map((c) => ({
              value: String(c.class_id),
              label: `${c.class_name} - ${c.section} (${c.room_no || 'Room N/A'})`,
            }))}
            placeholder="Select a class"
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@school.com"
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Residential Address
          </label>
          <textarea
            name="address"
            rows="2"
            value={formData.address}
            onChange={handleChange}
            placeholder="House/Flat No., Street, City, State, PIN Code..."
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {student ? 'Update Student' : 'Save Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
