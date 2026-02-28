'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { authService } from '@/services/authService';

export default function SettingsPage() {
  const { user, login, refreshUser, isLoading: isAuthLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // Sync state with user data when it's available or changes
  useEffect(() => {
    if (user?.profile) {
      setName(user.profile.fullName || '');
      setEmail(user.profile.email || '');
      setPhone(user.profile.phone || '');
    }
  }, [user]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await authService.updateProfile({
        fullName: name,
        email,
        phone
      });

      toast.success('Profile updated successfully');

      if (refreshUser) {
        await refreshUser();
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        'Failed to update profile'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      return toast.error('Please enter new password');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsChangingPassword(true);

    try {
      await authService.changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword
      });

      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        'Failed to update password'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Account Settings
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your profile information and security.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Personal Information
        </h2>

        <form
          onSubmit={handleSaveProfile}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <InputField
            label="Full Name"
            icon={<User size={16} />}
            value={name}
            onChange={setName}
            required
          />

          <InputField
            label="Email Address"
            icon={<Mail size={16} />}
            value={email}
            onChange={setEmail}
            type="email"
            required
          />

          <InputField
            label="Phone Number"
            icon={<Phone size={16} />}
            value={phone}
            onChange={setPhone}
            type="tel"
          />

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Change Password
          </h2>

          <button
            type="button"
            onClick={() => setShowPasswords(prev => !prev)}
            className="text-gray-500 hover:text-gray-700"
          >
            {showPasswords ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        <form
          onSubmit={handleChangePassword}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="md:col-span-2">
            <InputField
              label="Current Password"
              icon={<Lock size={16} />}
              value={currentPassword}
              onChange={setCurrentPassword}
              type={showPasswords ? 'text' : 'password'}
            />
          </div>

          <InputField
            label="New Password"
            icon={<Lock size={16} />}
            value={newPassword}
            onChange={setNewPassword}
            type={showPasswords ? 'text' : 'password'}
          />

          <InputField
            label="Confirm New Password"
            icon={<Lock size={16} />}
            value={confirmPassword}
            onChange={setConfirmPassword}
            type={showPasswords ? 'text' : 'password'}
          />

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              {isChangingPassword
                ? 'Updating...'
                : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Input Field Component */

function InputField({
  label,
  icon,
  value,
  onChange,
  type = 'text',
  required = false
}: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
        />
      </div>
    </div>
  );
}