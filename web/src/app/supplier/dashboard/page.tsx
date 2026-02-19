'use client';

import { useSupplier } from '@/context/SupplierContext';
import {
    Wallet,
    ShoppingBag,
    Package,
    Star,
    TrendingUp,
    Clock,
    ArrowUpRight,
    Zap,
    ChevronRight,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SupplierDashboard() {
    const { profile, orders, inventory, walletBalance, isLoading } = useSupplier();

    const pendingOrdersCount = orders?.filter(o => o.status?.toLowerCase() === 'pending' || o.status?.toLowerCase() === 'new').length || 0;
    const totalSales = orders?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    return (
        <div className="flex flex-col gap-10 md:gap-14 animate-fade-in">
            {/* HEADER */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 lg:mb-6">
                        <Zap size={10} className="text-primary fill-primary" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary">Live Performance</span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                        Supplier <span className="text-primary">Dashboard</span>
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-muted font-bold max-w-2xl opacity-80 leading-relaxed">
                        Welcome back, <span className="text-foreground">{profile?.storeName || 'Partner'}</span>. Your business overview and latest activity.
                    </p>
                </div>
                <div className="flex items-center gap-6 p-6 rounded-[28px] border border-border bg-card/20 backdrop-blur-xl shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Star size={24} className="fill-amber-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted opacity-60 m-0">Store Rating</p>
                        <p className="text-2xl font-black text-foreground italic m-0">{profile?.rating || '4.9'}/5.0</p>
                    </div>
                </div>
            </header>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Sales"
                    value={`₹${totalSales.toLocaleString()}`}
                    subtitle="Lifetime generated"
                    icon={<TrendingUp size={24} />}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    title="Wallet"
                    value={`₹${walletBalance.toLocaleString()}`}
                    subtitle="Available for payout"
                    icon={<Wallet size={24} />}
                    color="text-indigo-500"
                    bg="bg-indigo-500/10"
                />
                <StatCard
                    title="New Orders"
                    value={pendingOrdersCount.toString()}
                    subtitle="To be fulfilled"
                    icon={<ShoppingBag size={24} />}
                    color="text-amber-500"
                    bg="bg-amber-500/10"
                />
                <StatCard
                    title="Products"
                    value={(inventory?.length || 0).toString()}
                    subtitle="Active listings"
                    icon={<Package size={24} />}
                    color="text-green-500"
                    bg="bg-green-500/10"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-10">
                {/* RECENT ACTIVITY */}
                <section>
                    <div className="flex justify-between items-center mb-8 px-1">
                        <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight flex items-center gap-3">
                            Recent Activity
                        </h2>
                        <Link href="/supplier/orders" className="flex items-center gap-1.5 text-primary font-black text-xs uppercase tracking-widest group bg-primary/5 px-4 py-2 rounded-xl transition-all hover:bg-primary/10">
                            View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex flex-col gap-5">
                        {!orders || orders.length === 0 ? (
                            <div className="p-16 md:p-24 text-center rounded-[40px] border border-border border-dashed bg-card/5 transition-all hover:bg-card/10">
                                <div className="w-20 h-20 mx-auto bg-card/20 rounded-3xl flex items-center justify-center mb-8 text-muted/30">
                                    <Clock size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-foreground italic uppercase mb-2">No orders yet</h3>
                                <p className="text-muted font-black uppercase tracking-widest text-[10px] mb-8 max-w-xs mx-auto opacity-60">Your sales and incoming requests will appear here once customers start ordering.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {orders.slice(0, 5).map(order => (
                                    <Link
                                        key={order.id}
                                        href={`/supplier/orders/${order.id}`}
                                        className="flex flex-col sm:flex-row justify-between items-center p-6 md:p-8 rounded-[32px] border border-border bg-card/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/40 group"
                                    >
                                        <div className="flex items-center gap-6 w-full sm:w-auto">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl flex items-center justify-center font-black text-primary shrink-0 border border-primary/10 group-hover:rotate-3 transition-transform duration-500 italic">
                                                #{order.id.slice(-4).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="m-0 font-black text-lg text-foreground italic uppercase leading-tight mb-2 group-hover:text-primary transition-colors">
                                                    {order.partName || 'Spare Part'}
                                                </p>
                                                <div className="flex items-center gap-4 text-[10px] text-muted font-black uppercase tracking-widest opacity-60">
                                                    <span className="flex items-center gap-1.5"><Package size={12} /> Qty: {order.quantity}</span>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end mt-6 sm:mt-0 pt-6 sm:pt-0 border-t sm:border-0 border-border/50">
                                            <p className="m-0 font-black text-2xl text-foreground tracking-tighter">
                                                ₹{order.amount?.toLocaleString()}
                                            </p>
                                            <StatusBadge status={order.status} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* SIDEBAR CARDS */}
                <div className="flex flex-col gap-10">
                    {/* PERFORMANCE CARD */}
                    <div className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-3xl relative overflow-hidden flex flex-col gap-10 group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary opacity-[0.03] blur-[100px] -mr-40 -mt-40 pointer-events-none group-hover:opacity-10 transition-opacity" />

                        <div className="relative z-10">
                            <h3 className="m-0 text-2xl font-black tracking-tight text-foreground italic uppercase flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(255,140,0,0.5)]"></span>
                                Store Metrics
                            </h3>
                            <p className="mt-2 text-[10px] text-muted font-black uppercase tracking-[0.2em] opacity-60">System health and trust score</p>
                        </div>

                        <div className="relative z-10 flex flex-col gap-8">
                            <MetricRow label="Pickup Velocity" value="Top 3%" icon={<TrendingUp size={16} className="text-green-500" />} />
                            <MetricRow label="Acceptance Rate" value="92%" icon={<CheckCircle2 size={16} className="text-blue-500" />} />
                            <MetricRow label="Inventory Latency" value="0.1s" icon={<Clock size={16} className="text-indigo-500" />} />
                        </div>

                        <div className="mt-auto pt-8 border-t border-border/50 relative z-10 flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-muted opacity-40">System Status</span>
                            <span className="text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Optimal
                            </span>
                        </div>
                    </div>

                    {/* QUICK ACTION CARD */}
                    <div className="p-10 rounded-[40px] border border-primary/20 bg-primary/5 backdrop-blur-3xl relative overflow-hidden flex flex-col gap-6">
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary opacity-[0.05] blur-[80px] pointer-events-none" />
                        <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">Expand Catalog?</h3>
                        <p className="text-xs text-muted font-bold leading-relaxed opacity-70">
                            Add specialized vehicle components to reach more master technicians in your city.
                        </p>
                        <Link
                            href="/supplier/inventory"
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 italic text-center mt-2"
                        >
                            Add New Products
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon, color, bg }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string, bg: string }) {
    return (
        <div className="group p-8 rounded-[36px] border border-border bg-card/10 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 flex flex-col gap-8">
            <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shrink-0",
                bg, color
            )}>
                {icon}
            </div>
            <div>
                <p className="m-0 text-[10px] text-muted uppercase font-black tracking-[0.2em] opacity-60 mb-2 group-hover:text-primary transition-colors">{title}</p>
                <h3 className="text-3xl md:text-4xl font-black text-foreground italic tracking-tighter m-0">{value}</h3>
                <p className="mt-2 m-0 text-[9px] font-black uppercase tracking-widest text-muted opacity-40">{subtitle}</p>
            </div>
        </div>
    );
}

function MetricRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-card/30 border border-border/50 group/row hover:border-primary/30 transition-all">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted group-hover/row:border-primary/20">
                    {icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover/row:text-foreground transition-colors">{label}</span>
            </div>
            <span className="text-base font-black text-foreground italic tracking-tight">{value}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const s = status?.toLowerCase() || '';
    const isPending = s === 'pending' || s === 'new' || s === 'processing';
    const isCompleted = s === 'delivered' || s === 'paid' || s === 'completed';
    const isCancelled = s === 'cancelled' || s === 'rejected';

    let config = {
        bg: 'bg-amber-500/10',
        text: 'text-amber-500',
        border: 'border-amber-500/20'
    };

    if (isCompleted) {
        config = { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' };
    } else if (isCancelled) {
        config = { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
    } else if (s === 'shipped' || s === 'out_for_delivery') {
        config = { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
    }

    return (
        <span className={cn(
            "px-3 py-1 rounded-lg text-[10px] uppercase font-black tracking-widest mt-2 border",
            config.bg, config.text, config.border
        )}>
            {s.replace('_', ' ')}
        </span>
    );
}
