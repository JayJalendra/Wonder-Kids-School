import React from 'react';

export const Badge = ({ children, variant, className = '' }) => {
  const getStyle = (val) => {
    const v = String(val || '').toLowerCase();
    switch (v) {
      case 'present':
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'absent':
      case 'overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      case 'late':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200/60';
      case 'teacher':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'student':
        return 'bg-slate-100 text-slate-700 border-slate-300/60';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const badgeStyle = getStyle(variant || children);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      {children}
    </span>
  );
};
