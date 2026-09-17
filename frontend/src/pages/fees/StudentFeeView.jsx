import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';

export const StudentFeeView = () => {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({ paidTotal: 0, pendingTotal: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await api.get('/fees/my-fees');
        if (res.data.success) {
          setFees(res.data.data);
          setSummary(res.data.summary);
        }
      } catch (err) {
        console.error('Failed to load student fees', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Fetching fee invoices..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Fee Invoices & Receipts
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Review your tuition payment history, current clearance status, and receipts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="Total Fees Paid"
          value={`₹${(summary.paidTotal || 0).toLocaleString('en-IN')}`}
          subtitle="Settled tuition dues"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Outstanding Balance"
          value={`₹${(summary.dueTotal !== undefined ? summary.dueTotal : summary.pendingTotal || 0).toLocaleString('en-IN')}`}
          subtitle={
            (summary.dueTotal !== undefined ? summary.dueTotal : summary.pendingTotal) > 0
              ? 'Pending payment'
              : 'Fully Cleared'
          }
          icon={Clock}
          color={
            (summary.dueTotal !== undefined ? summary.dueTotal : summary.pendingTotal) > 0
              ? 'amber'
              : 'emerald'
          }
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">
            Payment Receipts
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Records: {fees.length}
          </span>
        </div>

        {fees.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No invoices on file</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your billing invoices and receipts will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Total Fee</th>
                  <th className="py-3.5 px-4 text-emerald-700">Paid Amount (₹)</th>
                  <th className="py-3.5 px-4 text-rose-700">Due Fee (₹)</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((fee) => {
                  const billed = parseFloat(fee.amount || 0);
                  const paid =
                    fee.paid_amount !== undefined && fee.paid_amount !== null
                      ? parseFloat(fee.paid_amount)
                      : fee.status === 'Paid'
                      ? billed
                      : 0;
                  const due =
                    fee.due_amount !== undefined && fee.due_amount !== null
                      ? parseFloat(fee.due_amount)
                      : Math.max(0, billed - paid);

                  return (
                    <tr key={fee.fee_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        REC-{String(fee.fee_id).padStart(4, '0')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        ₹{billed.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        ₹{paid.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        {due > 0 ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            ₹{due.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-400 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            ₹0 (Cleared)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {fee.payment_date || 'Awaiting Payment'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={fee.status}>{fee.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                        {fee.status === 'Paid'
                          ? 'Official Receipt Available'
                          : 'Please pay at school administrative office'}
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
