'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Search,
    ChevronDown,
    Command,
    Loader2,
    Menu
} from 'lucide-react';
import { useState } from 'react';

export default function AdminNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user } = useAuth();
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <nav className="h-20 bg-card/10 backdrop-blur-3xl border-b border-border flex items-center justify-between px-4 md:px-10 sticky top-0 z-[100]">
            {/* Left: Branding/Context */}
            <div className="flex items-center gap-2 md:gap-8">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl hover:bg-card/50 text-muted transition-all active:scale-90"
                >
                    <Menu size={20} />
                </button>

                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                            P
                        </div>
                        <span className="font-black text-xl tracking-tighter italic uppercase hidden xs:block">PAPAZ</span>
                    </div>
                </Link>

                <div className="hidden sm:block h-6 w-px bg-border" />

                <div className="hidden sm:flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse" />
                    Online
                </div>
            </div>

            {/* Center: Global Search - Hidden on Mobile */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8 relative">
                <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 w-full ${isSearchFocused
                    ? 'bg-card border-primary ring-4 ring-primary/10 shadow-lg'
                    : 'bg-card/50 border-border'
                    }`}>
                    <Search className={`transition-colors ${isSearchFocused ? 'text-primary' : 'text-muted'}`} size={16} />
                    <input
                        type="text"
                        placeholder="Search products, orders..."
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className="flex-1 bg-transparent border-none outline-none text-foreground text-sm font-bold placeholder:text-muted/50"
                    />
                    <div className="flex items-center gap-1 text-[10px] font-black text-muted/40 bg-muted/20 px-2 py-1 rounded-lg border border-border">
                        <Command size={10} /> K
                    </div>
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-4 md:gap-6">
                <div className="hidden sm:block h-8 w-px bg-border" />

                <div className="flex items-center gap-3.5 group cursor-pointer pl-0 md:pl-2">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-black tracking-tight leading-none group-hover:text-primary transition-colors">
                            {user?.profile?.fullName || 'Super Admin'}
                        </div>
                        <div className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1.5 opacity-60">
                            Admin
                        </div>
                    </div>
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-black border-2 border-white/10 shadow-xl shadow-primary/20 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300">
                        {user?.profile?.fullName?.[0] || 'A'}
                    </div>
                </div>
            </div>
        </nav>
    );
}

