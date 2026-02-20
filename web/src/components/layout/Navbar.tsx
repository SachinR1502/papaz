'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Search, ShoppingCart, User, LogOut, LayoutDashboard, Settings, ChevronDown, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(100);

    const placeholders = [
        "Search for tires...",
        "Looking for engine oil?",
        "Find brake parts...",
        "Search for helmets...",
        "Need new accessories?"
    ];

    useEffect(() => {
        const handleType = () => {
            const current = loopNum % placeholders.length;
            const fullText = placeholders[current];

            setDisplayText(
                isDeleting
                    ? fullText.substring(0, displayText.length - 1)
                    : fullText.substring(0, displayText.length + 1)
            );

            setTypingSpeed(isDeleting ? 40 : 100);

            if (!isDeleting && displayText === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && displayText === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, loopNum, typingSpeed, placeholders]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${searchQuery}`;
        }
    };

    const getProfileLink = () => {
        if (!user) return '/login';
        const role = user.role?.toLowerCase();
        if (role === 'admin') return '/admin/dashboard';
        if (role === 'supplier') return '/supplier/dashboard';
        if (role === 'technician') return '/technician/dashboard';
        return '/account';
    };

    return (
        <nav
            className={cn(
                "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out flex items-center justify-between border border-[var(--border-color)] gap-8",
                isScrolled
                    ? "top-4 w-[min(1400px,calc(100%-32px))] bg-[var(--bg-card)]/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[32px] py-2 px-8 border-white/10"
                    : "top-8 w-[min(1440px,calc(100%-64px))] bg-[var(--bg-card)] rounded-[40px] py-2 px-12 shadow-sm border-transparent",
                isMobileSearchOpen && "px-4 py-4"
            )}
        >
            {isMobileSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center w-full gap-4 animate-fade-in pr-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="rounded-full bg-[var(--bg-body)]/50"
                    >
                        <X size={20} />
                    </Button>
                    <div className="flex-1 relative">
                        <Input
                            autoFocus
                            placeholder={displayText}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-12 h-11 rounded-2xl bg-[var(--bg-body)]/50 border-[var(--color-primary)]/20 shadow-inner placeholder:transition-opacity placeholder:duration-500"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-primary)] opacity-60 pointer-events-none" size={18} />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] transition-all"
                            >
                                <X size={14} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                    <Button type="submit" variant="premium" className="rounded-xl px-6">
                        Search
                    </Button>
                </form>
            ) : (
                <>
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group relative shrink-0">
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 relative z-10 border border-white/10 overflow-hidden">
                                <img
                                    src="/icon.png"
                                    alt="Papaz"
                                    className="w-11 h-11 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-box"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>');
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter text-[var(--text-body)] uppercase hidden sm:block leading-none italic">
                                PAPAZ
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Command Bar */}
                    <div className="hidden md:block flex-1 max-w-2xl mx-16 lg:mx-24 transition-all duration-300">
                        <div className="relative group">
                            <form onSubmit={handleSearchSubmit}>
                                <Input
                                    placeholder={displayText}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-11 pr-12 h-11 bg-[var(--bg-body)]/40 hover:bg-[var(--bg-body)]/80 focus:bg-[var(--bg-card)] transition-all rounded-[18px] border-[var(--border-color)] group-hover:border-[var(--color-primary)]/30 group-hover:shadow-[0_0_20px_rgba(255,140,0,0.05)] placeholder:text-[var(--text-muted)]/50"
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-hover:text-orange-500 transition-colors duration-300 pointer-events-none" size={18} />

                                {searchQuery ? (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] transition-all animate-in fade-in scale-in-0 duration-200"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                ) : (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-card)]/50 border border-[var(--border-color)] pointer-events-none opacity-40">
                                        <span className="text-[10px] font-black tracking-tight">⌘</span>
                                        <span className="text-[10px] font-black tracking-tight">K</span>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex items-center gap-2.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileSearchOpen(true)}
                            className="md:hidden rounded-xl bg-[var(--bg-body)]/40"
                        >
                            <Search size={22} />
                        </Button>

                        <div className="hidden sm:flex items-center gap-1.5 mr-2">
                            <Button variant="ghost" size="icon" className="rounded-xl text-[var(--text-muted)] hover:text-orange-500 hover:bg-orange-500/5 transition-all">
                                <Bell size={20} />
                            </Button>
                        </div>

                        <Link href="/cart">
                            <div className="relative group p-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-12 h-12 rounded-2xl bg-[var(--bg-body)]/40 border border-transparent group-hover:border-orange-500/20 group-hover:bg-orange-500/5 transition-all"
                                >
                                    <ShoppingCart size={22} className="group-hover:translate-y-[-2px] transition-transform duration-300" />
                                </Button>
                                {totalItems > 0 && (
                                    <Badge variant="premium" className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 min-w-[20px] h-[20px] flex items-center justify-center border-2 border-[var(--bg-card)] text-[10px] font-black animate-in zoom-in-50 duration-300">
                                        {totalItems}
                                    </Badge>
                                )}
                            </div>
                        </Link>

                        <div className="h-8 w-px bg-[var(--border-color)] mx-1 hidden sm:block" />

                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={cn(
                                        "h-12 px-2 pl-2 pr-4 rounded-2xl gap-3 transition-all duration-300 border border-transparent",
                                        isDropdownOpen
                                            ? "bg-[var(--bg-body)] border-[var(--border-color)] shadow-inner"
                                            : "hover:bg-[var(--bg-body)] hover:border-orange-500/10"
                                    )}
                                >
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center text-white p-0.5 shadow-md group-hover:shadow-orange-500/20">
                                        <div className="w-full h-full rounded-[9px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-[10px] font-black uppercase text-white shadow-inner">
                                            {user.profile?.fullName?.[0] || user.role?.[0]?.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="hidden lg:flex flex-col items-start translate-y-[1px]">
                                        <span className="text-xs font-black text-[var(--text-body)] leading-tight tracking-tight">
                                            {user.profile?.fullName?.split(' ')[0] || user.role}
                                        </span>
                                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider leading-none opacity-60">
                                            {user.role}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={14}
                                        className={cn(
                                            "text-[var(--text-muted)] transition-transform duration-500 hidden lg:block",
                                            isDropdownOpen && "rotate-180 text-orange-500"
                                        )}
                                    />
                                </Button>

                                {isDropdownOpen && (
                                    <div className="absolute top-[calc(100%+14px)] right-0 w-64 p-2 bg-[var(--bg-card)]/95 backdrop-blur-3xl border border-[var(--border-color)] rounded-[24px] shadow-2xl shadow-black/20 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 flex flex-col gap-1.5 origin-top-right z-50">
                                        <div className="p-4 mb-1 border-b border-[var(--border-color)] bg-zinc-500/5 rounded-[18px]">
                                            <p className="font-black text-sm text-[var(--text-body)] truncate mb-1">{user.profile?.fullName || 'User'}</p>
                                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
                                                Online
                                            </div>
                                        </div>

                                        <DropdownItem
                                            href={getProfileLink()}
                                            icon={LayoutDashboard}
                                            label="My Dashboard"
                                            description="View your activity"
                                            onClick={() => setIsDropdownOpen(false)}
                                        />
                                        <DropdownItem
                                            href="/account/settings"
                                            icon={Settings}
                                            label="Settings"
                                            description="Update your profile"
                                            onClick={() => setIsDropdownOpen(false)}
                                        />

                                        <div className="h-px bg-[var(--border-color)] my-1.5 mx-2" />

                                        <button
                                            onClick={() => { logout(); setIsDropdownOpen(false); }}
                                            className="w-full flex items-center gap-4 p-3.5 rounded-xl text-[13px] font-black text-red-500 hover:bg-red-500/10 transition-all text-left group"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                                <LogOut size={16} />
                                            </div>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button variant="premium" className="h-11 px-8 rounded-2xl text-[13px] tracking-wide">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </>
            )}
        </nav>
    );
}

function DropdownItem({ href, icon: Icon, label, description, onClick }: { href: string, icon: any, label: string, description?: string, onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-4 p-3 rounded-xl text-[13px] font-black text-[var(--text-body)] hover:bg-[var(--bg-body)] hover:pl-4 transition-all duration-300 group"
        >
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-body)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-orange-500 group-hover:border-orange-500/20 group-hover:shadow-[0_0_15px_rgba(255,140,0,0.1)] transition-all">
                <Icon size={18} />
            </div>
            <div className="flex flex-col">
                <span className="tracking-tight leading-none mb-1">{label}</span>
                {description && <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide opacity-50">{description}</span>}
            </div>
        </Link>
    );
}
