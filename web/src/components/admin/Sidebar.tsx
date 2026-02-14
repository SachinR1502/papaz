'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Wrench,
    CreditCard,
    PieChart,
    Settings,
    Shield,
    ChevronRight,
    LogOut
} from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside style={{
            width: '300px',
            borderRight: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(20px)',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: '80px',
            height: 'calc(100vh - 80px)',
            zIndex: 10
        }}>
            <div style={{ marginBottom: '40px', padding: '0 16px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'var(--color-primary)',
                    marginBottom: '8px'
                }}>
                    <Shield size={24} fill="var(--color-primary)" color="white" />
                    <span style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>ADMIN PORTAL</span>
                </div>
                <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    letterSpacing: '1px',
                    opacity: 0.6
                }}>
                    MANAGEMENT PORTAL v4.2
                </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <AdminNavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={pathname === '/admin/dashboard'} />
                <AdminNavLink href="/admin/users" icon={<Users size={20} />} label="Users" active={pathname === '/admin/users'} />
                <AdminNavLink href="/admin/pending" icon={<UserCheck size={20} />} label="Pending Approvals" active={pathname === '/admin/pending'} />
                <AdminNavLink href="/admin/jobs" icon={<Wrench size={20} />} label="Service Jobs" active={pathname === '/admin/jobs'} />
                <AdminNavLink href="/admin/transactions" icon={<CreditCard size={20} />} label="Transactions" active={pathname === '/admin/transactions'} />
                <AdminNavLink href="/admin/reports" icon={<PieChart size={20} />} label="Reports" active={pathname === '/admin/reports'} />

                <div style={{ margin: '24px 16px 8px', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1.5px' }}>
                    SYSTEM
                </div>
                <AdminNavLink href="/admin/settings" icon={<Settings size={20} />} label="Settings" active={pathname === '/admin/settings'} />
            </nav>

            <div style={{ marginTop: 'auto', padding: '16px' }}>
                <button
                    onClick={() => logout()}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(255, 59, 48, 0.05)',
                        color: '#FF3B30',
                        border: '1px solid rgba(255, 59, 48, 0.1)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.05)'}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}

function AdminNavLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link href={href} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderRadius: '16px',
            textDecoration: 'none',
            color: active ? 'white' : 'var(--text-muted)',
            background: active ? 'var(--color-primary)' : 'transparent',
            fontWeight: 700,
            fontSize: '0.95rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: active ? '0 10px 20px rgba(var(--color-primary-rgb), 0.2)' : 'none'
        }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                    color: active ? 'white' : 'var(--color-primary)',
                    opacity: active ? 1 : 0.7
                }}>
                    {icon}
                </div>
                <span>{label}</span>
            </div>
            {active && <ChevronRight size={16} opacity={0.6} />}
        </Link>
    );
}
