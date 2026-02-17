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

            // 2. Set token in memory/localStorage for profile update (which requires 'protect' middleware)
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
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', padding: '20px' }}>
            <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '450px' }}>
                <h2 style={{ marginBottom: '8px', textAlign: 'center', fontSize: '2rem', fontWeight: 800 }}>
                    {step === 1 ? 'Create Account' : 'Verify Identity'}
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
                    {step === 1 ? 'Join the Papaz ecosystem today' : `Enter code sent to ${form.mobile}`}
                </p>

                {error && (
                    <div style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input type="text" placeholder="John Doe" style={inputStyle} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input type="email" placeholder="john@example.com" style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Mobile Number</label>
                            <input type="tel" placeholder="9988776655" style={inputStyle} value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} required />
                        </div>

                        <div style={{ margin: '8px 0' }}>
                            <label style={labelStyle}>Register As</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, role: 'customer' })}
                                    style={{
                                        ...roleBtnStyle,
                                        background: form.role === 'customer' ? 'var(--color-primary)' : 'transparent',
                                        color: form.role === 'customer' ? 'white' : 'var(--text-muted)',
                                        borderColor: form.role === 'customer' ? 'var(--color-primary)' : 'var(--border-color)'
                                    }}
                                >Customer</button>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, role: 'supplier' })}
                                    style={{
                                        ...roleBtnStyle,
                                        background: form.role === 'supplier' ? 'var(--color-primary)' : 'transparent',
                                        color: form.role === 'supplier' ? 'white' : 'var(--text-muted)',
                                        borderColor: form.role === 'supplier' ? 'var(--color-primary)' : 'var(--border-color)'
                                    }}
                                >Supplier</button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '16px' }} disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Send Verification OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={labelStyle}>One-Time Password</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                style={inputStyle}
                                placeholder="1234"
                                maxLength={4}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '16px' }} disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Verify & Register'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            Edit registration details
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
                    Already have an account? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-body)' };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-body)', fontSize: '1rem', outline: 'none' };
const roleBtnStyle = { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s' };
