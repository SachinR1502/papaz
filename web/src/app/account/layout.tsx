'use client';

import { useState } from 'react';
import AccountSidebar from '@/components/account/AccountSidebar';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Bell, Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAGE_TITLES: Record<string, string> = {
    '/account': 'Dashboard',
    '/account/orders': 'My Orders',
    '/account/wishlist': 'Wishlist',
    '/account/addresses': 'Addresses',
    '/account/settings': 'Settings',
};

function TopBar({
    sidebarOpen,
    onToggle,
}: {
    sidebarOpen: boolean;
    onToggle: () => void;
}) {
    const { user } = useAuth();
    const pathname = usePathname();

    const getTitle = () => {
        const matched = Object.keys(PAGE_TITLES).find((key) =>
            pathname.startsWith(key)
        );
        return matched ? PAGE_TITLES[matched] : 'Account';
    };

    const title = getTitle();

    return (
        <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[rgba(var(--bg-card-rgb),0.5)] backdrop-blur-xl flex-shrink-0">

            {/* LEFT */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggle}
                    className="w-9 h-9 rounded-xl bg-[rgba(var(--bg-card-rgb),0.6)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-body)] hover:border-[var(--color-primary)]/40 transition-all"
                >
                    {sidebarOpen ? (
                        <PanelLeftClose size={17} />
                    ) : (
                        <PanelLeftOpen size={17} />
                    )}
                </button>

                <div>
                    <h1 className="text-base font-bold tracking-tight text-[var(--text-body)]">
                        {title}
                    </h1>
                    <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5 opacity-60">
                        My Account
                    </p>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

                {/* Search */}
                <button className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(var(--bg-card-rgb),0.6)] border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-semibold hover:border-[var(--color-primary)]/40 hover:text-[var(--text-body)] transition-all group">
                    <Search size={14} className="group-hover:scale-110 transition-transform" />
                    Search...
                    <kbd className="text-[9px] bg-[rgba(var(--bg-card-rgb),0.8)] border border-[var(--border-color)] rounded px-1.5 py-0.5 font-mono opacity-60">
                        ⌘K
                    </kbd>
                </button>

                {/* Notifications */}
                <button className="relative w-9 h-9 rounded-xl bg-[rgba(var(--bg-card-rgb),0.6)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--color-primary)]/40 hover:text-[var(--text-body)] transition-all">
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-primary)] rounded-full border-2 border-[var(--bg-body)]" />
                </button>

                {/* Avatar */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--border-color)]">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-orange-500/20">
                        {user?.profile?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>

                    <div className="hidden lg:block">
                        <p className="text-xs font-semibold text-[var(--text-body)]">
                            {user?.profile?.fullName?.split(' ')[0] ?? 'User'}
                        </p>
                        <p className="text-[9px] text-[var(--text-muted)] opacity-60">
                            {user?.email ?? ''}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-[var(--bg-body)] text-[var(--text-body)]">

            {/* Ambient background */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[var(--color-primary)] opacity-[0.04] blur-[120px]" />
                <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500 opacity-[0.04] blur-[120px]" />
            </div>

            {/* SIDEBAR */}
            <div
                className={cn(
                    "relative z-40 flex flex-col transition-all duration-300 ease-in-out",
                    sidebarOpen ? "md:w-[260px] lg:w-[300px]" : "md:w-[80px]",
                    "w-full md:h-full md:border-r border-border/50"
                )}
            >
                <AccountSidebar collapsed={!sidebarOpen} />
            </div>

            {/* MAIN */}
            <div className="relative z-10 flex flex-1 flex-col min-w-0 min-h-0">

                <TopBar
                    sidebarOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen((prev) => !prev)}
                />

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <main className="px-4 pt-2 pb-32 md:p-8 lg:p-10">
                        <div className="mx-auto max-w-6xl animate-fade-in">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}