'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Wrench,
    Package,
    Wallet,
    User,
    Settings,
    HelpCircle,
    X,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechnicianSidebarProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

interface NavItem {
    href: string;
    icon: any;
    label: string;
}

const PRIMARY_LINKS: NavItem[] = [
    { href: '/technician/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/technician/jobs', icon: Wrench, label: 'My Jobs' },
    { href: '/technician/inventory', icon: Package, label: 'My Parts' },
];

const SECONDARY_LINKS: NavItem[] = [
    { href: '/technician/wallet', icon: Wallet, label: 'Earnings' },
    { href: '/technician/profile', icon: User, label: 'My Profile' },
    { href: '/technician/settings', icon: Settings, label: 'Settings' },
];

export default function TechnicianSidebar({ open, onOpenChange }: TechnicianSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => onOpenChange?.(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-80px)] w-[260px] bg-white border-r border-gray-200 p-6 flex flex-col transition-transform duration-300 z-50",
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Mobile Close */}
                <button
                    onClick={() => onOpenChange?.(false)}
                    className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
                >
                    <X size={18} />
                </button>

                {/* Logo / Title */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-gray-800">
                        Technician Panel
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Manage your work
                    </p>
                </div>

                {/* Main Links */}
                <nav className="space-y-2" aria-label="Main Navigation">
                    {PRIMARY_LINKS.map(link => (
                        <SidebarLink
                            key={link.href}
                            link={link}
                            active={pathname.startsWith(link.href)}
                            onClick={() => onOpenChange?.(false)}
                        />
                    ))}
                </nav>

                {/* Divider */}
                <div className="my-6 border-t border-gray-200" />

                {/* Secondary Links */}
                <nav className="space-y-2" aria-label="Account Navigation">
                    {SECONDARY_LINKS.map(link => (
                        <SidebarLink
                            key={link.href}
                            link={link}
                            active={pathname.startsWith(link.href)}
                            onClick={() => onOpenChange?.(false)}
                        />
                    ))}
                </nav>

                {/* Help Box */}
                <div className="mt-auto pt-6">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <div className="flex items-center gap-2 text-orange-600 mb-2">
                            <HelpCircle size={16} />
                            <span className="text-sm font-semibold">Need Help?</span>
                        </div>
                        <p className="text-xs text-gray-600">
                            Contact support if you face any issue.
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}

function SidebarLink({
    link,
    active,
    onClick
}: {
    link: NavItem;
    active: boolean;
    onClick: () => void;
}) {
    const Icon = link.icon;

    return (
        <Link
            href={link.href}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                active
                    ? "bg-orange-100 text-orange-600"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            )}
        >
            <Icon size={18} />
            {link.label}
            {active && (
                <ChevronRight size={14} className="ml-auto" />
            )}
        </Link>
    );
}