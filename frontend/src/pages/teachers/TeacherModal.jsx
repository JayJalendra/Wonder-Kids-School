import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const TeacherModal = ({ isOpen, onClose, onSave, teacher = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    phone: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || '',
        qualification: teacher.qualification || '',
        phone: teacher.phone || '',
        email: teacher.email || '',
      });
    } else {
      setFormData({
        name: '',
        qualification: '',
        phone: '',
        email: '',
      });
    }
    setError('');
  }, [teacher, isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (teacher?.teacher_id) {
        await api.put(`/teachers/${teacher.teacher_id}`, formData);
      } else {
        await api.post('/teachers', formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save teacher record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={teacher ? 'Edit Teacher' : 'Add New Teacher'}
      maxWidth="max-w-md"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Dr. Ramesh Verma"
          required
        />

        <Input
          label="Qualification"
          name="qualification"
          value={formData.qualification}
          onChange={handleChange}
          placeholder="e.g. M.Sc., B.Ed. in Mathematics"
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="teacher@school.com"
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

        <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {teacher ? 'Update Teacher' : 'Save Teacher'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
