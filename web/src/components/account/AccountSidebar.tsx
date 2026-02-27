'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
    { name: 'Dashboard', href: '/account', icon: LayoutDashboard },
    { name: 'Orders', href: '/account/orders', icon: Package },
    { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { name: 'Addresses', href: '/account/addresses', icon: MapPin },
    { name: 'Settings', href: '/account/settings', icon: Settings },
];

export default function AccountSidebar({
    collapsed = false,
}: {
    collapsed?: boolean;
}) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const isActive = (href: string) =>
        href === '/account'
            ? pathname === href
            : pathname.startsWith(href);

    return (
        <div className="h-full flex flex-col bg-white">

            {/* LOGO */}
            <div
                className={cn(
                    "border-b border-gray-200",
                    collapsed ? "p-4 flex justify-center" : "p-6"
                )}
            >
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                        P
                    </div>
                    {!collapsed && (
                        <div>
                            <p className="text-lg font-semibold text-gray-800">
                                PAPAZ
                            </p>
                            <p className="text-xs text-gray-500">
                                My Account
                            </p>
                        </div>
                    )}
                </Link>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 p-4 space-y-1">
                {LINKS.map(({ name, href, icon: Icon }) => {
                    const active = isActive(href);

                    return (
                        <Link
                            key={name}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition",
                                collapsed && "justify-center",
                                active
                                    ? "bg-orange-50 text-orange-600"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <Icon size={18} />
                            {!collapsed && <span>{name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* USER INFO */}
            {!collapsed && (
                <div className="p-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-800">
                        {user?.profile?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                        {user?.email}
                    </p>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}