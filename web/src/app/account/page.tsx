'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Package,
  Heart,
  MapPin,
  Settings,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

      const orders = Array.isArray(ordersRes)
        ? ordersRes
        : ordersRes?.data || [];

      setRecentOrders(orders.slice(0, 3));

      if (Array.isArray(wishlistRes)) {
        setWishlistCount(wishlistRes.length);
      } else if (Array.isArray(wishlistRes?.data)) {
        setWishlistCount(wishlistRes.data.length);
      }
    } catch (error) {
      console.error('Dashboard fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">

      {/* HEADER */}
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back,{" "}
          <span className="font-medium text-gray-800">
            {user?.profile?.fullName?.split(' ')[0] || user?.name || 'User'}
          </span>
          . Here’s a quick overview of your account.
        </p>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          icon={<ShoppingBag size={18} />}
          label="Orders"
          value={loading ? "..." : recentOrders.length.toString()}
        />

        <StatCard
          icon={<Heart size={18} />}
          label="Wishlist"
          value={loading ? "..." : wishlistCount.toString()}
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* RECENT ORDERS */}
        <section className="xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Orders
            </h2>

            <Link
              href="/account/orders"
              className="text-sm text-orange-600 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        Order #{order.orderId?.slice(-4)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ₹{order.totalAmount?.toLocaleString()}
                      </p>

                      <span
                        className={`text-xs px-2 py-1 rounded-md ${order.status === 'delivered'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-orange-50 text-orange-600'
                          }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center border border-dashed border-gray-300 rounded-xl bg-white">
              <Package size={40} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">
                No orders yet
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Start shopping to see your orders here.
              </p>

              <Link
                href="/"
                className="inline-block mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
              >
                Shop Now
              </Link>
            </div>
          )}
        </section>

        {/* QUICK LINKS */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Account Menu
          </h2>

          <div className="space-y-4">

            <QuickNavLink
              href="/account/addresses"
              icon={<MapPin size={18} />}
              title="My Addresses"
              subtitle="Manage your saved addresses"
            />

            <QuickNavLink
              href="/account/settings"
              icon={<Settings size={18} />}
              title="Settings"
              subtitle="Update profile and password"
            />

            <QuickNavLink
              href="/account/wishlist"
              icon={<Heart size={18} />}
              title="Wishlist"
              subtitle="View your saved items"
            />

          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-gray-200 bg-white hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-800 mt-1">
        {value}
      </p>
    </div>
  );
}

/* ================= QUICK NAV LINK ================= */

function QuickNavLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-5 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
        {icon}
      </div>

      <div className="flex-1">
        <p className="font-medium text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      <ChevronRight size={18} className="text-gray-400" />
    </Link>
  );
}