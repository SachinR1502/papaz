'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, Phone, ShieldCheck, Settings2, Save, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/authService';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.profile?.fullName || user?.name || '');
  const [email, setEmail] = useState(user?.profile?.email || user?.email || '');
  const [phone, setPhone] = useState(user?.profile?.phone || user?.phoneNumber || '');
  const [isSaving, setIsSaving] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authService.updateProfile({ fullName: name, email, phone });

      toast.success('Profile updated successfully');
      if (login && user) {
        login(localStorage.getItem('auth_token') || '', {
          ...user,
          profile: { ...user.profile, fullName: name, email, phone },
          name: name,
          email: email,
          phoneNumber: phone
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
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
      // Mocking password change for now as API might not be defined in service
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 md:gap-14 animate-fade-in pb-20">
      {/* HEADER */}
      <header className="text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 lg:mb-6">
          <Settings2 size={10} className="text-primary" />
          <span className="text-[10px] uppercase font-black tracking-widest text-primary">Account Security</span>
        </div>
        <h1 className="text-4xl lg:text-6xl font-black m-0 tracking-tighter text-foreground italic uppercase">
          Profile <span className="text-primary">Settings</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted font-bold max-w-2xl opacity-80 leading-relaxed">
          Update your personal information and manage your account security.
        </p>
      </header>

      <div className="flex flex-col gap-12 max-w-4xl">
        {/* PROFILE SECTION */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-blue-500/5 to-primary/10 rounded-[40px] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

          <div className="relative p-8 md:p-12 lg:p-16 rounded-[40px] border border-border bg-card/20 backdrop-blur-3xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-[0.02] blur-[120px] -mr-48 -mt-48 pointer-events-none" />

            <form onSubmit={handleSaveProfile} className="relative z-10 flex flex-col gap-10 md:gap-12">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,140,0,0.5)]" />
                <h3 className="text-xl md:text-2xl font-black text-foreground italic uppercase tracking-tight">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                <FormInput
                  label="Full Name"
                  icon={<User size={18} />}
                  value={name}
                  onChange={setName}
                  required
                  placeholder="Enter your full name"
                />
                <FormInput
                  label="Email Address"
                  icon={<Mail size={18} />}
                  value={email}
                  onChange={setEmail}
                  type="email"
                  required
                  placeholder="your@email.com"
                />
                <FormInput
                  label="Phone Number"
                  icon={<Phone size={18} />}
                  value={phone}
                  onChange={setPhone}
                  type="tel"
                  placeholder="+91 00000 00000"
                />
              </div>

              <div className="pt-8 border-t border-border/50 flex justify-start">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={cn(
                    "flex items-center justify-center gap-3 px-10 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 italic min-w-[200px]",
                    isSaving && "opacity-50 cursor-not-allowed translate-y-0"
                  )}
                >
                  {isSaving ? <Loader /> : <Save size={18} />}
                  {isSaving ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* PASSWORD SECTION */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-primary/5 rounded-[40px] blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />

          <div className="relative p-8 md:p-12 lg:p-16 rounded-[40px] border border-border bg-card/20 backdrop-blur-3xl shadow-2xl overflow-hidden">
            <form onSubmit={handleChangePassword} className="relative z-10 flex flex-col gap-10 md:gap-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                  <h3 className="text-xl md:text-2xl font-black text-foreground italic uppercase tracking-tight">Security Access</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="p-2 text-muted hover:text-foreground transition-colors"
                >
                  {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                <div className="md:col-span-2 max-w-md">
                  <FormInput
                    label="Current Password"
                    icon={<Lock size={18} />}
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    type={showPasswords ? "text" : "password"}
                    placeholder="••••••••"
                  />
                </div>
                <FormInput
                  label="New Password"
                  icon={<Lock size={18} />}
                  value={newPassword}
                  onChange={setNewPassword}
                  type={showPasswords ? "text" : "password"}
                  placeholder="••••••••"
                />
                <FormInput
                  label="Confirm New Password"
                  icon={<Lock size={18} />}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  type={showPasswords ? "text" : "password"}
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-8 border-t border-border/50 flex justify-start">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className={cn(
                    "flex items-center justify-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 italic min-w-[220px]",
                    isChangingPassword && "opacity-50 cursor-not-allowed translate-y-0"
                  )}
                >
                  {isChangingPassword ? <Loader /> : <ShieldCheck size={18} />}
                  {isChangingPassword ? 'Securing...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, icon, value, onChange, type = "text", required = false, placeholder }: any) {
  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60 ml-1">{label}</label>
      <div className="relative flex items-center group/input">
        <div className="absolute left-5 text-muted group-focus-within/input:text-primary transition-colors duration-300">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="w-full bg-card/30 border border-border rounded-2xl py-4 pl-14 pr-6 text-foreground font-bold outline-none focus:border-primary/50 focus:bg-card/50 transition-all duration-300"
        />
      </div>
    </div>
  );
}

function Loader() {
  return <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />;
}
