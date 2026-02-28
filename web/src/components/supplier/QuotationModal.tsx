'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, IndianRupee, Package, Calculator, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuotationItem {
    id: string;
    name: string;
    quantity: string;
    price: string;
}

interface QuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (items: any[], totalAmount: number) => Promise<void>;
    initialItems: any[];
    order: any;
    isLoading: boolean;
}

export function QuotationModal({ isOpen, onClose, onSubmit, initialItems, order, isLoading }: QuotationModalProps) {
    const [items, setItems] = useState<QuotationItem[]>([]);

    useEffect(() => {
        if (isOpen && initialItems?.length > 0) {
            setItems(initialItems.map(i => ({
                id: i.id || Math.random().toString(36).substr(2, 9),
                name: i.name || '',
                quantity: String(i.quantity || 1),
                price: String(i.price || 0)
            })));
        } else if (isOpen) {
            addItem();
        }
    }, [isOpen, initialItems]);

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(36).substr(2, 9), name: '', quantity: '1', price: '0' }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof QuotationItem, value: string) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const totalAmount = items.reduce((acc, curr) => {
        const q = parseFloat(curr.quantity) || 0;
        const p = parseFloat(curr.price) || 0;
        return acc + (q * p);
    }, 0);

    const handleSubmit = async () => {
        const validatedItems = items.filter(i => i.name.trim() !== '');
        if (validatedItems.length === 0) return;

        await onSubmit(validatedItems.map(i => ({
            name: i.name,
            quantity: parseFloat(i.quantity) || 1,
            price: parseFloat(i.price) || 0
        })), totalAmount);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                            <Calculator size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 m-0">Order Quotation</h2>
                            <p className="m-0 text-xs font-medium text-gray-500 tracking-tight">Price quote for Order #{order?.id?.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </header>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Package size={16} className="text-orange-500" />
                            Quoted Items
                        </h3>
                        <button
                            onClick={addItem}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-600 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
                        >
                            <Plus size={14} /> Add Line Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end p-5 bg-gray-50/50 border border-gray-100 rounded-2xl transition-all hover:border-orange-100 hover:bg-orange-50/30 group"
                            >
                                <div className="space-y-1.5 flex-1">
                                    <label className="px-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Item Description</label>
                                    <input
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        placeholder="e.g. Brake Pads (Rear)"
                                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <label className="px-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Unit Price</label>
                                    <div className="relative">
                                        <IndianRupee size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500" />
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <label className="px-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quantity</label>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-3.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer / Summary */}
                <footer className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Total Quotation Value</p>
                        <p className="text-3xl font-bold text-slate-900 tracking-tight">₹{totalAmount.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 md:px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-[2] md:px-10 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Send Quotation
                                </>
                            )}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
