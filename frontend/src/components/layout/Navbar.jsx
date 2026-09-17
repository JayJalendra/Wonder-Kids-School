import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { Badge } from '../common/Badge';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between">
        {/* Left Side: Mobile toggle + Breadcrumb / Greeting */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-slate-800">
              Welcome back, <span className="text-brand-600">{user?.name || user?.username}</span>
            </h1>
            <p className="text-xs text-slate-400 capitalize">Role: {user?.role} Portal</p>
          </div>
        </div>

        {/* Right Side: User Profile & Actions */}
        <div className="flex items-center space-x-3">
          <Badge variant={user?.role}>{user?.role}</Badge>

          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
              {user?.username ? user.username.substring(0, 2) : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.username}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">
                {user?.email}
              </p>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
