'use client';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import {
  Package,
  Heart,
  MapPin,
  Settings as SettingsIcon,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { customerService } from '@/services/customerService';

export default function AccountDashboard() {
  const { user, token } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, wishlistRes] = await Promise.all([
        customerService.getOrders(),
        customerService.getWishlist()
      ]);

      // Handle orders
      const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes.data || []);
      setRecentOrders(orders.slice(0, 2));

      // Handle wishlist count
      if (Array.isArray(wishlistRes)) {
        setWishlistCount(wishlistRes.length);
      } else if (wishlistRes?.data && Array.isArray(wishlistRes.data)) {
        setWishlistCount(wishlistRes.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-10 md:gap-14">

      {/* HEADER */}
      <header className="text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 lg:mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="text-[10px] uppercase font-black tracking-widest text-primary">Secure Session</span>
        </div>
        <h1 className="text-4xl lg:text-6xl font-black m-0 tracking-tighter text-foreground italic uppercase">
          My <span className="text-primary">Dashboard</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted font-bold max-w-2xl opacity-80 leading-relaxed">
          Welcome back, <span className="text-foreground">{user?.profile?.fullName?.split(' ')[0] || user?.name || 'User'}</span>!
          Track your orders and manage your saved items.
        </p>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          icon={<ShoppingBag size={24} />}
          label="Orders"
          value={loading ? "..." : (recentOrders.length > 0 ? recentOrders.length.toString() : "0")}
          colorClass="bg-primary/10 text-primary"
          hoverClass="hover:border-primary shadow-primary/5"
        />
        <StatCard
          icon={<Heart size={24} />}
          label="Favorites"
          value={loading ? "..." : wishlistCount.toString()}
          colorClass="bg-red-500/10 text-red-500"
          hoverClass="hover:border-red-500 shadow-red-500/5"
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-10">

        {/* RECENT ORDERS */}
        <section>
          <div className="flex justify-between items-center mb-8 px-1">
            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight flex items-center gap-3">
              Recent Orders
            </h2>
            <Link href="/account/orders" className="flex items-center gap-1.5 text-primary font-black text-xs uppercase tracking-widest group bg-primary/5 px-4 py-2 rounded-xl transition-all hover:bg-primary/10">
              View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            {loading ? (
              [1, 2].map(i => (
                <div key={i} className="h-[120px] bg-card/10 rounded-[28px] animate-pulse border border-border/50" />
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 rounded-[28px] border border-border bg-card/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-card/40 group">

                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl flex items-center justify-center font-black text-primary shrink-0 border border-primary/10 group-hover:rotate-3 transition-transform duration-500">
                      #{order.orderId?.slice(-4).toUpperCase() || '??'}
                    </div>
                    <div>
                      <p className="m-0 font-black text-xl text-foreground italic uppercase leading-none mb-1.5">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
                      </p>
                      <p className="m-0 text-[10px] text-muted font-black uppercase tracking-widest opacity-60">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end mt-6 sm:mt-0 pt-6 sm:pt-0 border-t sm:border-0 border-border/50">
                    <p className="m-0 font-black text-2xl text-foreground tracking-tighter">
                      ₹{order.totalAmount?.toLocaleString()}
                    </p>
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] uppercase font-black tracking-widest mt-2 border",
                      order.status === 'delivered' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 md:p-20 text-center rounded-[40px] border border-border border-dashed bg-card/5 transition-all hover:bg-card/10">
                <div className="w-20 h-20 mx-auto bg-card/20 rounded-3xl flex items-center justify-center mb-8 text-muted/30">
                  <Package size={40} />
                </div>
                <h3 className="text-2xl font-black text-foreground italic uppercase mb-2">No orders found</h3>
                <p className="text-muted font-black uppercase tracking-widest text-[10px] mb-8 max-w-xs mx-auto opacity-60">Start shopping to see your orders here.</p>
                <Link href="/" className="inline-flex px-10 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 italic text-center">
                  Shop Now
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* QUICK NAVIGATION */}
        <section className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-3xl relative overflow-hidden flex flex-col gap-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary opacity-[0.03] blur-[100px] -mr-40 -mt-40 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="m-0 text-2xl font-black tracking-tight text-foreground italic uppercase flex items-center gap-3">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Account Menu
            </h2>
            <p className="mt-2 text-[10px] text-muted font-black uppercase tracking-[0.2em] opacity-60">Manage your profile and settings</p>
          </div>

          <div className="grid grid-cols-1 gap-4 relative z-10">

            <QuickNavLink
              href="/account/addresses"
              icon={<MapPin size={22} />}
              title="My Addresses"
              subtitle="Manage your saved locations"
              color="primary"
            />

            <QuickNavLink
              href="/account/settings"
              icon={<SettingsIcon size={22} />}
              title="Settings"
              subtitle="Profile and security preferences"
              color="indigo"
            />

            <QuickNavLink
              href="/account/wishlist"
              icon={<Heart size={22} />}
              title="Favorites"
              subtitle="Items you have saved for later"
              color="red"
            />

          </div>

          <div className="mt-auto pt-8 border-t border-border/50 relative z-10">
            <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-[0.3em] text-muted opacity-40">
              <span>Member Status</span>
              <span className="text-green-500 opacity-100 italic">Verified</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* STAT CARD */
function StatCard({ icon, label, value, colorClass, hoverClass }: { icon: React.ReactNode, label: string, value: string, colorClass: string, hoverClass: string }) {
  return (
    <div className={`p-5 md:p-8 rounded-[28px] md:rounded-[36px] border border-border bg-card/10 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group ${hoverClass}`}>
      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-8 shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg ${colorClass}`}>
        {icon}
      </div>
      <p className="m-0 text-[8px] md:text-[10px] text-muted uppercase font-black tracking-[0.2em] md:tracking-[0.3em] opacity-60">{label}</p>
      <p className="mt-1 md:mt-2 mb-0 text-3xl md:text-5xl font-black text-foreground tracking-tighter italic">{value}</p>
    </div>
  );
}

/* QUICK NAV LINK */
function QuickNavLink({ href, icon, title, subtitle, color }: { href: string, icon: React.ReactNode, title: string, subtitle: string, color: 'primary' | 'indigo' | 'red' }) {
  const colorStyles = {
    primary: "bg-primary/10 text-primary hover:border-primary/50",
    indigo: "bg-indigo-500/10 text-indigo-500 hover:border-indigo-500/50",
    red: "bg-red-500/10 text-red-500 hover:border-red-500/50"
  };

  return (
    <Link href={href} className={cn(
      "group flex items-center gap-6 p-6 rounded-[24px] bg-card/30 border border-border transition-all duration-500 hover:scale-[1.02] hover:bg-card/50 shadow-sm",
      colorStyles[color].split(' ').pop()
    )}>
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110",
        colorStyles[color].split(' ').slice(0, 2).join(' ')
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="m-0 font-black text-lg text-foreground italic uppercase leading-tight mb-1">{title}</p>
        <p className="text-[10px] text-muted font-black uppercase tracking-widest opacity-60">{subtitle}</p>
      </div>
      <ChevronRight size={20} className="text-muted opacity-20 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-primary/70" />
    </Link>
  );
}