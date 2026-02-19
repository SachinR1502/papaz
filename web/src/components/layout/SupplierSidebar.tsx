'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    CreditCard,
    Settings,
    HelpCircle,
    X,
    ChevronRight,
    Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupplierSidebarProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

interface NavItem {
    href: string;
    icon: any;
    label: string;
}

const MANAGEMENT_LINKS: NavItem[] = [
    { href: '/supplier/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/supplier/orders', icon: ShoppingBag, label: 'Orders' },
    { href: '/supplier/inventory', icon: Package, label: 'Inventory' },
];

const FINANCIAL_LINKS: NavItem[] = [
    { href: '/supplier/payments', icon: CreditCard, label: 'Payments' },
    { href: '/supplier/profile', icon: Settings, label: 'Store Settings' },
];

export default function SupplierSidebar({ open, onOpenChange }: SupplierSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* MOBILE OVERLAY */}
            {open && (
                <div
                    className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-500"
                    onClick={() => onOpenChange?.(false)}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-[120] w-[280px] md:w-[300px] border-r border-border bg-card/40 backdrop-blur-3xl p-8 flex flex-col transition-all duration-500 ease-in-out lg:translate-x-0 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] lg:z-10",
                open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => onOpenChange?.(false)}
                    className="lg:hidden absolute top-6 right-6 p-2 rounded-xl bg-card/50 text-muted transition-all active:scale-90"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col gap-10">
                    {/* Management Section */}
                    <div className="space-y-4">
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-muted opacity-40">Management</p>
                        <nav className="flex flex-col gap-2">
                            {MANAGEMENT_LINKS.map(link => (
                                <SidebarLink
                                    key={link.href}
                                    link={link}
                                    active={pathname === link.href}
                                    onClick={() => onOpenChange?.(false)}
                                />
                            ))}
                        </nav>
                    </div>

                    {/* Financial Section */}
                    <div className="space-y-4">
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-muted opacity-40">Financials</p>
                        <nav className="flex flex-col gap-2">
                            {FINANCIAL_LINKS.map(link => (
                                <SidebarLink
                                    key={link.href}
                                    link={link}
                                    active={pathname === link.href || pathname.startsWith(link.href)}
                                    onClick={() => onOpenChange?.(false)}
                                />
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative p-5 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-primary">
                                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                    <HelpCircle size={16} />
                                </div>
                                <span className="font-black text-xs uppercase tracking-wider italic">Need Help?</span>
                            </div>
                            <p className="text-[10px] text-muted font-bold leading-relaxed opacity-70">
                                Contact our dedicated support team at <span className="text-primary">support@papaz.com</span>
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

function SidebarLink({ link, active, onClick }: { link: NavItem, active: boolean, onClick: () => void }) {
    const Icon = link.icon;

    return (
        <Link
            href={link.href}
            onClick={onClick}
            className={cn(
                "group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden",
                active
                    ? "bg-primary text-white shadow-xl shadow-primary/20 translate-x-1"
                    : "text-muted hover:text-foreground hover:bg-card/50 hover:translate-x-1"
            )}
        >
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                active ? "bg-white/20" : "bg-card border border-border group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5"
            )}>
                <Icon size={18} className={cn(active ? "text-white" : "text-muted group-hover:text-primary")} />
            </div>
            <span className="flex-1 font-black text-xs uppercase tracking-widest italic">{link.label}</span>
            {active ? (
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
            ) : (
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
            )}

            {/* Shine effect on active */}
            {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
        </Link>
    );
}
