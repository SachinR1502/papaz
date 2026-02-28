'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Package,
  Phone,
  MapPin,
  ListOrdered,
  Receipt
} from 'lucide-react';

export default function OrderDetailsPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = params.id as string;

  useEffect(() => {
    if (token && orderId) fetchOrderDetails();
  }, [token, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        toast.error('Order not found');
      }
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">
          Loading order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
        <Package size={40} className="text-gray-300" />
        <h2 className="text-2xl font-semibold">Order Not Found</h2>
        <button
          onClick={() => router.push('/account/orders')}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-16">

      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition"
      >
        <ArrowLeft size={16} />
        Back to Orders
      </button>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* ORDER HEADER */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border shadow-sm">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
              Order #{order.orderId?.slice(-8)}
            </h1>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {new Date(order.createdAt).toLocaleDateString('en-IN')}
              </span>

              <span className="flex items-center gap-1">
                <CreditCard size={14} />
                {order.paymentMethod} • {order.paymentStatus}
              </span>
            </div>

            <div className="mt-4 inline-block px-4 py-2 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
              {order.status}
            </div>
          </div>

          {/* ITEMS */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <ListOrdered size={18} />
              Items ({order.items?.length})
            </h2>

            <div className="flex flex-col gap-6">
              {order.items?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 border-b pb-4 last:border-b-0"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300">
                        <Package size={24} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-base sm:text-lg">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>

                  <div className="text-base sm:text-lg font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-8">

          {/* SHIPPING */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={18} />
              Shipping Address
            </h2>

            {order.deliveryAddress ? (
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium text-gray-800">
                  {order.deliveryAddress.fullName}
                </p>

                <p>
                  {order.deliveryAddress.addressLine1}
                  {order.deliveryAddress.addressLine2 &&
                    `, ${order.deliveryAddress.addressLine2}`}
                </p>

                <p>
                  {order.deliveryAddress.city},{' '}
                  {order.deliveryAddress.state} -{' '}
                  {order.deliveryAddress.zipCode}
                </p>

                <p className="flex items-center gap-2 mt-2">
                  <Phone size={14} />
                  +91 {order.deliveryAddress.phone}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Local Pickup Selected
              </p>
            )}
          </div>

          {/* SUMMARY */}
          <div className="bg-gray-900 p-6 sm:p-8 rounded-2xl text-white shadow-lg">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Receipt size={18} />
              Order Summary
            </h2>

            <div className="flex justify-between text-sm mb-3">
              <span>Subtotal</span>
              <span>₹{order.totalAmount}</span>
            </div>

            <div className="flex justify-between text-sm mb-3">
              <span>Delivery</span>
              <span>
                {order.deliveryFee ? `₹${order.deliveryFee}` : 'Free'}
              </span>
            </div>

            <div className="border-t border-white/20 mt-6 pt-6 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>

            <button className="w-full mt-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold transition">
              Download Invoice
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}