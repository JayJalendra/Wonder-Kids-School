import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { CalendarCheck, Award, CreditCard, ArrowRight, UserCheck } from 'lucide-react';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your academic profile..." />;
  }

  const student = data?.student;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-navy-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-200">
            Student Portal
          </span>
          <h2 className="text-2xl font-bold mt-1">
            Hello, {student?.name || 'Student'}
          </h2>
          <p className="text-sm text-brand-100 mt-0.5">
            Class: {student?.class ? `${student.class.class_name} - ${student.class.section}` : 'N/A'} • Student ID: #{student?.student_id}
          </p>
        </div>

        <Link
          to="/profile"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-colors border border-white/20 self-start md:self-auto"
        >
          <UserCheck className="w-4 h-4" />
          View Full Profile
        </Link>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Attendance Rate"
          value={`${data?.attendancePercentage ?? 0}%`}
          subtitle={`${data?.presentDays ?? 0} present of ${data?.totalDays ?? 0} days`}
          icon={CalendarCheck}
          color="emerald"
        />

        <StatCard
          title="Published Results"
          value={data?.resultsCount ?? 0}
          subtitle="Examinations graded"
          icon={Award}
          color="purple"
        />

        <StatCard
          title="Fee Status"
          value={data?.totalPending > 0 ? 'Due Pending' : 'Clear / Paid'}
          subtitle={`Paid: ₹${Number(data?.totalPaid ?? 0).toLocaleString('en-IN')} | Due: ₹${Number(data?.totalPending ?? 0).toLocaleString('en-IN')}`}
          icon={CreditCard}
          color={data?.totalPending > 0 ? 'amber' : 'emerald'}
        />

      </div>

      {/* Two Columns: Recent Exam Results & Recent Fee Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Results */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">
              Recent Exam Results
            </h3>
            <Link
              to="/results"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              All Results <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentResults && data.recentResults.length > 0 ? (
              data.recentResults.map((r) => (
                <div
                  key={r.result_id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      {r.exam?.exam_name || 'General Examination'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Date: {r.exam?.exam_date || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">
                      {r.marks} Marks
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      Grade {r.grade}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-slate-400">
                No exam results recorded yet.
              </p>
            )}
          </div>
        </div>

        {/* Fees Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">
              Recent Fee Invoices
            </h3>
            <Link
              to="/fees"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Fee History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentFees && data.recentFees.length > 0 ? (
              data.recentFees.map((f) => (
                <div
                  key={f.fee_id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      Fee Receipt #{f.fee_id}
                    </div>
                    <p className="text-xs text-slate-400">
                      Payment Date: {f.payment_date || 'Not Paid Yet'}
                    </p>
                  </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-800">
                        ₹{Number(f.amount).toLocaleString('en-IN')}
                      </div>
                      <Badge variant={f.status}>{f.status}</Badge>
                    </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-xs text-slate-400">
                No fee records found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
