'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useState } from 'react';
import {
    Search,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    LayoutGrid,
    Filter,
    ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { QuotationModal } from '@/components/supplier/QuotationModal';

const ORDER_TABS = [
    { label: 'All Orders', value: 'All', icon: <LayoutGrid size={16} /> },
    { label: 'New', value: 'New', icon: <Package size={16} /> },
    { label: 'Processing', value: 'Accepted', icon: <Clock size={16} /> },
    { label: 'Shipped', value: 'Shipped', icon: <Truck size={16} /> },
    { label: 'Completed', value: 'Delivered', icon: <CheckCircle2 size={16} /> },
    { label: 'Cancelled', value: 'Cancelled', icon: <XCircle size={16} /> }
];

const safeString = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
        if (val.name) return String(val.name);
        return 'N/A';
    }
    return String(val);
};

export default function SupplierOrdersPage() {
    const { orders, wholesaleOrders, isLoading, sendQuotation, profile } = useSupplier();
    const [selectedType, setSelectedType] = useState<'all' | 'standard' | 'wholesale'>('all');
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isQuoteModalVisible, setIsQuoteModalVisible] = useState(false);
    const [quoteOrder, setQuoteOrder] = useState<any>(null);
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

    const raw = selectedType === 'all'
        ? [...(orders || []), ...(wholesaleOrders || [])]
        : selectedType === 'standard' ? orders || [] : wholesaleOrders || [];

    const uniqueMap = new Map();
    raw.forEach(item => {
        if (item?.id) uniqueMap.set(item.id, item);
    });

    const currentData = Array.from(uniqueMap.values());

    const filteredOrders = currentData.filter(o => {
        const s = o.status?.toLowerCase() || '';
        const t = activeTab.toLowerCase();
        let matchesTab = t === 'all';
        if (t === 'new') matchesTab = s === 'new' || s === 'pending' || s === 'inquiry';
        else if (t === 'accepted') matchesTab = s === 'accepted' || s === 'confirmed';
        else if (t === 'shipped') matchesTab = s === 'shipped' || s === 'out_for_delivery';
        else if (t === 'delivered') matchesTab = s === 'delivered' || s === 'completed';
        else if (t === 'cancelled') matchesTab = s === 'cancelled' || s === 'rejected';

        const matchesSearch = searchTerm === '' ||
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            safeString(o.partName).toLowerCase().includes(searchTerm.toLowerCase()) ||
            safeString(o.technicianName).toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleQuoteOpen = (e: React.MouseEvent, order: any) => {
        e.preventDefault();
        e.stopPropagation();
        setQuoteOrder(order);
        setIsQuoteModalVisible(true);
    };

    const handleSubmitQuote = async (items: any[], totalAmount: number) => {
        if (!quoteOrder) return;
        setIsSubmittingQuote(true);
        try {
            await sendQuotation(quoteOrder.id, items, totalAmount, quoteOrder.isWholesale);
            setIsQuoteModalVisible(false);
            setQuoteOrder(null);
        } finally {
            setIsSubmittingQuote(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* HEADER */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Incoming <span className="text-orange-500">Orders</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage direct and wholesale requests.
                    </p>
                </div>

                <div className="w-full sm:w-auto">
                    <div className="relative flex w-full sm:w-auto bg-gray-100 border border-gray-200 rounded-xl p-1">
                        {/* Animated Active Background */}
                        <div
                            className={cn(
                                "absolute top-1 bottom-1 rounded-lg bg-orange-500 shadow-sm transition-all duration-300 ease-in-out",
                                selectedType === 'all' && "left-1 w-[calc(33.333%-4px)]",
                                selectedType === 'standard' && "left-[calc(33.333%+2px)] w-[calc(33.333%-4px)]",
                                selectedType === 'wholesale' && "left-[calc(66.666%+3px)] w-[calc(33.333%-4px)]"
                            )}
                        />
                        {(['all', 'standard', 'wholesale'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={cn(
                                    "relative z-10 flex-1 text-center px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300",
                                    selectedType === type ? "text-white" : "text-gray-600 hover:text-gray-900"
                                )}
                            >
                                {type === 'all' ? 'All Orders' : type === 'standard' ? 'Direct' : 'Wholesale'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* SEARCH + TABS */}
            <div className="flex flex-col gap-6">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                    />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                    {ORDER_TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition",
                                activeTab === tab.value ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ORDER LIST */}
            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <Clock size={28} className="animate-spin text-orange-500" />
                    </div>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <Link
                            key={order.id}
                            href={`/supplier/orders/${order.id}`}
                            className="flex flex-col md:flex-row justify-between gap-6 p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition"
                        >
                            <div className="flex gap-4">
                                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-semibold text-sm">
                                    #{order.id.slice(-4).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                                            {safeString(order.isWholesale ? order.technicianName : order.partName)}
                                        </h4>
                                        <StatusPill status={order.status} />
                                    </div>
                                    <div className="text-[11px] text-gray-500 mt-2 flex flex-wrap gap-4 font-medium uppercase tracking-wider">
                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        <span>{order.items?.length || 1} item(s)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</p>
                                    <p className="font-bold text-gray-900">₹{(order.totalAmount || order.amount || 0).toLocaleString()}</p>
                                </div>
                                {(order.status === 'inquiry' || order.status === 'pending') &&
                                    (!order.supplier || order.supplier === profile?._id || order.supplier === profile?.id) && (
                                        <button
                                            onClick={e => handleQuoteOpen(e, order)}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition"
                                        >
                                            Send Quote
                                        </button>
                                    )}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-20 text-center text-gray-500">
                        No orders found.
                    </div>
                )}
            </div>

            <QuotationModal
                isOpen={isQuoteModalVisible}
                onClose={() => setIsQuoteModalVisible(false)}
                onSubmit={handleSubmitQuote}
                initialItems={quoteOrder?.items || []}
                order={quoteOrder}
                isLoading={isSubmittingQuote}
            />
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const s = status?.toLowerCase() || '';
    const map: any = {
        new: "bg-blue-100 text-blue-700",
        pending: "bg-blue-100 text-blue-700",
        shipped: "bg-amber-100 text-amber-700",
        delivered: "bg-green-100 text-green-700",
        completed: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
        rejected: "bg-red-100 text-red-700"
    };

    return (
        <span className={cn(
            "px-3 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider",
            map[s] || "bg-gray-100 text-gray-600"
        )}>
            {s.replace('_', ' ')}
        </span>
    );
}