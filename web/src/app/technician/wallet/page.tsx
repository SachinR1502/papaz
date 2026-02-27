'use client';

import React from 'react';
import { useTechnician } from '@/context/TechnicianContext';
import {
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    ShieldCheck,
    History,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TechnicianWalletPage() {
    const { walletBalance, transactions, isLoading, isApproved } = useTechnician();

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse p-6">
                <div className="h-20 bg-gray-100 rounded-2xl w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in max-w-7xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Earnings & Settlements</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your professional revenue and payouts</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Available Credits</p>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl font-bold text-gray-900 tracking-tight">₹{walletBalance.toLocaleString()}</span>
                        <div className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp size={12} />
                            +12%
                        </div>
                    </div>
                    <button
                        disabled={!isApproved}
                        className={cn(
                            "w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                            isApproved
                                ? "bg-orange-500 text-white hover:bg-orange-600"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                    >
                        {isApproved ? "Initiate Settlement" : "Verification Required"}
                    </button>
                    {!isApproved && (
                        <p className="text-[10px] text-orange-600 mt-2 font-medium">Payouts are locked during verification</p>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Gross Life Earnings</p>
                    <div className="mb-8">
                        <span className="text-4xl font-bold text-gray-900 tracking-tight">₹{(walletBalance).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Weekly</p>
                            <p className="text-sm font-bold text-gray-900">₹12,400</p>
                        </div>
                        <div className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Monthly</p>
                            <p className="text-sm font-bold text-gray-900">₹84,200</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm relative">
                    <ShieldCheck size={24} className="text-orange-500 absolute top-6 right-6" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Payout Destination</p>
                    <div className="space-y-1 mb-8">
                        <p className="text-lg font-bold text-gray-900">HDFC Bank Limited</p>
                        <p className="text-xs font-medium text-gray-500 tracking-wider">A/C: **** **** 8892</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-2 rounded-xl border border-orange-100">
                        <CheckCircle2 size={14} />
                        Auto-Withdraw Active
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <History size={18} className="text-gray-400" />
                    <h3 className="text-xl font-bold text-gray-900">Transaction Logs</h3>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse" />)
                    ) : transactions.length > 0 ? (
                        transactions.map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        tx.type === 'earnings' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                    )}>
                                        {tx.type === 'earnings' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{tx.description}</p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                            <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>#{tx._id?.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn(
                                        "text-base font-bold",
                                        tx.type === 'earnings' ? "text-green-600" : "text-gray-900"
                                    )}>
                                        {tx.type === 'earnings' ? '+' : '-'} ₹{tx.amount?.toLocaleString()}
                                    </p>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Settled</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center">
                            <Wallet size={40} className="text-gray-200 mb-4" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">No Transaction Activity</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
