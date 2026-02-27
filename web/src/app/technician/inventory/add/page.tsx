'use client';

import React, { useState } from 'react';
import { useTechnician } from '@/context/TechnicianContext';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Package,
    Save,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AddTechnicianComponentPage() {
    const { addPart } = useTechnician();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        quantity: 1,
        price: 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addPart(formData);
            toast.success('Component added successfully');
            router.push('/technician/inventory');
        } catch (error) {
            console.error('Failed to add component', error);
            toast.error('Failed to add component. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-3xl mx-auto p-6 md:p-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/technician/inventory"
                        className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-200 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Component</h1>
                        <p className="text-xs font-medium text-gray-500 mt-1">
                            Expand your local parts inventory
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <Package size={16} className="text-orange-500" />
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Component Details</h2>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
                                    Component Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Premium Brake Pads"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
                                        SKU Code (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. BP-001"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Select Category...</option>
                                        <option value="Engine">Engine</option>
                                        <option value="Brakes">Brakes</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Suspension">Suspension</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Pricing and Stock */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <span className="text-base">💰</span>
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Pricing & Stock</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
                                        Initial Stock Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
                                        Unit Selling Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white transition-all"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex items-center justify-end gap-4 border-t border-gray-100">
                            <Link
                                href="/technician/inventory"
                                className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3.5 bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save Component
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
