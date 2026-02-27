'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Package,
  RefreshCw,
  ShoppingBag,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function CustomerOrdersPage() {
  const { token } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

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
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Processing')
      return ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery'].includes(order.status);
    if (activeTab === 'Completed')
      return ['delivered', 'completed'].includes(order.status);
    if (activeTab === 'Cancelled')
      return ['cancelled', 'rejected'].includes(order.status);
    return true;
  });

  return (
    <div className="flex flex-col gap-8">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>

          <div>
            <h1 className="text-3xl font-semibold text-gray-800">
              My Orders
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              View and track your purchases.
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'animate-spin' : ''}
          />
          {refreshing ? 'Refreshing' : 'Refresh'}
        </button>
      </header>

      {/* TABS */}
      <div className="flex gap-6 border-b border-gray-200 overflow-x-auto">
        {['All', 'Processing', 'Completed', 'Cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition ${activeTab === tab
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-24 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-gray-300 rounded-xl bg-white">
          <Package size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-800">
            No orders found
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            {activeTab === 'All'
              ? "You haven't placed any orders yet."
              : `No ${activeTab.toLowerCase()} orders available.`}
          </p>

          {activeTab === 'All' && (
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order._id}
              className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                {/* LEFT */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                    <Package size={18} />
                  </div>

                  <div>
                    <p className="font-medium text-gray-800">
                      Order #{order.orderId?.slice(-6)}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>

                      <span className="flex items-center gap-1">
                        <Layers size={14} />
                        {order.items?.length || 0} items
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-800">
                      ₹{order.totalAmount?.toLocaleString()}
                    </p>

                    <span className="text-xs px-2 py-1 rounded-md bg-orange-50 text-orange-600">
                      {order.status}
                    </span>
                  </div>

                  <Link
                    href={`/account/orders/${order.orderId}`}
                    className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
                  >
                    View Details <ChevronRight size={16} />
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}