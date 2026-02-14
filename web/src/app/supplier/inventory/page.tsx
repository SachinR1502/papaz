'use client';

import { useSupplier } from '@/context/SupplierContext';
import InventoryItemCard from '@/components/supplier/InventoryItemCard';
import Link from 'next/link';
import { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Package,
    Car,
    PlusCircle,
    LayoutGrid,
    ListFilter
} from 'lucide-react';

const FILTER_TYPES = [
    { label: 'All Listings', value: 'All', icon: <LayoutGrid size={18} /> },
    { label: 'Car Parts', value: 'Car', icon: <Car size={18} /> },
    { label: 'Bike Accessories', value: 'Bike', icon: '🏍️' },
    { label: 'Commercial Truck', value: 'Truck', icon: '🚚' },
    { label: 'Heavy Bus', value: 'Bus', icon: '🚌' },
    { label: 'Agriculture', value: 'Tractor', icon: '🚜' },
    { label: 'EV Components', value: 'EV Vehicle', icon: '⚡' }
];

export default function InventoryPage() {
    const { inventory, isLoading } = useSupplier();
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.type?.toLowerCase() || '').includes(search.toLowerCase());
        const matchesFilter = filterType === 'All' || item.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ padding: '40px', position: 'relative', minHeight: '100vh' }}>
            {/* Background Ambient Glow */}
            <div style={{
                position: 'fixed',
                bottom: '5%',
                left: '5%',
                width: '400px',
                height: '400px',
                background: 'var(--color-primary)',
                filter: 'blur(180px)',
                opacity: 0.04,
                zIndex: -1,
                pointerEvents: 'none',
                borderRadius: '50%'
            }} />

            {/* Header Section */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: '48px'
            }}>
                <div>
                    <h1 className="text-gradient" style={{
                        fontSize: '3rem',
                        fontWeight: 900,
                        margin: 0,
                        letterSpacing: '-1.5px'
                    }}>
                        Stock Inventory
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '4px' }}>
                        Manage and track your listed products across the PAPAZ network
                    </p>
                </div>
                <Link href="/supplier/inventory/add">
                    <button className="btn btn-primary" style={{
                        padding: '16px 32px',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 15px 30px rgba(var(--color-primary-rgb), 0.2)'
                    }}>
                        <Plus size={20} strokeWidth={3} />
                        List New Product
                    </button>
                </Link>
            </header>

            {/* Search & Filter Bar */}
            <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    {/* Search Field */}
                    <div className="glass-panel" style={{
                        flex: 1,
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.02)',
                        transition: 'all 0.3s ease'
                    }}>
                        <Search size={22} color="var(--color-primary)" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Find a specific part by name or category..."
                            style={{
                                flex: 1,
                                padding: '20px 0',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text-body)',
                                outline: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 500
                            }}
                        />
                    </div>

                    {/* Quick Info Box */}
                    <div className="glass-panel" style={{
                        padding: '0 32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        borderRadius: '24px',
                        background: 'rgba(var(--color-primary-rgb), 0.05)',
                        border: '1px solid rgba(var(--color-primary-rgb), 0.1)'
                    }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-primary)' }}>{inventory.length}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>TOTAL LISTINGS</div>
                        </div>
                        <div style={{ width: '1px', height: '32px', background: 'var(--border-color)' }} />
                        <Package size={24} color="var(--color-primary)" opacity={0.6} />
                    </div>
                </div>

                {/* Filter Chips */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    paddingBottom: '16px',
                    scrollbarWidth: 'none'
                }}>
                    {FILTER_TYPES.map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterType(filter.value)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '100px',
                                border: '1px solid',
                                borderColor: filterType === filter.value ? 'var(--color-primary)' : 'var(--border-color)',
                                background: filterType === filter.value ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.03)',
                                color: filterType === filter.value ? 'white' : 'var(--text-muted)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                if (filterType !== filter.value) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (filterType !== filter.value) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                }
                            }}
                        >
                            {typeof filter.icon === 'string' ? (
                                <span style={{ fontSize: '1.2rem' }}>{filter.icon}</span>
                            ) : (
                                filter.icon
                            )}
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Catalog Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '32px'
            }}>
                {isLoading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
                        <div style={{ color: 'var(--color-primary)', marginBottom: '16px' }}>
                            {/* Simple CSS Spinner */}
                            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(var(--color-primary-rgb), 0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Syncing global inventory data...</p>
                    </div>
                ) : filteredInventory.length > 0 ? (
                    filteredInventory.map(item => (
                        <InventoryItemCard key={item.id} item={item} />
                    ))
                ) : (
                    <div className="glass-panel" style={{
                        gridColumn: '1/-1',
                        textAlign: 'center',
                        padding: '120px 40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '24px',
                        borderRadius: '40px',
                        borderStyle: 'dashed',
                        borderWidth: '2px',
                        background: 'transparent'
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '30px',
                            background: 'rgba(255,255,255,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            opacity: 0.5
                        }}>
                            <Package size={50} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '12px' }}>
                                {search ? 'Search yield no results' : 'Your catalog is empty'}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                                {search
                                    ? `We couldn't find any products matching "${search}". Try refining your keywords or check the filters.`
                                    : 'Start growing your business by listing your first auto parts. Your inventory will be visible to thousands of technicians.'}
                            </p>
                        </div>

                        {!search && (
                            <Link href="/supplier/inventory/add">
                                <button className="btn btn-primary" style={{ padding: '14px 40px', borderRadius: '16px', fontWeight: 800 }}>
                                    <Plus size={20} style={{ marginRight: '8px' }} /> Create First Listing
                                </button>
                            </Link>
                        )}

                        {search && (
                            <button
                                onClick={() => { setSearch(''); setFilterType('All'); }}
                                className="btn btn-secondary"
                                style={{ padding: '12px 32px', borderRadius: '14px', fontWeight: 700 }}
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
