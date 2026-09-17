import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { StudentModal } from './StudentModal';
import { Plus, Search, Edit2, Trash2, Users, Eye } from 'lucide-react';

export const StudentList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        api.get(`/students`, {
          params: {
            search: searchTerm || undefined,
            class_id: selectedClass || undefined,
          },
        }),
        api.get('/classes'),
      ]);

      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      }
      if (classesRes.data.success) {
        setClasses(classesRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch students data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenAddModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (st) => {
    setSelectedStudent(st);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (st) => {
    setStudentToDelete(st);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/students/${studentToDelete.student_id}`);
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Student Directory
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage student registrations, academic classes, and contact records
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            className="self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Student
          </Button>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
          <div className="flex-1">
            <Input
              name="search"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="w-full md:w-64">
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching students..." />
        ) : students.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">
              No students found
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No student profiles match your search criteria. Try clearing filters or adding a new student.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">DOB / Gender</th>
                  <th className="py-3.5 px-4">Contact</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.student_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      #{st.student_id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div>{st.name}</div>
                      <span className="text-xs text-slate-400 font-normal">
                        {st.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {st.class ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                          {st.class.class_name} - {st.class.section}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      <div>{st.dob}</div>
                      <span className="text-slate-400">{st.gender}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{st.phone || 'No phone'}</div>
                      <span className="text-slate-400 truncate max-w-xs block">
                        {st.address || 'No address'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(st)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(st)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Student"
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

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {students.length} student records</span>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchData}
        student={selectedStudent}
        classes={classes}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student Record"
        message={`Are you sure you want to delete "${studentToDelete?.name}"? All associated attendance, results, and fee records will also be permanently deleted.`}
        isLoading={isDeleting}
      />
    </div>
  );
};
