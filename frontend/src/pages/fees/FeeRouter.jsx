import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FeeManager } from './FeeManager';
import { StudentFeeView } from './StudentFeeView';

export const FeeRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'student') {
    return <StudentFeeView />;
  }

  return <FeeManager />;
};
