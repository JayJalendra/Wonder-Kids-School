import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CalendarCheck, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const StudentAttendanceView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/my-attendance');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load student attendance', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Fetching your attendance records..." />;
  }

  const stats = data?.stats;
  const records = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          My Attendance Record
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          View your comprehensive presence logs, monthly percentage, and status history
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${stats?.attendancePercentage ?? 0}%`}
          subtitle="Cumulative rate"
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Days Present"
          value={stats?.presentDays ?? 0}
          subtitle="Full attendance"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Days Late"
          value={stats?.lateDays ?? 0}
          subtitle="Late arrivals"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Days Absent"
          value={stats?.absentDays ?? 0}
          subtitle="Unexcused / absences"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* History Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">
            Attendance Log
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Total Sessions: {records.length}
          </span>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">
              No attendance records yet
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Your attendance records will appear here as your teachers take roll call.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Session Date</th>
                  <th className="py-3.5 px-4">Day of Week</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => {
                  const dayName = new Date(r.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                  });
                  return (
                    <tr key={r.attendance_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {r.date}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {dayName}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={r.status}>{r.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                        {r.status === 'Present'
                          ? 'On time'
                          : r.status === 'Late'
                          ? 'Tardy entry'
                          : 'Absence noted'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
