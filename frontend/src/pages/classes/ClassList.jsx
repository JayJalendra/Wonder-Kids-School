import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ClassModal } from './ClassModal';
import { Plus, BookOpen, Edit2, Trash2, Users, Library, DoorOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClassList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = isTeacher ? '/teachers/me/classes' : '/classes';
      const [classRes, teacherRes] = await Promise.all([
        api.get(url),
        isAdmin ? api.get('/teachers') : Promise.resolve({ data: { data: [] } }),
      ]);

      if (classRes.data.success) {
        setClasses(classRes.data.data);
      }
      if (teacherRes.data.success) {
        setTeachers(teacherRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load classes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (cls) => {
    setClassToDelete(cls);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/classes/${classToDelete.class_id}`);
      setDeleteConfirmOpen(false);
      setClassToDelete(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete class');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            {isTeacher ? 'My Assigned Classes' : 'Classes & Sections'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isTeacher
              ? 'Classes assigned to your teaching profile'
              : 'Configure classrooms, sections, and assign class mentors'}
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" onClick={handleOpenAdd} className="self-start sm:self-auto">
            <Plus className="w-4 h-4 mr-1" />
            Create Class
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching classrooms..." />
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No classes found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Create class sections like Grade 10-A to enroll students and assign teachers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((c) => (
            <div
              key={c.class_id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                    <DoorOpen className="w-3.5 h-3.5" />
                    <span>{c.room_no || 'Room TBA'}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                        title="Edit Class"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(c)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-800 mt-3">
                  {c.class_name}
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Section: <span className="text-slate-800 font-semibold">{c.section}</span>
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Class Teacher:</span>
                    <span className="font-medium text-slate-700">
                      {c.teacher?.name || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Enrolled Students:</span>
                    <span className="font-semibold text-slate-800">
                      {c.student_count !== undefined ? c.student_count : (c.students?.length ?? 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Subjects:</span>
                    <span className="font-semibold text-slate-800">
                      {c.subject_count !== undefined ? c.subject_count : (c.subjects?.length ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <Link
                  to={`/students?class_id=${c.class_id}`}
                  className="text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  View Students
                </Link>

                <Link
                  to={`/attendance?class_id=${c.class_id}`}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  Attendance Sheet
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <>
          <ClassModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={fetchData}
            classItem={selectedClass}
            teachers={teachers}
          />

          <ConfirmModal
            isOpen={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Delete Class"
            message={`Are you sure you want to delete "${classToDelete?.class_name} - ${classToDelete?.section}"? Enrolled students will be marked as unassigned.`}
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
};
