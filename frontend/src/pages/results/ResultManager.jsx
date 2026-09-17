import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Eye,
  BarChart2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const ResultManager = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialExamId = searchParams.get('exam_id') || '';

  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedExam, setSelectedExam] = useState(initialExamId);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Accordion expanded rows state (Set of group keys)
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Subject Marks Breakdown Modal
  const [activeGroupKey, setActiveGroupKey] = useState(null);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    exam_id: '',
    subject_id: '',
    marks: '',
  });
  const [selectedResult, setSelectedResult] = useState(null);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resultToDelete, setResultToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDropdowns = async () => {
    try {
      const [examRes, classRes, subjectRes, studentRes] = await Promise.all([
        api.get('/exams'),
        api.get('/classes'),
        api.get('/subjects'),
        api.get('/students'),
      ]);
      if (examRes.data.success) {
        setExams(examRes.data.data);
        if (!selectedExam && examRes.data.data.length > 0) {
          setSelectedExam(String(examRes.data.data[0].exam_id));
        }
      }
      if (classRes.data.success) {
        setClasses(classRes.data.data);
      }
      if (subjectRes.data.success) {
        setSubjects(subjectRes.data.data);
      }
      if (studentRes.data.success) {
        setStudents(studentRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load dropdowns', err);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get('/results', {
        params: {
          exam_id: selectedExam || undefined,
          class_id: selectedClass || undefined,
        },
      });
      if (res.data.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load results', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [selectedExam, selectedClass]);

  // Group raw result entries by Student and Exam so student names NEVER repeat
  const groupedResults = useMemo(() => {
    const groups = {};
    results.forEach((r) => {
      const key = `${r.student_id}_${r.exam_id}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          student_id: r.student_id,
          student: r.student,
          exam_id: r.exam_id,
          exam: r.exam,
          subjects: [],
          totalMarks: 0,
        };
      }
      groups[key].subjects.push(r);
      groups[key].totalMarks += parseFloat(r.marks || 0);
    });

    return Object.values(groups).map((g) => {
      const count = g.subjects.length;
      const avgPercentage = count > 0 ? g.totalMarks / count : 0;
      let overallGrade = 'F';
      if (avgPercentage >= 90) overallGrade = 'A+';
      else if (avgPercentage >= 80) overallGrade = 'A';
      else if (avgPercentage >= 70) overallGrade = 'B';
      else if (avgPercentage >= 60) overallGrade = 'C';
      else if (avgPercentage >= 50) overallGrade = 'D';

      return {
        ...g,
        avgPercentage: avgPercentage.toFixed(1),
        overallGrade,
      };
    });
  }, [results]);

  // Filter groups by search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupedResults;
    const term = searchTerm.toLowerCase();
    return groupedResults.filter((g) => {
      const name = g.student?.name?.toLowerCase() || '';
      const email = g.student?.email?.toLowerCase() || '';
      const id = String(g.student_id);
      return name.includes(term) || email.includes(term) || id.includes(term);
    });
  }, [groupedResults, searchTerm]);

  // Active student group for the breakdown modal
  const activeGroup = useMemo(() => {
    if (!activeGroupKey) return null;
    return groupedResults.find((g) => g.key === activeGroupKey) || null;
  }, [groupedResults, activeGroupKey]);

  // Row Expand/Collapse toggle
  const toggleRowExpand = (key) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Open Subject Breakdown Modal
  const handleOpenBreakdown = (group) => {
    setActiveGroupKey(group.key);
    setIsBreakdownModalOpen(true);
  };

  // Open Add Marks Modal
  const handleOpenAdd = (defaultStudentId = null, defaultExamId = null) => {
    setSelectedResult(null);
    const targetStudentId = defaultStudentId || (students[0] ? String(students[0].student_id) : '');
    const targetExamId = defaultExamId || selectedExam || (exams[0] ? String(exams[0].exam_id) : '');

    const studentObj = students.find((s) => String(s.student_id) === String(targetStudentId));
    const studentSubjects = studentObj?.class_id
      ? subjects.filter((sub) => sub.class_id === studentObj.class_id)
      : subjects;

    setFormData({
      student_id: targetStudentId,
      exam_id: targetExamId,
      subject_id: studentSubjects[0] ? String(studentSubjects[0].subject_id) : '',
      marks: '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  // Open Edit Marks Modal
  const handleOpenEdit = (res) => {
    setSelectedResult(res);
    setFormData({
      student_id: String(res.student_id),
      exam_id: String(res.exam_id),
      subject_id: res.subject_id ? String(res.subject_id) : '',
      marks: String(res.marks),
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsSaving(true);

    try {
      const payload = {
        student_id: parseInt(formData.student_id, 10),
        exam_id: parseInt(formData.exam_id, 10),
        subject_id: formData.subject_id ? parseInt(formData.subject_id, 10) : null,
        marks: parseFloat(formData.marks),
      };

      if (selectedResult) {
        await api.put(`/results/${selectedResult.result_id}`, payload);
      } else {
        await api.post('/results', payload);
      }
      setIsModalOpen(false);
      fetchResults();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save result');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (res) => {
    setResultToDelete(res);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!resultToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/results/${resultToDelete.result_id}`);
      setDeleteConfirmOpen(false);
      setResultToDelete(null);
      fetchResults();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete result');
    } finally {
      setIsDeleting(false);
    }
  };

  // Dynamic subjects matching the student selected in modal
  const modalStudentObj = students.find((s) => String(s.student_id) === String(formData.student_id));
  const availableSubjectsForStudent = modalStudentObj?.class_id
    ? subjects.filter((sub) => sub.class_id === modalStudentObj.class_id)
    : subjects;

  // Overall stats
  const overallAvgPercentage =
    groupedResults.length > 0
      ? (
          groupedResults.reduce((acc, curr) => acc + parseFloat(curr.avgPercentage), 0) /
          groupedResults.length
        ).toFixed(1)
      : '0.0';

  const topStudentScore =
    groupedResults.length > 0
      ? Math.max(...groupedResults.map((r) => parseFloat(r.avgPercentage))).toFixed(1)
      : '0.0';

  const getGradeBadgeClass = (grade) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'A':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'D':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <span>Examinations & Subject Marks</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              Grouped by Student
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            View student academic evaluations with single-row summaries and subject-wise score cards
          </p>
        </div>

        <Button variant="primary" onClick={() => handleOpenAdd()} className="self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Add / Record Mark
        </Button>
      </div>

      {/* Filter and Stats Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Exam Filter */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Filter by Exam Term
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Examinations</option>
              {exams.map((ex) => (
                <option key={ex.exam_id} value={ex.exam_id}>
                  {ex.exam_name} ({ex.exam_date})
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Filter by Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Classes (Playgroup - 10)</option>
              {classes.map((c) => (
                <option key={c.class_id} value={c.class_id}>
                  {c.class_name} - {c.section}
                </option>
              ))}
            </select>
          </div>

          {/* Student Search */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Search Student
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Quick KPIs Summary */}
          <div className="flex items-center gap-4 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 justify-around">
            <div>
              <span className="text-slate-400 block font-medium">Students:</span>
              <span className="text-sm font-bold text-slate-800">{filteredGroups.length}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Class Avg:</span>
              <span className="text-sm font-bold text-brand-600">{overallAvgPercentage}%</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Top Score:</span>
              <span className="text-sm font-bold text-emerald-600">{topStudentScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Table - ONE UNIQUE ROW PER STUDENT */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching examination marks..." />
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No marks recorded</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select an exam/class or click "Add / Record Mark" to enter subject evaluation marks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Examination</th>
                  <th className="py-3.5 px-4">Subjects</th>
                  <th className="py-3.5 px-4">Overall Percentage (%)</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4 text-center">Subject Breakdown</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroups.map((group) => {
                  const isExpanded = expandedRows.has(group.key);
                  return (
                    <React.Fragment key={group.key}>
                      {/* Main Student Row */}
                      <tr
                        className={`transition-colors ${
                          isExpanded ? 'bg-brand-50/30' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 uppercase flex-shrink-0">
                              {group.student?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">
                                {group.student?.name || 'Unknown Student'}
                              </div>
                              <span className="text-xs text-slate-400 font-normal">
                                ID: #{group.student_id} • {group.student?.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Class */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {group.student?.class ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {group.student.class.class_name} - {group.student.class.section}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>

                        {/* Examination */}
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <span className="font-medium text-slate-700 block">
                            {group.exam?.exam_name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {group.exam?.exam_date}
                          </span>
                        </td>

                        {/* Subjects Count Pill */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <BookOpen className="w-3 h-3 text-slate-500" />
                            {group.subjects.length} Subjects
                          </span>
                        </td>

                        {/* Overall Percentage (%) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-slate-800">
                              {group.avgPercentage}%
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              ({Math.round(group.totalMarks)} / {group.subjects.length * 100})
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-28 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                parseFloat(group.avgPercentage) >= 80
                                  ? 'bg-emerald-500'
                                  : parseFloat(group.avgPercentage) >= 60
                                  ? 'bg-brand-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, group.avgPercentage))}%` }}
                            />
                          </div>
                        </td>

                        {/* Overall Grade */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getGradeBadgeClass(
                              group.overallGrade
                            )}`}
                          >
                            {group.overallGrade}
                          </span>
                        </td>

                        {/* Dedicated "View Subject Marks" Button in Row */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenBreakdown(group)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 shadow-2xs transition-colors"
                            title="Click to view marks in every subject"
                          >
                            <Eye className="w-3.5 h-3.5 text-brand-600" />
                            <span>View Subject Marks ({group.subjects.length})</span>
                          </button>
                        </td>

                        {/* Row Actions */}
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Add more marks for this student */}
                          <button
                            onClick={() => handleOpenAdd(group.student_id, group.exam_id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                            title="Record another subject mark for this student"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          {/* Inline accordion expand/collapse toggle */}
                          <button
                            onClick={() => toggleRowExpand(group.key)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isExpanded
                                ? 'bg-brand-100 text-brand-700'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                            title={isExpanded ? 'Collapse subjects' : 'Expand subjects inline'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Inline Expandable Accordion Breakdown */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-y border-slate-200">
                          <td colSpan={8} className="py-3 px-6">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-brand-600" />
                                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Subject-Wise Score Breakdown: {group.student?.name}
                                  </h4>
                                </div>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleOpenAdd(group.student_id, group.exam_id)}
                                  className="text-xs"
                                >
                                  <Plus className="w-3.5 h-3.5 mr-1" />
                                  Add Subject Mark
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {group.subjects.map((subRes) => (
                                  <div
                                    key={subRes.result_id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-brand-200 hover:bg-brand-50/20 transition-all"
                                  >
                                    <div>
                                      <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                                        <span>{subRes.subject?.subject_name || 'General Course'}</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-bold text-slate-800">
                                          {parseFloat(subRes.marks).toFixed(1)}%
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                          ({subRes.marks} / 100)
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-2 py-0.5 rounded text-xs font-bold border ${getGradeBadgeClass(
                                          subRes.grade
                                        )}`}
                                      >
                                        {subRes.grade}
                                      </span>
                                      <div className="flex items-center">
                                        <button
                                          onClick={() => handleOpenEdit(subRes)}
                                          className="p-1 text-slate-400 hover:text-brand-600 hover:bg-white rounded transition-colors"
                                          title="Edit Marks"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleOpenDelete(subRes)}
                                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                                          title="Delete Result"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {filteredGroups.length} unique student report cards ({results.length} total subject records)
          </div>
          <div className="text-[11px] text-slate-400">
            Click "View Subject Marks" in any row to see full evaluation cards
          </div>
        </div>
      </div>

      {/* POPUP MODAL: Subject Marks Breakdown */}
      <Modal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        title={
          activeGroup ? (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              <span>Subject-Wise Marks: {activeGroup.student?.name}</span>
            </div>
          ) : (
            'Subject Marks Breakdown'
          )
        }
        maxWidth="max-w-2xl"
      >
        {activeGroup && (
          <div className="space-y-5">
            {/* Student & Exam Header Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Student Details
                </div>
                <div className="text-base font-bold text-slate-800">
                  {activeGroup.student?.name}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    (ID: #{activeGroup.student_id})
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Class: {activeGroup.student?.class?.class_name} - {activeGroup.student?.class?.section} •{' '}
                  {activeGroup.student?.email}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Examination Term
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {activeGroup.exam?.exam_name}
                </div>
                <div className="text-xs text-slate-500">
                  {activeGroup.exam?.exam_date}
                </div>
              </div>
            </div>

            {/* Scorecard KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-brand-50/50 p-3 rounded-xl border border-brand-100 text-center">
                <span className="text-xs text-brand-600 font-semibold block">Overall Percentage</span>
                <span className="text-2xl font-black text-brand-700">{activeGroup.avgPercentage}%</span>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-center">
                <span className="text-xs text-emerald-600 font-semibold block">Overall Grade</span>
                <span className="text-2xl font-black text-emerald-700">{activeGroup.overallGrade}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Total Marks</span>
                <span className="text-lg font-bold text-slate-800 mt-0.5 block">
                  {Math.round(activeGroup.totalMarks)} / {activeGroup.subjects.length * 100}
                </span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Evaluated Subjects ({activeGroup.subjects.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsBreakdownModalOpen(false);
                    handleOpenAdd(activeGroup.student_id, activeGroup.exam_id);
                  }}
                  className="text-xs py-1"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Subject Mark
                </Button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Subject Name</th>
                      <th className="py-2.5 px-3">Marks Obtained</th>
                      <th className="py-2.5 px-3">Percentage (%)</th>
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeGroup.subjects.map((subRes) => {
                      const num = parseFloat(subRes.marks);
                      return (
                        <tr key={subRes.result_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                              <span>{subRes.subject?.subject_name || 'General Course'}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-700">
                            {subRes.marks} / 100
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-800">{num.toFixed(1)}%</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getGradeBadgeClass(
                                subRes.grade
                              )}`}
                            >
                              {subRes.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            <button
                              onClick={() => {
                                handleOpenEdit(subRes);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                              title="Edit Marks"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                handleOpenDelete(subRes);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete Mark"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 flex justify-end border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsBreakdownModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedResult ? 'Update Subject Marks' : 'Record Subject Marks'}
        maxWidth="max-w-md"
      >
        {modalError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmitModal} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Student
            </label>
            <select
              value={formData.student_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, student_id: e.target.value }))}
              required
              disabled={!!selectedResult}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {students.map((st) => (
                <option key={st.student_id} value={st.student_id}>
                  {st.name} (ID: #{st.student_id}) {st.class ? `- ${st.class.class_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Examination
            </label>
            <select
              value={formData.exam_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, exam_id: e.target.value }))}
              required
              disabled={!!selectedResult}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {exams.map((ex) => (
                <option key={ex.exam_id} value={ex.exam_id}>
                  {ex.exam_name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Dropdown Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Subject
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject_id: e.target.value }))}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select a subject</option>
              {(availableSubjectsForStudent.length > 0 ? availableSubjectsForStudent : subjects).map((sub) => (
                <option key={sub.subject_id} value={sub.subject_id}>
                  {sub.subject_name} {sub.class ? `(${sub.class.class_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Percentage Score (0 - 100%)"
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={formData.marks}
            onChange={(e) => setFormData((prev) => ({ ...prev, marks: e.target.value }))}
            placeholder="e.g. 88.5"
            required
            helperText="Grade is automatically assigned: A+ (≥90%), A (≥80%), B (≥70%), C (≥60%), D (≥50%), F (<50%)"
          />

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Marks
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Examination Result"
        message="Are you sure you want to delete this subject examination score?"
        isLoading={isDeleting}
      />
    </div>
  );
};

