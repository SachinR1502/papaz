'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const PAGE_TITLES: Record<string, string> = {
    '/account': 'Dashboard',
    '/account/orders': 'My Orders',
    '/account/wishlist': 'Wishlist',
    '/account/addresses': 'Addresses',
    '/account/settings': 'Settings',
};

interface AccountTopBarProps {
    sidebarOpen: boolean;
    onToggle: () => void;
}

export default function AccountTopBar({
    sidebarOpen,
    onToggle,
}: AccountTopBarProps) {
    const { user } = useAuth();
    const pathname = usePathname();

    const getTitle = () => {
        const matched = Object.keys(PAGE_TITLES).find((key) =>
            pathname.startsWith(key)
        );
        return matched ? PAGE_TITLES[matched] : 'Account';
    };

    return (
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white sticky top-0 z-40">

            {/* LEFT */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggle}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
                >
                    {sidebarOpen ? (
                        <PanelLeftClose size={18} className="text-gray-600" />
                    ) : (
                        <PanelLeftOpen size={18} className="text-gray-600" />
                    )}
                </button>

                <div>
                    <h1 className="text-lg font-semibold text-gray-800">
                        {getTitle()}
                    </h1>
                    <p className="text-xs text-gray-500">
                        My Account
                    </p>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">

                {/* Notification */}
                <div className="relative">
                    <NotificationDropdown />
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-semibold">
                        {user?.profile?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>

                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-800">
                            {user?.profile?.fullName?.split(' ')[0] ?? 'User'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {user?.email ?? ''}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}