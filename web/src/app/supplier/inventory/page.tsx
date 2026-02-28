'use client';

import { useSupplier } from '@/context/SupplierContext';
import InventoryItemCard from '@/components/supplier/InventoryItemCard';
import Link from 'next/link';
import { useState } from 'react';
import {
    Plus,
    Search,
    Package,
    LayoutGrid,
    Loader2,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FILTER_TYPES = [
    { label: 'All', value: 'All', icon: <LayoutGrid size={14} /> },
    { label: 'Batteries', value: 'Batteries', icon: <Zap size={14} /> },
    { label: 'Tires', value: 'Tires', icon: <span>🛞</span> },
    { label: 'Oil', value: 'Engine Oil', icon: <span>🛢️</span> },
    { label: 'Brakes', value: 'Brakes', icon: <span>🛑</span> },
    { label: 'Parts', value: 'Spare Parts', icon: <Package size={14} /> },
];

export default function InventoryPage() {
    const { inventory, isLoading } = useSupplier();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');

    const filteredInventory = inventory.filter(item => {
        const matchesSearch =
            (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.category?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.brand?.toLowerCase() || '').includes(search.toLowerCase());

        const matchesFilter =
            filterType === 'All' || item.category === filterType;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col gap-6 pb-16">

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Inventory <span className="text-orange-500">({inventory.length})</span>
                    </h1>
                    <p className="text-xs text-gray-500">
                        Manage your product listings
                    </p>
                </div>

                <Link href="/supplier/inventory/add">
                    <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition">
                        <Plus size={16} />
                        Add Product
                    </button>
                </Link>
            </header>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {FILTER_TYPES.map(filter => (
                    <button
                        key={filter.value}
                        onClick={() => setFilterType(filter.value)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition",
                            filterType === filter.value
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {filter.icon}
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {isLoading ? (
                    <div className="col-span-full py-16 flex flex-col items-center gap-3">
                        <Loader2 size={24} className="text-orange-500 animate-spin" />
                        <p className="text-xs text-gray-400">Loading inventory...</p>
                    </div>
                ) : filteredInventory.length > 0 ? (
                    filteredInventory.map(item => (
                        <InventoryItemCard key={item.id} item={item} />
                    ))
                ) : (
                    <div className="col-span-full py-16 border border-dashed border-gray-200 rounded-lg text-center">
                        <Package size={28} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-sm font-medium text-gray-700">
                            {search ? 'No products found' : 'No products added yet'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {search
                                ? 'Try another keyword.'
                                : 'Start by adding your first product.'}
                        </p>

                        {!search && (
                            <Link href="/supplier/inventory/add">
                                <button className="mt-4 px-5 py-2 bg-orange-500 text-white rounded-md text-xs font-semibold hover:bg-orange-600 transition">
                                    Add Product
                                </button>
                            </Link>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}