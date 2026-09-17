import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Award, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';

export const StudentResultView = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyResults = async () => {
      try {
        const res = await api.get('/results/my-results');
        if (res.data.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load student results', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyResults();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Generating your report card..." />;
  }

  const totalEvaluations = results.length;
  const avgPercentage =
    totalEvaluations > 0
      ? (
          results.reduce((acc, curr) => acc + parseFloat(curr.marks), 0) /
          totalEvaluations
        ).toFixed(1)
      : '0.0';

  const highestScore =
    totalEvaluations > 0
      ? Math.max(...results.map((r) => parseFloat(r.marks)))
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Academic Report Card & Subject Results
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          View your subject-wise scores, percentage evaluations, and overall performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Subjects Evaluated"
          value={totalEvaluations}
          subtitle="Total course assessments"
          icon={BookOpen}
          color="blue"
        />

        <StatCard
          title="Overall Percentage"
          value={`${avgPercentage}%`}
          subtitle="Cumulative average score"
          icon={TrendingUp}
          color="indigo"
        />

        <StatCard
          title="Highest Score"
          value={`${highestScore}%`}
          subtitle="Personal best"
          icon={Award}
          color="emerald"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">
            Statement of Marks & Percentages
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Subjects Graded: {results.length}
          </span>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No results published</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your evaluation marks will appear here once examinations are graded.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Examination</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Percentage (%)</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r) => {
                  const numMarks = parseFloat(r.marks);
                  const isPassed = numMarks >= 40;
                  return (
                    <tr key={r.result_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-brand-700">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                          <span>{r.subject?.subject_name || 'General Course'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {r.exam?.exam_name || 'Academic Assessment'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {r.exam?.exam_date || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-base font-bold text-slate-800">
                          {numMarks.toFixed(1)}%
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          ({r.marks} / 100)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            isPassed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPassed ? 'Passed' : 'Needs Retake'}
                        </span>
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
