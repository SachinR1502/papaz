'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ShieldCheck, ArrowRight, Tag } from 'lucide-react';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-body)]">
            <Navbar />

            <main className="flex-1 pt-32 pb-24">
                <div className="container mx-auto max-w-7xl px-6">
                    {/* Page Header */}
                    <div className="mb-12">
                        <h1 className="text-[clamp(2.4rem,6vw,3.8rem)] font-black tracking-tighter leading-none text-[var(--text-body)] m-0">
                            Shopping <span className="text-[var(--color-primary)]">Cart</span>
                        </h1>
                        <p className="text-[var(--text-muted)] text-lg mt-4 font-medium max-w-2xl">
                            Review your selected items before checkout.
                        </p>
                    </div>

                    {cart.length === 0 ? (
                        <div className="bg-[var(--bg-card)] p-20 md:p-32 rounded-[48px] border border-[var(--border-color)] text-center flex flex-col items-center gap-8 shadow-2xl shadow-black/5 animate-fade-in">
                            <div className="w-24 h-24 bg-[var(--color-primary)]/10 rounded-3xl flex items-center justify-center text-5xl">
                                🛒
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-[var(--text-body)] tracking-tighter mb-3">Your Cart is Empty</h2>
                                <p className="text-[var(--text-muted)] text-lg font-medium max-w-md mx-auto">Looks like you haven't added anything to your cart yet.</p>
                            </div>
                            <Link href="/">
                                <button className="bg-[var(--color-primary)] text-white px-12 py-5 rounded-2xl text-lg font-black shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all active:scale-95">
                                    Start Shopping
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
                            {/* Items List */}
                            <div className="space-y-6">
                                {cart.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="group bg-[var(--bg-card)] p-6 md:p-8 rounded-[32px] border border-[var(--border-color)] flex flex-col md:flex-row gap-8 items-center transition-all duration-300 hover:border-[var(--color-primary)]/40 hover:shadow-xl hover:shadow-black/5"
                                    >
                                        {/* Image */}
                                        <div
                                            className="w-full md:w-32 h-32 md:h-32 rounded-2xl bg-cover bg-center border border-[var(--border-color)] shrink-0 group-hover:scale-105 transition-transform duration-500"
                                            style={{ backgroundImage: `url(${item.image})` }}
                                        />

                                        {/* Content */}
                                        <div className="flex-1 flex flex-col gap-6 w-full">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="text-xl font-black text-[var(--text-body)] tracking-tight mb-1">{item.name}</h3>
                                                    <span className="inline-block px-3 py-1 bg-[var(--bg-body)] rounded-lg text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider border border-[var(--border-color)]">
                                                        SKU: {item.id}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-6">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 bg-[var(--bg-body)] p-1.5 rounded-2xl border border-[var(--border-color)]">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--bg-card)] text-[var(--text-body)] disabled:opacity-30 transition-all font-black text-lg"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={16} strokeWidth={3} />
                                                    </button>
                                                    <span className="w-10 text-center font-black text-lg text-[var(--text-body)]">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--bg-card)] text-[var(--text-body)] transition-all font-black text-lg"
                                                    >
                                                        <Plus size={16} strokeWidth={3} />
                                                    </button>
                                                </div>

                                                {/* Price Display */}
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-[var(--color-primary)] tracking-tight">
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                                                        ₹{item.price.toLocaleString()} / UNIT
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:sticky lg:top-32 space-y-6">
                                <div className="bg-[var(--bg-card)] p-10 rounded-[40px] border border-[var(--border-color)] shadow-2xl shadow-black/5">
                                    <h2 className="text-2xl font-black text-[var(--text-body)] tracking-tighter mb-8 flex items-center gap-3">
                                        Order Summary
                                    </h2>

                                    <div className="space-y-6 mb-8">
                                        <div className="flex justify-between items-center text-sm font-bold text-[var(--text-muted)]">
                                            <span className="uppercase tracking-widest opacity-70">Subtotal ({totalItems} items)</span>
                                            <span className="text-[var(--text-body)]">₹{totalPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-[var(--text-muted)] uppercase tracking-widest opacity-70">Shipping</span>
                                            <span className="text-green-500 font-black">FREE</span>
                                        </div>
                                        <div className="h-px bg-[var(--border-color)]" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-black text-[var(--text-body)] tracking-tighter">Total</span>
                                            <span className="text-3xl font-black text-[var(--color-primary)] tracking-tight">
                                                ₹{totalPrice.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Promo Code */}
                                    <div className="mb-8">
                                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[2px] mb-3 opacity-70">
                                            Promo Code
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" />
                                                <input
                                                    type="text"
                                                    placeholder="Enter code"
                                                    className="w-full pl-10 pr-4 py-3.5 bg-[var(--bg-body)] rounded-xl border border-[var(--border-color)] outline-none focus:border-[var(--color-primary)]/50 text-sm font-bold placeholder:opacity-40"
                                                />
                                            </div>
                                            <button className="px-6 py-3.5 bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl text-xs font-black text-[var(--text-body)] hover:bg-[var(--bg-card)] hover:border-[var(--color-primary)]/50 transition-all">
                                                Apply
                                            </button>
                                        </div>
                                    </div>

                                    <Link href="/checkout">
                                        <button className="w-full bg-[var(--color-primary)] text-white py-5 rounded-2xl text-lg font-black shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3">
                                            Proceed to Checkout
                                            <ArrowRight size={20} />
                                        </button>
                                    </Link>

                                    <div className="mt-8 pt-8 border-t border-[var(--border-color)] flex flex-col items-center gap-4 text-center">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest px-4 py-2 bg-green-500/5 rounded-full border border-green-500/10">
                                            <ShieldCheck size={14} />
                                            Secure Transaction
                                        </div>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] leading-relaxed max-w-[200px] opacity-60">
                                            By proceeding, you agree to the PAPAZ B2B Terms.
                                        </p>
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
