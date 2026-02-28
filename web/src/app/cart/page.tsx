'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import {
    Trash2,
    Minus,
    Plus,
    ShieldCheck,
    ArrowRight,
    Tag
} from 'lucide-react';

export default function CartPage() {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        totalPrice,
        totalItems
    } = useCart();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4">

                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
                            Shopping Cart
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Review your items before checkout
                        </p>
                    </div>

                    {cart.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
                            <div className="text-5xl mb-4">🛒</div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Your cart is empty
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Start shopping to add products to your cart.
                            </p>
                            <Link href="/">
                                <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition">
                                    Start Shopping
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

                            {/* Cart Items */}
                            <div className="space-y-5">
                                {cart.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-5"
                                    >
                                        {/* Image */}
                                        <div
                                            className="w-full sm:w-28 h-28 rounded-lg bg-cover bg-center border border-gray-200 shrink-0"
                                            style={{ backgroundImage: `url(${item.image})` }}
                                        />

                                        {/* Info */}
                                        <div className="flex-1 flex flex-col justify-between">

                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-base font-medium text-gray-900">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        SKU: {item.id}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4 mt-4">

                                                {/* Quantity */}
                                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(item.id, item.quantity - 1)
                                                        }
                                                        disabled={item.quantity <= 1}
                                                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40"
                                                    >
                                                        <Minus size={16} />
                                                    </button>

                                                    <span className="px-4 font-medium">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(item.id, item.quantity + 1)
                                                        }
                                                        className="px-3 py-2 hover:bg-gray-100"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <div className="text-lg font-semibold text-gray-900">
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        ₹{item.price.toLocaleString()} each
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="lg:sticky lg:top-28 h-fit">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">

                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                        Order Summary
                                    </h2>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Subtotal ({totalItems} items)</span>
                                            <span>₹{totalPrice.toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Shipping</span>
                                            <span className="text-green-600 font-medium">
                                                Free
                                            </span>
                                        </div>

                                        <div className="border-t pt-4 flex justify-between font-semibold text-gray-900">
                                            <span>Total</span>
                                            <span>
                                                ₹{totalPrice.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Promo */}
                                    <div className="mb-6">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag
                                                    size={14}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Promo code"
                                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                                                />
                                            </div>
                                            <button className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-100">
                                                Apply
                                            </button>
                                        </div>
                                    </div>

                                    <Link href="/checkout">
                                        <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition flex items-center justify-center gap-2">
                                            Checkout
                                            <ArrowRight size={18} />
                                        </button>
                                    </Link>

                                    <div className="mt-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                                        <ShieldCheck size={14} className="text-green-600" />
                                        Secure checkout
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}