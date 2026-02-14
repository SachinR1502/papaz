'use client';

import { SupplierProvider, useSupplier } from '@/context/SupplierContext';
import SupplierNavbar from '@/components/layout/SupplierNavbar';
import SupplierSidebar from '@/components/layout/SupplierSidebar';

function SupplierGuard({ children }: { children: React.ReactNode }) {
    const { isLoading } = useSupplier();

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--bg-body)'
            }}>
                <div style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Syncing Store Data...</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <SupplierNavbar />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <SupplierSidebar />
                <main style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.01)' }}>
                    {children}
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
