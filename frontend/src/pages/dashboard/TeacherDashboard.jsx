import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { BookOpen, Users, CalendarCheck, Award, ArrowRight } from 'lucide-react';

export const TeacherDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load teacher dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your teaching portal..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Teacher Portal
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back, {stats?.teacherName || 'Instructor'}. Manage your classes, attendance, and exam marks.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Assigned Classes"
          value={stats?.totalAssignedClasses ?? 0}
          subtitle="Classes under your supervision"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          subtitle="Enrolled in your classes"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Scheduled Exams"
          value={stats?.totalExams ?? 0}
          subtitle="Current academic evaluations"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Assigned Classes Roster */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-4">
          Your Assigned Classrooms
        </h3>

        {stats?.classes && stats.classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.classes.map((cls) => (
              <div
                key={cls.class_id}
                className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-brand-200 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase text-brand-600 tracking-wider">
                      {cls.room_no || 'Room TBA'}
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {cls.students ? `${cls.students.length} students` : '0 students'}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">
                    {cls.class_name} - Section {cls.section}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {cls.subjects?.length ?? 0} Subjects Assigned
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <Link
                    to={`/attendance?class_id=${cls.class_id}`}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Attendance
                  </Link>

                  <Link
                    to={`/results?class_id=${cls.class_id}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Upload Marks
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No classes assigned yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Contact the administrator to assign classes to your teacher account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
