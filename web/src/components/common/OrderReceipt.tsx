'use client';

import React from 'react';
import { IndianRupee, Package, MapPin, Phone, User, Calendar, Clock, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, safeString } from '@/utils/printUtils';

interface OrderReceiptProps {
    order: any;
    className?: string;
}

/**
 * A reusable, professional Order Receipt component.
 * It's optimized for the standard look and print output.
 */
export function OrderReceipt({ order, className }: OrderReceiptProps) {
    if (!order) return null;

    const isWholesale = !!order.technicianName || !!(order.technician && typeof order.technician === 'object');
    const items = order.items || [];
    const orderId = order.id?.slice(-6).toUpperCase() || 'N/A';
    const createdAt = new Date(order.createdAt);
    const subtotal = (order.totalAmount || order.amount || 0) * 0.95;
    const tax = (order.totalAmount || order.amount || 0) * 0.05;
    const grandTotal = order.totalAmount || order.amount || 0;

    return (
        <div className={cn("bg-white text-slate-900 font-sans print:p-0 print:border-0", className)}>
            {/* INVOICE HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-900 pb-8 mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 flex items-center gap-2">
                        <ShoppingBag className="text-orange-500" strokeWidth={3} /> PAPAZ
                    </h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-1">Official Digital Receipt</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Order Identifier</p>
                    <p className="text-2xl font-black text-slate-900">#{orderId}</p>
                </div>
            </header>

            {/* INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
                {/* TRANSACTION DETAILS */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500 border-b border-gray-100 pb-2">Order Info</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Calendar size={14} className="text-gray-400" />
                            <div>
                                <p className="text-[9px] font-bold uppercase text-gray-400">Date</p>
                                <p className="text-[13px] font-bold">{createdAt.toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock size={14} className="text-gray-400" />
                            <div>
                                <p className="text-[9px] font-bold uppercase text-gray-400">Time</p>
                                <p className="text-[13px] font-bold">{createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Package size={14} className="text-gray-400" />
                            <div>
                                <p className="text-[9px] font-bold uppercase text-gray-400">Order Method</p>
                                <p className="text-[13px] font-bold uppercase">{isWholesale ? 'Wholesale' : 'Store Order'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CUSTOMER/TECH DETAILS */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500 border-b border-gray-100 pb-2">
                        {isWholesale ? 'Technician' : 'Customer'}
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <User size={14} className="text-gray-400" />
                            <div>
                                <p className="text-[9px] font-bold uppercase text-gray-400">Name</p>
                                <p className="text-[13px] font-bold">{safeString(order.technicianName || order.customer?.fullName || 'Valuable User')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone size={14} className="text-gray-400" />
                            <div>
                                <p className="text-[9px] font-bold uppercase text-gray-400">Contact</p>
                                <p className="text-[13px] font-bold">{order.customer?.phoneNumber || order.technician?.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DELIVERY DETAILS */}
                <div className="space-y-4 lg:col-span-1">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500 border-b border-gray-100 pb-2">Delivery Location</h3>
                    <div className="flex items-start gap-3">
                        <MapPin size={14} className="text-gray-400 shrink-0 mt-1" />
                        <div>
                            <p className="text-[9px] font-bold uppercase text-gray-400">Address</p>
                            <p className="text-[13px] font-bold leading-relaxed uppercase italic">
                                {safeString(order.deliveryDetails?.address || order.location || 'Hub Store Delivery')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ITEM TABLE */}
            <div className="mb-12 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white">
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Description</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-center">Qty</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-right">Unit Price</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {items.length > 0 ? items.map((item: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-5">
                                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{item.brand || 'Original Part'}</p>
                                </td>
                                <td className="px-6 py-5 text-center text-sm font-bold text-slate-500">x{item.quantity}</td>
                                <td className="px-6 py-5 text-right text-sm font-bold text-slate-500">{formatCurrency(item.price)}</td>
                                <td className="px-6 py-5 text-right text-sm font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td className="px-6 py-5">
                                    <p className="text-sm font-bold text-slate-900">{order.partName || 'Product Request'}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Custom Order</p>
                                </td>
                                <td className="px-6 py-5 text-center text-sm font-bold text-slate-500">x{order.quantity || 1}</td>
                                <td className="px-6 py-5 text-right text-sm font-bold text-slate-500">{formatCurrency(grandTotal / (order.quantity || 1))}</td>
                                <td className="px-6 py-5 text-right text-sm font-black text-slate-900">{formatCurrency(grandTotal)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* TOTALS */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="max-w-xs space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Legal Note</p>
                    <p className="text-[11px] leading-relaxed text-gray-500 font-medium"> This is a computer-generated digital receipt and does not require a physical signature. Returns are subject to terms and conditions.</p>
                </div>
                <div className="w-full md:w-80 space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-gray-400">
                        <span>Net Value</span>
                        <span className="text-slate-700">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-gray-400">
                        <span>Estimated Tax (5%)</span>
                        <span className="text-slate-700">{formatCurrency(tax)}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2" />
                    <div className="flex justify-between items-center">
                        <span className="text-[13px] font-black uppercase tracking-widest text-slate-900">Final Amount</span>
                        <span className="text-3xl font-black text-orange-600 tracking-tighter italic">{formatCurrency(grandTotal)}</span>
                    </div>
                </div>
            </div>

            {/* BARCODE / STAMP Placeholder (visual only for premium feel) */}
            <div className="mt-16 flex flex-col items-center justify-center border-t border-dashed border-gray-200 pt-8 opacity-50 grayscale hover:grayscale-0 transition-all pointer-events-none select-none">
                <div className="flex gap-1 h-8 opacity-80">
                    {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className={cn("w-[2px] bg-slate-400", Math.random() > 0.6 ? "h-8" : "h-6")} />
                    ))}
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 mt-3">Verified Transaction Hub</p>
            </div>
        </div>
    );
}
