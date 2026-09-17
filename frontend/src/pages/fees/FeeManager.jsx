import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { FeeModal } from './FeeModal';
import { Plus, CreditCard, CheckCircle2, Clock, AlertTriangle, Edit2, Trash2, Filter } from 'lucide-react';

export const FeeManager = () => {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters (Requirement #6: Class filter)
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feesRes, statsRes, studentsRes, classesRes] = await Promise.all([
        api.get('/fees', {
          params: {
            status: statusFilter || undefined,
            class_id: selectedClass || undefined,
          },
        }),
        api.get('/fees/stats'),
        api.get('/students'),
        api.get('/classes'),
      ]);

      if (feesRes.data.success) {
        setFees(feesRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      }
      if (classesRes.data.success) {
        setClasses(classesRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load fee data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, selectedClass]);

  const handleOpenAdd = () => {
    setSelectedFee(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fee) => {
    setSelectedFee(fee);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (fee) => {
    setFeeToDelete(fee);
    setDeleteConfirmOpen(true);
  };

  const handleMarkAsPaid = async (fee) => {
    try {
      await api.put(`/fees/${fee.fee_id}`, {
        status: 'Paid',
        paid_amount: fee.amount,
        payment_date: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!feeToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/fees/${feeToDelete.fee_id}`);
      setDeleteConfirmOpen(false);
      setFeeToDelete(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete fee record');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Fee & Payment Management
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track student tuition dues, record collections, and monitor revenue across classes
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAdd} className="self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1" />
          Issue Fee Invoice
        </Button>
      </div>

      {/* Revenue & Outstanding Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Fees Collected"
          value={`₹${Number(stats?.totalFeesCollected || 0).toLocaleString('en-IN')}`}
          subtitle={`${stats?.paidCount ?? 0} paid invoices`}
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Pending Dues"
          value={`₹${Number(stats?.pendingFees || 0).toLocaleString('en-IN')}`}
          subtitle="Awaiting clearance"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Overdue Dues"
          value={`₹${Number(stats?.overdueFees || 0).toLocaleString('en-IN')}`}
          subtitle="Requires follow-up"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Filter Bar with Status & Class Selectors (Requirement #6) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Class Filter Dropdown */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-xs font-semibold uppercase text-slate-400 whitespace-nowrap">
            Filter by Class:
          </span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full md:w-56 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Classes (Playgroup - 10)</option>
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>
                {c.class_name} - {c.section}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold uppercase text-slate-400 mr-1 whitespace-nowrap">
            Status:
          </span>
          {['', 'Paid', 'Pending', 'Overdue'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st || 'All Invoices'}
            </button>
          ))}
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching fee ledger..." />
        ) : fees.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No invoices found</h3>
            <p className="text-xs text-slate-400 mt-1">
              No billing records match the selected class and status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Total Fee</th>
                  <th className="py-3.5 px-4 text-emerald-700">Paid Amount (₹)</th>
                  <th className="py-3.5 px-4 text-rose-700">Due Fee (₹)</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
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
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                        REC-{String(fee.fee_id).padStart(4, '0')}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div>{fee.student?.name}</div>
                        <span className="text-xs text-slate-400 font-normal">
                          ID: #{fee.student_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {fee.student?.class ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {fee.student.class.class_name} - {fee.student.class.section}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      {/* Total Billed */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        ₹{billed.toLocaleString('en-IN')}
                      </td>
                      {/* Paid Amount (How much is paid) */}
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        <div className="flex items-center gap-1.5">
                          <span>₹{paid.toLocaleString('en-IN')}</span>
                          {paid === billed && billed > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                              Full
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Due Fee (How much is due) */}
                      <td className="py-3.5 px-4">
                        {due > 0 ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 inline-block">
                            ₹{due.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="font-medium text-slate-400 text-xs inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            ₹0 (Cleared)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {fee.payment_date || 'Pending Payment'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={fee.status}>{fee.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {fee.status !== 'Paid' && due > 0 && (
                          <button
                            onClick={() => handleMarkAsPaid(fee)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors mr-1"
                          >
                            Mark Paid
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(fee)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(fee)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {fees.length} fee invoices</span>
          {selectedClass && <span>Filtered by selected class</span>}
        </div>
      </div>

      <FeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchData}
        fee={selectedFee}
        students={students}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Fee Invoice"
        message={`Are you sure you want to delete invoice REC-${String(feeToDelete?.fee_id).padStart(4, '0')}?`}
        isLoading={isDeleting}
      />
    </div>
  );
};
