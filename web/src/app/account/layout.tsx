'use client';

import { useState, useEffect } from 'react';
import AccountSidebar from '@/components/account/AccountSidebar';
import AccountTopBar from '@/components/account/AccountTopBar';
import { cn } from '@/lib/utils';

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(false); // Close mobile sidebar when resizing to desktop
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    /* Prevent body scroll on mobile when sidebar open */
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [sidebarOpen]);

    return (
        <div className="flex h-screen w-full bg-gray-50 text-gray-800 relative overflow-hidden">

            {/* ================= MOBILE OVERLAY ================= */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ================= SIDEBAR ================= */}
            <div
                className={cn(
                    "fixed md:relative z-50 top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",

                    // Mobile slide
                    sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",

                    // Desktop width collapse
                    desktopCollapsed ? "md:w-[80px]" : "md:w-[260px]",

                    "w-[260px]"
                )}
            >
                <AccountSidebar
                    collapsed={desktopCollapsed}
                    onItemClick={() => isMobile && setSidebarOpen(false)}
                />
            </div>

            {/* ================= MAIN ================= */}
            <div className="flex flex-1 flex-col min-w-0">

                <AccountTopBar
                    sidebarOpen={isMobile ? sidebarOpen : !desktopCollapsed}
                    onToggle={() => {
                        if (isMobile) {
                            setSidebarOpen(prev => !prev);
                        } else {
                            setDesktopCollapsed(prev => !prev);
                        }
                    }}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-full mx-auto">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}