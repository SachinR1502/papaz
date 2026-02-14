'use client';

import { useSupplier } from '@/context/SupplierContext';
import {
    Wallet,
    ShoppingBag,
    Package,
    Star,
    TrendingUp,
    Clock,
    ArrowUpRight,
    Users,
    Zap
} from 'lucide-react';
import Link from 'next/link';

export default function SupplierDashboard() {
    const { profile, orders, inventory, walletBalance } = useSupplier();

    const pendingOrdersCount = orders?.filter(o => o.status === 'pending' || o.status.toLowerCase() === 'new').length || 0;
    const totalSales = orders?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    return (
        <div style={{ padding: '40px', position: 'relative' }}>
            {/* Ambient background accent */}
            <div style={{
                position: 'fixed',
                top: '0',
                right: '0',
                width: '40vw',
                height: '40vh',
                background: 'var(--color-primary)',
                filter: 'blur(160px)',
                opacity: 0.03,
                zIndex: -1,
                pointerEvents: 'none'
            }} />

            <header style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: 'rgba(var(--color-primary-rgb), 0.1)',
                        color: 'var(--color-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: '1px'
                    }}>
                        SUPPLIER PORTAL v2.0
                    </div>
                </div>
                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>
                    Partner Overview
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                    Welcome back, <span style={{ color: 'var(--text-body)', fontWeight: 700 }}>{profile?.storeName || 'Partner'}</span>. Here's your business performance.
                </p>
            </header>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '48px'
            }}>
                <StatCard
                    title="Total Revenue"
                    value={`₹${totalSales.toLocaleString()}`}
                    subtitle="Lifetime generated"
                    icon={<TrendingUp size={24} />}
                    color="#007AFF"
                />
                <StatCard
                    title="Wallet Balance"
                    value={`₹${walletBalance.toLocaleString()}`}
                    subtitle="Available for payout"
                    icon={<Wallet size={24} />}
                    color="#5856D6"
                />
                <StatCard
                    title="Active Tasks"
                    value={pendingOrdersCount.toString()}
                    subtitle="Orders to fulfill"
                    icon={<ShoppingBag size={24} />}
                    color="#FF9500"
                />
                <StatCard
                    title="Catalog Size"
                    value={(inventory?.length || 0).toString()}
                    subtitle="Active listings"
                    icon={<Package size={24} />}
                    color="#34C759"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* Orders Section */}
                <div className="glass-panel" style={{ padding: '0', borderRadius: '32px', overflow: 'hidden' }}>
                    <div style={{
                        padding: '32px',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.02)'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Recent Orders</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>Latest transactions and requests</p>
                        </div>
                        <Link href="/supplier/orders">
                            <button className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                View All <ArrowUpRight size={16} />
                            </button>
                        </Link>
                    </div>

                    <div style={{ padding: '8px' }}>
                        {!orders || orders.length === 0 ? (
                            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 24px',
                                    color: 'var(--text-muted)'
                                }}>
                                    <Clock size={40} opacity={0.3} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px' }}>No orders yet</h3>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Your sales and incoming requests will appear here.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', padding: '0 24px 24px' }}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>ORDER ID</th>
                                            <th style={thStyle}>DETAILS</th>
                                            <th style={thStyle}>VALUATION</th>
                                            <th style={thStyle}>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders?.slice(0, 8).map(order => (
                                            <tr key={order.id} className="table-row-hover" style={{ cursor: 'pointer' }}>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 800, color: 'var(--text-body)' }}>
                                                        #{order.id.slice(-6).toUpperCase()}
                                                    </div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-body)' }}>{order.partName || 'Spare Part'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Qty: {order.quantity}</div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 800 }}>₹{order.amount?.toLocaleString()}</div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <StatusBadge status={order.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Performance Card */}
                    <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, color: 'var(--color-primary)' }}>
                            <Zap size={120} />
                        </div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '24px', position: 'relative' }}>Service Metrics</h2>

                        <div style={{ textAlign: 'center', padding: '12px 0 32px' }}>
                            <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>
                                {profile?.rating || '4.9'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '16px 0 8px', color: '#FFCC00' }}>
                                <Star fill="#FFCC00" size={18} />
                                <Star fill="#FFCC00" size={18} />
                                <Star fill="#FFCC00" size={18} />
                                <Star fill="#FFCC00" size={18} />
                                <Star fill="#FFCC00" size={18} />
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Trust Score & Partner Rating</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <MetricRow label="Pickup Velocity" value="Top 3%" trend="+2.4%" />
                            <MetricRow label="Quote Acceptance" value="92%" trend="+5.1%" />
                            <MetricRow label="Inventory Latency" value="0.1s" trend="Optimal" />
                        </div>
                    </div>

                    {/* Quick Access Card */}
                    <div className="glass-panel" style={{
                        padding: '32px',
                        borderRadius: '32px',
                        background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1), rgba(var(--color-primary-rgb), 0.05))',
                        border: '1px solid rgba(var(--color-primary-rgb), 0.2)'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Need assistance?</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
                            Access dedicated partner support or view the knowledge base for portal features.
                        </p>
                        <button className="btn btn-primary" style={{ width: '100%', borderRadius: '16px', fontWeight: 800 }}>
                            Partner Support
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .table-row-hover:hover td {
                    background: rgba(255, 255, 255, 0.03);
                }
                .table-row-hover td:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
                .table-row-hover td:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
            `}</style>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
    return (
        <div className="glass-panel card-hover" style={{
            padding: '28px',
            borderRadius: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: `${color}15`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 16px ${color}10`
            }}>
                {icon}
            </div>
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 6px', letterSpacing: '0.5px' }}>
                    {title.toUpperCase()}
                </p>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>{value}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, margin: 0, opacity: 0.8 }}>{subtitle}</p>
            </div>
        </div>
    );
}

function MetricRow({ label, value, trend }: { label: string, value: string, trend: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{value}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34C759' }}>{trend}</div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const isPending = status.toLowerCase() === 'pending' || status.toLowerCase() === 'new';
    const isCompleted = status.toLowerCase() === 'delivered' || status.toLowerCase() === 'paid';

    let styles = {
        background: 'rgba(255, 149, 0, 0.1)',
        color: '#FF9500'
    };

    if (isCompleted) {
        styles = {
            background: 'rgba(52, 199, 89, 0.1)',
            color: '#34C759'
        };
    } else if (status.toLowerCase() === 'cancelled') {
        styles = {
            background: 'rgba(255, 59, 48, 0.1)',
            color: '#FF3B30'
        };
    }

    return (
        <span style={{
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.5px',
            ...styles
        }}>
            {status.toUpperCase()}
        </span>
    );
}

const thStyle = {
    padding: '12px 24px',
    textAlign: 'left' as const,
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 800,
    letterSpacing: '1px'
};

const tdStyle = {
    padding: '20px 24px',
    fontSize: '0.95rem',
    background: 'transparent',
    transition: 'background 0.2s'
};
