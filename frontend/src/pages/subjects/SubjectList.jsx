import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { SubjectModal } from './SubjectModal';
import { Plus, Library, Edit2, Trash2, BookOpen } from 'lucide-react';

export const SubjectList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjRes, classRes] = await Promise.all([
        api.get('/subjects', {
          params: { class_id: selectedClass || undefined },
        }),
        api.get('/classes'),
      ]);

      if (subjRes.data.success) {
        setSubjects(subjRes.data.data);
      }
      if (classRes.data.success) {
        setClasses(classRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load subjects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const handleOpenAdd = () => {
    setSelectedSubject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subj) => {
    setSelectedSubject(subj);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (subj) => {
    setSubjectToDelete(subj);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/subjects/${subjectToDelete.subject_id}`);
      setDeleteConfirmOpen(false);
      setSubjectToDelete(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete subject');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Curriculum & Subjects
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage course subjects allocated to respective classroom sections
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" onClick={handleOpenAdd} className="self-start sm:self-auto">
            <Plus className="w-4 h-4 mr-1" />
            Add Subject
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="w-full sm:w-72">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Filter by Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>
                {c.class_name} - {c.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching subjects..." />
        ) : subjects.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Library className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No subjects found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add subjects to classes to build the curriculum.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Subject ID</th>
                  <th className="py-3.5 px-4">Subject Name</th>
                  <th className="py-3.5 px-4">Allocated Class</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((s) => (
                  <tr key={s.subject_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      #{s.subject_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {s.subject_name}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.class ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                          {s.class.class_name} - {s.class.section}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                          title="Edit Subject"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
          Showing {subjects.length} course modules
        </div>
      </div>

      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchData}
        subject={selectedSubject}
        classes={classes}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Subject"
        message={`Are you sure you want to delete "${subjectToDelete?.subject_name}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};
