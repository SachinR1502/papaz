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
    ChevronRight
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
    { href: '/supplier/inventory', icon: Package, label: 'Inventory' }
];

const FINANCIAL_LINKS: NavItem[] = [
    { href: '/supplier/payments', icon: CreditCard, label: 'Payments' },
    { href: '/supplier/profile', icon: Settings, label: 'Store Settings' }
];

export default function SupplierSidebar({
    open,
    onOpenChange
}: SupplierSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* MOBILE OVERLAY */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => onOpenChange?.(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Close Button (Mobile) */}
                <div className="lg:hidden flex justify-end p-4">
                    <button
                        onClick={() => onOpenChange?.(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 px-4 sm:px-6 pb-6 space-y-6 overflow-y-auto">

                    {/* MANAGEMENT */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                            Management
                        </p>
                        <nav className="space-y-2">
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

                    {/* FINANCIAL */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                            Financial
                        </p>
                        <nav className="space-y-2">
                            {FINANCIAL_LINKS.map(link => (
                                <SidebarLink
                                    key={link.href}
                                    link={link}
                                    active={
                                        pathname === link.href ||
                                        pathname.startsWith(link.href)
                                    }
                                    onClick={() => onOpenChange?.(false)}
                                />
                            ))}
                        </nav>
                    </div>
                </div>

                {/* HELP CARD */}
                <div className="p-6 border-t border-gray-200">
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                        <div className="flex items-center gap-2 text-orange-600 mb-2">
                            <HelpCircle size={16} />
                            <span className="text-sm font-semibold">
                                Need Help?
                            </span>
                        </div>
                        <p className="text-xs text-gray-600">
                            Contact our support team at{" "}
                            <span className="text-orange-500 font-medium">
                                support@papaz.com
                            </span>
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
            className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-sm font-medium",
                active
                    ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
        >
            <Icon size={18} />
            <span className="flex-1">{link.label}</span>
            {!active && (
                <ChevronRight size={14} className="opacity-40" />
            )}
        </Link>
    );
}