'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
    User
} from 'lucide-react';

export default function AccountSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const links = [
        { name: 'Dashboard', href: '/account', icon: <LayoutDashboard size={20} /> },
        { name: 'My Orders', href: '/account/orders', icon: <Package size={20} /> },
        { name: 'Wishlist', href: '/account/wishlist', icon: <Heart size={20} /> },
        { name: 'Addresses', href: '/account/addresses', icon: <MapPin size={20} /> },
        { name: 'Settings', href: '/account/settings', icon: <Settings size={20} /> }
    ];

    return (
        <aside className="account-sidebar">

            {/* --- MOBILE: TOP STRIP (Visible < 992px) --- */}
            <div className="mobile-header">
                <div className="mobile-user">
                    <div className="avatar-small">
                        {user?.profile?.fullName?.[0] || 'U'}
                    </div>
                    <span className="mobile-username">
                        {user?.profile?.fullName?.split(' ')[0] || 'My Account'}
                    </span>
                </div>
                <button onClick={logout} className="mobile-logout">
                    <LogOut size={18} />
                </button>
            </div>

            {/* --- DESKTOP: MAIN PANEL --- */}
            <div className="sidebar-container">

                {/* Profile Section (Desktop Only) */}
                <div className="desktop-profile">
                    <div className="avatar-large">
                        <User size={24} />
                    </div>
                    <div className="profile-text">
                        <h3 className="user-name">{user?.profile?.fullName || 'Welcome'}</h3>
                        <p className="user-email">{user?.email || 'Manage your account'}</p>
                    </div>
                </div>

                <div className="divider desktop-only"></div>

                {/* Navigation Links */}
                <nav className="nav-menu">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className={`nav-icon ${isActive ? 'icon-active' : ''}`}>
                                    {link.icon}
                                </span>
                                <span className="nav-label">{link.name}</span>
                                {isActive && <div className="active-dot" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="divider desktop-only"></div>

                {/* Logout (Desktop Only) */}
                <button onClick={logout} className="logout-btn desktop-only">
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>

            <style jsx>{`
                /* --- CSS VARIABLES (LOCALLY SCOPED FALLBACKS) --- */
                .account-sidebar {
                    --c-bg: var(--bg-card, #ffffff);
                    --c-border: var(--border-color, #e5e7eb);
                    --c-text: var(--text-body, #111827);
                    --c-muted: var(--text-muted, #6b7280);
                    --c-primary: var(--color-primary, #f97316); /* Orange default */
                    --c-danger: #ef4444;
                    
                    width: 280px;
                    flex-shrink: 0;
                    z-index: 40;
                }

                /* --- DESKTOP LAYOUT --- */
                .sidebar-container {
                    background: var(--c-bg);
                    border: 1px solid var(--c-border);
                    border-radius: 24px;
                    padding: 24px;
                    position: sticky;
                    top: 120px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                }

                /* Profile */
                .desktop-profile {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding-bottom: 8px;
                }

                .avatar-large {
                    width: 48px;
                    height: 48px;
                    background: rgba(249, 115, 22, 0.1);
                    color: var(--c-primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .profile-text .user-name {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--c-text);
                }
                .profile-text .user-email {
                    margin: 2px 0 0;
                    font-size: 0.8rem;
                    color: var(--c-muted);
                    max-width: 160px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                /* Nav Menu */
                .nav-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px 16px;
                    border-radius: 12px;
                    text-decoration: none;
                    color: var(--c-muted);
                    font-weight: 600;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .nav-item:hover {
                    background: rgba(0,0,0,0.03);
                    color: var(--c-text);
                }

                .nav-item.active {
                    background: var(--c-primary);
                    color: white;
                    box-shadow: 0 8px 16px rgba(249, 115, 22, 0.25);
                }
                
                .nav-item.active .nav-icon { color: white; }

                /* Utils */
                .divider { height: 1px; background: var(--c-border); margin: 8px 0; }

                .logout-btn {
                    display: flex; align-items: center; gap: 14px;
                    padding: 14px 16px;
                    background: transparent;
                    border: none;
                    color: var(--c-danger);
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    border-radius: 12px;
                    transition: 0.2s;
                    text-align: left;
                    font-size: 1rem;
                }
                .logout-btn:hover { background: rgba(239, 68, 68, 0.1); }

                /* Mobile Header (Hidden by default) */
                .mobile-header { display: none; }

                /* ========================================= */
                /* RESPONSIVE DESIGN (TABLET & MOBILE)       */
                /* ========================================= */
                @media (max-width: 992px) {
                    .account-sidebar {
                        width: 100%;
                        margin-bottom: 32px;
                        position: relative;
                        z-index: 100;
                    }

                    .sidebar-container {
                        padding: 0;
                        background: transparent;
                        border: none;
                        box-shadow: none;
                        position: relative;
                        top: 0;
                        gap: 0;
                    }

                    /* HIDE Desktop Elements */
                    .desktop-profile, .desktop-only { display: none !important; }

                    /* SHOW Mobile Elements */
                    .mobile-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: var(--c-bg);
                        border: 1px solid var(--c-border);
                        padding: 16px;
                        border-radius: 16px;
                        margin-bottom: 16px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    }

                    .mobile-user { display: flex; align-items: center; gap: 12px; }
                    .avatar-small {
                        width: 36px; height: 36px;
                        background: var(--c-primary);
                        color: white;
                        border-radius: 50%;
                        display: flex; align-items: center; justify-content: center;
                        font-weight: 700; font-size: 0.9rem;
                    }
                    .mobile-username { font-weight: 700; color: var(--c-text); }
                    
                    .mobile-logout {
                        width: 40px; height: 40px;
                        display: flex; align-items: center; justify-content: center;
                        border-radius: 10px;
                        border: 1px solid var(--c-border);
                        background: transparent;
                        color: var(--c-danger);
                    }

                    /* TRANSFORM Nav to Horizontal Scroll */
                    .nav-menu {
                        flex-direction: row;
                        overflow-x: auto;
                        gap: 12px;
                        padding-bottom: 4px;
                        /* Hide Scrollbar */
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }
                    .nav-menu::-webkit-scrollbar { display: none; }

                    .nav-item {
                        flex-direction: column;
                        justify-content: center;
                        gap: 8px;
                        min-width: 90px;
                        padding: 12px;
                        background: var(--c-bg);
                        border: 1px solid var(--c-border);
                        font-size: 0.8rem;
                        text-align: center;
                        white-space: nowrap;
                    }

                    .nav-item.active {
                        transform: translateY(-2px);
                    }
                }
            `}</style>
        </aside>
    );
}