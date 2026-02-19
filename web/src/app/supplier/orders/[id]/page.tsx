'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSupplier } from '@/context/SupplierContext';
import {
    ChevronLeft,
    Package,
    Truck,
    CheckCircle2,
    MapPin,
    Phone,
    User,
    Printer,
    Download,
    AlertCircle,
    ArrowUpRight,
    Clock,
    ShoppingBag,
    Calendar,
    Star,
    Zap,
    Globe,
    Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { QuotationModal } from '@/components/supplier/QuotationModal';
import { DeliveryModal } from '@/components/supplier/DeliveryModal';

// Defensive Rendering Component - Prevents "Objects as React child" crashes
const safeString = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
        if (val.lat !== undefined && val.lng !== undefined) {
            return `GPS: ${Number(val.lat).toFixed(4)}, ${Number(val.lng).toFixed(4)}`;
        }
        if (val.name) return String(val.name);
        if (val.address) return String(val.address);
        return 'N/A';
    }
    return String(val);
};

export default function SupplierOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { orders, wholesaleOrders, updateOrder, sendQuotation, isLoading } = useSupplier();
    const [order, setOrder] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Modal States
    const [isQuoteModalVisible, setIsQuoteModalVisible] = useState(false);
    const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);

    useEffect(() => {
        if (id) {
            const found = (orders || []).find(o => o.id === id) || (wholesaleOrders || []).find(o => o.id === id);
            if (found) setOrder(found);
        }
    }, [id, orders, wholesaleOrders]);

    if (!order && isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary animate-spin">
                    <Clock size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted opacity-60">Loading Order Details</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-black italic uppercase">Order not found</h2>
                <button onClick={() => router.back()} className="px-6 py-2 bg-primary text-white rounded-xl">Go Back</button>
            </div>
        );
    }

    const handleStatusUpdate = async (newStatus: string, data?: any) => {
        setIsUpdating(true);
        try {
            await updateOrder(order.id, 'update_status', newStatus, data);
            setOrder({ ...order, status: newStatus, ...(data || {}) });
            setIsDeliveryModalVisible(false);
        } catch (error) {
            console.error('Failed to update status', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSubmitQuote = async (items: any[], totalAmount: number) => {
        setIsUpdating(true);
        try {
            await sendQuotation(order.id, items, totalAmount, isWholesale);
            setIsQuoteModalVisible(false);
            setOrder({ ...order, status: 'quoted', items, totalAmount });
        } catch (error) {
            console.error("Failed to send quote", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const s = order.status?.toLowerCase() || '';
    const isPending = s === 'pending' || s === 'new' || s === 'inquiry';
    const isQuoted = s === 'quoted';
    const isProcessing = s === 'accepted' || s === 'confirmed' || s === 'packed';
    const isShipped = s === 'shipped' || s === 'out_for_delivery';
    const isCompleted = s === 'delivered' || s === 'completed' || s === 'paid';

    const isWholesale = !!order.technicianName || !!(order.technician && typeof order.technician === 'object');

    const photos = Array.from(new Set([
        ...(order.photos || []),
        ...(order.images || []),
        ...(order.image ? [order.image] : [])
    ])).filter(Boolean) as string[];

    const voiceNote = order.voiceNote || order.voiceUri;

    return (
        <div className="flex flex-col gap-10 md:gap-14 animate-fade-in pb-20">
            {/* Header Actions */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all active:scale-90 shadow-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl lg:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase leading-none">
                                {isQuoted || isPending ? (isWholesale ? 'Quotation' : 'Inquiry') : 'Order'} <span className="text-primary">#{order.id.slice(-6).toUpperCase()}</span>
                            </h1>
                            <StatusPill status={order.status} />
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-muted opacity-60">
                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-foreground transition-all active:scale-95">
                        <Printer size={16} /> Print Details
                    </button>
                    <button className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 italic font-bold">
                        <Download size={16} /> Download Order
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-10">
                <div className="flex flex-col gap-10">
                    {/* Status Pipeline */}
                    <section className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-xl group relative overflow-hidden">
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight flex items-center gap-3">
                                <Zap size={18} className="text-primary fill-primary" /> Order Status
                            </h3>
                            {isUpdating && <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />}
                        </div>

                        <div className="relative flex justify-between items-center mt-6 px-4">
                            <div className="absolute top-7 left-10 right-10 h-0.5 bg-border -z-10" />
                            <div
                                className="absolute top-7 left-10 h-0.5 bg-primary -z-10 transition-all duration-1000 ease-in-out"
                                style={{ width: isCompleted ? 'calc(100% - 80px)' : isShipped ? '66%' : isProcessing ? '33%' : '0%' }}
                            />

                            <Step
                                active={true}
                                completed={!isPending && !isQuoted}
                                icon={<ShoppingBag size={20} />}
                                label={isWholesale ? "Inquiry" : "Received"}
                            />
                            <Step
                                active={isQuoted || isProcessing || isShipped || isCompleted}
                                completed={isProcessing || isShipped || isCompleted}
                                icon={<Calculator size={20} />}
                                label={isWholesale ? "Quoted" : "Processing"}
                            />
                            <Step
                                active={isShipped || isCompleted}
                                completed={isCompleted}
                                icon={<Truck size={20} />}
                                label="In Transit"
                            />
                            <Step
                                active={isCompleted}
                                completed={isCompleted}
                                icon={<CheckCircle2 size={20} />}
                                label="Delivered"
                            />
                        </div>

                        <div className="mt-14 pt-10 border-t border-border/50 flex flex-col md:flex-row items-center gap-6">
                            {(isPending || isQuoted) && !isWholesale && (
                                <button
                                    onClick={() => handleStatusUpdate('accepted')}
                                    disabled={isUpdating}
                                    className="w-full md:w-fit px-12 py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 italic font-bold"
                                >
                                    Start Processing
                                </button>
                            )}

                            {isWholesale && isPending && (
                                <button
                                    onClick={() => setIsQuoteModalVisible(true)}
                                    disabled={isUpdating}
                                    className="w-full md:w-fit px-12 py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 italic font-bold"
                                >
                                    Send Quotation
                                </button>
                            )}

                            {isWholesale && isQuoted && (
                                <button
                                    onClick={() => handleStatusUpdate('accepted')}
                                    disabled={isUpdating}
                                    className="w-full md:w-fit px-12 py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 italic font-bold"
                                >
                                    Confirm & Process Order
                                </button>
                            )}

                            {isProcessing && (
                                <button
                                    onClick={() => setIsDeliveryModalVisible(true)}
                                    disabled={isUpdating}
                                    className="w-full md:w-fit px-10 py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:brightness-110 active:scale-95 italic font-bold"
                                >
                                    Dispatch Order
                                </button>
                            )}

                            {isShipped && (
                                <button
                                    onClick={() => handleStatusUpdate('delivered')}
                                    disabled={isUpdating}
                                    className="w-full md:w-fit px-12 py-5 bg-green-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-green-500/20 transition-all hover:-translate-y-1 active:scale-95 italic font-bold"
                                >
                                    Confirm Delivery
                                </button>
                            )}

                            {isCompleted && (
                                <div className="flex items-center gap-4 p-6 bg-green-500/5 rounded-3xl border border-green-500/10 w-full animate-in zoom-in-95 duration-700">
                                    <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="m-0 text-lg font-black text-green-500 italic uppercase">Order Completed</p>
                                        <p className="m-0 text-[10px] font-black tracking-widest text-green-500/60 uppercase">Successfully delivered and closed.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Media Attachments */}
                    {(photos.length > 0 || voiceNote) && (
                        <section className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-xl">
                            <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight flex items-center gap-3 mb-10">
                                <Zap size={18} className="text-primary fill-primary" /> Photos & Voice Notes
                            </h3>
                            <div className="flex flex-col gap-10">
                                {photos.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {photos.map((p: string, i: number) => (
                                            <div key={i} className="aspect-square rounded-2xl border border-border bg-card overflow-hidden group/img relative cursor-pointer shadow-lg shadow-black/10">
                                                <img src={p} className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 group-hover/img:scale-110 transition-all duration-700" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {voiceNote && (
                                    <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 flex flex-col gap-4">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-primary italic">Customer Voice Note</p>
                                        <audio controls className="w-full filter invert hue-rotate-180 opacity-60 hover:opacity-100 transition-opacity">
                                            <source src={voiceNote} type="audio/mpeg" />
                                        </audio>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Order Items */}
                    <div className="rounded-[40px] border border-border bg-card/20 backdrop-blur-xl overflow-hidden shadow-xl">
                        <header className="px-10 py-8 border-b border-border/50 flex justify-between items-center bg-card/10">
                            <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight flex items-center gap-3">
                                <Package size={20} className="text-primary" /> Order Summary
                            </h3>
                            <span className="px-4 py-1.5 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                                {order.items?.length || 1} Item{(order.items?.length || 1) !== 1 ? 's' : ''}
                            </span>
                        </header>

                        <div className="divide-y divide-border/50">
                            {order.items?.map((item: any, i: number) => (
                                <div key={i} className="flex flex-col sm:flex-row p-10 gap-10 group hover:bg-card/30 transition-colors">
                                    <div className="relative w-32 h-32 rounded-3xl bg-card border border-border overflow-hidden shrink-0 group-hover:rotate-2 transition-transform duration-500 shadow-lg">
                                        <img
                                            src={item.image || 'https://images.unsplash.com/photo-1486262715619-67b85e0b0403?w=400&h=400&fit=crop'}
                                            alt={item.name}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="text-2xl font-black text-foreground italic uppercase tracking-tight group-hover:text-primary transition-colors leading-tight mb-2">
                                            {item.name}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-muted font-black uppercase tracking-widest opacity-60">
                                            <span>SKU: <span className="text-foreground">{item.sku || 'N/A'}</span></span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span>Brand: <span className="text-foreground italic">{item.brand || 'Premium'}</span></span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-6 mt-8">
                                            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                                                <p className="text-[9px] uppercase font-black tracking-widest text-muted opacity-40 mb-1">Price</p>
                                                <p className="text-lg font-black text-foreground italic">₹{item.price?.toLocaleString()}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                                                <p className="text-[9px] uppercase font-black tracking-widest text-muted opacity-40 mb-1">Qty</p>
                                                <p className="text-lg font-black text-primary italic">x{item.quantity}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
                                                <p className="text-[9px] uppercase font-black tracking-widest text-muted opacity-40 mb-1">Total</p>
                                                <p className="text-lg font-black text-foreground italic">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                    <div className="p-10 flex justify-between items-center group hover:bg-card/30 transition-colors">
                                        <div>
                                            <h4 className="text-2xl font-black text-foreground italic uppercase tracking-tight">{order.partName}</h4>
                                            <p className="text-xs font-black uppercase text-muted tracking-widest opacity-60 mt-1">Single Item Request</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-foreground tracking-tighter">₹{(order.totalAmount || order.amount || 0).toLocaleString()}</p>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60 italic">Qty: {order.quantity || 1}</span>
                                        </div>
                                    </div>
                                )}
                        </div>

                        <footer className="bg-card/40 border-t border-border/50 p-10 flex justify-end">
                            <div className="w-full sm:w-80 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                                    <span>Subtotal</span>
                                    <span className="text-foreground">₹{((order.totalAmount || order.amount || 0) * 0.95).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                                    <span>Tax (5%)</span>
                                    <span className="text-foreground">₹{((order.totalAmount || order.amount || 0) * 0.05).toLocaleString()}</span>
                                </div>
                                <div className="pt-6 border-t border-border flex justify-between items-center">
                                    <span className="text-xl font-black text-foreground italic uppercase tracking-tighter">Total Amount</span>
                                    <span className="text-3xl font-black text-primary italic tracking-tighter leading-none">
                                        ₹{(order.totalAmount || order.amount || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-10">
                    {/* Customer Info */}
                    <section className="p-10 rounded-[40px] border border-border bg-card/10 backdrop-blur-3xl group">
                        <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight flex items-center gap-3 mb-8">
                            <User size={20} className="text-primary" /> {isWholesale ? 'Technician Information' : 'Customer Information'}
                        </h3>
                        <div className="flex items-center gap-6 mb-8 p-6 bg-card/40 rounded-3xl border border-border group-hover:border-primary/30 transition-all">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-black text-3xl italic shadow-2xl shadow-primary/20 shrink-0">
                                {safeString((order.technicianName || order.customer?.fullName)?.[0] || 'C')}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="text-xl font-black text-foreground italic uppercase leading-none mb-2 truncate">
                                    {safeString(isWholesale ? (order.technicianName || order.technician?.garageName || 'Master Tech') : (order.customer?.fullName || 'Customer Entity'))}
                                </h4>
                                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 w-fit">
                                    <Star size={10} className="fill-amber-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest italic">{isWholesale ? 'Certified Pro' : 'Top Rated'}</span>
                                </div>
                            </div>
                        </div>
                        <a href={`tel:${order.customer?.phoneNumber || order.technician?.phoneNumber}`} className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group/link font-bold">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                                    <Phone size={18} />
                                </div>
                                <span className="text-sm font-black italic">{safeString(order.customer?.phoneNumber || order.technician?.phoneNumber) || 'Contact N/A'}</span>
                            </div>
                            <ArrowUpRight size={18} className="text-muted group-hover/link:text-primary transition-all" />
                        </a>
                    </section>

                    {/* Delivery Address */}
                    <section className="p-10 rounded-[40px] border border-border bg-card/10 backdrop-blur-3xl">
                        <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight flex items-center gap-3 mb-8">
                            <MapPin size={20} className="text-primary" /> Delivery Location
                        </h3>
                        <div className="p-8 rounded-[32px] bg-card border border-border relative overflow-hidden group mb-8">
                            <p className="text-base font-black text-foreground/80 leading-relaxed italic uppercase tracking-tight relative z-10">
                                {safeString(order.deliveryDetails?.address) || safeString(order.location) || 'Delivery Hub'}
                            </p>
                        </div>
                        {order.deliveryDetails && (
                            <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Truck size={18} /></div>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-primary italic">Delivery Info</span>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[9px] uppercase font-black tracking-widest text-muted opacity-40 mb-1">Courier</p>
                                        <p className="text-sm font-black italic truncate">{safeString(order.deliveryDetails.courierName || order.deliveryDetails.driverName) || 'System Partner'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-black tracking-widest text-muted opacity-40 mb-1">Tracking ID</p>
                                        <p className="text-xs font-black uppercase tracking-tight font-mono truncate">{safeString(order.deliveryDetails.trackingId || order.deliveryDetails.vehicleNumber) || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-10 p-6 flex items-start gap-4 bg-amber-500/5 rounded-3xl border border-amber-500/10">
                            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-1" />
                            <p className="m-0 text-[10px] font-black uppercase tracking-widest text-amber-500 italic">Fast-track fulfillment active.</p>
                        </div>
                    </section>
                </div>
            </div>

            <QuotationModal
                isOpen={isQuoteModalVisible}
                onClose={() => setIsQuoteModalVisible(false)}
                onSubmit={handleSubmitQuote}
                initialItems={order.items || []}
                order={order}
                isLoading={isUpdating}
            />
            <DeliveryModal
                isOpen={isDeliveryModalVisible}
                onClose={() => setIsDeliveryModalVisible(false)}
                onSubmit={(data) => handleStatusUpdate('out_for_delivery', { deliveryDetails: data })}
                initialData={order.deliveryDetails}
                isLoading={isUpdating}
            />
        </div>
    );
}

function Step({ active, completed, icon, label }: { active: boolean, completed: boolean, icon: React.ReactNode, label: string }) {
    return (
        <div className="flex flex-col items-center gap-5 relative z-10 transition-all duration-500">
            <div className={cn(
                "w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-700 shadow-xl",
                completed ? "bg-green-500 text-white shadow-green-500/20 rotate-[360deg]" :
                    active ? "bg-primary text-white shadow-primary/30 scale-110" : "bg-card border-2 border-border text-muted opacity-40"
            )}>
                {icon}
            </div>
            <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.15em] italic transition-colors duration-500",
                (active || completed) ? "text-foreground" : "text-muted"
            )}>
                {label}
            </span>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const s = status?.toLowerCase() || '';
    const isNew = s === 'new' || s === 'pending' || s === 'inquiry';
    const isSuccess = s === 'delivered' || s === 'paid' || s === 'completed';
    const isWarn = s.includes('delivery') || s.includes('preparing') || s.includes('processing') || s.includes('shipped') || s === 'quoted';
    const isError = s === 'cancelled' || s === 'failed' || s === 'rejected';

    let config = { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' };
    if (isNew) config = { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
    if (isSuccess) config = { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' };
    if (isWarn) config = { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
    if (isError) config = { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };

    return (
        <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border italic", config.bg, config.text, config.border)}>
            {s.replace(/_/g, ' ')}
        </span>
    );
}
