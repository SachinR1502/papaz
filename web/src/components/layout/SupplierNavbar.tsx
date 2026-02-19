'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSupplier } from '@/context/SupplierContext';
import { LogOut, Search, Menu, Bell, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupplierNavbarProps {
    onMenuClick?: () => void;
}

export default function SupplierNavbar({ onMenuClick }: SupplierNavbarProps) {
    const { profile, isApproved } = useSupplier();
    const { logout } = useAuth();

    return (
        <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-border/50 bg-card/30 backdrop-blur-2xl z-50 sticky top-0 shrink-0">
            <div className="flex items-center gap-6 lg:gap-10">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2.5 rounded-xl hover:bg-card/50 text-muted transition-all active:scale-90"
                >
                    <Menu size={20} />
                </button>

                <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                        P
                    </div>
                    <span className="font-black text-xl tracking-tighter text-foreground italic uppercase hidden sm:block">
                        Papaz <span className="text-primary italic-none tracking-normal lowercase font-bold opacity-80 decoration-primary/30 underline underline-offset-4">supplier</span>
                    </span>
                </Link>

                <div className="hidden lg:block h-6 w-px bg-border/50" />

                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
                    <Store size={16} className="text-primary" />
                    <span className="font-black text-xs uppercase tracking-widest text-foreground shrink-0">{profile?.storeName || profile?.shopName || 'Partner Portal'}</span>
                    {!isApproved && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Pending Verification</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
                <div className="relative hidden xl:block group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search orders or products..."
                        className="bg-card/40 border border-border/50 py-2.5 pl-12 pr-6 rounded-xl text-xs font-bold w-64 outline-none focus:border-primary/50 focus:bg-card/60 transition-all placeholder:text-muted/50"
                    />
                </div>

                <button className="relative w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all hover:-translate-y-0.5 active:scale-95">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-card" />
                </button>

                <div className="h-6 w-px bg-border/50" />

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/5 text-red-500 border border-red-500/10 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-500/10 hover:border-red-500/20 active:scale-95"
                >
                    <LogOut size={16} />
                    <span className="hidden lg:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}
