'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Wrench,
    CreditCard,
    PieChart,
    Settings,
    Shield,
    ChevronRight,
    LogOut,
    ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSidebar({ open, onOpenChange }: { open?: boolean, onOpenChange?: (open: boolean) => void }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <>
            {/* Mobile Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden animate-fade-in"
                    onClick={() => onOpenChange?.(false)}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-[120] w-[280px] md:w-[300px] border-r border-border bg-card/40 backdrop-blur-3xl p-8 flex flex-col transition-all duration-500 ease-in-out lg:translate-x-0 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] lg:z-10",
                open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}>
                <div className="mb-10 px-4">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Shield size={24} className="fill-primary text-white" />
                        <span className="font-black text-xl tracking-tighter italic">ADMIN PANEL</span>
                    </div>
                    <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em] opacity-40">
                        Sourcing Protocol v4.0
                    </div>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    <AdminNavLink href="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" active={pathname === '/admin/dashboard'} />
                    <AdminNavLink href="/admin/users" icon={<Users size={18} />} label="Users" active={pathname === '/admin/users'} />
                    <AdminNavLink href="/admin/pending" icon={<UserCheck size={18} />} label="Pending" active={pathname === '/admin/pending'} />
                    <AdminNavLink href="/admin/jobs" icon={<Wrench size={18} />} label="Service Jobs" active={pathname === '/admin/jobs'} />
                    <AdminNavLink href="/admin/transactions" icon={<CreditCard size={18} />} label="Transactions" active={pathname === '/admin/transactions'} />
                    <AdminNavLink href="/admin/reports" icon={<PieChart size={18} />} label="Intelligence" active={pathname === '/admin/reports'} />

                    <div className="mt-8 mb-4 px-4 text-[10px] font-black text-muted uppercase tracking-[0.3em] opacity-30">
                        System Resources
                    </div>
                    <AdminNavLink href="/admin/settings" icon={<Settings size={18} />} label="Security" active={pathname === '/admin/settings'} />
                    <Link
                        href="/"
                        className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-black text-muted hover:text-primary hover:bg-primary/5 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <ExternalLink size={18} className="opacity-70 group-hover:opacity-100" />
                            <span>View Storefront</span>
                        </div>
                    </Link>
                </nav>

                <div className="mt-auto px-2">
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-3.5 px-6 py-4 rounded-2xl bg-red-500/5 text-red-500 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 font-black text-xs uppercase tracking-widest transition-all group active:scale-[0.98]"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}

function AdminNavLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link href={href} className={cn(
            "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group",
            active
                ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                : "text-muted hover:text-foreground hover:bg-muted/30"
        )}>
            <div className="flex items-center gap-3.5">
                <div className={cn(
                    "transition-colors",
                    active ? "text-white" : "text-primary opacity-60 group-hover:opacity-100"
                )}>
                    {icon}
                </div>
                <span className="font-black text-sm tracking-tight">{label}</span>
            </div>
            {active && <ChevronRight size={14} className="opacity-40" />}
        </Link>
    );
}

