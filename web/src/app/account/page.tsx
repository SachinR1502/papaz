'use client';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import {
  Package,
  Heart,
  MapPin,
  Settings as SettingsIcon,
  ShieldCheck,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AccountDashboard() {
  const { user, token } = useAuth();
  const { cart } = useCart();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchRecentOrders();
  }, [token]);

  const fetchRecentOrders = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setRecentOrders((data.data || data).slice(0, 2));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">

      {/* HEADER */}
      <header className="dashboard-header">
        <h1>
          Mission <span>Control</span>
        </h1>
        <p>
          Welcome back, commander{' '}
          {user?.profile?.fullName?.split(' ')[0] || 'User'}.
        </p>
      </header>

      {/* STATS */}
      <div className="stats-grid">
        <StatCard
          icon={<ShoppingBag size={22} />}
          label="Active Orders"
          value={recentOrders.length.toString()}
          color="var(--color-primary)"
        />
        <StatCard
          icon={<Heart size={22} />}
          label="Wishlist Items"
          value="0"
          color="#ff3b30"
        />
        <StatCard
          icon={<ShieldCheck size={22} />}
          label="Security Status"
          value="Optimal"
          color="var(--status-success)"
        />
      </div>

      {/* MAIN GRID */}
      <div className="dashboard-grid">

        {/* RECENT ORDERS */}
        <section>
          <div className="section-header">
            <h2>Recent Procurement</h2>
            <Link href="/account/orders">View All Hub</Link>
          </div>

          <div className="orders-wrapper">
            {loading ? (
              [1, 2].map(i => (
                <div key={i} className="order-skeleton" />
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order._id} className="order-card">

                  <div className="order-left">
                    <div className="order-id">
                      #{order.orderId?.slice(-4) || '??'}
                    </div>
                    <div>
                      <p className="order-title">
                        {order.items?.length || 0} Components
                      </p>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="order-right">
                    <p className="order-amount">
                      ₹{order.totalAmount?.toLocaleString()}
                    </p>
                    <span className="order-status">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Package size={40} />
                <p>No recent sequences detected.</p>
                <Link href="/" className="btn-primary">
                  Initialize Procurement
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* QUICK NAV */}
        <section className="quick-section">
          <div className="quick-header">
            <h2>Quick Navigation</h2>
            <p>Fast access to your account controls</p>
          </div>

          <div className="quick-grid">

            <Link href="/account/addresses" className="quick-card orange">
              <div className="quick-icon">
                <MapPin size={20} />
              </div>
              <div className="quick-content">
                <p className="quick-title">Logistics Points</p>
                <span>Manage delivery coordinates</span>
              </div>
              <ChevronRight size={18} className="quick-arrow" />
            </Link>

            <Link href="/account/settings" className="quick-card purple">
              <div className="quick-icon">
                <SettingsIcon size={20} />
              </div>
              <div className="quick-content">
                <p className="quick-title">Core Settings</p>
                <span>Security and profile overrides</span>
              </div>
              <ChevronRight size={18} className="quick-arrow" />
            </Link>

            <Link href="/account/wishlist" className="quick-card red">
              <div className="quick-icon">
                <Heart size={20} />
              </div>
              <div className="quick-content">
                <p className="quick-title">Tactical Wishlist</p>
                <span>Saved component sequences</span>
              </div>
              <ChevronRight size={18} className="quick-arrow" />
            </Link>

          </div>

        </section>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .dashboard-wrapper {
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* HEADER */
        .dashboard-header {
          margin-bottom: 40px;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -1.5px;
        }

        .dashboard-header h1 span {
          color: var(--color-primary);
        }

        .dashboard-header p {
          margin-top: 8px;
          font-size: 1.1rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* STATS */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        /* MAIN GRID */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1.2fr;
          gap: 32px;
        }

        /* SECTION HEADER */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0;
        }

        .section-header a {
          color: var(--color-primary);
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
        }

        /* ORDER CARD */
        .orders-wrapper {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .order-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-radius: 24px;
          border: 1px solid var(--border-color);
          background: rgba(var(--bg-card-rgb), 0.5);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .order-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-primary);
          box-shadow: 0 12px 24px rgba(0,0,0,0.06);
        }

        .order-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .order-id {
          width: 48px;
          height: 48px;
          background: rgba(255,140,0,0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: var(--color-primary);
        }

        .order-title {
          margin: 0;
          font-weight: 800;
          font-size: 1rem;
        }

        .order-date {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .order-amount {
          margin: 0;
          font-weight: 900;
          font-size: 1.1rem;
        }

        .order-status {
          font-size: 0.7rem;
          padding: 4px 10px;
          background: rgba(255,140,0,0.1);
          border-radius: 6px;
          color: var(--color-primary);
          text-transform: uppercase;
          font-weight: 800;
          display: inline-block;
          margin-top: 4px;
        }

        /* EMPTY */
        .empty-state {
          padding: 48px;
          text-align: center;
          border-radius: 32px;
          border: 1px solid var(--border-color);
          background: rgba(var(--bg-card-rgb), 0.3);
        }
        
        .empty-state p {
            color: var(--text-muted);
            font-weight: 600;
            margin: 16px 0;
        }

        .btn-primary {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, var(--color-primary), #FF4D00);
          color: white;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(255,140,0,0.3);
          transition: all 0.3s;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(255,140,0,0.4);
        }

        /* QUICK SECTION */
        .quick-section {
          padding: 32px;
          border-radius: 32px;
          border: 1px solid var(--border-color);
          background: rgba(var(--bg-card-rgb), 0.2);
          backdrop-filter: blur(16px);
          position: relative;
          overflow: hidden;
        }

        .quick-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle,
            rgba(var(--color-primary-rgb), 0.05) 0%,
            transparent 70%
          );
          pointer-events: none;
        }

        .quick-header {
          margin-bottom: 28px;
        }

        .quick-header h2 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quick-header h2::before {
          content: '';
          width: 4px;
          height: 24px;
          background: var(--color-primary);
          border-radius: 2px;
        }

        .quick-header p {
          margin: 8px 0 0 16px;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: 1fr; /* Stack vertically in the sidebar */
          gap: 12px;
        }

        .quick-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-radius: 20px;
          background: rgba(var(--bg-card-rgb), 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          text-decoration: none;
          color: inherit;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }

        .quick-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.03),
            transparent
          );
          opacity: 0;
          transition: 0.3s;
        }

        .quick-card:hover {
          transform: scale(1.02) translateX(4px);
          background: rgba(var(--bg-card-rgb), 0.6);
          border-color: var(--color-primary);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }
        
        .quick-card:hover::after {
          opacity: 1;
        }

        .quick-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(255, 140, 0, 0.15);
          color: var(--color-primary);
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(255, 140, 0, 0.1);
        }

        .quick-card.purple .quick-icon {
          background: rgba(108, 92, 231, 0.15);
          color: #a29bfe; /* Lighter/Vibrant purple */
          box-shadow: 0 4px 12px rgba(108, 92, 231, 0.1);
        }

        .quick-card.red .quick-icon {
          background: rgba(255, 59, 48, 0.15);
          color: #ff7675; /* Lighter/Vibrant red */
          box-shadow: 0 4px 12px rgba(255, 59, 48, 0.1);
        }

        .quick-card.orange .quick-icon {
          background: rgba(255, 140, 0, 0.15);
          color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(255, 140, 0, 0.1);
        }

        .quick-card:hover .quick-icon {
          transform: rotate(-5deg) scale(1.1);
          box-shadow: 0 0 20px currentColor; /* Dynamic glow */
        }

        .quick-content {
          flex: 1;
        }

        .quick-title {
          margin: 0;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-body);
        }

        .quick-content span {
          font-size: 0.75rem;
          color: var(--text-muted);
          opacity: 0.8;
        }

        .quick-arrow {
          color: var(--text-muted);
          transition: transform 0.3s ease, color 0.3s ease;
          opacity: 0.5;
        }

        .quick-card:hover .quick-arrow {
          transform: translateX(4px);
          color: var(--color-primary);
          opacity: 1;
        }

        /* SKELETON */
        .order-skeleton {
            height: 100px;
            background: rgba(var(--bg-card-rgb), 0.3);
            border-radius: 24px;
            animation: pulse 1.5s infinite ease-in-out;
        }

        @keyframes pulse {
            0% { opacity: 0.4; }
            50% { opacity: 0.7; }
            100% { opacity: 0.4; }
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
             text-align: center;
          }  
          .dashboard-header h1 {
            font-size: 2rem;
          }
          
          .orders-wrapper {
              gap: 12px;
          }

          .order-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding: 20px;
          }
          
          .order-left {
              width: 100%;
          }
          
          .order-right {
            text-align: left;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 12px;
            border-top: 1px solid var(--border-color);
          }
          
          .order-status {
              margin-top: 0;
          }
          
          .quick-grid {
             grid-template-columns: 1fr;
          }
          
          .quick-card {
              padding: 16px;
          }
        }

      `}</style>
    </div>
  );
}

/* STAT CARD */
function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>

      <style jsx>{`
        .stat-card {
          padding: 32px;
          border-radius: 32px;
          border: 1px solid var(--border-color);
          background: rgba(var(--bg-card-rgb), 0.5);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.06);
          border-color: ${color};
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .stat-label {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .stat-value {
          margin: 8px 0 0;
          font-size: 2rem;
          font-weight: 900;
          color: var(--text-body);
        }
      `}</style>
    </div>
  );
}