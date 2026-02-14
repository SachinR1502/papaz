'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useState } from 'react';
import {
    Search,
    Filter,
    ChevronRight,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    LayoutGrid,
    MoreVertical,
    ExternalLink
} from 'lucide-react';

const ORDER_TABS = [
    { label: 'All Orders', value: 'All', icon: <LayoutGrid size={18} /> },
    { label: 'New Requests', value: 'New', icon: <Package size={18} /> },
    { label: 'In Progress', value: 'Preparing', icon: <Clock size={18} /> },
    { label: 'Transiting', value: 'Out for Delivery', icon: <Truck size={18} /> },
    { label: 'Completed', value: 'Delivered', icon: <CheckCircle2 size={18} /> },
    { label: 'Voided', value: 'Cancelled', icon: <XCircle size={18} /> }
];

export default function SupplierOrdersPage() {
    const { orders } = useSupplier();
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = (orders || []).filter(o => {
        const matchesTab = activeTab === 'All' || o.status === activeTab;
        const matchesSearch = searchTerm === '' ||
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.partName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div style={{ padding: '40px', minHeight: '100vh', position: 'relative' }}>
            {/* Header */}
            <header style={{ marginBottom: '40px' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1.5px' }}>
                    Order Center
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                    Track, manage and fulfill customer spare part requests.
                </p>
            </header>

            {/* Filter Tabs Tooling */}
            <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="glass-panel" style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '0 20px',
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                        <Search size={20} color="var(--color-primary)" opacity={0.6} />
                        <input
                            type="text"
                            placeholder="Search by ID or Part Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '16px 0',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-body)',
                                outline: 'none',
                                fontWeight: 500
                            }}
                        />
                    </div>

                    <button className="glass-panel" style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 700,
                        color: 'var(--text-body)',
                        cursor: 'pointer'
                    }}>
                        <Filter size={18} /> Advanced
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    scrollbarWidth: 'none'
                }}>
                    {ORDER_TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '14px',
                                border: '1px solid',
                                borderColor: activeTab === tab.value ? 'var(--color-primary)' : 'var(--border-color)',
                                background: activeTab === tab.value ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                                color: activeTab === tab.value ? 'white' : 'var(--text-muted)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Data Grid */}
            <div className="glass-panel" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={thStyle}>TRACE ID</th>
                            <th style={thStyle}>PLACEMENT DATE</th>
                            <th style={thStyle}>LINE ITEMS</th>
                            <th style={thStyle}>TOTAL VALUATION</th>
                            <th style={thStyle}>LIFECYCLE STATUS</th>
                            <th style={thStyle}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? filteredOrders.map((order: any) => (
                            <tr key={order.id} className="row-hover" style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                                        <span style={{ fontWeight: 800, color: 'var(--text-body)' }}>#{order.id.slice(-8).toUpperCase()}</span>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-body)' }}>{order.partName || (order.items?.[0]?.name) || 'Multi-part Order'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.items?.length || 1} distinct items</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>₹{(order.totalAmount || order.amount || 0).toLocaleString()}</div>
                                </td>
                                <td style={tdStyle}>
                                    <StatusPill status={order.status} />
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            Open <ExternalLink size={14} />
                                        </button>
                                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '120px 40px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', position: 'relative' }}>
                                        <Package size={40} color="var(--text-muted)" opacity={0.3} style={{ margin: 'auto' }} />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Zero results found</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No orders matching your criteria were found in our system.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .row-hover:hover {
                    background: rgba(255, 255, 255, 0.015);
                }
            `}</style>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const isNew = status.toLowerCase() === 'new' || status.toLowerCase() === 'pending';
    const isSuccess = status.toLowerCase() === 'delivered' || status.toLowerCase() === 'paid';
    const isWarn = status.toLowerCase().includes('delivery') || status.toLowerCase().includes('preparing');
    const isError = status.toLowerCase() === 'cancelled' || status.toLowerCase() === 'failed';

    let color = '#777';
    let bg = 'rgba(120, 120, 120, 0.1)';

    if (isNew) { color = '#007AFF'; bg = 'rgba(0, 122, 255, 0.1)'; }
    if (isSuccess) { color = '#34C759'; bg = 'rgba(52, 199, 89, 0.1)'; }
    if (isWarn) { color = '#FF9500'; bg = 'rgba(255, 149, 0, 0.1)'; }
    if (isError) { color = '#FF3B30'; bg = 'rgba(255, 59, 48, 0.1)'; }

    return (
        <span style={{
            padding: '6px 14px',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: color,
            background: bg,
            letterSpacing: '0.5px',
            display: 'inline-block'
        }}>
            {status.toUpperCase()}
        </span>
    );
}

const thStyle = {
    padding: '20px 24px',
    fontWeight: 800,
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    letterSpacing: '1px'
};

const tdStyle = {
    padding: '24px 24px',
    fontSize: '0.95rem'
};
