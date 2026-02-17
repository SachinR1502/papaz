'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Package, ChevronRight, RefreshCw, ShoppingBag, Calendar, Layers, DollarSign } from 'lucide-react';

export default function CustomerOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/orders`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') return true;
    if (activeTab === 'In Progress')
      return ['pending', 'confirmed', 'packed', 'out_for_delivery', 'shipped'].includes(order.status);
    if (activeTab === 'Delivered')
      return ['delivered', 'completed'].includes(order.status);
    if (activeTab === 'Cancelled')
      return ['cancelled', 'rejected'].includes(order.status);
    return true;
  });

  return (
    <section className="orders-page">
      {/* HEADER */}
      <header className="page-header">
        <div className="title-group">
          <div className="icon-box">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1>My <span className="text-primary">Orders</span></h1>
            <p>View and track your past purchases.</p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
          disabled={isRefreshing}
        >
          <RefreshCw size={18} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </header>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-scroll-area">
          {['All', 'In Progress', 'Delivered', 'Cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="orders-list">
        {loading && !isRefreshing ? (
          <div className="loading-skeleton">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={48} />
            </div>
            <h3>No Orders Found</h3>
            <p>You haven't placed any orders yet.</p>
            {activeTab === 'All' && (
              <Link href="/" className="start-btn">
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <div key={order._id} className="order-card">

                {/* CARD HEADER (Mobile: Top Row) */}
                <div className="card-top">
                  <div className="order-identity">
                    <div className="order-icon">
                      <Package size={20} />
                    </div>
                    <div>
                      <span className="label">Order #</span>
                      <h4>{order.orderId?.slice(-8).toUpperCase() || 'N/A'}</h4>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`status-badge ${order.status}`}>
                    <span className="dot"></span>
                    {order.status.replace('_', ' ')}
                  </div>
                </div>

                {/* CARD BODY (Mobile: Middle Row) */}
                <div className="card-details">
                  <div className="detail-item">
                    <Calendar size={14} className="detail-icon" />
                    <div>
                      <span className="label">Date</span>
                      <span className="value">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Layers size={14} className="detail-icon" />
                    <div>
                      <span className="label">Items</span>
                      <span className="value">{order.items?.length || 0}</span>
                    </div>
                  </div>

                  <div className="detail-item highlight">
                    <DollarSign size={14} className="detail-icon" />
                    <div>
                      <span className="label">Total</span>
                      <span className="value">₹{order.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* CARD ACTION (Mobile: Bottom Row) */}
                <div className="card-action">
                  <Link href={`/account/orders/${order.orderId}`} className="view-btn">
                    View Details
                    <ChevronRight size={16} />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .orders-page {
          width: 100%;
          max-width: 1200px; /* Slightly wider for better desktop view */
          margin: 0 auto;
          padding: 40px 24px; /* More breathing room (Top/Bottom: 40px, Sides: 24px) */
          min-height: 80vh; /* Ensures footer stays at the bottom on empty states */
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* HEADER */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .title-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-box {
          width: 50px;
          height: 50px;
          background: rgba(var(--primary-rgb, 255, 140, 0), 0.1);
          color: var(--color-primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        h1 {
          font-size: 1.8rem;
          margin: 0;
          font-weight: 800;
          line-height: 1.1;
        }

        .text-primary { color: var(--color-primary); }

        .page-header p {
          margin: 4px 0 0;
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 50px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-body);
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .refresh-btn:hover {
          border-color: var(--color-primary);
          background: rgba(var(--primary-rgb, 255, 140, 0), 0.05);
        }

        .refresh-btn.spinning svg {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* TABS */
        .tabs-container {
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .tabs-scroll-area {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
          padding-bottom: 1px; /* Avoid border clipping */
        }
        .tabs-scroll-area::-webkit-scrollbar { display: none; }

        .tab-btn {
          background: none;
          border: none;
          padding: 12px 4px;
          font-size: 0.95rem;
          color: var(--text-muted);
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: 0.3s;
        }

        .tab-btn:hover { color: var(--text-body); }

        .tab-btn.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        /* ORDERS LIST */
        .orders-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border-color: var(--color-primary);
        }

        /* Card Sections */
        .card-top {
          display: flex;
          align-items: center;
          gap: 24px;
          min-width: 200px;
        }

        .order-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .order-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .label {
          display: block;
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 2px;
          font-weight: 700;
        }

        h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .card-details {
          display: flex;
          align-items: center;
          gap: 40px;
          flex: 1;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .detail-icon { color: var(--text-muted); opacity: 0.5; }

        .value {
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-body);
        }

        .detail-item.highlight .value {
          color: var(--color-primary);
          font-weight: 700;
        }

        .card-action {
          min-width: 140px;
          display: flex;
          justify-content: flex-end;
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          background: rgba(var(--primary-rgb, 255, 140, 0), 0.1);
          color: var(--color-primary);
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: 0.2s;
        }

        .view-btn:hover {
          background: var(--color-primary);
          color: white;
        }

        /* STATUS BADGES */
        .status-badge {
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

        .status-badge.pending { color: #f1c40f; background: rgba(241, 196, 15, 0.1); border-color: rgba(241, 196, 15, 0.2); }
        .status-badge.delivered, .status-badge.completed { color: #2ecc71; background: rgba(46, 204, 113, 0.1); border-color: rgba(46, 204, 113, 0.2); }
        .status-badge.cancelled { color: #e74c3c; background: rgba(231, 76, 60, 0.1); border-color: rgba(231, 76, 60, 0.2); }
        .status-badge.shipped, .status-badge.out_for_delivery { color: var(--color-primary); background: rgba(var(--primary-rgb, 255, 140, 0), 0.1); border-color: rgba(var(--primary-rgb, 255, 140, 0), 0.2); }

        /* EMPTY & SKELETON STATES */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: var(--bg-card);
          border: 2px dashed var(--border-color);
          border-radius: 16px;
        }
        .empty-icon { color: var(--text-muted); margin-bottom: 16px; }
        .start-btn {
          display: inline-block;
          margin-top: 16px;
          padding: 10px 24px;
          background: var(--color-primary);
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        }
        .skeleton-card {
          height: 100px;
          background: var(--bg-card);
          border-radius: 16px;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

        /* ============================ */
        /* RESPONSIVE DESIGN (MOBILE)   */
        /* ============================ */
        
        @media (max-width: 768px) {
        .orders-page {
            padding: 20px 16px; /* Tighter padding for mobile screens */
            max-width: 100%;
          }
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .refresh-btn {
            width: 100%;
            justify-content: center;
          }

          .order-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            padding: 20px;
          }

          .card-top {
            width: 100%;
            justify-content: space-between;
          }

          .card-details {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: rgba(0,0,0,0.03);
            padding: 16px;
            border-radius: 12px;
          }

          /* Make the 'Total' span across two columns if needed, or keep grid */
          .detail-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .detail-icon { display: none; } /* Simplify mobile view */

          .card-action {
            width: 100%;
          }

          .view-btn {
            width: 100%;
            justify-content: center;
            background: var(--color-primary);
            color: white; /* More tappable on mobile */
          }
        }
      `}</style>
    </section>
  );
}