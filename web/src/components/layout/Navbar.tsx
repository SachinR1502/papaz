'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        console.log('[NAVBAR] User State Changed:', user);
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [user]);

    console.log('[NAVBAR] Rendering with user:', user?.role || 'Guest');

    const getProfileLink = () => {
        if (!user) return '/login';
        const role = user.role?.toLowerCase();
        if (role === 'admin') return '/admin/dashboard';
        if (role === 'supplier') return '/supplier/dashboard';
        if (role === 'technician') return '/technician/dashboard';
        return '/account/orders';
    };

    return (
        <nav className="glass-panel" style={{
            position: 'sticky',
            top: 20,
            zIndex: 50,
            margin: '0 auto',
            width: 'calc(100% - 48px)',
            maxWidth: '1200px',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(20px)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <img
                        src="/icon.png"
                        alt="Papaz Logo"
                        style={{ width: '45px', height: '45px', borderRadius: '12px', objectFit: 'contain' }}
                    />
                    <span style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.5px' }}>PAPAZ</span>
                </div>
            </Link>

            {/* Search Bar - Hidden on small screens */}
            <div style={{ flex: 1, maxWidth: '460px', margin: '0 32px' }} className="hidden md:block">
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search parts, services, or brands..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                window.location.href = `/search?q=${searchQuery}`;
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '12px 20px',
                            paddingLeft: '44px',
                            borderRadius: '100px',
                            border: '1px solid var(--border-color)',
                            background: 'rgba(0,0,0,0.03)',
                            color: 'var(--text-body)',
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                    <span
                        onClick={() => window.location.href = `/search?q=${searchQuery}`}
                        style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.1rem', cursor: 'pointer' }}
                    >🔍</span>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Only show "Become a Supplier" to guests or customers */}
                {(!user || user.role === 'customer') && (
                    <Link href="/supplier/onboarding" style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        transition: 'background 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        Seller Hub
                    </Link>
                )}

                {/* Cart Icon - Useful for everyone except maybe Admins */}
                {user?.role !== 'admin' && (
                    <Link href="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{
                            position: 'relative',
                            cursor: 'pointer',
                            display: 'flex',
                            width: '40px',
                            height: '40px',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '10px',
                            transition: 'background 0.2s'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ fontSize: '1.4rem' }}>🛒</span>
                            {totalItems > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '2px',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    fontSize: '0.65rem',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    border: '2px solid white'
                                }}>{totalItems}</span>
                            )}
                        </div>
                    </Link>
                )}

                <div style={{ height: '24px', width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />

                {/* User Section */}
                {user ? (
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                background: isDropdownOpen ? 'rgba(0,0,0,0.04)' : 'transparent',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '900',
                                color: 'var(--color-primary)',
                                overflow: 'hidden',
                                fontSize: '1rem'
                            }}>
                                <span style={{ width: '100%', textAlign: 'center' }}>
                                    {user.profile?.fullName?.[0] || user.role?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-body)' }} className="hidden lg:block">
                                {user.profile?.fullName?.split(' ')[0] || user.role}
                            </span>
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="glass-panel highlight" style={{
                                position: 'absolute',
                                top: 'calc(100% + 12px)',
                                right: 0,
                                width: '220px',
                                padding: '8px',
                                background: 'var(--bg-card)',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-body)' }}>
                                        {user.profile?.fullName || 'Logged In'}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                        {user.role} Portal
                                    </p>
                                </div>

                                <DropdownItem href={getProfileLink()} icon="🏢" label="Dashboard" onClick={() => setIsDropdownOpen(false)} />
                                <DropdownItem href="/account/settings" icon="⚙️" label="Settings" onClick={() => setIsDropdownOpen(false)} />

                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

                                <button
                                    onClick={() => { logout(); setIsDropdownOpen(false); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#ff3b30',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        width: '100%',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span>🚪</span> Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/login" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '100px', fontWeight: 700 }}>
                            Sign In
                        </button>
                    </Link>
                )}
            </div>
        </nav>
    );
}

function DropdownItem({ href, icon, label, onClick }: { href: string, icon: string, label: string, onClick: () => void }) {
    return (
        <Link href={href} style={{ textDecoration: 'none' }} onClick={onClick}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                color: 'var(--text-body)',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'background 0.2s'
            }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
                <span style={{ fontSize: '1.1rem' }}>{icon}</span> {label}
            </div>
        </Link>
    );
}
