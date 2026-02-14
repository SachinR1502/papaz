'use client';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AccountSidebar from '@/components/account/AccountSidebar';

const MOCK_ORDERS = [
    { id: 'ORD-1234', date: 'Feb 05, 2026', total: 4500, status: 'Shipped', itemsCount: 2 },
    { id: 'ORD-5678', date: 'Jan 28, 2026', total: 1200, status: 'Delivered', itemsCount: 1 }
];

export default function CustomerOrdersPage() {
    const { user, token } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All') return true;
        if (activeTab === 'In Progress') return ['pending', 'confirmed', 'packed', 'out_for_delivery', 'shipped'].includes(order.status);
        if (activeTab === 'Delivered') return ['delivered', 'completed'].includes(order.status);
        if (activeTab === 'Cancelled') return ['cancelled', 'rejected'].includes(order.status);
        return true;
    });

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '40px' }} className="account-grid">

                    {/* Sidebar */}
                    <AccountSidebar />

                    {/* Content */}
                    <section>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Order History</h1>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
                            {['All', 'In Progress', 'Delivered', 'Cancelled'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '100px',
                                        border: 'none',
                                        background: activeTab === tab ? 'var(--color-primary)' : 'var(--bg-card)',
                                        color: activeTab === tab ? 'white' : 'var(--text-muted)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading orders...</div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                <div style={{ fontSize: '3rem' }}>🔍</div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>No orders found</h3>
                                    <p style={{ color: 'var(--text-muted)', margin: '8px 0 0' }}>It looks like you haven't placed any orders in this category yet.</p>
                                </div>
                                {activeTab === 'All' && (
                                    <Link href="/shop" className="btn btn-primary" style={{ marginTop: '16px' }}>
                                        Browse Shop
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {filteredOrders.map(order => (
                                    <div key={order._id} className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                                🛍️
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', gap: '12px', marginBottom: '4px' }}>
                                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Order #{order.orderId}</h4>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, alignSelf: 'center' }}>
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: 500 }}>
                                                    {order.items?.length || 0} Items • <span style={{ fontWeight: 700 }}>₹{order.totalAmount?.toLocaleString()}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end', minWidth: '140px' }}>
                                            <span style={{
                                                padding: '6px 16px',
                                                borderRadius: '100px',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                background: ['delivered', 'completed'].includes(order.status) ? 'rgba(46,204,113,0.1)' :
                                                    ['cancelled', 'rejected'].includes(order.status) ? 'rgba(231,76,60,0.1)' :
                                                        'rgba(255,140,0,0.1)',
                                                color: ['delivered', 'completed'].includes(order.status) ? 'var(--status-success)' :
                                                    ['cancelled', 'rejected'].includes(order.status) ? '#e74c3c' :
                                                        'var(--color-primary)',
                                                textTransform: 'capitalize'
                                            }}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                            <Link href={`/account/orders/${order.orderId}`} className="btn btn-secondary" style={{ padding: '8px 24px', fontSize: '0.9rem', textDecoration: 'none' }}>
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </div>

            <style jsx global>{`
                @media (max-width: 768px) {
                    .account-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </main>
    );
}
