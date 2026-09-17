import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { TeacherModal } from './TeacherModal';
import { Plus, Search, Edit2, Trash2, GraduationCap, Mail, Phone } from 'lucide-react';

export const TeacherList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teachers', {
        params: { search: searchTerm || undefined },
      });
      if (res.data.success) {
        setTeachers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch teachers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTeachers();
  };

  const handleOpenAddModal = () => {
    setSelectedTeacher(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t) => {
    setSelectedTeacher(t);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (t) => {
    setTeacherToDelete(t);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/teachers/${teacherToDelete.teacher_id}`);
      setDeleteConfirmOpen(false);
      setTeacherToDelete(null);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete teacher');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Faculty & Teachers
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage teacher profiles, academic qualifications, and class allocations
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            className="self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Teacher
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <Input
            name="search"
            placeholder="Search teachers by name, qualification, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching teachers..." />
        ) : teachers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No teachers found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add your faculty members to assign them to classes and courses.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Teacher Name</th>
                  <th className="py-3.5 px-4">Qualification</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Assigned Classes</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((t) => (
                  <tr key={t.teacher_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      #{t.teacher_id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div>{t.name}</div>
                      <span className="text-xs text-slate-400 font-normal">{t.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {t.qualification || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{t.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.classes && t.classes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {t.classes.map((cls) => (
                            <span
                              key={cls.class_id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                            >
                              {cls.class_name} ({cls.section})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                          title="Edit Teacher"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Teacher"
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
          Showing {teachers.length} faculty records
        </div>
      </div>

      <TeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchTeachers}
        teacher={selectedTeacher}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Teacher Record"
        message={`Are you sure you want to delete "${teacherToDelete?.name}"? Assigned classes will have their teacher set to unassigned.`}
        isLoading={isDeleting}
      />
    </div>
  );
};
