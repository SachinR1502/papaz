'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminNavbar from '@/components/admin/Navbar';
import AdminSidebar from '@/components/admin/Sidebar';

function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            const userRole = user?.role?.toLowerCase();
            if (!user) {
                router.replace('/login');
            } else if (userRole !== 'admin') {
                router.replace('/');
            }
        }
    }, [user, isLoading, router]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const userRole = user?.role?.toLowerCase();

    if (isLoading || !user || userRole !== 'admin') {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--bg-body)',
                flexDirection: 'column',
                gap: '24px'
            }}>
                <div className="animate-spin" style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid rgba(var(--color-primary-rgb), 0.1)',
                    borderTopColor: 'var(--color-primary)',
                    borderRadius: '50%'
                }}></div>
                <div style={{ color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '2px', fontSize: '0.9rem' }}>
                    AUTHENTICATING SECURE ACCESS...
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-body)' }}>
            {/* Ambient background effect */}
            <div style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 0% 0%, rgba(var(--color-primary-rgb), 0.05) 0%, transparent 50%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <AdminNavbar onMenuClick={() => setIsSidebarOpen(true)} />
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', position: 'relative', zIndex: 1 }}>
                <AdminSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            {children}
        </AdminGuard>
    );
}
