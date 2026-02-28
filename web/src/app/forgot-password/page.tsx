'use client';

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
    ArrowLeft
} from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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

    const handleCheckOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await authService.checkOtp(phoneNumber.trim(), otp);
            setStep(3);
            toast.success('OTP Verified', { description: 'Please set your new password' });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Invalid OTP';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await authService.resetPassword({
                phoneNumber: phoneNumber.trim(),
                otp,
                newPassword: password
            });
            toast.success('Password updated successfully', {
                description: 'Login with your new password.'
            });
            router.push('/login');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to reset password';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
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
                        {step === 1 && 'Forgot Password?'}
                        {step === 2 && 'Verify OTP'}
                        {step === 3 && 'New Password'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        {step === 1 && 'Enter your phone number to receive a reset code'}
                        {step === 2 && `Enter the code sent to ${phoneNumber}`}
                        {step === 3 && 'Create a strong new password for your account'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-5">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <label className="text-sm text-gray-600 mb-1 block">Phone Number</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                                placeholder="Enter phone number"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleCheckOtp} className="space-y-6">
                        <label className="text-sm text-gray-600 mb-2 block text-center">OTP Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full text-center text-3xl tracking-[0.5em] py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                            placeholder="0000"
                            maxLength={4}
                            required
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            {isLoading ? 'Checking...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-sm text-gray-500 hover:text-orange-500 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <label className="text-sm text-gray-600 mb-1 block">New Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                                placeholder="At least 6 characters"
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Set New Password'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="w-full text-sm text-gray-500 hover:text-orange-500 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                    </form>
                )}

                <div className="text-center mt-8 text-sm text-gray-600">
                    Already have an account? <Link href="/login" className="text-orange-500 hover:underline font-medium">Log in</Link>
                </div>
            </div>
        </div>
    );
}
