'use client';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

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
        } catch (err: any) {
            console.error('Login Error:', err);
            if (!err.response) {
                setError('Network error: Cannot reach server. Please check your connection.');
            } else {
                setError(err.response?.data?.message || 'Failed to send OTP. Please check your phone number.');
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
            const data = await authService.verifyOtp(phoneNumber.trim(), otp);

            // Log in the user
            login(data.token, {
                id: data._id,
                role: data.role,
                profile: data.profile || {},
                profileCompleted: data.profileCompleted
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
                // Standard customer
                router.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
            <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        display: 'inline-flex',
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        borderRadius: '16px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: '16px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }}>
                        P
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>
                        {step === 1 ? 'Welcome Back' : 'Verification'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                        {step === 1 ? 'Enter your registered phone number' : `Enter the 4-digit code sent to ${phoneNumber}`}
                    </p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600, border: '1px solid rgba(231, 76, 60, 0.2)' }}>
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={labelStyle}>Phone Number</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>📱</span>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    style={{ ...inputStyle, paddingLeft: '44px' }}
                                    placeholder="e.g. 9876543210"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700 }} disabled={isLoading}>
                            {isLoading ? 'Sending OTP...' : 'Continue'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={labelStyle}>One-Time Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔑</span>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    style={{ ...inputStyle, paddingLeft: '44px', letterSpacing: '8px', fontWeight: 'bold' }}
                                    placeholder="0000"
                                    maxLength={4}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700 }} disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Sign In Now'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, marginTop: '8px' }}
                        >
                            ← Not your number? Change it
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                        New to Papaz? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Join the ecosystem</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1px' };
const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.02)', color: 'var(--text-body)', fontSize: '1.1rem', outline: 'none', transition: 'all 0.2s' };
