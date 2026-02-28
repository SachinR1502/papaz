'use client';

import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    Phone,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    CheckCircle2
} from 'lucide-react';

type LoginMethod = 'otp' | 'password';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [loginMethod, setLoginMethod] = useState<LoginMethod>('otp');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [setNewPassword, setSetNewPassword] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await authService.sendOtp(phoneNumber.trim(), undefined, false);
            setStep(2);
            toast.success('OTP sent successfully');
        } catch (err: any) {
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
            const data = await authService.verifyOtp(
                phoneNumber.trim(),
                otp,
                setNewPassword ? password : undefined
            );
            completeLogin(data);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Invalid OTP';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await authService.loginWithPassword(
                phoneNumber.trim(),
                password
            );
            completeLogin(data);
        } catch (err: any) {
            const msg =
                err.response?.data?.message || 'Invalid phone or password';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const completeLogin = (data: any) => {
        login(data.token, {
            id: data._id,
            role: data.role,
            profile: data.profile || {},
            profileCompleted: data.profileCompleted
        });

        toast.success('Login successful');

        const role = data.role?.toLowerCase();
        if (role === 'admin') router.push('/admin/dashboard');
        else if (role === 'supplier')
            router.push(
                !data.profileCompleted
                    ? '/supplier/onboarding'
                    : '/supplier/dashboard'
            );
        else if (role === 'technician')
            router.push('/technician/dashboard');
        else router.push('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl border border-gray-200 shadow-lg">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-orange-500 text-white rounded-xl flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                        P
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {step === 2 ? 'Verify OTP' : 'Login to your account'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        {step === 2
                            ? `Enter the 4-digit code sent to ${phoneNumber}`
                            : 'Enter your phone number to continue'}
                    </p>
                </div>

                {/* Toggle */}
                {step === 1 && (
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-6 text-sm">
                        <button
                            onClick={() => setLoginMethod('otp')}
                            className={`flex-1 py-2 rounded-md ${loginMethod === 'otp'
                                    ? 'bg-white shadow text-orange-600'
                                    : 'text-gray-500'
                                }`}
                        >
                            OTP Login
                        </button>
                        <button
                            onClick={() => setLoginMethod('password')}
                            className={`flex-1 py-2 rounded-md ${loginMethod === 'password'
                                    ? 'bg-white shadow text-orange-600'
                                    : 'text-gray-500'
                                }`}
                        >
                            Password Login
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-5">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form
                        onSubmit={
                            loginMethod === 'otp'
                                ? handleSendOtp
                                : handlePasswordLogin
                        }
                        className="space-y-5"
                    >
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(e.target.value)
                                    }
                                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        {loginMethod === 'password' && (
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <label className="text-gray-600">
                                        Password
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-orange-500 hover:underline"
                                    >
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        required
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            {isLoading
                                ? 'Please wait...'
                                : loginMethod === 'otp'
                                    ? 'Send OTP'
                                    : 'Login'}
                        </button>
                    </form>
                ) : (
                    <form
                        onSubmit={handleVerifyOtp}
                        className="space-y-6"
                    >
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block text-center">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 4)
                                    )
                                }
                                maxLength={4}
                                required
                                className="w-full text-center text-3xl tracking-[0.5em] py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                                placeholder="0000"
                            />
                        </div>

                        <label className="flex items-center gap-3 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={setNewPassword}
                                onChange={(e) =>
                                    setSetNewPassword(e.target.checked)
                                }
                            />
                            Set password for future login
                        </label>

                        {setNewPassword && (
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                className="w-full py-3 border border-gray-200 rounded-lg px-3 focus:outline-none focus:border-orange-500"
                                placeholder="New password"
                            />
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            {isLoading
                                ? 'Verifying...'
                                : 'Verify & Login'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-sm text-gray-500 hover:text-orange-500 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={14} />
                            Change phone number
                        </button>
                    </form>
                )}

                <div className="text-center mt-8 text-sm text-gray-600">
                    New user?{' '}
                    <Link
                        href="/register"
                        className="text-orange-500 hover:underline"
                    >
                        Create account
                    </Link>
                </div>
            </div>
        </div>
    );
}