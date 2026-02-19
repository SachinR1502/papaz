'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutDashboard,
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
    ChevronRight,
} from 'lucide-react';

const LINKS = [
    { name: 'Home', href: '/account', icon: LayoutDashboard },
    { name: 'Orders', href: '/account/orders', icon: Package },
    { name: 'Favorites', href: '/account/wishlist', icon: Heart },
    { name: 'Address', href: '/account/addresses', icon: MapPin },
    { name: 'Settings', href: '/account/settings', icon: Settings },
];

export default function AccountSidebar({ collapsed = false }: { collapsed?: boolean }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const isRouteActive = (href: string) => {
        if (href === '/account') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="w-full h-full flex flex-col">

            {/* ================= MOBILE TOP BAR ================= */}
            <header className="md:hidden flex items-center justify-between bg-card/80 backdrop-blur-2xl border-b border-border px-5 py-4">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Image src="/icon.png" alt="PAPAZ" width={22} height={22} priority />
                    </div>
                    <span className="font-black text-lg tracking-tighter text-foreground italic uppercase">
                        PAPAZ
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs font-black text-foreground leading-none mb-1">
                            {user?.profile?.fullName?.split(' ')[0] || 'User'}
                        </p>
                        <p className="text-[10px] text-green-500 font-black uppercase tracking-widest opacity-80">
                            Online
                        </p>
                    </div>

                    <div className="w-px h-6 bg-border" />

                    <button
                        onClick={logout}
                        className="text-red-500 p-2 rounded-xl hover:bg-red-500/10 active:scale-95 transition-all"
                        aria-label="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* ================= DESKTOP SIDEBAR ================= */}
            <aside className="hidden md:flex flex-col flex-1 overflow-y-auto scrollbar-hide bg-card/40 backdrop-blur-3xl relative transition-all duration-300 border-r border-border/50">

                {/* Top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <div className={`relative flex flex-col flex-1 ${collapsed ? 'py-8 items-center' : 'p-8'}`}>

                    {/* ===== Branding ===== */}
                    <Link
                        href="/"
                        className={`flex items-center group mb-12 ${collapsed ? 'justify-center' : 'gap-4 px-1'}`}
                    >
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0 border border-white/10">
                            <Image src="/icon.png" alt="PAPAZ" width={28} height={28} />
                        </div>

                        {!collapsed && (
                            <div className="animate-fade-in flex flex-col">
                                <span className="text-2xl font-black tracking-tighter text-foreground italic uppercase leading-none">
                                    PAPAZ
                                </span>
                                <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mt-1.5 opacity-60">
                                    Dashboard
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* ===== Navigation ===== */}
                    <nav className={`flex-1 space-y-2 ${collapsed ? 'w-full px-2' : ''}`}>
                        {!collapsed && (
                            <p className="text-[10px] font-black text-muted mb-6 px-4 tracking-[0.3em] uppercase opacity-40 animate-fade-in">
                                Main Menu
                            </p>
                        )}

                        {LINKS.map(({ name, href, icon: Icon }) => {
                            const isActive = isRouteActive(href);

                            return (
                                <Link
                                    key={name}
                                    href={href}
                                    title={collapsed ? name : ''}
                                    className={`
                                        relative group flex items-center
                                        ${collapsed ? 'justify-center p-3.5' : 'gap-4 px-5 py-4'}
                                        rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-500 border
                                        ${isActive
                                            ? `bg-primary text-white border-primary/20 shadow-xl shadow-primary/20`
                                            : `text-muted border-transparent hover:bg-foreground/5 hover:border-foreground/10 hover:text-foreground ${!collapsed && 'hover:translate-x-1'}`
                                        }
                                    `}
                                >
                                    {/* Icon wrapper */}
                                    <div
                                        className={`
                                            flex items-center justify-center rounded-xl transition-all duration-500
                                            ${collapsed ? 'w-8 h-8' : 'w-10 h-10'}
                                            ${isActive ? 'bg-white/20 shadow-inner' : 'bg-foreground/5 group-hover:bg-foreground/10'}
                                        `}
                                    >
                                        <Icon
                                            size={collapsed ? 24 : 18}
                                            strokeWidth={isActive ? 3 : 2.5}
                                            className="transition-all duration-500 group-hover:scale-110"
                                        />
                                    </div>

                                    {!collapsed && (
                                        <>
                                            <span className="animate-fade-in whitespace-nowrap italic">{name}</span>
                                            <ChevronRight
                                                size={16}
                                                className="ml-auto opacity-0 translate-x-4 group-hover:opacity-40 group-hover:translate-x-0 transition-all duration-500"
                                            />
                                        </>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ===== Logout ===== */}
                    <div className={`mt-8 pt-8 border-t border-border/50 ${collapsed ? 'w-full flex justify-center' : ''}`}>
                        <button
                            onClick={logout}
                            title={collapsed ? 'Logout' : ''}
                            className={`
                                flex items-center rounded-2xl font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/10 transition-all duration-500 group
                                ${collapsed ? 'justify-center p-4 w-full' : 'w-full gap-4 px-5 py-4 text-[13px]'}
                            `}
                        >
                            <div className={`
                                bg-red-500/15 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-inner
                                ${collapsed ? 'w-12 h-12' : 'w-10 h-10'}
                            `}>
                                <LogOut size={collapsed ? 24 : 18} />
                            </div>
                            {!collapsed && <span className="animate-fade-in whitespace-nowrap italic">Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* ================= MOBILE BOTTOM DOCK ================= */}
            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm bg-card/90 backdrop-blur-3xl border border-border rounded-[32px] p-2 shadow-2xl shadow-black/40 flex items-center justify-around z-50">
                {LINKS.map(({ name, href, icon: Icon }) => {
                    const isActive = isRouteActive(href);

                    return (
                        <Link
                            key={name}
                            href={href}
                            aria-label={name}
                            className={`
                                relative flex items-center justify-center w-14 h-14 rounded-2xl
                                transition-all duration-500
                                ${isActive
                                    ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110 -translate-y-2'
                                    : 'text-muted hover:text-foreground hover:scale-105'
                                }
                            `}
                        >
                            <Icon size={22} strokeWidth={isActive ? 3 : 2} />
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}