'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSupplier } from '@/context/SupplierContext';
import {
    ChevronLeft,
    Package,
    Truck,
    CheckCircle2,
    MapPin,
    Phone,
    User,
    Printer,
    Download,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function SupplierOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { orders, updateOrder } = useSupplier();
    const [order, setOrder] = useState<any>(null);
    const [pkgDetails, setPkgDetails] = useState({ weight: '', dimensions: '' });

    useEffect(() => {
        if (id && orders.length > 0) {
            const found = orders.find(o => o.id === id);
            if (found) setOrder(found);
        }
    }, [id, orders]);

    if (!order) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 20px' }}></div>
                <p style={{ color: 'var(--text-muted)' }}>Loading Order Details...</p>
            </div>
        </div>
    );

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            await updateOrder(order.id, 'update_status', newStatus);
            setOrder({ ...order, status: newStatus });
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const isPending = order.status === 'pending' || order.status === 'new';
    const isProcessing = order.status === 'processing' || order.status === 'preparing';
    const isShipped = order.status === 'shipped' || order.status === 'out_for_delivery';
    const isCompleted = order.status === 'delivered' || order.status === 'completed';

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)', paddingBottom: '80px' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '40px' }}>
                {/* Header Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => router.back()}
                            style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-body)'
                            }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Order #{order.id.slice(-6).toUpperCase()}</h1>
                                <StatusBadge status={order.status} />
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Printer size={16} /> Print Invoice
                        </button>
                        <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={16} /> Shipping Label
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

                    {/* Left Column: Order Items & actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Status Progression */}
                        <div className="glass-panel" style={{ padding: '32px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px' }}>Fulfillment Status</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                {/* Progress Bar Background */}
                                <div style={{ position: 'absolute', top: '24px', left: '0', right: '0', height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
                                {/* Active Progress (Dynamic width based on status) */}
                                <div style={{
                                    position: 'absolute', top: '24px', left: '0', height: '2px', background: 'var(--color-primary)', zIndex: 0,
                                    width: isCompleted ? '100%' : isShipped ? '66%' : isProcessing ? '33%' : '0%'
                                }}></div>

                                <StepItem active={true} completed={!isPending} icon={<Package size={18} />} label="Order Received" />
                                <StepItem active={isProcessing || isShipped || isCompleted} completed={isShipped || isCompleted} icon={<Package size={18} />} label="Packed" />
                                <StepItem active={isShipped || isCompleted} completed={isCompleted} icon={<Truck size={18} />} label="Shipped" />
                                <StepItem active={isCompleted} completed={isCompleted} icon={<CheckCircle2 size={18} />} label="Delivered" />
                            </div>

                            {/* Action Buttons based on status */}
                            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                {isPending && (
                                    <button
                                        onClick={() => handleStatusUpdate('processing')}
                                        className="btn btn-primary"
                                    >
                                        Accept & Pack Order
                                    </button>
                                )}
                                {isProcessing && (
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                                        <input
                                            placeholder="Weight (kg)"
                                            value={pkgDetails.weight}
                                            onChange={e => setPkgDetails({ ...pkgDetails, weight: e.target.value })}
                                            style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '8px', color: 'var(--text-body)', outline: 'none' }}
                                        />
                                        <input
                                            placeholder="Dimensions (LxWxH)"
                                            value={pkgDetails.dimensions}
                                            onChange={e => setPkgDetails({ ...pkgDetails, dimensions: e.target.value })}
                                            style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '8px', color: 'var(--text-body)', outline: 'none', flex: 1 }}
                                        />
                                        <button
                                            onClick={() => handleStatusUpdate('shipped')}
                                            className="btn btn-primary"
                                        >
                                            Mark as Shipped
                                        </button>
                                    </div>
                                )}
                                {isShipped && (
                                    <button
                                        onClick={() => handleStatusUpdate('delivered')}
                                        className="btn btn-primary" style={{ background: 'var(--status-success)' }}
                                    >
                                        Confirm Delivery
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Items Ordered ({order.items?.length || 1})</h3>
                            </div>
                            <div>
                                {order.items?.map((item: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', padding: '24px', gap: '20px', borderBottom: i < order.items.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '12px', background: 'var(--bg-card)',
                                            backgroundImage: `url(${item.image || 'https://placehold.co/100'})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border-color)'
                                        }}></div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>{item.name}</h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>SKU: {item.sku || 'N/A'} • Brand: {item.brand || 'Generic'}</p>
                                            <div style={{ display: 'flex', gap: '24px' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PRICE</span>
                                                    <span style={{ fontWeight: 600 }}>₹{item.price?.toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>QTY</span>
                                                    <span style={{ fontWeight: 600 }}>x{item.quantity}</span>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL</span>
                                                    <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!order.items && (
                                    <div style={{ padding: '24px', display: 'flex', gap: '20px' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{order.partName}</h4>
                                            <p style={{ color: 'var(--text-muted)' }}>Qty: {order.quantity}</p>
                                        </div>
                                        <div style={{ fontWeight: 700 }}>₹{order.amount?.toLocaleString()}</div>
                                    </div>
                                )}
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ minWidth: '250px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)' }}>
                                        <span>Subtotal</span>
                                        <span>₹{((order.totalAmount || order.amount) * 0.95).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-muted)' }}>
                                        <span>Tax (5%)</span>
                                        <span>₹{((order.totalAmount || order.amount) * 0.05).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                        <span>Total</span>
                                        <span>₹{(order.totalAmount || order.amount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Customer & Delivery Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Customer Card */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={18} color="var(--color-primary)" /> Customer Details
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                                    {order.customer?.fullName?.[0] || 'C'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{order.customer?.fullName || 'Guest Customer'}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.customer?.email || 'No email provided'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <a href={`tel:${order.customer?.phoneNumber}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-body)', textDecoration: 'none' }}>
                                    <Phone size={16} color="var(--text-muted)" />
                                    <span style={{ fontWeight: 500 }}>{order.customer?.phoneNumber || 'N/A'}</span>
                                </a>
                            </div>
                        </div>

                        {/* Delivery Details */}
                        {order.deliveryDetails && (
                            <div className="glass-panel" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Truck size={18} color="var(--color-primary)" />
                                    {order.deliveryDetails.type === 'courier' ? 'Courier Details' : 'Vehicle Details'}
                                </h3>

                                {order.deliveryDetails.type === 'courier' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Courier Partner</span>
                                                <div style={{ fontWeight: 600 }}>{order.deliveryDetails.courierName || 'N/A'}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tracking ID</span>
                                                <div style={{ fontWeight: 600, fontFamily: 'monospace', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {order.deliveryDetails.trackingId || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        {order.deliveryDetails.trackingUrl && (
                                            <a
                                                href={order.deliveryDetails.trackingUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', textDecoration: 'none', padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '8px', justifyContent: 'center', fontWeight: 600 }}
                                            >
                                                Track Shipment <Package size={16} />
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Vehicle Number</span>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{order.deliveryDetails.vehicleNumber}</div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                                            <div>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Driver Name</span>
                                                <div style={{ fontWeight: 600 }}>{order.deliveryDetails.driverName}</div>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone</span>
                                                <div style={{ fontWeight: 600 }}>{order.deliveryDetails.driverPhone}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Shipping Address */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={18} color="var(--color-primary)" /> Delivery Address
                            </h3>
                            <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                {order.deliveryDetails?.address || order.location || 'No specific address provided'}
                                <br />
                                {order.customer?.city || ''}
                                <br />
                                {order.deliveryDetails?.pincode ? `Pincode: ${order.deliveryDetails.pincode}` : ''}
                            </p>
                        </div>

                        {/* Alert Box if needed */}
                        <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255, 149, 0, 0.1)', border: '1px solid rgba(255, 149, 0, 0.2)', display: 'flex', gap: '16px' }}>
                            <AlertCircle size={24} color="#FF9500" style={{ flexShrink: 0 }} />
                            <div>
                                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', color: '#FF9500' }}>Expedited Shipping</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer requested urgent delivery within 24 hours.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}

function StepItem({ active, completed, icon, label }: { active: boolean, completed: boolean, icon: React.ReactNode, label: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: completed ? 'var(--status-success)' : active ? 'var(--color-primary)' : 'var(--bg-card)',
                border: active || completed ? 'none' : '2px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: active || completed ? 'white' : 'var(--text-muted)',
                transition: 'all 0.3s ease'
            }}>
                {icon}
            </div>
            <span style={{
                fontSize: '0.85rem', fontWeight: 600,
                color: active || completed ? 'var(--text-body)' : 'var(--text-muted)'
            }}>
                {label}
            </span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const s = status?.toLowerCase() || 'pending';
    let color = '#FF9500';
    let bg = 'rgba(255, 149, 0, 0.1)';

    if (s === 'delivered' || s === 'completed') {
        color = '#34C759';
        bg = 'rgba(52, 199, 89, 0.1)';
    } else if (s === 'cancelled') {
        color = '#FF3B30';
        bg = 'rgba(255, 59, 48, 0.1)';
    } else if (s === 'processing' || s === 'shipped' || s === 'out_for_delivery') {
        color = '#007AFF';
        bg = 'rgba(0, 122, 255, 0.1)';
    }

    return (
        <span style={{
            padding: '6px 12px', borderRadius: '100px',
            background: bg, color: color, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase'
        }}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
}
