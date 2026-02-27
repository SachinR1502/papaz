'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Search, Menu, Bell, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechnicianNavbarProps {
    onMenuClick?: () => void;
}

export default function TechnicianNavbar({ onMenuClick }: TechnicianNavbarProps) {
    const { user, logout } = useAuth();
    const isApproved =
        user?.profile?.isApproved || user?.profile?.status === 'approved';

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 bg-white sticky top-0 z-40">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">

                {/* Mobile Menu */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <Menu size={20} />
                </button>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                        P
                    </div>
                    <span className="hidden sm:block font-bold text-gray-800 text-lg">
                        Papaz Tech
                    </span>
                </Link>

                {/* Divider */}
                <div className="hidden md:block h-5 w-px bg-gray-200 mx-3" />

                {/* User Name + Status */}
                <div className="hidden md:flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                        {user?.fullName || 'Technician'}
                    </span>

                    {isApproved ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                            <ShieldCheck size={12} />
                            Verified
                        </div>
                    ) : (
                        <div className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-medium">
                            Pending
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">

                {/* Search (Desktop) */}
                <div className="relative hidden xl:block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    />
                </div>

                {/* Notifications */}
                <button className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                    <Bell size={18} className="text-gray-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
                </button>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
                >
                    <LogOut size={16} />
                    <span className="hidden md:inline">Logout</span>
                </button>

            </div>
        </header>
    );
}