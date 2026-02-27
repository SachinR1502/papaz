'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
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
  const { user, login } = useAuth();

  const [name, setName] = useState(
    user?.profile?.fullName || user?.name || ''
  );
  const [email, setEmail] = useState(
    user?.profile?.email || user?.email || ''
  );
  const [phone, setPhone] = useState(
    user?.profile?.phone || user?.phoneNumber || ''
  );

  const [isSaving, setIsSaving] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

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

      if (login && user) {
        login(localStorage.getItem('auth_token') || '', {
          ...user,
          profile: {
            ...user.profile,
            fullName: name,
            email,
            phone
          }
        });
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

    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsChangingPassword(true);

    try {
      await new Promise(r => setTimeout(r, 800)); // mock
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl">

      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-semibold text-gray-800">
          Account Settings
        </h1>
        <p className="mt-2 text-gray-500">
          Update your personal details and password.
        </p>
      </header>

      {/* PROFILE SECTION */}
      <section className="p-8 border border-gray-200 rounded-xl bg-white space-y-8">
        <h2 className="text-lg font-semibold text-gray-800">
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
            label="Email"
            icon={<Mail size={16} />}
            value={email}
            onChange={setEmail}
            type="email"
            required
          />

          <InputField
            label="Phone"
            icon={<Phone size={16} />}
            value={phone}
            onChange={setPhone}
            type="tel"
          />

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* PASSWORD SECTION */}
      <section className="p-8 border border-gray-200 rounded-xl bg-white space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Change Password
          </h2>

          <button
            type="button"
            onClick={() =>
              setShowPasswords(prev => !prev)
            }
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

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              {isChangingPassword
                ? 'Updating...'
                : 'Update Password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

/* INPUT FIELD */
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
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
        />
      </div>
    </div>
  );
}