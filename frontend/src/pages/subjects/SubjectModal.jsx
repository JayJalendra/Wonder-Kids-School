import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const SubjectModal = ({ isOpen, onClose, onSave, subject = null, classes = [] }) => {
  const [formData, setFormData] = useState({
    subject_name: '',
    class_id: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (subject) {
      setFormData({
        subject_name: subject.subject_name || '',
        class_id: subject.class_id ? String(subject.class_id) : '',
      });
    } else {
      setFormData({
        subject_name: '',
        class_id: classes[0] ? String(classes[0].class_id) : '',
      });
    }
    setError('');
  }, [subject, isOpen, classes]);

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
        subject_name: formData.subject_name,
        class_id: parseInt(formData.class_id, 10),
      };

      if (subject?.subject_id) {
        await api.put(`/subjects/${subject.subject_id}`, payload);
      } else {
        await api.post('/subjects', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subject ? 'Edit Subject' : 'Add Subject'}
      maxWidth="max-w-md"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Subject Name"
          name="subject_name"
          value={formData.subject_name}
          onChange={handleChange}
          placeholder="e.g. Mathematics, Organic Chemistry"
          required
        />

        <Select
          label="Associated Class"
          name="class_id"
          value={formData.class_id}
          onChange={handleChange}
          options={classes.map((c) => ({
            value: String(c.class_id),
            label: `${c.class_name} - ${c.section}`,
          }))}
          required
        />

        <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {subject ? 'Update Subject' : 'Save Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
