import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ResultManager } from './ResultManager';
import { StudentResultView } from './StudentResultView';

export const ResultRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'student') {
    return <StudentResultView />;
  }

  return <ResultManager />;
};
