'use client';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // Trim phone number just in case
            const cleanPhone = phoneNumber.trim();
            // We no longer send the role from the frontend; backend determines it from the phone number
            await authService.sendOtp(cleanPhone, undefined, false);
            setStep(2);
            toast.success('OTP Sent', {
                description: `A verification code has been sent to ${cleanPhone}`
            });
        } catch (err: any) {
            console.error('Login Error:', err);
            const msg = err.response?.data?.message || 'Failed to send OTP';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const data = await authService.verifyOtp(phoneNumber.trim(), otp);

            // Log in the user
            login(data.token, {
                id: data._id,
                role: data.role,
                profile: data.profile || {},
                profileCompleted: data.profileCompleted
            });

            toast.success('Login Successful', {
                description: `Welcome back to Papaz ecosystem.`
            });

            // Handle redirection based on the role RETURNED by the backend
            const role = data.role?.toLowerCase();
            if (role === 'admin') {
                router.push('/admin/dashboard');
            } else if (role === 'supplier') {
                if (!data.profileCompleted) {
                    router.push('/supplier/onboarding');
                } else {
                    router.push('/supplier/dashboard');
                }
            } else if (role === 'technician') {
                router.push('/technician/dashboard');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-body)] p-5">
            <div className="glass-panel w-full max-w-[440px] p-8 md:p-10 animate-fade-in relative z-10 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-primary)]/10 blur-[80px] pointer-events-none rounded-full" />

                {/* Header Section */}
                <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-orange-600 rounded-2xl items-center justify-center text-white text-3xl font-black mb-6 shadow-xl shadow-orange-500/30 transform hover:scale-105 transition-transform duration-300">
                        P
                    </div>
                    <h2 className="text-3xl font-black text-[var(--text-body)] mb-2 tracking-tight">
                        {step === 1 ? 'Welcome Back' : 'Verification'}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] font-medium">
                        {step === 1 ? 'Enter your registered phone number' : `Enter the 4-digit code sent to ${phoneNumber}`}
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-xl mb-6 text-xs font-bold text-center border border-red-500/20 animate-fade-in">
                        {error}
                    </div>
                )}

                {/* Forms */}
                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="flex flex-col gap-6 relative z-10">
                        <div>
                            <label className="block mb-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[2px] opacity-70">
                                Phone Number
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-lg group-hover:opacity-80 transition-opacity">📱</span>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 text-[var(--text-body)] text-lg font-bold outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:font-medium placeholder:opacity-40"
                                    placeholder="e.g. 9876543210"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg-gradient-to-r from-[var(--color-primary)] to-orange-600 text-white w-full py-4 rounded-xl text-base font-black shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending Code...' : 'Continue'}
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
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/50 text-[var(--text-body)] text-xl font-black tracking-[12px] outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:tracking-normal placeholder:font-medium placeholder:opacity-40 text-center"
                                    placeholder="0000"
                                    maxLength={4}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg-gradient-to-r from-[var(--color-primary)] to-orange-600 text-white w-full py-4 rounded-xl text-base font-black shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Sign In Now'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors text-center mt-2 flex items-center justify-center gap-1 group w-full p-2"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Not your number? Change it
                        </button>
                    </form>
                )}

                {/* Footer */}
                <div className="text-center mt-8 pt-6 border-t border-[var(--border-color)] relative z-10">
                    <p className="text-xs font-medium text-[var(--text-muted)]">
                        New to Papaz? <Link href="/register" className="text-[var(--color-primary)] font-black hover:underline ml-1">Join the ecosystem</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
