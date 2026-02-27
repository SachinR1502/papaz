'use client';

import React, { useState } from 'react';
import { useTechnician } from '@/context/TechnicianContext';
import {
    Cpu,
    Search,
    Plus,
    Package,
    Database,
    Boxes,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TechnicianInventoryPage() {
    const { inventory, isLoading, isApproved } = useTechnician();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredInventory = inventory.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse p-6">
                <div className="h-16 bg-gray-100 rounded-2xl w-full" />
                <div className="h-96 bg-gray-100 rounded-2xl w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Parts Inventory</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Boxes size={14} className="text-orange-500" />
                            <p className="text-xs font-semibold text-gray-500">
                                Total Assets: <span className="text-gray-900 ml-1">₹{(inventory.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)).toLocaleString()}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative group w-full sm:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-gray-50 border border-gray-200 h-10 pl-9 pr-4 rounded-xl text-xs font-medium w-full outline-none focus:border-orange-500 focus:bg-white transition-all"
                            />
                        </div>
                        <Link
                            href="/technician/inventory/add"
                            className="h-10 px-6 bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-95 w-full sm:w-auto"
                        >
                            <Plus size={14} />
                            Add Component
                        </Link>
                    </div>
                </div>
            </div>

            {/* Verification Alert if Not Approved */}
            {!isApproved && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-4 text-amber-800">
                    <Database size={20} />
                    <p className="text-xs font-medium">Inventory management is currently in browse-only mode while your profile is under review.</p>
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Item Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-center">Stock</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Unit Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInventory.length > 0 ? (
                                filteredInventory.map((item, index) => (
                                    <tr key={item.id || item._id || index} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors">
                                                    <Package size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU: {item.sku || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md text-[9px] font-bold uppercase tracking-wider text-gray-600">
                                                {item.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center">
                                                <span className={cn(
                                                    "font-bold text-base",
                                                    item.quantity < 5 ? "text-red-500" : "text-gray-900"
                                                )}>{item.quantity}</span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Units</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-gray-900 text-sm">
                                            ₹{item.price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            {item.quantity < 5 ? (
                                                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100 w-fit font-bold text-[9px] uppercase tracking-wider">
                                                    <AlertTriangle size={10} />
                                                    Critical
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100 w-fit font-bold text-[9px] uppercase tracking-wider">
                                                    <CheckCircle2 size={10} />
                                                    Optimal
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Boxes size={40} className="text-gray-300 mb-2" />
                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Inventory Empty</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
