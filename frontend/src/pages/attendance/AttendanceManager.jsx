import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { CalendarCheck, CheckCircle2, XCircle, Clock, Save, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const AttendanceManager = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialClassId = searchParams.get('class_id') || '';

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(initialClassId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const url = user?.role === 'teacher' ? '/teachers/me/classes' : '/classes';
        const res = await api.get(url);
        if (res.data.success) {
          setClasses(res.data.data);
          if (!selectedClass && res.data.data.length > 0) {
            setSelectedClass(String(res.data.data[0].class_id));
          }
        }
      } catch (err) {
        console.error('Failed to load classes', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  // 2. Fetch class attendance for selected date
  const loadClassAttendance = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await api.get(`/attendance/class/${selectedClass}`, {
        params: { date },
      });

      if (res.data.success) {
        setStudents(res.data.data);
        const map = {};
        res.data.data.forEach((s) => {
          map[s.student_id] = s.status || 'Present';
        });
        setAttendanceMap(map);
      }
    } catch (err) {
      setErrorMsg('Failed to load class roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      loadClassAttendance();
    }
  }, [selectedClass, date]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.student_id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    try {
      setIsSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const records = Object.keys(attendanceMap).map((stId) => ({
        student_id: parseInt(stId, 10),
        status: attendanceMap[stId],
      }));

      const res = await api.post('/attendance/bulk', {
        date,
        records,
      });

      if (res.data.success) {
        setSuccessMsg(`Attendance for ${date} recorded successfully!`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Attendance Register
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Mark daily attendance for enrolled students across class sections
          </p>
        </div>

        {students.length > 0 && (
          <Button
            variant="success"
            onClick={handleSaveAttendance}
            isLoading={isSaving}
            className="self-start sm:self-auto shadow-sm"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Attendance
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-medium flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Class & Date Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-end gap-4">
        <div className="w-full md:w-64 space-y-1">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>
                {c.class_name} - Section {c.section}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-56 space-y-1">
          <Input
            label="Attendance Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {students.length > 0 && (
          <div className="flex items-center gap-2 pb-0.5">
            <span className="text-xs text-slate-400 font-semibold uppercase mr-1">
              Quick Set:
            </span>
            <button
              type="button"
              onClick={() => handleMarkAll('Present')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('Absent')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              All Absent
            </button>
          </div>
        )}
      </div>

      {/* Students Roll Call Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching roster and attendance records..." />
        ) : students.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">
              No students enrolled in this class
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add students to this class in the Student Directory to mark their attendance.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Roll No / ID</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => {
                  const currentStatus = attendanceMap[st.student_id] || 'Present';
                  return (
                    <tr key={st.student_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                        #{st.student_id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {st.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={currentStatus}>{currentStatus}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.student_id, 'Present')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.student_id, 'Late')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.student_id, 'Absent')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {students.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>{students.length} students in roster</span>
            <span>Date: {date}</span>
          </div>
        )}
      </div>
    </div>
  );
};
