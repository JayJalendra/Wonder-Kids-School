import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const ClassModal = ({ isOpen, onClose, onSave, classItem = null, teachers = [] }) => {
  const [formData, setFormData] = useState({
    class_name: '',
    section: '',
    room_no: '',
    teacher_id: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (classItem) {
      setFormData({
        class_name: classItem.class_name || '',
        section: classItem.section || '',
        room_no: classItem.room_no || '',
        teacher_id: classItem.teacher_id ? String(classItem.teacher_id) : '',
      });
    } else {
      setFormData({
        class_name: '',
        section: '',
        room_no: '',
        teacher_id: '',
      });
    }
    setError('');
  }, [classItem, isOpen]);

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
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id, 10) : null,
      };

      if (classItem?.class_id) {
        await api.put(`/classes/${classItem.class_id}`, payload);
      } else {
        await api.post('/classes', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save class record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={classItem ? 'Edit Class' : 'Create New Class'}
      maxWidth="max-w-md"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Class Name"
          name="class_name"
          value={formData.class_name}
          onChange={handleChange}
          placeholder="e.g. Class 10, Class 11"
          required
        />

        <Input
          label="Section"
          name="section"
          value={formData.section}
          onChange={handleChange}
          placeholder="e.g. A, B, Science"
          required
        />

        <Input
          label="Room Number"
          name="room_no"
          value={formData.room_no}
          onChange={handleChange}
          placeholder="e.g. Room 101, Lab 202"
        />

        <Select
          label="Class Teacher"
          name="teacher_id"
          value={formData.teacher_id}
          onChange={handleChange}
          options={teachers.map((t) => ({
            value: String(t.teacher_id),
            label: `${t.name} (${t.qualification || 'Teacher'})`,
          }))}
          placeholder="Select an assigned teacher"
        />

        <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {classItem ? 'Update Class' : 'Create Class'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
