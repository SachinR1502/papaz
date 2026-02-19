'use client';

import { useSupplier } from '@/context/SupplierContext';
import InventoryItemCard from '@/components/supplier/InventoryItemCard';
import Link from 'next/link';
import { useState } from 'react';
import {
    Plus,
    Search,
    Package,
    Car,
    LayoutGrid,
    ChevronRight,
    Loader2,
    Truck,
    Zap,
    Tractor
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FILTER_TYPES = [
    { label: 'All Listings', value: 'All', icon: <LayoutGrid size={18} /> },
    { label: 'Batteries', value: 'Batteries', icon: <Zap size={18} /> },
    { label: 'Tires', value: 'Tires', icon: <span className="text-lg">🛞</span> },
    { label: 'Engine Oil', value: 'Engine Oil', icon: <span className="text-lg">🛢️</span> },
    { label: 'Brakes', value: 'Brakes', icon: <span className="text-lg">🛑</span> },
    { label: 'Spare Parts', value: 'Spare Parts', icon: <Package size={18} /> },
    { label: 'Electrical', value: 'Electrical', icon: <Zap size={18} /> }
];

export default function InventoryPage() {
    const { inventory, isLoading } = useSupplier();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.category?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.brand?.toLowerCase() || '').includes(search.toLowerCase());
        const matchesFilter = filterType === 'All' || item.category === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col gap-10 md:gap-14 animate-fade-in pb-20">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 lg:mb-6">
                        <Package size={10} className="text-primary fill-primary" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary">Warehouse Management</span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                        Stock <span className="text-primary">Inventory</span>
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-muted font-bold max-w-2xl opacity-80 leading-relaxed">
                        Manage and track your listed components across the global network.
                    </p>
                </div>
                <Link href="/supplier/inventory/add">
                    <button className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 italic shrink-0">
                        <Plus size={20} />
                        List New Product
                    </button>
                </Link>
            </header>

            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
                    {/* Search Field */}
                    <div className="relative group">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Find a specific component by name or tag..."
                            className="w-full bg-card/20 border border-border group-focus-within:border-primary/50 group-focus-within:bg-card/40 rounded-[28px] py-6 pl-16 pr-8 text-lg font-bold outline-none transition-all placeholder:text-muted/40 backdrop-blur-xl"
                        />
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-between px-8 py-5 bg-primary/5 border border-primary/10 rounded-[28px] group hover:bg-primary/10 transition-colors">
                        <div>
                            <div className="text-3xl font-black text-primary italic leading-none">{inventory.length}</div>
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted opacity-60 mt-1">Total Items</div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5 group-hover:rotate-6 transition-transform">
                            <Package size={22} />
                        </div>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {FILTER_TYPES.map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterType(filter.value)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-4 rounded-full border transition-all duration-300 whitespace-nowrap active:scale-95",
                                filterType === filter.value
                                    ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 -translate-y-1"
                                    : "bg-card/20 border-border text-muted hover:border-primary/30 hover:bg-card/40"
                            )}
                        >
                            <span className={cn(
                                "transition-colors",
                                filterType === filter.value ? "text-white" : "text-primary/70"
                            )}>
                                {filter.icon}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest italic">{filter.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {isLoading ? (
                    <div className="col-span-full py-32 flex flex-col items-center gap-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary animate-spin">
                            <Loader2 size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted opacity-60">Syncing Warehouse Data</p>
                    </div>
                ) : filteredInventory.length > 0 ? (
                    filteredInventory.map(item => (
                        <InventoryItemCard key={item.id} item={item} />
                    ))
                ) : (
                    <div className="col-span-full relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-[40px] blur-xl opacity-20" />
                        <div className="relative p-12 md:p-24 rounded-[40px] border border-border border-dashed bg-card/5 backdrop-blur-3xl flex flex-col items-center text-center gap-10 overflow-hidden shadow-2xl">
                            <div className="w-24 h-24 bg-card/20 rounded-[32px] flex items-center justify-center text-muted/30 group-hover:scale-110 transition-transform duration-500">
                                <Package size={48} />
                            </div>
                            <div className="max-w-md">
                                <h3 className="text-3xl font-black text-foreground italic uppercase mb-4">
                                    {search ? 'No Matches Found' : 'Warehouse Empty'}
                                </h3>
                                <p className="text-muted font-black uppercase tracking-widest text-[10px] opacity-60 leading-loose">
                                    {search
                                        ? `We couldn't find any products matching "${search}". Try refining your keywords.`
                                        : 'Start expanding your reach by listing your first vehicle components. Your inventory will be visible to thousands of experts.'}
                                </p>
                            </div>

                            {!search ? (
                                <Link href="/supplier/inventory/add">
                                    <button className="px-10 py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95 italic">
                                        <Plus size={20} className="inline mr-2" /> Create First Listing
                                    </button>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => { setSearch(''); setFilterType('All'); }}
                                    className="px-10 py-5 bg-card/40 border border-border text-foreground rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-card/60 transition-all active:scale-95 italic"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
