'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Package, ChevronRight, RefreshCw, ShoppingBag, Calendar, Layers, CheckCircle2, Clock, XCircle, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string, icon: any, color: string, bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  packed: { label: 'Packed', icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-primary', bg: 'bg-primary/10' },
  out_for_delivery: { label: 'Out for Delivery', icon: Truck, color: 'text-primary', bg: 'bg-primary/10' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

export default function CustomerOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Processing')
      return ['pending', 'confirmed', 'packed', 'out_for_delivery', 'shipped'].includes(order.status);
    if (activeTab === 'Completed')
      return ['delivered', 'completed'].includes(order.status);
    if (activeTab === 'Cancelled')
      return ['cancelled', 'rejected'].includes(order.status);
    return true;
  });

  return (
    <div className="flex flex-col gap-8 md:gap-12 animate-fade-in">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-primary/5">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
              My <span className="text-primary">Orders</span>
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted font-bold opacity-60">
              Track and manage your recent purchases.
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className={cn(
            "flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl border border-border bg-card/50 text-foreground font-black text-xs uppercase tracking-widest transition-all hover:bg-card hover:border-primary/30 active:scale-95",
            isRefreshing && "opacity-50 cursor-not-allowed"
          )}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={cn("transition-transform duration-700", isRefreshing && "animate-spin")} />
          <span>{isRefreshing ? 'Refreshing' : 'Refresh'}</span>
        </button>
      </header>

      {/* TABS */}
      <div className="flex gap-4 md:gap-8 border-b border-border overflow-x-auto scrollbar-hide">
        {['All', 'Processing', 'Completed', 'Cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-4 px-2 text-sm font-black uppercase tracking-[0.2em] transition-all relative border-b-2",
              activeTab === tab
                ? "text-primary border-primary"
                : "text-muted border-transparent hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      <div className="flex flex-col gap-6">
        {(loading && !isRefreshing) ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-32 md:h-40 bg-card/10 rounded-[28px] animate-pulse border border-border/50" />
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 rounded-[40px] border border-border border-dashed bg-card/5">
            <div className="w-20 h-20 bg-card/20 rounded-3xl flex items-center justify-center mb-8 text-muted/30">
              <Package size={36} />
            </div>
            <h3 className="text-2xl font-black text-foreground italic uppercase mb-2">No Orders Found</h3>
            <p className="text-muted font-black uppercase tracking-widest text-[10px] text-center max-w-xs mx-auto opacity-60">
              {activeTab === 'All'
                ? "You haven't placed any orders yet."
                : `No orders match the filter: ${activeTab}`}
            </p>
            {activeTab === 'All' && (
              <Link href="/" className="mt-10 px-10 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 italic">
                Shop Now
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {filteredOrders.map(order => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;

              return (
                <div key={order._id} className="group flex flex-col md:flex-row items-stretch md:items-center gap-6 p-6 md:p-8 rounded-[28px] border border-border bg-card/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/40">

                  {/* Order Info */}
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-card/40 rounded-2xl flex items-center justify-center text-muted group-hover:text-primary transition-colors border border-border duration-500">
                      <Package size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h4 className="font-black text-xl italic uppercase tracking-tight text-foreground leading-none">
                          Order #{order.orderId?.slice(-8).toUpperCase()}
                        </h4>
                        <div className={cn("hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", status.color, status.bg, "border-current/10")}>
                          <StatusIcon size={10} />
                          {status.label}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-muted font-black uppercase tracking-widest opacity-60">
                        <span className="flex items-center gap-2">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2">
                          <Layers size={12} />
                          {order.items?.length || 0} Items
                        </span>
                        <div className={cn("sm:hidden flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border", status.color, status.bg, "border-current/10")}>
                          {status.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action & Total */}
                  <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-4 pt-6 md:pt-0 border-t md:border-0 border-border/50">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-muted font-black uppercase tracking-widest opacity-40 leading-none mb-1 md:hidden">Total</p>
                      <p className="text-2xl font-black text-foreground tracking-tighter">
                        ₹{order.totalAmount?.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/account/orders/${order.orderId}`}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95 italic"
                    >
                      View Details
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}