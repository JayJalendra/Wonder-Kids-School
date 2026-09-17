import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceManager } from './AttendanceManager';
import { StudentAttendanceView } from './StudentAttendanceView';

export const AttendanceRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'student') {
    return <StudentAttendanceView />;
  }

  return <AttendanceManager />;
};
