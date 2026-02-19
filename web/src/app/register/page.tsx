'use client';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Info & Phase 1 OTP, 2: Verify OTP
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        mobile: '',
        role: 'customer'
    });
    const [otp, setOtp] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await authService.sendOtp(form.mobile, form.role, true);
            setStep(2);
        } catch (err: any) {
            console.error('Register Error:', err);
            if (!err.response) {
                setError('Network error: Cannot reach server at http://localhost:8082');
            } else {
                setError(err.response?.data?.message || 'Failed to send OTP. Account might already exist.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // 1. Verify OTP to get token
            const data = await authService.verifyOtp(form.mobile, otp);

            // 2. Set token in memory/localStorage for profile update
            localStorage.setItem('auth_token', data.token);

            // 3. Update profile with additional details (Name, Email)
            await authService.updateProfile({
                fullName: form.fullName,
                email: form.email,
                phoneNumber: form.mobile
            });

            // 4. Update Auth Context
            login(data.token, {
                id: data._id,
                role: data.role,
                profile: {
                    fullName: form.fullName,
                    email: form.email
                }
            });

            if (form.role === 'supplier') {
                router.push('/supplier/onboarding');
            } else if (form.role === 'technician') {
                router.push('/technician/dashboard');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-body)] p-5">
            <div className="glass-panel w-full max-w-[480px] p-8 md:p-10 animate-fade-in relative z-10 overflow-hidden rounded-[32px]">

                {/* Background Decor */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 blur-[80px] pointer-events-none rounded-full" />
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--color-primary)]/10 blur-[80px] pointer-events-none rounded-full" />

                {/* Header */}
                <div className="text-center mb-8 relative z-10">
                    <h2 className="text-3xl font-black text-[var(--text-body)] mb-2 tracking-tight">
                        {step === 1 ? 'Create Account' : 'Verify Identity'}
                    </h2>
                    <p className="text-sm font-medium text-[var(--text-muted)]">
                        {step === 1 ? 'Join the Papaz ecosystem today' : `Enter code sent to ${form.mobile}`}
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-xl mb-6 text-xs font-bold text-center border border-red-500/20 animate-fade-in">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="flex flex-col gap-5 relative z-10">
                        {/* Name Input */}
                        <div>
                            <label className="block mb-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[2px] opacity-70">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="w-full px-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 text-[var(--text-body)] text-base font-bold outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:font-medium placeholder:opacity-40"
                                value={form.fullName}
                                onChange={e => setForm({ ...form, fullName: e.target.value })}
                                required
                            />
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block mb-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[2px] opacity-70">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                className="w-full px-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 text-[var(--text-body)] text-base font-bold outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:font-medium placeholder:opacity-40"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        {/* Mobile Input */}
                        <div>
                            <label className="block mb-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[2px] opacity-70">
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                placeholder="9988776655"
                                className="w-full px-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 text-[var(--text-body)] text-base font-bold outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:font-medium placeholder:opacity-40"
                                value={form.mobile}
                                onChange={e => setForm({ ...form, mobile: e.target.value })}
                                required
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="pt-2">
                            <label className="block mb-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[2px] opacity-70">
                                Register As
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, role: 'customer' })}
                                    className={`
                                        py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wide border transition-all duration-200
                                        ${form.role === 'customer'
                                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg shadow-orange-500/20 scale-[1.02]'
                                            : 'bg-transparent text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--color-primary)]/50'
                                        }
                                    `}
                                >
                                    Customer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, role: 'supplier' })}
                                    className={`
                                        py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wide border transition-all duration-200
                                        ${form.role === 'supplier'
                                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg shadow-orange-500/20 scale-[1.02]'
                                            : 'bg-transparent text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--color-primary)]/50'
                                        }
                                    `}
                                >
                                    Supplier
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full py-4 mt-2 rounded-xl text-base font-black shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Send Verification OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 relative z-10">
                        <div>
                            <label className="block mb-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[2px] opacity-70">
                                One-Time Password
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-lg group-hover:opacity-80 transition-opacity">Key</span>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 text-[var(--text-body)] text-xl font-black tracking-[12px] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:tracking-normal placeholder:font-medium placeholder:opacity-40 text-center"
                                    placeholder="0000"
                                    maxLength={4}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full py-4 rounded-xl text-base font-black shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Verify & Register'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors text-center mt-2 flex items-center justify-center gap-1 group w-full p-2"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Edit registration details
                        </button>
                    </form>
                )}

                <div className="text-center mt-8 pt-6 border-t border-[var(--border-color)] relative z-10">
                    <p className="text-xs font-medium text-[var(--text-muted)]">
                        Already have an account? <Link href="/login" className="text-[var(--color-primary)] font-black hover:underline ml-1">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
