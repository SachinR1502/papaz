'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSupplier } from '@/context/SupplierContext';

export default function SupplierNavbar() {
    const { profile, isApproved } = useSupplier();
    const { logout } = useAuth();

    return (
        <header className="glass-panel" style={{
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            borderBottom: '1px solid var(--border-color)',
            zIndex: 100,
            borderRadius: '0',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            flexShrink: 0
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 800
                        }}>P</div>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>PAPAZ</span>
                    </div>
                </Link>

                <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🏪</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-body)' }}>{profile?.storeName || profile?.shopName || 'Partner Portal'}</span>
                    {!isApproved && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(255, 149, 0, 0.1)', color: '#ff9500', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>VERIFICATION PENDING</span>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }} className="hidden md:block">
                    <input
                        type="text"
                        placeholder="Find orders or parts..."
                        style={{
                            background: 'rgba(0,0,0,0.03)',
                            border: '1px solid var(--border-color)',
                            padding: '8px 16px',
                            paddingLeft: '32px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            width: '240px',
                            outline: 'none'
                        }}
                    />
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.9rem' }}>🔍</span>
                </div>

                <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }} />

                <button
                    onClick={logout}
                    className="btn"
                    style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#ff3b30',
                        background: 'rgba(255, 59, 48, 0.05)',
                        padding: '8px 16px',
                        border: '1px solid rgba(255, 59, 48, 0.1)',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.05)'}
                >
                    LOGOUT
                </button>
            </div>
        </header>
    );
}
