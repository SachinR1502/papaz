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
    Loader2,
    Activity
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function SupplierPaymentsPage() {
    const { walletBalance, transactions, orders, isLoading } = useSupplier();
    const [searchTerm, setSearchTerm] = useState('');

    const lifetimeGenerated = orders
        ?.filter(o => ['delivered', 'paid', 'completed'].includes(o.status?.toLowerCase() || ''))
        ?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    const pendingSettlement = orders
        ?.filter(o => ['pending', 'preparing', 'processing', 'shipped', 'out for delivery'].includes(o.status?.toLowerCase() || ''))
        ?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    const filteredTransactions = (transactions || []).filter(t =>
        t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.referenceId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Revenue & <span className="text-orange-500">Payouts</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track your earnings and manage bank settlements.
                    </p>
                </div>

                <button className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition shadow-lg shadow-gray-200 active:scale-95 flex items-center justify-center gap-2">
                    Request Payout <ArrowUpRight size={18} />
                </button>
            </header>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="relative group bg-gray-900 rounded-3xl p-8 text-white overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-20 blur-3xl -mr-16 -mt-16 group-hover:opacity-40 transition-opacity" />
                    <Wallet size={120} className="absolute -bottom-6 -right-6 opacity-5 rotate-12 pointer-events-none" />

                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center gap-2 mb-4 opacity-60">
                                <Wallet size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Current Balance</span>
                            </div>
                            <div className="text-4xl font-black tracking-tight text-white mb-2">
                                ₹{walletBalance.toLocaleString()}
                            </div>
                            <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Ready to withdraw</p>
                        </div>
                    </div>
                </div>

                {/* Growth Card */}
                <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Revenue</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">₹{lifetimeGenerated.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 mb-1">Settlement Cycle</p>
                            <p className="text-xs font-bold text-gray-900 uppercase">Every Monday</p>
                        </div>
                        <Activity size={18} className="text-emerald-500 opacity-40" />
                    </div>
                </div>

                {/* Pending Card */}
                <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">In Transit</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">₹{pendingSettlement.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">Awaiting clearance from active orders</p>
                        <ShieldCheck size={18} className="text-orange-500 opacity-40" />
                    </div>
                </div>
            </div>

            {/* Transaction History Section */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
                        <p className="text-xs text-gray-500 font-medium">Clear logs of all your portal payouts and adjustments.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Ref ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white border border-gray-200 py-2 pl-10 pr-4 rounded-xl text-xs font-medium w-full md:w-56 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-all">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <Loader2 size={32} className="text-orange-500 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Data...</p>
                        </div>
                    ) : (transactions || []).length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-[28px] flex items-center justify-center text-gray-200 mb-2">
                                <History size={32} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">No Transactions Found</h3>
                            <p className="text-xs text-gray-400 font-medium italic">Payments will appear here after your first fulfillment.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#F8F9FB] border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date & Info</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Reference ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Destination</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Amount</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredTransactions.map((tx: any, i: number) => (
                                        <tr key={tx.id || i} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                                        <CreditCard size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Payout Request</p>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase">{tx.date || 'Jan 12, 2024'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black text-gray-500 px-2 py-1 bg-gray-100 rounded-lg">
                                                    #{tx.referenceId || tx.id?.slice(-8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Bank Account • 4321</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-black text-gray-900">₹{tx.amount?.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
