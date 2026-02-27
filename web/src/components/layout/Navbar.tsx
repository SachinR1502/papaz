'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useState, useRef, useEffect } from 'react';
import {
    Search,
    ShoppingCart,
    LogOut,
    LayoutDashboard,
    Settings,
    ChevronDown,
    X,
    Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { totalItems } = useCart();

    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    /* ---------- Scroll Effect ---------- */
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /* ---------- Close Dropdown Outside ---------- */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /* ---------- Search Submit ---------- */
    const handleSearchSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setIsMobileSearchOpen(false);
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
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-6">
            <nav
                aria-label="Main Navigation"
                className={cn(
                    'mt-4 w-full max-w-[1400px] flex items-center justify-between gap-4 sm:gap-8 transition-all duration-300 border backdrop-blur-xl',
                    isScrolled
                        ? 'bg-[var(--bg-card)]/80 border-[var(--border-color)] shadow-lg rounded-2xl px-4 sm:px-8 py-2'
                        : 'bg-[var(--bg-card)] border-transparent rounded-3xl px-4 sm:px-10 py-3'
                )}
            >
                {/* Logo */}
                <Link href="/" aria-label="Papaz Home" className="flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                        P
                    </div>
                    <span className="hidden sm:block font-black text-xl uppercase tracking-tight">
                        PAPAZ
                    </span>
                </Link>

                {/* Desktop Search */}
                <div className="hidden md:block flex-1 max-w-xl">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <Input
                            placeholder="Search auto parts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 h-10 rounded-xl bg-[var(--bg-body)]"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={16} />
                    </form>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3">

                    {/* Mobile Search Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        aria-label="Search"
                    >
                        {isMobileSearchOpen ? <X size={20} /> : <Search size={20} />}
                    </Button>

                    {/* Notification */}
                    <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Notifications">
                        <Bell size={18} />
                    </Button>

                    {/* Cart */}
                    <Link href="/cart" aria-label="Shopping Cart">
                        <div className="relative">
                            <Button variant="ghost" size="icon">
                                <ShoppingCart size={20} />
                            </Button>
                            {totalItems > 0 && (
                                <Badge className="absolute -top-1 -right-1 text-[10px] px-1.5">
                                    {totalItems}
                                </Badge>
                            )}
                        </div>
                    </Link>

                    {/* User Section */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <Button
                                variant="ghost"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2"
                                aria-expanded={isDropdownOpen}
                            >
                                <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {user.profile?.fullName?.[0] || 'U'}
                                </span>
                                <ChevronDown size={14} />
                            </Button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg p-2">
                                    <DropdownItem
                                        href={getProfileLink()}
                                        icon={LayoutDashboard}
                                        label="Dashboard"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                    <DropdownItem
                                        href="/account/settings"
                                        icon={Settings}
                                        label="Settings"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="premium" className="px-6 h-10 rounded-xl">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Mobile Search Bar */}
            {isMobileSearchOpen && (
                <div className="absolute top-[70px] left-0 right-0 px-4 md:hidden">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 shadow-lg"
                    >
                        <Input
                            autoFocus
                            placeholder="Search auto parts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>
            )}
        </header>
    );
}

function DropdownItem({
    href,
    icon: Icon,
    label,
    onClick,
}: {
    href: string;
    icon: any;
    label: string;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 p-2 hover:bg-[var(--bg-body)] rounded-lg transition"
        >
            <Icon size={16} />
            {label}
        </Link>
    );
}