'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${searchQuery}`;
        }
    };

    const getProfileLink = () => {
        if (!user) return '/login';
        const role = user.role?.toLowerCase();
        if (role === 'admin') return '/admin/dashboard';
        if (role === 'supplier') return '/supplier/dashboard';
        if (role === 'technician') return '/technician/dashboard';
        return '/account';
    };

    return (
        <nav style={{
            position: 'fixed',
            top: isScrolled ? '12px' : '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            width: 'min(1400px, calc(100% - 48px))',
            padding: isMobileSearchOpen ? '8px 12px' : '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(24px) saturate(180%)',
            background: isScrolled ? 'rgba(var(--bg-card-rgb), 0.8)' : 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            boxShadow: isScrolled ? '0 10px 30px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            minHeight: '64px'
        }}>
            {isMobileSearchOpen ? (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }} className="animate-fade-in">
                    <button
                        onClick={() => setIsMobileSearchOpen(false)}
                        style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '8px', color: 'var(--text-body)' }}
                    >←</button>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search parts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                paddingLeft: '40px',
                                borderRadius: '14px',
                                border: '1px solid var(--color-primary)',
                                background: 'rgba(255,140,0,0.03)',
                                color: 'var(--text-body)',
                                outline: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 500
                            }}
                        />
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>🔍</span>
                    </div>
                    <button
                        onClick={handleSearchSubmit}
                        style={{
                            background: 'var(--color-primary)',
                            border: 'none',
                            color: 'white',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                        }}
                    >Go</button>
                </div>
            ) : (
                <>
                    {/* Logo */}
                    <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <div style={{
                                width: '38px',
                                height: '38px',
                                background: 'var(--color-primary)',
                                borderRadius: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                boxShadow: '0 4px 12px rgba(255, 140, 0, 0.3)'
                            }}>
                                <Image src="/icon.png" alt="Logo" width={38} height={38} />
                            </div>
                            <span style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase' }}>PAPAZ</span>
                        </div>
                    </Link>

                    {/* Search Bar (Desktop) */}
                    <div style={{ flex: 1, maxWidth: '500px', margin: '0 40px' }} className="hidden md:block">
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search for parts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                style={{
                                    width: '100%',
                                    padding: '14px 24px',
                                    paddingLeft: '52px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(0,0,0,0.02)',
                                    color: 'var(--text-body)',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s ease',
                                    fontWeight: 500
                                }}
                                className="nav-search-input"
                            />
                            <span
                                style={{
                                    position: 'absolute',
                                    left: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    opacity: 0.6,
                                    fontSize: '1.2rem',
                                    pointerEvents: 'none'
                                }}
                            >🔍</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileSearchOpen(true)}
                                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '8px' }}
                            >🔍</button>
                        </div>

                        <Link href="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{
                                position: 'relative',
                                cursor: 'pointer',
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '14px',
                                background: 'rgba(0,0,0,0.02)',
                                transition: 'all 0.3s ease',
                                border: '1px solid transparent'
                            }}
                                className="nav-icon-btn"
                            >
                                <span style={{ fontSize: '1.4rem' }}>🛒</span>
                                {totalItems > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        padding: '1px 5px',
                                        borderRadius: '6px',
                                        fontWeight: 800,
                                        border: '2px solid var(--bg-card)',
                                    }}>{totalItems}</span>
                                )}
                            </div>
                        </Link>

                        {user ? (
                            <div style={{ position: 'relative' }} ref={dropdownRef}>
                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        paddingRight: '10px',
                                        borderRadius: '14px',
                                        background: isDropdownOpen ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.02)',
                                        transition: 'all 0.3s ease',
                                        border: '1px solid var(--border-color)'
                                    }}
                                >
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '10px',
                                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 900,
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        boxShadow: '0 4px 10px rgba(255, 140, 0, 0.2)'
                                    }}>
                                        {user.profile?.fullName?.[0] || user.role?.[0]?.toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-body)' }} className="hidden lg:block">
                                        {user.profile?.fullName?.split(' ')[0] || user.role}
                                    </span>
                                </div>

                                {isDropdownOpen && (
                                    <div className="glass-panel animate-fade-in" style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 12px)',
                                        right: 0,
                                        width: '220px',
                                        padding: '8px',
                                        background: 'var(--bg-card)',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '18px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                    }}>
                                        <div style={{ padding: '12px', marginBottom: '4px', borderBottom: '1px solid var(--border-color)' }}>
                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>{user.profile?.fullName || 'User'}</p>
                                            <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role} Account</p>
                                        </div>
                                        <DropdownItem href={getProfileLink()} icon="🏢" label="Dashboard" onClick={() => setIsDropdownOpen(false)} />
                                        <DropdownItem href="/account/settings" icon="⚙️" label="Settings" onClick={() => setIsDropdownOpen(false)} />
                                        <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
                                        <button
                                            onClick={() => { logout(); setIsDropdownOpen(false); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#ff3b30',
                                                fontSize: '0.9rem',
                                                fontWeight: 700,
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
                                <button className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem' }}>
                                    Sign In
                                </button>
                            </Link>
                        )}
                    </div>
                </>
            )}

            <style jsx>{`
                .nav-search-input:focus {
                    background: var(--bg-card) !important;
                    border-color: var(--color-primary) !important;
                    box-shadow: 0 0 0 4px rgba(255, 140, 0, 0.1);
                }
                .nav-icon-btn:hover {
                    background: rgba(255, 140, 0, 0.05) !important;
                    border-color: rgba(255, 140, 0, 0.2) !important;
                    transform: translateY(-2px);
                }
                @media (max-width: 768px) {
                    nav {
                        padding: 8px 16px !important;
                        top: 10px !important;
                        width: calc(100% - 20px) !important;
                    }
                }
            `}</style>
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
                padding: '12px',
                borderRadius: '12px',
                color: 'var(--text-body)',
                fontSize: '0.95rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                    e.currentTarget.style.paddingLeft = '16px';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '12px';
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>{icon}</span> {label}
            </div>
        </Link>
    );
}
