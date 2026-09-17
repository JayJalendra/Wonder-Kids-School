import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ExamModal } from './ExamModal';
import { Plus, FileSpreadsheet, Edit2, Trash2, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExamList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exams');
      if (res.data.success) {
        setExams(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load exams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenAdd = () => {
    setSelectedExam(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (exam) => {
    setExamToDelete(exam);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/exams/${examToDelete.exam_id}`);
      setDeleteConfirmOpen(false);
      setExamToDelete(null);
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete exam');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Examinations
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage test schedules, evaluation terms, and result publications
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" onClick={handleOpenAdd} className="self-start sm:self-auto">
            <Plus className="w-4 h-4 mr-1" />
            Schedule Exam
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching examinations..." />
        ) : exams.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No exams scheduled</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create an examination term to enter student grades and generate report cards.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Exam ID</th>
                  <th className="py-3.5 px-4">Examination Title</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Graded Results</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((exam) => (
                  <tr key={exam.exam_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      #{exam.exam_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {exam.exam_name}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.exam_date}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {exam.results_count ?? 0} Students Graded
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {(isAdmin || isTeacher) && (
                        <Link
                          to={`/results?exam_id=${exam.exam_id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 mr-2"
                        >
                          <Award className="w-3.5 h-3.5" />
                          Marks Sheet
                        </Link>
                      )}

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(exam)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                            title="Edit Exam"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(exam)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Exam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
          Showing {exams.length} examination terms
        </div>
      </div>

      <ExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchExams}
        exam={selectedExam}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Examination"
        message={`Are you sure you want to delete "${examToDelete?.exam_name}"? All associated student marks will also be permanently deleted.`}
        isLoading={isDeleting}
      />
    </div>
  );
};
