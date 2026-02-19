'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useState } from 'react';
import {
    Search,
    ChevronRight,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    LayoutGrid,
    MoreVertical,
    Filter,
    ArrowUpRight,
    ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { QuotationModal } from '@/components/supplier/QuotationModal';

const ORDER_TABS = [
    { label: 'All Orders', value: 'All', icon: <LayoutGrid size={18} /> },
    { label: 'New Requests', value: 'New', icon: <Package size={18} /> },
    { label: 'On Process', value: 'Accepted', icon: <Clock size={18} /> },
    { label: 'On the Way', value: 'Shipped', icon: <Truck size={18} /> },
    { label: 'Completed', value: 'Delivered', icon: <CheckCircle2 size={18} /> },
    { label: 'Cancelled', value: 'Cancelled', icon: <XCircle size={18} /> }
];

// Defensive Rendering helper
const safeString = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
        if (val.lat !== undefined && val.lng !== undefined) {
            return `GPS: ${Number(val.lat).toFixed(4)}, ${Number(val.lng).toFixed(4)}`;
        }
        if (val.name) return String(val.name);
        return 'N/A';
    }
    return String(val);
};

export default function SupplierOrdersPage() {
    const { orders, wholesaleOrders, isLoading, sendQuotation } = useSupplier();
    const [selectedType, setSelectedType] = useState<'all' | 'standard' | 'wholesale'>('all');
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Quotation Modal State
    const [isQuoteModalVisible, setIsQuoteModalVisible] = useState(false);
    const [quoteOrder, setQuoteOrder] = useState<any>(null);
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

    const getUniqueData = () => {
        const raw = selectedType === 'all'
            ? [...(orders || []), ...(wholesaleOrders || [])]
            : selectedType === 'standard' ? (orders || []) : (wholesaleOrders || []);

        // Deduplicate by ID, ensuring no duplicate keys in the list
        // Using a Map keeps the last occurrence of an ID, effectively merging duplicates
        const uniqueMap = new Map();
        raw.forEach(item => {
            if (item && item.id) {
                uniqueMap.set(item.id, item);
            }
        });
        return Array.from(uniqueMap.values());
    };

    const currentData = getUniqueData();

    const filteredOrders = (currentData || []).filter(o => {
        const s = o.status?.toLowerCase() || '';
        const t = activeTab.toLowerCase();

        let matchesTab = t === 'all';
        if (t === 'new') matchesTab = s === 'new' || s === 'pending' || s === 'quoted' || s === 'inquiry';
        else if (t === 'accepted') matchesTab = s === 'accepted' || s === 'confirmed' || s === 'packed';
        else if (t === 'shipped') matchesTab = s === 'shipped' || s === 'out_for_delivery';
        else if (t === 'delivered') matchesTab = s === 'delivered' || s === 'completed';
        else if (t === 'cancelled') matchesTab = s === 'cancelled' || s === 'rejected';

        const matchesSearch = searchTerm === '' ||
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (safeString(o.partName).toLowerCase()).includes(searchTerm.toLowerCase()) ||
            (safeString(o.technicianName).toLowerCase()).includes(searchTerm.toLowerCase());

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
        } catch (error) {
            console.error("Failed to send quote", error);
        } finally {
            setIsSubmittingQuote(false);
        }
    };

    return (
        <div className="flex flex-col gap-10 md:gap-14 animate-fade-in pb-20">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 lg:mb-6">
                        <ShoppingBag size={10} className="text-primary fill-primary" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary">Sales Center</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <h1 className="text-4xl lg:text-6xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                            Incoming <span className="text-primary">Orders</span>
                        </h1>
                        <div className="flex p-1 bg-card/40 border border-border rounded-2xl gap-1">
                            <button onClick={() => setSelectedType('all')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic", selectedType === 'all' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:text-foreground")}>All</button>
                            <button onClick={() => setSelectedType('standard')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic", selectedType === 'standard' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:text-foreground")}>Direct</button>
                            <button onClick={() => setSelectedType('wholesale')} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic", selectedType === 'wholesale' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:text-foreground")}>Wholesale</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filter Tooling */}
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
                    <div className="relative group flex-1">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            type="text"
                            placeholder={selectedType === 'standard' ? "Find an order by ID or part name..." : "Search by Technician or Garage Name..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-card/20 border border-border group-focus-within:border-primary/50 group-focus-within:bg-card/40 rounded-[28px] py-6 pl-16 pr-8 text-lg font-bold outline-none transition-all placeholder:text-muted/40 backdrop-blur-xl"
                        />
                    </div>
                    <button className="flex items-center gap-3 px-8 py-5 bg-card/40 border border-border rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-card/60 transition-all active:scale-95 italic text-muted">
                        <Filter size={18} /> Filters
                    </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {ORDER_TABS.map(tab => (
                        <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={cn("flex items-center gap-3 px-6 py-4 rounded-full border transition-all duration-300 whitespace-nowrap active:scale-95", activeTab === tab.value ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" : "bg-card/20 border-border text-muted hover:bg-card/40")}>
                            {tab.icon} <span className="text-[10px] font-black uppercase tracking-widest italic">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Data List */}
            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="py-32 flex flex-col items-center gap-6 animate-pulse">
                        <Clock size={32} className="text-primary animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Updating Order List</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredOrders.map((order: any) => (
                            <Link key={order.id} href={`/supplier/orders/${order.id}`} className="group relative flex flex-col md:flex-row items-center justify-between p-6 md:p-8 rounded-[36px] border border-border bg-card/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/40 overflow-hidden">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl flex flex-col items-center justify-center font-black text-primary shrink-0 border border-primary/10 group-hover:rotate-3 transition-transform">
                                        <span className="text-[10px] uppercase opacity-40 mb-1">
                                            {order.status === 'quoted' || order.status === 'inquiry' ? 'QTN' : order.isWholesale ? 'WHLS' : 'ORD'}
                                        </span>
                                        <span className="text-lg italic">#{order.id.slice(-4).toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                            <h4 className="text-xl font-black text-foreground italic uppercase tracking-tight group-hover:text-primary transition-colors leading-none">
                                                {safeString(order.isWholesale ? (order.technicianName || 'Master Tech') : (order.partName || (order.items?.[0]?.name) || 'Multi-part Order'))}
                                            </h4>
                                            <StatusPill status={order.status} />
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-[10px] text-muted font-black uppercase tracking-widest opacity-60">
                                            <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><Package size={12} /> {order.items?.length || 1} Item(s)</span>
                                            {(order.location) && <span className="flex items-center gap-1.5"><ArrowUpRight size={12} /> {safeString(order.location)}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto mt-8 md:mt-0 pt-6 md:pt-0 border-t md:border-0 border-border/50">
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted opacity-40 mb-1">Order Total</p>
                                        <p className="text-2xl font-black text-foreground tracking-tighter italic leading-none">₹{(order.totalAmount || order.amount || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {(order.status === 'inquiry' || order.status === 'pending') && (
                                            <button onClick={(e) => handleQuoteOpen(e, order)} className="hidden lg:flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all italic">Send Quote</button>
                                        )}
                                        <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-card border border-border text-muted group-hover:text-primary transition-all">
                                            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-24 rounded-[40px] border border-border border-dashed bg-card/5 text-center flex flex-col items-center gap-6">
                        <ShoppingBag size={48} className="text-muted/30" />
                        <h3 className="text-2xl font-black text-foreground italic uppercase">No Orders Found</h3>
                        <button onClick={() => { setSearchTerm(''); setActiveTab('All'); }} className="px-8 py-4 bg-card/40 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest italic">Reset Filters</button>
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
    const isNew = s === 'new' || s === 'pending';
    const isSuccess = s === 'delivered' || s === 'paid' || s === 'completed';
    const isWarn = s.includes('delivery') || s.includes('preparing') || s.includes('processing') || s.includes('shipped');
    const isError = s === 'cancelled' || s === 'failed' || s === 'rejected';

    let config = { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' };
    if (isNew) config = { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
    if (isSuccess) config = { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' };
    if (isWarn) config = { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
    if (isError) config = { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };

    return (
        <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm", config.bg, config.text, config.border)}>
            {s.replace('_', ' ')}
        </span>
    );
}
