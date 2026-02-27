'use client';

import { useState } from 'react';
import AccountSidebar from '@/components/account/AccountSidebar';
import AccountTopBar from '@/components/account/AccountTopBar';
import { cn } from '@/lib/utils';

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen w-full bg-gray-50 text-gray-800">

            {/* SIDEBAR */}
            <div
                className={cn(
                    "hidden md:block transition-all duration-300 border-r border-gray-200 bg-white",
                    sidebarOpen ? "md:w-[260px]" : "md:w-[80px]"
                )}
            >
                <AccountSidebar collapsed={!sidebarOpen} />
            </div>

            {/* MAIN CONTENT */}
            <div className="flex flex-1 flex-col min-w-0">

                <AccountTopBar
                    sidebarOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(prev => !prev)}
                />

                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-full mx-auto">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}