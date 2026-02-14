'use client';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function OrderDetailsPage() {
    const { user, token } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const orderId = params.id as string;

    useEffect(() => {
        if (token && orderId) {
            fetchOrderDetails();
        }
    }, [token, orderId]);

    const fetchOrderDetails = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                toast.error('Order not found');
            }
        } catch (error) {
            console.error('Failed to fetch order details:', error);
            toast.error('Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
                <Navbar />
                <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Loading order details...</p>
                </div>
            </main>
        );
    }

    if (!order) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
                <Navbar />
                <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '16px' }}>Order Not Found</h2>
                    <button onClick={() => router.push('/account/orders')} className="btn btn-secondary">Back to Orders</button>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '60px 24px', maxWidth: '800px' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', marginBottom: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ← Back to Orders
                </button>

                <div className="glass-panel" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>Order #{order.orderId}</h1>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                                Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{
                                padding: '8px 20px',
                                borderRadius: '100px',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                background: order.status === 'delivered' ? 'rgba(46,204,113,0.1)' : 'rgba(255,140,0,0.1)',
                                color: order.status === 'delivered' ? 'var(--status-success)' : 'var(--color-primary)',
                                textTransform: 'capitalize',
                                display: 'inline-block',
                                marginBottom: '8px'
                            }}>
                                {order.status.replace('_', ' ')}
                            </span>
                            <p style={{ margin: 0, fontWeight: 600 }}>Payment: <span style={{ textTransform: 'capitalize', color: order.paymentStatus === 'paid' ? 'var(--status-success)' : 'var(--text-muted)' }}>{order.paymentStatus} ({order.paymentMethod})</span></p>
                        </div>
                    </div>

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '0 0 32px' }} />

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Items ({order.items?.length || 0})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                        {order.items?.map((item: any, index: number) => (
                            <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: index < (order.items.length - 1) ? '1px solid var(--border-color)' : 'none' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'var(--bg-card)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '1.5rem' }}>📦</span>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600 }}>{item.name}</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Qty: {item.quantity}</p>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                    ₹{(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '0 0 32px' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Delivery Address</h3>
                            {order.deliveryAddress ? (
                                <div style={{ color: 'var(--text-body)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                    <p style={{ margin: 0, fontWeight: 600 }}>{order.deliveryAddress.label}</p>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{order.deliveryAddress.address || [order.deliveryAddress.addressLine1, order.deliveryAddress.addressLine2, order.deliveryAddress.city].filter(Boolean).join(', ')}</p>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                                        {order.deliveryAddress.city}{order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''} - {order.deliveryAddress.zipCode}
                                    </p>
                                    <p style={{ margin: '8px 0 0', fontWeight: 500 }}>Ph: {order.deliveryAddress.phone}</p>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>Store Pickup / Garage Delivery</p>
                            )}
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Order Summary</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                    <span>Subtotal</span>
                                    <span>₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                    <span>Delivery Fee</span>
                                    <span style={{ color: 'var(--status-success)' }}>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem' }}>
                                    <span>Total</span>
                                    <span>₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
