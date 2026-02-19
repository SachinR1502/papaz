'use client';

import { useSupplier } from '@/context/SupplierContext';
import {
    Wallet,
    ArrowUpRight,
    TrendingUp,
    Clock,
    Banknote,
    Search,
    Download,
    CreditCard,
    History,
    ShieldCheck,
    ChevronRight,
    Plus,
    Loader2
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function SupplierPaymentsPage() {
    const { walletBalance, transactions, orders, isLoading } = useSupplier();
    const [searchTerm, setSearchTerm] = useState('');

    // Calculate lifetime generated from orders
    const lifetimeGenerated = orders
        ?.filter(o => o.status?.toLowerCase() === 'delivered' || o.status?.toLowerCase() === 'paid' || o.status?.toLowerCase() === 'completed')
        ?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    // Calculate pending settlement (in-progress orders)
    const pendingSettlement = orders
        ?.filter(o => ['pending', 'preparing', 'processing', 'shipped', 'out for delivery'].includes(o.status?.toLowerCase() || ''))
        ?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    const filteredTransactions = (transactions || []).filter(t =>
        t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.referenceId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-10 md:gap-14 animate-fade-in pb-20">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 lg:mb-6">
                        <Banknote size={10} className="text-primary" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary">Financial Center</span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                        Revenue & <span className="text-primary">Payouts</span>
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-muted font-bold max-w-2xl opacity-80 leading-relaxed">
                        Track your earnings, manage your wallet, and request bank settlements.
                    </p>
                </div>
            </header>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Balance Card */}
                <div className="relative group lg:col-span-1 md:col-span-2 lg:row-span-1">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-600 rounded-[40px] blur opacity-25 group-hover:opacity-40 transition-opacity" />
                    <div className="relative h-full flex flex-col justify-between p-10 rounded-[40px] bg-gradient-to-br from-primary via-orange-600 to-primary text-white overflow-hidden min-h-[320px] shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full pointer-events-none" />
                        <Wallet size={180} className="absolute -bottom-10 -right-10 opacity-10 rotate-12 pointer-events-none" />

                        <div>
                            <div className="flex items-center gap-3 mb-4 opacity-80">
                                <Wallet size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Current Balance</span>
                            </div>
                            <div className="text-5xl md:text-6xl font-black tracking-tighter italic m-0">
                                ₹{walletBalance.toLocaleString()}
                            </div>
                        </div>

                        <button className="flex items-center gap-3 px-8 py-5 bg-white text-primary rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 italic w-fit mt-10">
                            Request Payout <ArrowUpRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Growth Card */}
                <div className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-xl flex flex-col justify-between gap-10 group hover:border-primary/30 transition-all duration-500">
                    <div>
                        <div className="flex items-center gap-3 mb-4 opacity-60">
                            <TrendingUp size={16} className="text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Total Revenue</span>
                        </div>
                        <div className="text-4xl font-black text-foreground italic tracking-tighter">
                            ₹{lifetimeGenerated.toLocaleString()}
                        </div>
                        <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-1.5 opacity-80">
                            <ArrowUpRight size={14} /> System lifetime earnings
                        </p>
                    </div>
                    <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] uppercase font-black tracking-widest text-muted opacity-40 mb-1">Next Auto-Settlement</p>
                            <p className="text-xs font-black text-primary uppercase italic">Every Monday morning</p>
                        </div>
                        <Clock size={20} className="text-muted opacity-20" />
                    </div>
                </div>

                {/* Pending Card */}
                <div className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-xl flex flex-col justify-between gap-10 group hover:border-primary/30 transition-all duration-500">
                    <div>
                        <div className="flex items-center gap-3 mb-4 opacity-60">
                            <Clock size={16} className="text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Awaiting Settlement</span>
                        </div>
                        <div className="text-4xl font-black text-foreground italic tracking-tighter">
                            ₹{pendingSettlement.toLocaleString()}
                        </div>
                        <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-muted opacity-60 leading-relaxed">
                            Captured but not yet cleared from in-transit orders.
                        </p>
                    </div>
                    <button className="flex items-center justify-center gap-2 w-full py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary hover:border-primary/30 transition-all active:scale-98">
                        View Detailed Audit
                    </button>
                </div>
            </div>

            {/* Transaction History Section */}
            <section className="flex flex-col gap-8 mt-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                    <div>
                        <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight flex items-center gap-3 leading-none">
                            <History size={24} className="text-primary" />
                            Transaction Sync
                        </h2>
                        <p className="mt-3 text-xs text-muted font-bold opacity-60">End-to-end transparent logs of your portal payouts.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted opacity-50 group-focus-within:opacity-100 transition-opacity" />
                            <input
                                type="text"
                                placeholder="Ref ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-card/20 border border-border py-3 pl-12 pr-6 rounded-2xl text-xs font-bold w-full md:w-64 outline-none focus:border-primary/50 transition-all placeholder:text-muted/40"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-foreground transition-all">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {isLoading ? (
                        <div className="py-24 flex flex-col items-center gap-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary animate-spin">
                                <Loader2 size={32} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted opacity-60">Fetching Financial Data</p>
                        </div>
                    ) : (transactions || []).length === 0 ? (
                        <div className="p-20 text-center rounded-[40px] border border-border border-dashed bg-card/5 transition-all">
                            <div className="w-20 h-20 mx-auto bg-card/20 rounded-3xl flex items-center justify-center mb-8 text-muted/30">
                                <History size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-foreground italic uppercase mb-2">No Transactions Yet</h3>
                            <p className="text-muted font-black uppercase tracking-widest text-[10px] opacity-60">Financial movements will appear here after your first order fulfillment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredTransactions.map((tx: any, i: number) => (
                                <div
                                    key={tx.id || i}
                                    className="group relative flex flex-col md:flex-row items-center justify-between p-6 md:p-8 rounded-[36px] border border-border bg-card/20 backdrop-blur-xl transition-all duration-500 hover:border-primary/50 hover:bg-card/40"
                                >
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10 group-hover:rotate-6 transition-transform">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-black text-foreground italic uppercase tracking-tight group-hover:text-primary transition-colors leading-none">
                                                    Payout Request
                                                </h4>
                                                <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 text-[8px] font-black uppercase tracking-widest">
                                                    Settled
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[9px] text-muted font-black uppercase tracking-widest opacity-60">
                                                <span className="flex items-center gap-1.5"><Clock size={12} /> {tx.date || 'Today'}</span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-green-500" /> Ref: {tx.referenceId || tx.id?.slice(-8).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto mt-8 md:mt-0 pt-6 md:pt-0 border-t md:border-0 border-border/50">
                                        <div className="flex flex-col gap-3">
                                            <p className="text-[9px] uppercase font-black tracking-widest text-muted opacity-40 leading-none">Destination</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-card border border-border flex items-center justify-center">
                                                    <Plus size={12} className="text-muted" />
                                                </div>
                                                <span className="text-xs font-black text-foreground uppercase tracking-tight">HDFC Bank **** 4321</span>
                                            </div>
                                        </div>

                                        <div className="text-left md:text-right">
                                            <p className="text-[9px] uppercase font-black tracking-widest text-muted opacity-40 mb-1">Net Payout</p>
                                            <p className="text-2xl font-black text-foreground tracking-tighter italic leading-none">
                                                ₹{tx.amount?.toLocaleString() || '0'}
                                            </p>
                                        </div>

                                        <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-xl bg-card border border-border text-muted group-hover:text-primary group-hover:border-primary/30 transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>

                                    {/* Ambient effect */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
