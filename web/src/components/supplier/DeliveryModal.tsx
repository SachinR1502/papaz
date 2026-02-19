'use client';

import React, { useState, useEffect } from 'react';
import { X, Truck, Phone, User, MapPin, Globe, CreditCard, Save, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isLoading: boolean;
}

export function DeliveryModal({ isOpen, onClose, onSubmit, initialData, isLoading }: DeliveryModalProps) {
    const [deliveryType, setDeliveryType] = useState<'local' | 'courier'>(initialData?.type || 'local');
    const [form, setForm] = useState({
        driverName: initialData?.driverName || '',
        driverPhone: initialData?.driverPhone || '',
        vehicleNumber: initialData?.vehicleNumber || '',
        courierName: initialData?.courierName || '',
        trackingId: initialData?.trackingId || '',
        trackingUrl: initialData?.trackingUrl || '',
        estimatedDelivery: initialData?.estimatedDelivery || '',
        notes: initialData?.notes || ''
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setDeliveryType(initialData.type || 'local');
            setForm({
                driverName: initialData.driverName || '',
                driverPhone: initialData.driverPhone || '',
                vehicleNumber: initialData.vehicleNumber || '',
                courierName: initialData.courierName || '',
                trackingId: initialData.trackingId || '',
                trackingUrl: initialData.trackingUrl || '',
                estimatedDelivery: initialData.estimatedDelivery || '',
                notes: initialData.notes || ''
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ ...form, type: deliveryType });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-card border border-border rounded-[42px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <header className="px-10 py-8 border-b border-border/50 flex justify-between items-center bg-card/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight m-0">Delivery <span className="text-primary">Details</span></h2>
                            <p className="m-0 text-[10px] font-black uppercase tracking-widest text-muted opacity-60">Enter shipping and delivery information</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:text-primary transition-colors">
                        <X size={20} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-10 space-y-10">
                    {/* Delivery Mode Selector */}
                    <div className="flex p-1.5 bg-card/40 border border-border rounded-[24px] gap-2">
                        <button
                            onClick={() => setDeliveryType('local')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-3 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 italic",
                                deliveryType === 'local' ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted hover:text-foreground hover:bg-card/60"
                            )}
                        >
                            <MapPin size={16} /> Local Delivery
                        </button>
                        <button
                            onClick={() => setDeliveryType('courier')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-3 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 italic",
                                deliveryType === 'courier' ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted hover:text-foreground hover:bg-card/60"
                            )}
                        >
                            <Globe size={16} /> Courier Service
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {deliveryType === 'local' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3 flex-1 group">
                                    <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60 italic">Driver Name</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity"><User size={18} /></div>
                                        <input
                                            value={form.driverName}
                                            onChange={e => setForm({ ...form, driverName: e.target.value })}
                                            placeholder="Name of driver..."
                                            className="w-full bg-card/40 border border-border rounded-2xl py-4.5 pl-14 pr-6 text-sm font-black outline-none focus:border-primary/50 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 flex-1 group">
                                    <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60 italic">Contact Number</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity"><Phone size={18} /></div>
                                        <input
                                            value={form.driverPhone}
                                            onChange={e => setForm({ ...form, driverPhone: e.target.value })}
                                            placeholder="+91 XXXX XXX XXX"
                                            className="w-full bg-card/40 border border-border rounded-2xl py-4.5 pl-14 pr-6 text-sm font-black outline-none focus:border-primary/50 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 flex-1 group md:col-span-2">
                                    <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60 italic">Vehicle Number</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity"><Truck size={18} /></div>
                                        <input
                                            value={form.vehicleNumber}
                                            onChange={e => setForm({ ...form, vehicleNumber: e.target.value })}
                                            placeholder="Plate number / VIN..."
                                            className="w-full bg-card/40 border border-border rounded-2xl py-4.5 pl-14 pr-6 text-sm font-black outline-none focus:border-primary/50 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3 flex-1 group">
                                    <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60 italic">Courier Name</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity"><Globe size={18} /></div>
                                        <input
                                            value={form.courierName}
                                            onChange={e => setForm({ ...form, courierName: e.target.value })}
                                            placeholder="e.g. FedEx, BlueDart..."
                                            className="w-full bg-card/40 border border-border rounded-2xl py-4.5 pl-14 pr-6 text-sm font-black outline-none focus:border-primary/50 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 flex-1 group">
                                    <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60 italic">Tracking ID</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity"><CreditCard size={18} /></div>
                                        <input
                                            value={form.trackingId}
                                            onChange={e => setForm({ ...form, trackingId: e.target.value })}
                                            placeholder="AWB / Tracking Number..."
                                            className="w-full bg-card/40 border border-border rounded-2xl py-4.5 pl-14 pr-6 text-sm font-black outline-none focus:border-primary/50 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 flex-1 group md:col-span-2">
                                    <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60 italic">Tracking URL</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity"><CheckCircle2 size={18} /></div>
                                        <input
                                            value={form.trackingUrl}
                                            onChange={e => setForm({ ...form, trackingUrl: e.target.value })}
                                            placeholder="Website link..."
                                            className="w-full bg-card/40 border border-border rounded-2xl py-4.5 pl-14 pr-6 text-sm font-black outline-none focus:border-primary/50 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 group">
                            <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60 italic">Delivery Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                placeholder="Any special instructions for the delivery..."
                                className="w-full min-h-[120px] bg-card/40 border border-border rounded-[28px] py-6 px-8 text-sm font-bold outline-none focus:border-primary/50 transition-all placeholder:text-muted/40 placeholder:italic resize-none leading-relaxed font-mono"
                            />
                        </div>
                    </form>
                </div>

                <footer className="p-10 border-t border-border/50 bg-card/20 flex flex-col md:flex-row items-center justify-end gap-6">
                    <button
                        onClick={onClose}
                        className="w-full md:w-fit px-10 py-5 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-foreground transition-all active:scale-95 italic"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full md:w-fit px-12 py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4 italic"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} /> Save Delivery Info
                            </>
                        )}
                    </button>
                </footer>
            </div>
        </div>
    );
}
