import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Library,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  CreditCard,
  UserCheck,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const role = user?.role;

  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/students', label: 'Students', icon: Users },
        { to: '/teachers', label: 'Teachers', icon: GraduationCap },
        { to: '/classes', label: 'Classes', icon: BookOpen },
        { to: '/subjects', label: 'Subjects', icon: Library },
        { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
        { to: '/exams', label: 'Exams', icon: FileSpreadsheet },
        { to: '/results', label: 'Results', icon: Award },
        { to: '/fees', label: 'Fees', icon: CreditCard },
      ];
    }

    if (role === 'teacher') {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/classes', label: 'Assigned Classes', icon: BookOpen },
        { to: '/students', label: 'Students', icon: Users },
        { to: '/attendance', label: 'Take Attendance', icon: CalendarCheck },
        { to: '/results', label: 'Marks & Results', icon: Award },
        { to: '/exams', label: 'Exams', icon: FileSpreadsheet },
      ];
    }

    if (role === 'student') {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/attendance', label: 'My Attendance', icon: CalendarCheck },
        { to: '/results', label: 'My Results', icon: Award },
        { to: '/fees', label: 'My Fees', icon: CreditCard },
        { to: '/profile', label: 'My Profile', icon: UserCheck },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">
                WONDER KIDS
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                School Portal • India
              </span>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* System footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 text-center">
          <p className="text-slate-400 font-medium">School Management v1.0</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Production Ready</p>
        </div>
      </aside>
    </>
  );
};
