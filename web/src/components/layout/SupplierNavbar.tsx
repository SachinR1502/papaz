'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSupplier } from '@/context/SupplierContext';
import { LogOut, Search, Menu, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import SupplierNotificationDropdown from './SupplierNotificationDropdown';

interface SupplierNavbarProps {
    onMenuClick?: () => void;
}

export default function SupplierNavbar({
    onMenuClick
}: SupplierNavbarProps) {
    const { profile, isApproved } = useSupplier();
    const { logout } = useAuth();

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">

            {/* LEFT SECTION */}
            <div className="flex items-center gap-6">

                {/* Mobile Menu */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <Menu size={20} />
                </button>

                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-3 group"
                >
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:rotate-6 transition">
                        P
                    </div>

                    <span className="hidden sm:block text-lg font-semibold text-gray-900">
                        Papaz <span className="text-orange-500 font-medium">Supplier</span>
                    </span>
                </Link>

                {/* Divider */}
                <div className="hidden lg:block h-6 w-px bg-gray-200" />

                {/* Store Name */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100">
                    <Store size={16} className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-800">
                        {profile?.storeName ||
                            profile?.shopName ||
                            'Partner Portal'}
                    </span>

                    {!isApproved && (
                        <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                            Pending
                        </span>
                    )}
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-4">

                {/* Search */}
                <div className="relative hidden xl:block">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition w-64"
                    />
                </div>

                {/* Notification */}
                <SupplierNotificationDropdown />

                {/* Divider */}
                <div className="h-6 w-px bg-gray-200" />

                {/* Logout */}
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition text-sm font-medium"
                >
                    <LogOut size={16} />
                    <span className="hidden lg:inline">
                        Logout
                    </span>
                </button>
            </div>
        </header>
    );
}