'use client';

import { useSupplier } from '@/context/SupplierContext';
import {
    Wallet,
    ShoppingBag,
    Package,
    TrendingUp,
    Clock,
    ChevronRight,
    ArrowUpRight,
    Search,
    Filter,
    Activity,
    Target,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SupplierDashboard() {
    const { profile, orders, inventory, walletBalance } = useSupplier();

    const pendingOrders = orders?.filter((o) =>
        ['pending', 'new', 'processing'].includes(o.status?.toLowerCase())
    ) || [];

    const totalSales = orders?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    return (
        <div className="space-y-8 pb-10">

            {/* TOP HEADER SECTION */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                        Hello, <span className="text-orange-500">{profile?.storeName || 'Partner'}</span>
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Welcome to your business command center.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-2 shadow-sm">
                        <span className="text-amber-500 font-bold">★</span>
                        <span className="text-sm font-bold text-gray-700">{profile?.rating || '4.9'}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rating</span>
                    </div>
                    <Link
                        href="/supplier/inventory/add"
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition shadow-lg shadow-gray-200 active:scale-95"
                    >
                        Add Product
                    </Link>
                </div>
            </div>

            {/* KEY STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Revenue"
                    value={`₹${totalSales.toLocaleString()}`}
                    trend="+12.5%"
                    icon={<TrendingUp size={20} />}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    label="Available Balance"
                    value={`₹${walletBalance?.toLocaleString()}`}
                    trend="Ready to Payout"
                    icon={<Wallet size={20} />}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
                <StatCard
                    label="Pending Orders"
                    value={pendingOrders.length}
                    trend={`${pendingOrders.length > 0 ? 'Action Required' : 'All clear'}`}
                    icon={<ShoppingBag size={20} />}
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
                <StatCard
                    label="Active Products"
                    value={inventory?.length || 0}
                    trend="In Inventory"
                    icon={<Package size={20} />}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* RECENT ORDERS LIST */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                        <Link href="/supplier/orders" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                            VIEW ALL <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        {!orders || orders.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                                    <ShoppingBag size={32} />
                                </div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No orders found yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F8F9FB] border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.slice(0, 6).map((order) => (
                                            <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-black text-gray-900">₹{order.amount?.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={order.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/supplier/orders/${order.id}`}
                                                        className="p-2 inline-flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition"
                                                    >
                                                        <ArrowUpRight size={16} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR ANALYTICS */}
                <div className="space-y-8">
                    {/* STORE HEALTH */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Store Health</h3>
                            <Activity size={16} className="text-orange-500" />
                        </div>

                        <div className="space-y-5">
                            <MetricItem label="Fulfillment Rate" value="98%" progress={98} color="bg-emerald-500" />
                            <MetricItem label="Average Delivery" value="1.2 Days" progress={85} color="bg-blue-500" />
                            <MetricItem label="Customer Trust" value="4.9 / 5" progress={92} color="bg-amber-500" />
                        </div>
                    </div>

                    {/* GROWTH CARD */}
                    <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden group shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-20 blur-3xl -mr-16 -mt-16 group-hover:opacity-40 transition-opacity" />

                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Zap size={20} className="text-orange-500" />
                            </div>
                            <h4 className="text-lg font-bold tracking-tight">Expand Business</h4>
                            <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                Upload more products to increase your store's visibility to technicians in your region.
                            </p>
                            <Link
                                href="/supplier/inventory"
                                className="block w-full py-3 bg-white text-gray-900 rounded-xl text-center text-xs font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition"
                            >
                                Update Inventory
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ label, value, trend, icon, color, bg }: any) {
    return (
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", bg, color)}>
                    {icon}
                </div>
                <div className="px-2.5 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function MetricItem({ label, value, progress, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold">
                <span className="text-gray-400 uppercase tracking-wider">{label}</span>
                <span className="text-gray-900 font-bold">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000", color)}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const s = status?.toLowerCase() || 'pending';
    const config: any = {
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        new: 'bg-amber-50 text-amber-600 border-amber-100',
        shipped: 'bg-blue-50 text-blue-600 border-blue-100',
        delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        cancelled: 'bg-red-50 text-red-600 border-red-100',
        rejected: 'bg-red-50 text-red-600 border-red-100',
    };

    const style = config[s] || config.pending;

    return (
        <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border", style)}>
            {s.replace('_', ' ')}
        </span>
    );
}