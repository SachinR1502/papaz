'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
    CreditCard,
    Search,
    Download,
    TrendingUp,
    ShieldCheck,
    Clock,
    User,
    Wrench,
    Truck,
    AlertCircle,
    CheckCircle2,
    MoreVertical
} from 'lucide-react';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await adminService.getAllTransactions();
            if (Array.isArray(data)) {
                setTransactions(data);
            } else if (data && typeof data === 'object' && Array.isArray((data as any).transactions)) {
                setTransactions((data as any).transactions);
            } else {
                console.warn('Unexpected API response format for transactions:', data);
                setTransactions([]);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        (t.id || t._id || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.customer?.fullName || t.customer || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                        Transactions
                    </h1>
                    <p className="text-muted text-sm md:text-base font-medium mt-2">
                        View and manage all platform financial transactions
                    </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-card border border-border/50 text-sm font-bold hover:bg-card/80 transition-all active:scale-95 w-full md:w-auto justify-center">
                    <Download size={18} /> <span>Export CSV</span>
                </button>
            </header>

            {/* Stats Summary Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 md:mb-12">
                <div className="glass-panel p-6 rounded-[24px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={48} />
                    </div>
                    <div className="text-[#34c759] mb-3"><TrendingUp size={24} /></div>
                    <div className="text-xs font-black text-muted tracking-widest uppercase mb-1">Total Volume</div>
                    <div className="text-3xl md:text-4xl font-black mt-1 tracking-tight">
                        ₹{transactions.reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString()}
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-[24px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={48} />
                    </div>
                    <div className="text-primary mb-3"><ShieldCheck size={24} /></div>
                    <div className="text-xs font-black text-muted tracking-widest uppercase mb-1">Average Txn</div>
                    <div className="text-3xl md:text-4xl font-black mt-1 tracking-tight">
                        ₹{transactions.length > 0 ? (transactions.reduce((acc, t) => acc + (t.amount || 0), 0) / transactions.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8">
                <div className="flex-1 flex items-center gap-3 px-5 py-3 md:py-4 rounded-2xl bg-white/5 border border-white/10 focus-within:bg-white/10 transition-colors">
                    <Search size={20} className="text-primary opacity-60" />
                    <input
                        type="text"
                        placeholder="Search by ID or Name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-foreground font-medium placeholder:text-muted/50 w-full"
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="glass-panel p-0 rounded-[24px] overflow-hidden border border-white/5">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="p-6 text-xs font-black text-muted tracking-widest border-b border-white/5">ID</th>
                                <th className="p-6 text-xs font-black text-muted tracking-widest border-b border-white/5">USER</th>
                                <th className="p-6 text-xs font-black text-muted tracking-widest border-b border-white/5">TYPE</th>
                                <th className="p-6 text-xs font-black text-muted tracking-widest border-b border-white/5">AMOUNT</th>
                                <th className="p-6 text-xs font-black text-muted tracking-widest border-b border-white/5">STATUS</th>
                                <th className="p-6 text-xs font-black text-muted tracking-widest border-b border-white/5">DATE</th>
                                <th className="p-6 text-xs font-black text-muted tracking-widest border-b border-white/5"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center p-24">
                                        <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredTransactions.length > 0 ? filteredTransactions.map((tx: any, index: number) => (
                                <tr key={tx.id || index} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <CreditCard size={18} />
                                            </div>
                                            <span className="font-extrabold text-sm text-foreground">
                                                #{(tx.id || tx._id || 'N/A').slice(-8).toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <UserCell transaction={tx} />
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-bold whitespace-nowrap">
                                            {(tx.type || 'Transaction').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className={`text-lg font-black ${tx.type === 'refund' || tx.type === 'withdrawal' ? 'text-red-500' : 'text-foreground'}`}>
                                            {tx.type === 'refund' || tx.type === 'withdrawal' ? '-' : '+'}₹{(tx.amount || 0).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <StatusPill status={tx.status} />
                                    </td>
                                    <td className="p-6">
                                        <div className="font-bold text-sm whitespace-nowrap">{new Date(tx.createdAt || Date.now()).toLocaleDateString()}</div>
                                        <div className="text-xs text-muted font-medium mt-0.5">{new Date(tx.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="p-2 rounded-lg text-muted hover:bg-white/5 hover:text-foreground transition-all">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center p-24 text-muted">
                                        <div className="flex flex-col items-center gap-4">
                                            <Search size={48} className="opacity-20" />
                                            <span>No transactions found</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}

function StatusPill({ status }: { status?: string }) {
    const s = (status || 'pending').toLowerCase();

    let color = 'text-muted';
    let bg = 'bg-white/10';
    let icon = <Clock size={12} />;

    if (s === 'completed' || s === 'success' || s === 'paid') {
        color = 'text-green-500';
        bg = 'bg-green-500/10';
        icon = <CheckCircle2 size={12} />;
    } else if (s === 'pending' || s === 'processing') {
        color = 'text-orange-500';
        bg = 'bg-orange-500/10';
        icon = <Clock size={12} />;
    } else if (s === 'failed' || s === 'cancelled' || s === 'refunded') {
        color = 'text-red-500';
        bg = 'bg-red-500/10';
        icon = <AlertCircle size={12} />;
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${bg} ${color}`}>
            {icon} <span>{s}</span>
        </div>
    );
}

function UserCell({ transaction }: { transaction: any }) {
    let name = 'Unknown User';
    let sub = 'External';
    let icon = <User size={16} />;
    let typeClass = 'text-primary border-primary/20 bg-primary/10';

    if (transaction.customer) {
        name = transaction.customer.fullName || 'Customer';
        sub = 'Customer Account';
        icon = <User size={16} />;
        typeClass = 'text-blue-500 border-blue-500/20 bg-blue-500/10';
    } else if (transaction.technician) {
        name = transaction.technician.fullName || 'Technician';
        sub = 'Technician Partner';
        icon = <Wrench size={16} />;
        typeClass = 'text-green-500 border-green-500/20 bg-green-500/10';
    } else if (transaction.supplier) {
        name = transaction.supplier.storeName || transaction.supplier.fullName || 'Supplier';
        sub = 'Supplier Vendor';
        icon = <Truck size={16} />;
        typeClass = 'text-orange-500 border-orange-500/20 bg-orange-500/10';
    }

    return (
        <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${typeClass}`}>
                {icon}
            </div>
            <div>
                <div className="font-bold text-sm text-foreground whitespace-nowrap">{name}</div>
                <div className="text-[10px] uppercase font-bold text-muted tracking-wider">{sub}</div>
            </div>
        </div>
    );
}
