import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Users,
  GraduationCap,
  BookOpen,
  Library,
  CalendarCheck,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        setError('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard statistics..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Executive Dashboard
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          High-level institutional performance and operational metrics
        </p>
      </div>

      {/* 6 Core Required KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          subtitle="Enrolled learners"
          icon={Users}
          color="blue"
          trend="Active enrollment records"
        />

        <StatCard
          title="Total Teachers"
          value={stats?.totalTeachers ?? 0}
          subtitle="Faculty members"
          icon={GraduationCap}
          color="indigo"
          trend="Qualified teaching staff"
        />

        <StatCard
          title="Total Classes"
          value={stats?.totalClasses ?? 0}
          subtitle="Academic rooms"
          icon={BookOpen}
          color="slate"
          trend="Classrooms & sections"
        />

        <StatCard
          title="Total Subjects"
          value={stats?.totalSubjects ?? 0}
          subtitle="Curriculum courses"
          icon={Library}
          color="purple"
          trend="Allocated course modules"
        />

        <StatCard
          title="Attendance Rate"
          value={`${stats?.attendancePercentage ?? 0}%`}
          subtitle="Overall student presence"
          icon={CalendarCheck}
          color="emerald"
          trend="Recorded presence across classes"
        />

        <StatCard
          title="Total Fees Collected"
          value={`₹${Number(stats?.totalFeesCollected || 0).toLocaleString('en-IN')}`}
          subtitle={`Pending: ₹${Number(stats?.pendingFees || 0).toLocaleString('en-IN')}`}
          icon={CreditCard}
          color="amber"
          trend="Revenue collected to date"
        />
      </div>


      {/* Operational Highlights and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Management Shortcuts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-slate-800">
            Quick Actions
          </h3>
          <div className="space-y-2.5">
            <Link
              to="/students"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-medium text-slate-700">
                  Manage Students
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/attendance"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <div className="flex items-center space-x-3">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">
                  Mark Attendance
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/exams"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-slate-700">
                  Exams & Schedules
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/fees"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-slate-700">
                  Fee Payments & Ledger
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Recently Admitted Students */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">
              Recently Enrolled Students
            </h3>
            <Link
              to="/students"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Gender</th>
                  <th className="py-2.5 px-3">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentStudents && stats.recentStudents.length > 0 ? (
                  stats.recentStudents.map((st) => (
                    <tr key={st.student_id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {st.name}
                        <span className="block text-xs text-slate-400 font-normal">
                          {st.email}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {st.class ? `${st.class.class_name} - ${st.class.section}` : 'Unassigned'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{st.gender}</td>
                      <td className="py-3 px-3 text-xs text-slate-400">
                        {st.created_at ? new Date(st.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400 text-xs">
                      No student records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
