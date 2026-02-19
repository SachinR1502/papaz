'use client';

import { SupplierProvider, useSupplier } from '@/context/SupplierContext';
import SupplierNavbar from '@/components/layout/SupplierNavbar';
import SupplierSidebar from '@/components/layout/SupplierSidebar';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

function SupplierGuard({ children }: { children: React.ReactNode }) {
    const { isLoading, isRegistered, profile } = useSupplier();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-full bg-background gap-6 animate-pulse">
                <div className="w-16 h-16 bg-primary/10 rounded-[28px] flex items-center justify-center text-primary shadow-2xl shadow-primary/20 animate-spin">
                    <Loader2 size={32} />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xl font-black italic uppercase tracking-tighter text-foreground">Syncing Store Data</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted opacity-60">Establishing Secure Connection</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground relative">
            {/* Ambient background accent */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary opacity-[0.03] blur-[120px]" />
                <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500 opacity-[0.02] blur-[120px]" />
            </div>

            <SupplierNavbar onMenuClick={() => setIsSidebarOpen(true)} />

            <div className="flex flex-1 overflow-hidden relative z-10">
                <SupplierSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
                <main className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="w-full h-full p-4 md:p-8 lg:p-10">
                        <div className="mx-auto max-w-7xl animate-fade-in">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function SupplierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SupplierProvider>
            <SupplierGuard>
                {children}
            </SupplierGuard>
        </SupplierProvider>
    );
}
