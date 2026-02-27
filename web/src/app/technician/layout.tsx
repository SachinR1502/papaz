'use client';

import { useAuth } from '@/context/AuthContext';
import { TechnicianProvider, useTechnician } from '@/context/TechnicianContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TechnicianNavbar from '@/components/technician/Navbar';
import TechnicianSidebar from '@/components/technician/Sidebar';
import { Loader2 } from 'lucide-react';

function TechnicianGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading: authLoading } = useAuth();
    const { isLoading: techLoading } = useTechnician();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isLoading = authLoading || techLoading;

    useEffect(() => {
        if (!authLoading) {
            const userRole = user?.role?.toLowerCase();
            if (!user) {
                router.replace('/login');
            } else if (userRole !== 'technician') {
                router.replace('/');
            }
        }
    }, [user, authLoading, router]);

    if (isLoading || !user || user?.role?.toLowerCase() !== 'technician') {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-full bg-[var(--bg-body)] gap-6 animate-pulse">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-[32px] flex items-center justify-center text-[var(--color-primary)] shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.1)] animate-spin">
                    <Loader2 size={32} />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xl font-black italic uppercase tracking-tighter text-[var(--text-body)]">Initializing Control Center</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] animate-pulse">Syncing Secure Data</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-[var(--bg-body)] text-[var(--text-body)] relative">
            {/* Ambient Background Accents (Badges of Color) */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -right-[10%] -top-[10%] w-[500px] h-[500px] rounded-full bg-[var(--color-primary)]/5 blur-[120px] animate-pulse-slow" />
                <div className="absolute -left-[10%] -bottom-[10%] w-[600px] h-[600px] rounded-full bg-[var(--color-secondary)]/5 blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(var(--color-primary-rgb),0.02),transparent_70%)]" />
            </div>

            <div className="relative z-10 flex flex-col h-full w-full">
                <TechnicianNavbar onMenuClick={() => setIsSidebarOpen(true)} />

                <div className="flex flex-1 overflow-hidden">
                    <TechnicianSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
                    <main className="flex-1 overflow-y-auto scrollbar-hide">
                        <div className="container mx-auto p-6 md:p-10 max-w-[1400px] animate-fade-in">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function TechnicianLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TechnicianProvider>
            <TechnicianGuard>
                {children}
            </TechnicianGuard>
        </TechnicianProvider>
    );
}
