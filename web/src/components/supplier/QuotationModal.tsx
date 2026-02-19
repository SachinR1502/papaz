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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-card border border-border rounded-[42px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <header className="px-10 py-8 border-b border-border/50 flex justify-between items-center bg-card/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Calculator size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight m-0">Order <span className="text-primary">Quotation</span></h2>
                            <p className="m-0 text-[10px] font-black uppercase tracking-widest text-muted opacity-60">Price quote for Order #{order?.id?.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:text-primary transition-colors">
                        <X size={20} />
                    </button>
                </header>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-lg font-black text-foreground italic uppercase flex items-center gap-3">
                            <Package size={18} className="text-primary" /> Item Details
                        </h3>
                        <button
                            onClick={addItem}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95"
                        >
                            <Plus size={14} /> Add Item
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {items.map((item, idx) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end p-6 bg-card/30 border border-border rounded-3xl group transition-all hover:bg-card/50"
                            >
                                <div className="space-y-2">
                                    <label className="px-1 text-[9px] font-black uppercase tracking-widest text-muted opacity-60 italic">Item Name</label>
                                    <input
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        placeholder="e.g. Brake Pads (Rear)"
                                        className="w-full bg-card border border-border rounded-xl py-3 px-5 text-sm font-bold outline-none focus:border-primary/50 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="px-1 text-[9px] font-black uppercase tracking-widest text-muted opacity-60 italic">Price</label>
                                    <div className="relative">
                                        <IndianRupee size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40" />
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                            className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-5 text-sm font-bold outline-none focus:border-primary/50 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="px-1 text-[9px] font-black uppercase tracking-widest text-muted opacity-60 italic">Quantity</label>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                        className="w-full bg-card border border-border rounded-xl py-3 px-5 text-sm font-bold outline-none focus:border-primary/50 transition-all font-mono"
                                    />
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="mb-1 w-11 h-11 rounded-xl bg-red-500/5 text-red-500/40 hover:bg-red-500/10 hover:text-red-500 border border-red-500/10 flex items-center justify-center transition-all active:scale-90"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer / Summary */}
                <footer className="p-10 border-t border-border/50 bg-card/20 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex flex-col gap-1">
                        <p className="m-0 text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Total Quote Amount</p>
                        <p className="m-0 text-4xl font-black text-foreground italic tracking-tighter">₹{totalAmount.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 md:px-10 py-5 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-foreground transition-all active:scale-95 italic"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-[2] md:px-12 py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4 italic"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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
