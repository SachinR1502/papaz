'use client';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Clock, CreditCard, Package, Phone } from 'lucide-react';

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
            <div style={{ padding: '100px 24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600 }}>Analyzing procurement sequences...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ padding: '100px 24px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '16px', fontWeight: 900 }}>Sequence Not Found</h2>
                <button onClick={() => router.push('/account/orders')} className="btn btn-secondary">Back to Manifest</button>
            </div>
        );
    }

    return (
        <section className="procurement-analysis">
            <header className="page-header">
                <button onClick={() => router.back()} className="back-link">
                    <ArrowLeft size={18} />
                    Return to Manifest
                </button>
            </header>

            <div className="analysis-orb">

                {/* STATUS BAR */}
                <div className="telemetry-bar">
                    <div className="core-info">
                        <h1 className="order-title">
                            Resolution <span>#{order.orderId?.slice(-8) || order.orderId}</span>
                        </h1>
                        <p className="timestamp">
                            <Clock size={14} />
                            Deployment logged on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div className="status-cluster">
                        <div className={`status-orb ${order.status}`}>
                            {order.status.replace('_', ' ')}
                        </div>
                        <div className="payment-indicator">
                            <CreditCard size={14} />
                            {order.paymentStatus} via {order.paymentMethod}
                        </div>
                    </div>
                </div>

                <div className="content-grid">

                    {/* LEFT COLUMN: COMPONENTS */}
                    <div className="components-sector">
                        <div className="sector-header">
                            <div className="header-bar"></div>
                            <h3>Component Sequences ({order.items?.length || 0})</h3>
                        </div>

                        <div className="item-manifest">
                            {order.items?.map((item: any, index: number) => (
                                <div key={index} className="item-node">
                                    <div className="node-icon">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} />
                                        ) : (
                                            <Package size={24} />
                                        )}
                                    </div>
                                    <div className="node-info">
                                        <h4>{item.name}</h4>
                                        <p>Unit Count: {item.quantity}</p>
                                    </div>
                                    <div className="node-value">
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LOGISTICS & SUMMARY */}
                    <div className="logistics-sector">

                        <div className="sector-block">
                            <div className="sector-header">
                                <div className="header-bar"></div>
                                <h3>Delivery Coordinates</h3>
                            </div>
                            {order.deliveryAddress ? (
                                <div className="coord-data">
                                    <h5 className="label">{order.deliveryAddress.label}</h5>
                                    <p className="address">{order.deliveryAddress.address || [order.deliveryAddress.addressLine1, order.deliveryAddress.addressLine2, order.deliveryAddress.city].filter(Boolean).join(', ')}</p>
                                    <p className="region">{order.deliveryAddress.city}{order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''} - {order.deliveryAddress.zipCode}</p>
                                    <div className="comms">
                                        <Phone size={12} />
                                        <span>Ph: {order.deliveryAddress.phone}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="coord-data empty">
                                    <p>Store Pickup / Garage Handover</p>
                                </div>
                            )}
                        </div>

                        <div className="sector-block summary">
                            <div className="sector-header">
                                <div className="header-bar"></div>
                                <h3>Procurement Summary</h3>
                            </div>
                            <div className="financial-logs">
                                <div className="log-row">
                                    <span className="label">Sequence Value</span>
                                    <span className="value">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="log-row">
                                    <span className="label">Logistics Fee</span>
                                    <span className="value success">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                                </div>
                                <div className="log-divider"></div>
                                <div className="log-row total">
                                    <span className="label">Total Resolution</span>
                                    <span className="value highlight">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            <style jsx>{`
        .procurement-analysis {
          animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.98) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(var(--bg-card-rgb), 0.4);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 12px;
          color: var(--text-muted);
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
          margin-bottom: 32px;
        }

        .back-link:hover {
          color: var(--color-primary);
          border-color: var(--color-primary);
          background: rgba(var(--bg-card-rgb), 0.6);
          transform: translateX(-4px);
        }

        .analysis-orb {
          background: rgba(var(--bg-card-rgb), 0.5);
          backdrop-filter: blur(24px);
          border: 1px solid var(--border-color);
          border-radius: 40px;
          padding: 48px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.15);
        }

        .analysis-orb::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,140,0,0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        /* TELEMETRY BAR */
        .telemetry-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 48px;
          padding-bottom: 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          flex-wrap: wrap;
          gap: 24px;
        }

        .order-title {
          font-size: 2.2rem;
          font-weight: 950;
          margin: 0 0 8px;
          letter-spacing: -1.5px;
        }

        .order-title span {
          color: var(--color-primary);
        }

        .timestamp {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .status-cluster {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .status-orb {
          padding: 8px 24px;
          background: rgba(var(--color-primary-rgb), 0.1);
          color: var(--color-primary);
          border: 1px solid rgba(var(--color-primary-rgb), 0.2);
          border-radius: 100px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-size: 0.75rem;
          box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.05);
        }

        .status-orb.delivered, .status-orb.completed {
          background: rgba(52, 199, 89, 0.1);
          color: var(--status-success);
          border-color: rgba(52, 199, 89, 0.2);
        }

        .payment-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        /* CONTENT GRID */
        .content-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 48px;
        }

        .sector-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .header-bar {
          width: 3px;
          height: 20px;
          background: var(--color-primary);
          border-radius: 2px;
          box-shadow: 0 0 10px var(--color-primary);
        }

        .sector-header h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-body);
        }

        /* ITEMS */
        .item-manifest {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .item-node {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          transition: 0.3s;
        }

        .item-node:hover {
          background: rgba(255, 255, 255, 0.04);
          transform: scale(1.01);
          border-color: rgba(255, 140, 0, 0.2);
        }

        .node-icon {
          width: 64px;
          height: 64px;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .node-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .node-info h4 {
          margin: 0 0 4px;
          font-size: 1rem;
          font-weight: 700;
        }

        .node-info p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .node-value {
          margin-left: auto;
          font-weight: 800;
          font-size: 1.1rem;
        }

        /* LOGISTICS */
        .sector-block {
          margin-bottom: 40px;
        }

        .coord-data {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 24px;
          border-radius: 20px;
        }

        .coord-data .label {
          margin: 0 0 8px;
          font-size: 1rem;
          font-weight: 800;
          color: var(--color-primary);
        }

        .coord-data p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--text-muted);
        }

        .comms {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-body);
        }

        .financial-logs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .log-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .log-row.total {
          color: var(--text-body);
          font-size: 1.25rem;
          font-weight: 900;
        }

        .log-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          margin: 8px 0;
        }

        .value.success {
          color: var(--status-success);
        }

        .value.highlight {
          color: var(--color-primary);
          filter: drop-shadow(0 0 10px rgba(255, 140, 0, 0.2));
        }

        @media (max-width: 1100px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          .analysis-orb {
            padding: 32px;
          }
        }

        @media (max-width: 600px) {
          .telemetry-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .status-cluster {
            align-items: flex-start;
          }
          .order-title {
            font-size: 1.6rem;
          }
          .sector-block {
            margin-bottom: 32px;
          }
        }
      `}</style>
        </section>
    );
}
