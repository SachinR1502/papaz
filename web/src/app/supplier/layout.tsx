'use client';

import { SupplierProvider, useSupplier } from '@/context/SupplierContext';
import SupplierNavbar from '@/components/layout/SupplierNavbar';
import SupplierSidebar from '@/components/layout/SupplierSidebar';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

function SupplierGuard({ children }: { children: React.ReactNode }) {
    const { isLoading } = useSupplier();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    /* ================= LOADING SCREEN ================= */
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-orange-50 via-white to-indigo-50">
                <div className="flex flex-col items-center gap-6">

                    <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg animate-spin">
                        <Loader2 size={28} />
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Syncing Store Data
                        </h2>
                        <p className="text-sm text-gray-500">
                            Establishing secure connection...
                        </p>
                    </div>

                </div>
            </div>
        );
    }

    /* ================= MAIN LAYOUT ================= */
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-[#FAFBFF] text-gray-900">

            {/* NAVBAR */}
            <SupplierNavbar onMenuClick={() => setIsSidebarOpen(true)} />

            <div className="flex flex-1 overflow-hidden">

                {/* SIDEBAR */}
                <SupplierSidebar
                    open={isSidebarOpen}
                    onOpenChange={setIsSidebarOpen}
                />

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 lg:p-8 animate-fade-in min-h-full">
                        {children}
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