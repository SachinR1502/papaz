'use client';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import AccountSidebar from '@/components/account/AccountSidebar';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { user, login } = useAuth();
    const [name, setName] = useState(user?.profile?.fullName || user?.name || '');
    const [email, setEmail] = useState(user?.profile?.email || user?.email || '');
    const [phone, setPhone] = useState(user?.profile?.phone || user?.phoneNumber || '');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, update profile via API here
        toast.success('Profile updated successfully');
        // Simulate update
        if (login && user) {
            login(localStorage.getItem('auth_token') || '', {
                ...user,
                profile: { ...user.profile, fullName: name, email, phone },
                name: name,
                email: email,
                phoneNumber: phone
            });
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '40px' }} className="account-grid">

                    <AccountSidebar />

                    {/* Content */}
                    <section>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Account Settings</h1>

                        <form onSubmit={handleSave} className="glass-panel" style={{ padding: '32px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>Personal Information</h3>

                            <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="form-input"
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="form-input"
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="form-input"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)' }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', marginTop: '16px' }}>Save Changes</button>
                            </div>
                        </form>
                    </section>

                </div>
            </div>

            <style jsx global>{`
                @media (max-width: 768px) {
                    .account-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </main>
    );
}
