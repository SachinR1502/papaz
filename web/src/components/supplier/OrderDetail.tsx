'use client';

import { useRouter } from 'next/navigation';
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
    AlertCircle,
    ArrowUpRight,
    Clock,
    ShoppingBag,
    Calendar,
    Zap,
    Calculator,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { printOrderReceipt, safeString, formatCurrency } from '@/utils/printUtils';
import { OrderReceipt } from '@/components/common/OrderReceipt';

import { QuotationModal } from '@/components/supplier/QuotationModal';
import { DeliveryModal } from '@/components/supplier/DeliveryModal';

// Helper moved to printUtils

interface OrderDetailProps {
    orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
    const router = useRouter();
    const { orders, wholesaleOrders, updateOrder, sendQuotation, isLoading, profile } = useSupplier();
    const [order, setOrder] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isQuoteModalVisible, setIsQuoteModalVisible] = useState(false);
    const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);

    useEffect(() => {
        if (orderId) {
            const found = (orders || []).find(o => o.id === orderId) || (wholesaleOrders || []).find(o => o.id === orderId);
            if (found) setOrder(found);
        }
    }, [orderId, orders, wholesaleOrders]);

    if (!order && isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Order...</p>
        </div>
    );

    if (!order) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <AlertCircle className="w-12 h-12 text-gray-300" />
            <p className="text-lg font-bold text-gray-900">Order not found</p>
            <button onClick={() => router.back()} className="text-sm text-orange-600 font-bold hover:underline">Go Back</button>
        </div>
    );

    const handleStatusUpdate = async (newStatus: string, data?: any) => {
        setIsUpdating(true);
        try {
            await updateOrder(order.id, 'update_status', newStatus, data);
            setOrder({ ...order, status: newStatus, ...(data || {}) });
            setIsDeliveryModalVisible(false);
        } catch (error) { console.error(error); } finally { setIsUpdating(false); }
    };

    const handleSubmitQuote = async (items: any[], totalAmount: number) => {
        setIsUpdating(true);
        try {
            await sendQuotation(order.id, items, totalAmount, isWholesale);
            setIsQuoteModalVisible(false);
            setOrder({ ...order, status: 'quoted', items, totalAmount });
        } catch (error) { console.error(error); } finally { setIsUpdating(false); }
    };

    const s = order.status?.toLowerCase() || '';
    const isPending = ['pending', 'new', 'inquiry'].includes(s);
    const isQuoted = s === 'quoted';
    const isProcessing = ['accepted', 'confirmed', 'packed'].includes(s);
    const isShipped = ['shipped', 'out_for_delivery'].includes(s);
    const isCompleted = ['delivered', 'completed', 'paid'].includes(s);
    const isWholesale = !!order.technicianName || !!(order.technician && typeof order.technician === 'object');

    const handlePrint = () => {
        printOrderReceipt(order.id);
    };

    const photos = Array.from(new Set([
        ...(order.photos || []),
        ...(order.images || []),
        ...(order.image ? [order.image] : [])
    ])).filter(Boolean) as string[];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="print:hidden space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {isWholesale ? 'Wholesale Order' : 'Store Order'} <span className="text-orange-500">#{order.id.slice(-6).toUpperCase()}</span>
                                </h1>
                                <StatusPill status={order.status} />
                            </div>
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-3 mt-1 uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Printer size={14} /> Print
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Status Tracker */}
                        <Card title="Order Status" icon={<Zap size={16} />}>
                            <div className="relative flex justify-between items-center px-4 py-4">
                                <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-100 -translate-y-1/2" />
                                <div
                                    className="absolute top-1/2 left-10 h-0.5 bg-orange-500 -translate-y-1/2 transition-all duration-700"
                                    style={{ width: isCompleted ? 'calc(100% - 80px)' : isShipped ? '66%' : isProcessing ? '33%' : '0%' }}
                                />
                                <Step active={true} completed={!isPending && !isQuoted} icon={<ShoppingBag size={18} />} label="Received" />
                                <Step active={isQuoted || isProcessing || isShipped || isCompleted} completed={isProcessing || isShipped || isCompleted} icon={<Calculator size={18} />} label="Processing" />
                                <Step active={isShipped || isCompleted} completed={isCompleted} icon={<Truck size={18} />} label="Shipped" />
                                <Step active={isCompleted} completed={isCompleted} icon={<CheckCircle2 size={18} />} label="Delivered" />
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                {(isPending || isQuoted) && !isWholesale && (
                                    <ActionButton onClick={() => handleStatusUpdate('accepted')} disabled={isUpdating}>Accept Order</ActionButton>
                                )}
                                {isPending && (!order.supplier || order.supplier === profile?._id || order.supplier === profile?.id) && (
                                    <ActionButton onClick={() => setIsQuoteModalVisible(true)} disabled={isUpdating}>Send Quote</ActionButton>
                                )}
                                {isWholesale && isQuoted && (
                                    <ActionButton onClick={() => handleStatusUpdate('accepted')} disabled={isUpdating}>Confirm Order</ActionButton>
                                )}
                                {isProcessing && (
                                    <ActionButton onClick={() => setIsDeliveryModalVisible(true)} disabled={isUpdating}>Dispatch Now</ActionButton>
                                )}
                                {isShipped && (
                                    <button onClick={() => handleStatusUpdate('delivered')} className="bg-green-600 text-white px-6 py-2 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95">Mark Delivered</button>
                                )}
                                {isCompleted && (
                                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-100 flex items-center gap-2 text-xs font-bold">
                                        <CheckCircle2 size={14} /> This order is completed
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Order Details */}
                        <Card title="Order Details" icon={<Package size={16} />} badge={`${order.items?.length || 1} Item`}>
                            <div className="space-y-6">
                                <div className="divide-y divide-gray-50 -mx-4">
                                    {order.items?.map((item: any, i: number) => (
                                        <div key={i} className="flex gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                                <img src={item.image || '/placeholder.png'} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">SKU: {item.sku || 'N/A'}</span>
                                                    <span className="text-gray-200">•</span>
                                                    <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tight">{item.brand || 'Premium'}</span>
                                                </div>
                                                <div className="flex items-center gap-6 mt-2">
                                                    <div className="text-xs"><span className="text-gray-400">Price:</span> <span className="font-bold">{formatCurrency(item.price)}</span></div>
                                                    <div className="text-xs"><span className="text-gray-400">Qty:</span> <span className="font-bold">x{item.quantity}</span></div>
                                                    <div className="text-xs ml-auto"><span className="text-gray-400">Total:</span> <span className="font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    )) || (
                                            <div className="p-4 flex justify-between items-center">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">{order.partName}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Single Item Request</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount || order.amount || 0)}</p>
                                                    <p className="text-[10px] text-orange-600 font-bold uppercase">Quantity: {order.quantity || 1}</p>
                                                </div>
                                            </div>
                                        )}
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                                    <div className="w-full sm:w-80 space-y-3 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <span>Subtotal</span>
                                            <span className="text-slate-700">{formatCurrency((order.totalAmount || order.amount || 0) * 0.95)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <span>Tax (5%)</span>
                                            <span className="text-slate-700">{formatCurrency((order.totalAmount || order.amount || 0) * 0.05)}</span>
                                        </div>
                                        <div className="h-px bg-gray-100 my-2" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-900">Grand Total</span>
                                            <span className="text-2xl font-black text-orange-600 tracking-tighter italic">{formatCurrency(order.totalAmount || order.amount || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Media */}
                        {(photos.length > 0 || order.voiceNote) && (
                            <Card title="Attachments" icon={<Zap size={16} />}>
                                <div className="space-y-6">
                                    {photos.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {photos.map((p, i) => (
                                                <img key={i} src={p} className="w-20 h-20 rounded-lg border border-gray-200 object-cover hover:shadow-md cursor-pointer transition-all" />
                                            ))}
                                        </div>
                                    )}
                                    {order.voiceNote && (
                                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg flex flex-col gap-2">
                                            <p className="text-[10px] uppercase font-bold text-gray-500">Voice Instruction</p>
                                            <audio controls className="w-full h-8"><source src={order.voiceNote} /></audio>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* User Card */}
                        <Card title={isWholesale ? 'Technician' : 'Customer'} icon={<User size={16} />}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xl uppercase italic">
                                    {safeString((order.technicianName || order.customer?.fullName)?.[0] || 'C')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">
                                        {safeString(isWholesale ? (order.technicianName || order.technician?.garageName || 'Pro Tech') : (order.customer?.fullName || 'Client'))}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{isWholesale ? 'Garage Partner' : 'Registered Customer'}</p>
                                </div>
                            </div>
                            <a href={`tel:${order.customer?.phoneNumber || order.technician?.phoneNumber}`} className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-orange-500/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Phone size={14} className="text-gray-400 group-hover:text-orange-500" />
                                    <span className="text-sm font-bold text-gray-700">{order.customer?.phoneNumber || order.technician?.phoneNumber || 'N/A'}</span>
                                </div>
                                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-orange-500" />
                            </a>
                        </Card>

                        {/* Shipping Card */}
                        <Card title="Shipping Address" icon={<MapPin size={16} />}>
                            <p className="text-sm font-medium text-gray-600 leading-relaxed italic uppercase">
                                {safeString(order.deliveryDetails?.address || order.location || 'Express Delivery Hub')}
                            </p>
                            {order.deliveryDetails && (
                                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-gray-400">Carrier</p>
                                        <p className="text-xs font-bold text-gray-900">{safeString(order.deliveryDetails.courierName || order.deliveryDetails.driverName) || 'System'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-gray-400">Tracking</p>
                                        <p className="text-xs font-bold text-gray-900 truncate">{safeString(order.deliveryDetails.trackingId || order.deliveryDetails.vehicleNumber) || 'Active'}</p>
                                    </div>
                                </div>
                            )}
                        </Card>

                        <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/50 flex items-start gap-3">
                            <AlertCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-orange-600 uppercase leading-normal">Fast-track processing is active for this order. Ensure stock availability before accepting.</p>
                        </div>
                    </div>
                </div>

                <QuotationModal isOpen={isQuoteModalVisible} onClose={() => setIsQuoteModalVisible(false)} onSubmit={handleSubmitQuote} initialItems={order.items || []} order={order} isLoading={isUpdating} />
                <DeliveryModal isOpen={isDeliveryModalVisible} onClose={() => setIsDeliveryModalVisible(false)} onSubmit={(data) => handleStatusUpdate('out_for_delivery', { deliveryDetails: data })} initialData={order.deliveryDetails} isLoading={isUpdating} />

            </div>

            <div className="hidden print:block">
                <OrderReceipt order={order} />
            </div>
        </div>
    );
}

function Card({ title, icon, children, badge, className }: { title: string, icon: any, children: React.ReactNode, badge?: string, className?: string }) {
    return (
        <div className={cn("bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm", className)}>
            <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="text-orange-500">{icon}</div>
                    <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">{title}</h3>
                </div>
                {badge && <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">{badge}</span>}
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

function Step({ active, completed, icon, label }: { active: boolean, completed: boolean, icon: any, label: string }) {
    return (
        <div className="flex flex-col items-center gap-2 relative z-10">
            <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500",
                completed ? "bg-green-600 text-white shadow-md shadow-green-100" :
                    active ? "bg-orange-500 text-white shadow-lg shadow-orange-100 ring-4 ring-orange-500/10" : "bg-white border border-gray-100 text-gray-300"
            )}>
                {icon}
            </div>
            <span className={cn("text-[9px] font-bold uppercase tracking-tight", (active || completed) ? "text-gray-900" : "text-gray-300")}>{label}</span>
        </div>
    );
}

function ActionButton({ children, onClick, disabled }: any) {
    return (
        <button onClick={onClick} disabled={disabled} className="bg-orange-500 text-white px-6 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-orange-600 transition-all disabled:opacity-50">
            {children}
        </button>
    );
}

function StatusPill({ status }: { status: string }) {
    const s = (status || '').toLowerCase();
    const colors = s === 'delivered' || s === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
        s === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100';
    return <span className={cn("px-2 py-0.5 text-[9px] rounded-full font-bold uppercase tracking-tighter border", colors)}>{s.replace(/_/g, ' ')}</span>;
}

