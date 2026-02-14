'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

function TechnicianGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            const userRole = user?.role?.toLowerCase();
            if (!user) {
                router.replace('/login');
            } else if (userRole !== 'technician') {
                router.replace('/');
            }
        }
    }, [user, isLoading, router]);

    const userRole = user?.role?.toLowerCase();
    if (isLoading || !user || userRole !== 'technician') {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--bg-body)'
            }}>
                <div style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Loading Technician Portal...</div>
            </div>
        );
    }

    const pathname = usePathname();

    return (
        <>
            <Navbar />
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
                {/* Technician Sidebar */}
                <aside style={{
                    width: '280px',
                    borderRight: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    padding: '32px 16px'
                }}>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <TechnicianNavLink href="/technician/dashboard" icon="🛠️" label="My Jobs" active={pathname === '/technician/dashboard'} />
                        <TechnicianNavLink href="/technician/inventory" icon="⚙️" label="Inventory" active={pathname === '/technician/inventory'} />
                        <TechnicianNavLink href="/technician/wallet" icon="💰" label="Earnings" active={pathname === '/technician/wallet'} />
                        <TechnicianNavLink href="/technician/profile" icon="👤" label="My Profile" active={pathname === '/technician/profile'} />
                    </nav>
                </aside>

                <main style={{ flex: 1, overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </>
    );
}

function TechnicianNavLink({ href, icon, label, active = false }: { href: string, icon: string, label: string, active?: boolean }) {
    return (
        <Link href={href} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            textDecoration: 'none',
            color: active ? 'white' : 'var(--text-muted)',
            background: active ? 'var(--color-primary)' : 'transparent',
            fontWeight: 600,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            <span>{label}</span>
        </Link>
    );
}

export default function TechnicianLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TechnicianGuard>
            {children}
        </TechnicianGuard>
    );
}
