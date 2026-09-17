import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const ExamModal = ({ isOpen, onClose, onSave, exam = null }) => {
  const [formData, setFormData] = useState({
    exam_name: '',
    exam_date: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (exam) {
      setFormData({
        exam_name: exam.exam_name || '',
        exam_date: exam.exam_date ? exam.exam_date.split('T')[0] : '',
      });
    } else {
      setFormData({
        exam_name: '',
        exam_date: new Date().toISOString().split('T')[0],
      });
    }
    setError('');
  }, [exam, isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (exam?.exam_id) {
        await api.put(`/exams/${exam.exam_id}`, formData);
      } else {
        await api.post('/exams', formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exam');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exam ? 'Edit Examination' : 'Schedule New Exam'}
      maxWidth="max-w-md"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Examination Title"
          name="exam_name"
          value={formData.exam_name}
          onChange={handleChange}
          placeholder="e.g. Midterm Examination 2026"
          required
        />

        <Input
          label="Exam Date"
          name="exam_date"
          type="date"
          value={formData.exam_date}
          onChange={handleChange}
          required
        />

        <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {exam ? 'Update Exam' : 'Schedule Exam'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
