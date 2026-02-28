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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 m-0">Delivery Details</h2>
                            <p className="m-0 text-xs font-medium text-gray-500">Update shipping and dispatch information</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Delivery Mode Selector */}
                    <div className="flex p-1 bg-gray-100 rounded-2xl gap-1">
                        <button
                            onClick={() => setDeliveryType('local')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-xs font-bold transition-all",
                                deliveryType === 'local'
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <MapPin size={16} /> Local Delivery
                        </button>
                        <button
                            onClick={() => setDeliveryType('courier')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-xs font-bold transition-all",
                                deliveryType === 'courier'
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <Globe size={16} /> Courier Service
                        </button>
                    </div>

                    <form id="delivery-form" onSubmit={handleSubmit} className="space-y-6">
                        {deliveryType === 'local' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ModalInput
                                    label="Driver Name"
                                    icon={<User size={18} />}
                                    value={form.driverName}
                                    onChange={val => setForm({ ...form, driverName: val })}
                                    placeholder="Enter name"
                                />
                                <ModalInput
                                    label="Contact Number"
                                    icon={<Phone size={18} />}
                                    value={form.driverPhone}
                                    onChange={val => setForm({ ...form, driverPhone: val })}
                                    placeholder="+91 XXXX XXX XXX"
                                />
                                <div className="md:col-span-2">
                                    <ModalInput
                                        label="Vehicle Number"
                                        icon={<Truck size={18} />}
                                        value={form.vehicleNumber}
                                        onChange={val => setForm({ ...form, vehicleNumber: val })}
                                        placeholder="Plate number / VIN"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ModalInput
                                    label="Courier Name"
                                    icon={<Globe size={18} />}
                                    value={form.courierName}
                                    onChange={val => setForm({ ...form, courierName: val })}
                                    placeholder="e.g. FedEx, BlueDart"
                                />
                                <ModalInput
                                    label="Tracking ID"
                                    icon={<CreditCard size={18} />}
                                    value={form.trackingId}
                                    onChange={val => setForm({ ...form, trackingId: val })}
                                    placeholder="AWB / Tracking Number"
                                />
                                <div className="md:col-span-2">
                                    <ModalInput
                                        label="Tracking URL"
                                        icon={<CheckCircle2 size={18} />}
                                        value={form.trackingUrl}
                                        onChange={val => setForm({ ...form, trackingUrl: val })}
                                        placeholder="Package tracking website link"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Delivery Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                placeholder="Any special instructions for the delivery..."
                                className="w-full min-h-[120px] bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 resize-none leading-relaxed"
                            />
                        </div>
                    </form>
                </div>

                <footer className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        form="delivery-form"
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Delivery
                            </>
                        )}
                    </button>
                </footer>
            </div>
        </div>
    );
}

interface ModalInputProps {
    label: string;
    icon: React.ReactNode;
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    type?: string;
}

function ModalInput({ label, icon, value, onChange, placeholder, type = "text" }: ModalInputProps) {
    return (
        <div className="space-y-1.5 flex-1 group">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1 group-focus-within:text-orange-500 transition-colors uppercase">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    {icon}
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-11 pr-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400"
                />
            </div>
        </div>
    );
}
