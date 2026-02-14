'use client';

import { useAuth } from '@/context/AuthContext';
import { useSupplier } from '@/context/SupplierContext';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
    Camera,
    Phone,
    MapPin,
    Navigation,
    Bell,
    Globe,
    CreditCard,
    HelpCircle,
    BadgeCheck,
    LogOut,
    ChevronRight,
    CircleDollarSign,
    User,
    Lock,
    Settings,
    Shield
} from 'lucide-react';

export default function SupplierProfilePage() {
    const { logout } = useAuth();
    const { profile, inventory, orders } = useSupplier();
    const router = useRouter();
    const [currentLang, setCurrentLang] = React.useState('en');

    const getLanguageLabel = (lang: string) => {
        const labels: Record<string, string> = {
            'en': 'English', 'hi': 'Hindi', 'mr': 'Marathi',
            'kn': 'Kannada', 'ta': 'Tamil', 'te': 'Telugu'
        };
        return labels[lang] || 'English';
    };

    const handleLanguageCycle = () => {
        const langs = ['en', 'hi', 'mr', 'kn', 'ta', 'te'];
        const nextIndex = (langs.indexOf(currentLang) + 1) % langs.length;
        setCurrentLang(langs[nextIndex]);
    };

    const stats = [
        { label: 'LISTINGS', value: inventory?.length || 0, icon: <Package size={18} /> },
        { label: 'VOLUME', value: orders?.length || 0, icon: <CircleDollarSign size={18} /> },
        { label: 'RATING', value: profile?.rating || '4.8', icon: <Star size={18} /> },
    ];

    return (
        <div style={{ padding: '48px', position: 'relative', minHeight: '100vh' }}>
            {/* Ambient background blur */}
            <div style={{
                position: 'fixed',
                top: '-10%',
                right: '-5%',
                width: '500px',
                height: '500px',
                background: 'var(--color-primary)',
                filter: 'blur(200px)',
                opacity: 0.04,
                zIndex: -1,
                pointerEvents: 'none'
            }} />

            <header style={{ marginBottom: '56px' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1.5px' }}>
                    Portal Settings
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                    Manage your core business profile, system preferences and account security.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '48px' }}>
                {/* Left Column: Business Identity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <div className="glass-panel" style={{ padding: '48px 32px', textAlign: 'center', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 24px' }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                padding: '6px',
                                background: 'linear-gradient(135deg, var(--color-primary), #5856D6)',
                                position: 'relative'
                            }}>
                                <img
                                    src={profile?.avatar || 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=400&fit=crop'}
                                    alt="Store Logo"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '6px solid var(--bg-card)' }}
                                />
                            </div>
                            <button
                                style={{
                                    position: 'absolute',
                                    bottom: '8px',
                                    right: '8px',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: '4px solid var(--bg-card)',
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
                            >
                                <Camera size={18} strokeWidth={2.5} />
                            </button>
                        </div>

                        <h2 style={{ fontSize: '1.85rem', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.5px' }}>
                            {profile?.storeName || 'Partner Shop'}
                        </h2>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            color: 'var(--color-primary)',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            letterSpacing: '1px',
                            marginBottom: '32px'
                        }}>
                            <BadgeCheck size={16} fill="var(--color-primary)" color="white" />
                            VERIFIED ENTERPRISE
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
                            {stats.map((stat, i) => (
                                <StatItem key={i} {...stat} />
                            ))}
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '18px',
                                fontWeight: 900,
                                borderRadius: '18px',
                                fontSize: '1rem',
                                boxShadow: '0 15px 30px rgba(var(--color-primary-rgb), 0.2)'
                            }}
                            onClick={() => router.push('/supplier/profile/edit')}
                        >
                            Sync Account Details
                        </button>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255, 59, 48, 0.05)', border: '1px solid rgba(255, 59, 48, 0.1)' }}>
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ff3b30', cursor: 'pointer', fontWeight: 800 }}
                            onClick={() => { if (confirm('Are you sure you want to sign out?')) logout(); }}
                        >
                            <div style={{ background: 'rgba(255, 59, 48, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                <LogOut size={20} />
                            </div>
                            Sign Out of Portal
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* Contact Info */}
                    <section>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(var(--color-primary-rgb), 0.1)', padding: '8px', borderRadius: '10px' }}>
                                <Shield size={20} color="var(--color-primary)" />
                            </div>
                            Business Certification
                        </h3>
                        <div className="glass-panel" style={{ padding: '0', borderRadius: '28px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <ProfileRow icon={<User size={18} />} label="Registered Entity Name" value={profile?.fullName || 'Business Owner'} />
                            <ProfileRow icon={<Phone size={18} />} label="Primary Operations Phone" value={profile?.phoneNumber || '+91 99000 00000'} />
                            <ProfileRow icon={<MapPin size={18} />} label="Warehouse Physical Address" value={profile?.address || 'Indiranagar, Bangalore'} />
                            <ProfileRow icon={<Navigation size={18} />} label="Primary Operating City" value={profile?.city || 'Bangalore'} isLast />
                        </div>
                    </section>

                    {/* Preferences */}
                    <section>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(var(--color-primary-rgb), 0.1)', padding: '8px', borderRadius: '10px' }}>
                                <Settings size={20} color="var(--color-primary)" />
                            </div>
                            Account Preferences
                        </h3>
                        <div className="glass-panel" style={{ padding: '0', borderRadius: '28px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <SettingsItem icon={<Bell size={18} />} label="Communication & Order Alerts" />
                            <SettingsItem
                                icon={<Globe size={18} />}
                                label="Regional Portal Language"
                                detail={getLanguageLabel(currentLang)}
                                onClick={handleLanguageCycle}
                            />
                            <SettingsItem icon={<CreditCard size={18} />} label="Settlement & Bank Configurations" />
                            <SettingsItem icon={<CircleDollarSign size={18} />} label="Base Trading Currency" detail="INR (₹)" />
                            <SettingsItem icon={<Lock size={18} strokeWidth={2.5} />} label="Login & Security Protocol" isLast />
                        </div>
                    </section>
                </div>
            </div>

            <style jsx>{`
                .btn-primary:active { transform: scale(0.98); }
            `}</style>
        </div>
    );
}

function Package({ size, ...props }: any) { return <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>; }
function Star({ size, ...props }: any) { return <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>; }

function StatItem({ value, label, icon }: { value: string | number, label: string, icon: React.ReactNode }) {
    return (
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px 12px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ color: 'var(--color-primary)', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900, marginTop: '2px', letterSpacing: '0.5px' }}>{label}</div>
        </div>
    );
}

function ProfileRow({ icon, label, value, isLast = false }: { icon: React.ReactNode, label: string, value: string, isLast?: boolean }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 32px',
            borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.01)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ color: 'var(--color-primary)', background: 'rgba(var(--color-primary-rgb), 0.08)', padding: '10px', borderRadius: '12px' }}>{icon}</div>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.95rem' }}>{label}</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-body)' }}>{value}</span>
        </div>
    );
}

function SettingsItem({ icon, label, detail, onClick, isLast = false }: { icon: React.ReactNode, label: string, detail?: string, onClick?: () => void, isLast?: boolean }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 32px',
            cursor: 'pointer',
            borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'rgba(255, 255, 255, 0.01)'
        }}
            onClick={onClick}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ color: 'var(--color-primary)' }}>{icon}</div>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {detail && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800, background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '8px' }}>{detail}</span>}
                <ChevronRight size={18} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            </div>
        </div>
    );
}