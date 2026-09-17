import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GraduationCap, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credential autofill helper
  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  // Auto-toggle: Instant demo login buttons will only show in local development.
  // On any live hosted domain (e.g. Vercel, Render, AWS, custom domain), it will automatically be HIDDEN for security.
  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local'));

  const showDemoLogins =
    import.meta.env.VITE_SHOW_DEMO_LOGINS === 'true' ||
    (import.meta.env.DEV && isLocalHost);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-800">
          WONDER KIDS
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          School Management System • India
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm rounded-2xl border border-slate-200/80">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-sm text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. admin@school.com"
              icon={Mail}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Fill Buttons (Auto-hidden on live hosted domains) */}
          {showDemoLogins && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Instant Demo Logins:</span>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Local Dev Only
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@school.com', 'admin123')}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 text-center"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('ramesh@school.com', 'teacher123')}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 text-center"
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('aarav@school.com', 'student123')}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 text-center"
                >
                  Student
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
