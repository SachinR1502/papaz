'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Bell,
    Search,
    Globe,
    Zap,
    ChevronDown,
    ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

export default function AdminNavbar() {
    const { user, logout } = useAuth();
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <nav style={{
            height: '80px',
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Left: Branding/Context */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'var(--color-primary)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.2rem'
                        }}>
                            P
                        </div>
                        <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>PAPAZ</span>
                    </div>
                </Link>

                <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34C759', fontSize: '0.85rem', fontWeight: 700 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34C759', boxShadow: '0 0 10px #34C759' }} />
                    SYSTEM LIVE
                </div>
            </div>

            {/* Center: Global Search (Optional for Admin) */}
            <div style={{
                flex: 1,
                maxWidth: '500px',
                position: 'relative',
                transition: 'all 0.3s'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '0 20px',
                    background: isSearchFocused ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: isSearchFocused ? 'var(--color-primary)' : 'var(--border-color)',
                    transition: 'all 0.2s'
                }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Global search..."
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        style={{
                            flex: 1,
                            padding: '12px 0',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-body)',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}
                    />
                    <div style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)'
                    }}>⌘ K</div>
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* <div style={{ display: 'flex', gap: '8px' }}>
                    <NavIconButton icon={<Bell size={20} />} count={3} />
                    <NavIconButton icon={<Globe size={20} />} />
                    <NavIconButton icon={<Zap size={20} />} active />
                </div> */}

                <div style={{ height: '32px', width: '1px', background: 'var(--border-color)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{user?.profile?.fullName || 'Super Admin'}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.5px' }}>ADMINISTRATOR</div>
                    </div>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--color-primary), #5856D6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 900,
                        border: '2px solid rgba(255,255,255,0.1)'
                    }}>
                        {user?.profile?.fullName?.[0] || 'A'}
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavIconButton({ icon, count, active = false }: { icon: React.ReactNode, count?: number, active?: boolean }) {
    return (
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: active ? 'var(--color-primary)' : 'var(--text-muted)',
            background: active ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
        }}>
            {icon}
            {count && (
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '14px',
                    height: '14px',
                    background: '#FF3B30',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-body)',
                    fontSize: '0.5rem',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                }}>
                    {count}
                </div>
            )}
        </div>
    );
}
