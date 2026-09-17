import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { User, Mail, Shield, Phone, MapPin, Calendar, BookOpen, GraduationCap } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setProfileData(res.data);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  const currentUser = profileData?.user || user;
  const teacher = profileData?.teacher;
  const student = profileData?.student;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          User Account & Profile
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          View your authentication details and academic institution records
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center font-bold text-2xl uppercase">
            {currentUser?.username ? currentUser.username.substring(0, 2) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">
                {student?.name || teacher?.name || currentUser?.username}
              </h3>
              <Badge variant={currentUser?.role}>{currentUser?.role}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Account ID: #{currentUser?.user_id} • System Username: @{currentUser?.username}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
          <div className="flex items-center space-x-3 text-slate-600">
            <Mail className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-xs text-slate-400 block font-medium">Email</span>
              <span>{currentUser?.email}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-slate-600">
            <Shield className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-xs text-slate-400 block font-medium">Role Privilege</span>
              <span className="capitalize">{currentUser?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role specific info */}
      {student && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-600" />
            Student Academic Record
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-3 text-slate-600">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Class & Section</span>
                <span>
                  {student.class
                    ? `${student.class.class_name} - Section ${student.class.section} (${student.class.room_no || 'Room TBA'})`
                    : 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Date of Birth & Gender</span>
                <span>{student.dob} ({student.gender})</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Phone</span>
                <span>{student.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Address</span>
                <span>{student.address || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {teacher && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-brand-600" />
            Teacher Professional Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Academic Qualification</span>
              <span className="text-slate-700 font-medium">{teacher.qualification || 'N/A'}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-medium">Contact Phone</span>
              <span className="text-slate-700 font-medium">{teacher.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
