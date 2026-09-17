import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboards
import { DashboardRouter } from './pages/dashboard/DashboardRouter';

// Modules
import { StudentList } from './pages/students/StudentList';
import { TeacherList } from './pages/teachers/TeacherList';
import { ClassList } from './pages/classes/ClassList';
import { SubjectList } from './pages/subjects/SubjectList';
import { AttendanceRouter } from './pages/attendance/AttendanceRouter';
import { ExamList } from './pages/exams/ExamList';
import { ResultRouter } from './pages/results/ResultRouter';
import { FeeRouter } from './pages/fees/FeeRouter';
import { ProfilePage } from './pages/profile/ProfilePage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/attendance" element={<AttendanceRouter />} />
              <Route path="/exams" element={<ExamList />} />
              <Route path="/results" element={<ResultRouter />} />
              <Route path="/fees" element={<FeeRouter />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Admin & Teacher Restricted Routes */}
              <Route
                element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}
              >
                <Route path="/students" element={<StudentList />} />
                <Route path="/teachers" element={<TeacherList />} />
                <Route path="/classes" element={<ClassList />} />
                <Route path="/subjects" element={<SubjectList />} />
              </Route>
            </Route>
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
