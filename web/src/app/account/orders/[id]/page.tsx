'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Clock, CreditCard, Package, Phone, MapPin, ListOrdered, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OrderDetailsPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = params.id as string;

  useEffect(() => {
    if (token && orderId) {
      fetchOrderDetails();
    }
  }, [token, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted font-black uppercase tracking-[0.3em] text-[10px]">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
        <div className="w-20 h-20 bg-card/20 rounded-3xl flex items-center justify-center mb-4 text-muted/30">
          <Package size={40} />
        </div>
        <h2 className="text-3xl font-black text-foreground italic uppercase">Order Not Found</h2>
        <button
          onClick={() => router.push('/account/orders')}
          className="px-10 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 italic"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {/* BACK BUTTON */}
      <header>
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-3 px-5 py-2.5 rounded-xl border border-border bg-card/20 text-muted hover:text-primary hover:border-primary/30 transition-all font-black text-[10px] uppercase tracking-widest italic"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Orders
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10">

        {/* LEFT COLUMN: ORDER ITEMS */}
        <div className="flex flex-col gap-8">
          {/* ORDER INFO CARD */}
          <div className="p-8 md:p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary opacity-[0.03] blur-[100px] -mr-40 -mt-40 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-primary italic">Detailed Information</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-foreground italic uppercase tracking-tighter leading-none mb-4">
                  Order <span className="text-primary">#{order.orderId?.slice(-8).toUpperCase()}</span>
                </h1>
                <p className="flex items-center gap-2 text-sm text-muted font-bold opacity-60">
                  <Clock size={16} className="text-primary/70" />
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-3">
                <div className="px-6 py-2.5 bg-primary/10 rounded-full text-primary border border-primary/20 font-black text-xs uppercase tracking-widest italic shadow-xl shadow-primary/5">
                  {order.status.replace('_', ' ')}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted font-black uppercase tracking-widest opacity-60">
                  <CreditCard size={14} className="text-primary/70" />
                  {order.paymentStatus} via {order.paymentMethod}
                </div>
              </div>
            </div>
          </div>

          {/* ITEMS LIST */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2">
              <ListOrdered size={20} className="text-primary" />
              <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">
                Items ({order.items?.length || 0})
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="group flex items-center gap-6 p-6 rounded-[28px] border border-border bg-card/20 active:scale-[0.99] transition-all duration-300 hover:bg-card/40 hover:border-primary/20">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-card/40 rounded-2xl overflow-hidden shrink-0 border border-border group-hover:scale-105 group-hover:rotate-2 transition-all duration-500">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted/30">
                        <Package size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-lg md:text-xl text-foreground italic uppercase tracking-tight truncate group-hover:text-primary transition-colors duration-300">
                      {item.name}
                    </h4>
                    <div className="mt-2 flex items-center gap-4 text-[10px] text-muted font-black uppercase tracking-widest opacity-60">
                      <span>Qty: {item.quantity}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>₹{item.price?.toLocaleString()} / unit</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-xl text-foreground tracking-tighter">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SHIPPING & SUMMARY */}
        <div className="flex flex-col gap-10">

          {/* SHIPPING ADDRESS */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2">
              <MapPin size={20} className="text-primary" />
              <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">
                Shipping Address
              </h3>
            </div>

            <div className="p-8 rounded-[32px] border border-border bg-card/20 backdrop-blur-3xl relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
              {order.deliveryAddress ? (
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-primary/10 rounded-lg text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                      {order.deliveryAddress.label || 'Default'}
                    </div>
                  </div>
                  <p className="text-lg font-black text-foreground italic uppercase tracking-tight leading-snug">
                    {order.deliveryAddress.address || [order.deliveryAddress.addressLine1, order.deliveryAddress.addressLine2, order.deliveryAddress.city].filter(Boolean).join(', ')}
                  </p>
                  <div className="text-[11px] text-muted font-black uppercase tracking-[0.2em] opacity-60 space-y-1">
                    <p>{order.deliveryAddress.city}{order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''}</p>
                    <p>Postal Code: {order.deliveryAddress.zipCode}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-sm font-bold text-foreground bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <Phone size={16} className="text-primary" />
                    <span>+91 {order.deliveryAddress.phone}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted font-bold italic uppercase tracking-widest text-xs opacity-40">
                  Local Pickup Only
                </div>
              )}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2">
              <Receipt size={20} className="text-primary" />
              <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">
                Order Summary
              </h3>
            </div>

            <div className="p-10 rounded-[40px] border border-border bg-card/30 backdrop-blur-3xl relative overflow-hidden shadow-2xl shadow-black/20">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />

              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-muted opacity-60">
                  <span>Subtotal</span>
                  <span className="text-foreground italic">₹{order.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-muted opacity-60">
                  <span>Delivery Fee</span>
                  <span className="text-green-500 italic uppercase">
                    {order.deliveryFee === 0 || !order.deliveryFee ? 'Free' : `₹${order.deliveryFee}`}
                  </span>
                </div>
                <div className="h-px bg-border/50 my-2" />
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Total Amount</p>
                    <p className="text-muted text-[8px] font-black uppercase tracking-[0.1em] opacity-40 italic">Incl. all taxes</p>
                  </div>
                  <p className="text-5xl font-black text-foreground tracking-tighter italic leading-none">
                    ₹{order.totalAmount?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
