'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MapPin, Plus, Phone, Edit2, Trash2 } from 'lucide-react';

export default function AddressesPage() {
    const { token } = useAuth();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchAddresses();
        }
    }, [token]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAddresses(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="logistics-hub">
            <header className="page-header">
                <div>
                    <h1>
                        Saved <span className="text-primary">Locations</span>
                    </h1>
                    <p>Manage your delivery coordinates and logistics headquarters.</p>
                </div>
                <button className="add-btn">
                    <Plus size={20} />
                    New Coordinate
                </button>
            </header>

            {loading ? (
                <div className="skeleton-grid">
                    {[1, 2].map(i => (
                        <div key={i} className="skeleton-orb" />
                    ))}
                </div>
            ) : addresses.length === 0 ? (
                <div className="void-pane">
                    <div className="void-icon">
                        <MapPin size={48} />
                    </div>
                    <h3>No Coordinates Detected</h3>
                    <p>Establish your first delivery point to expedite procurement.</p>
                </div>
            ) : (
                <div className="address-grid">
                    {addresses.map(address => (
                        <div key={address._id || address.id} className="address-card">
                            <div className="card-top">
                                <div className="label-badge">
                                    <div className="status-dot"></div>
                                    <span>{address.label}</span>
                                </div>
                                {address.isDefault && (
                                    <span className="primary-pill">Primary</span>
                                )}
                            </div>

                            <div className="card-body">
                                <h4>{address.fullName}</h4>
                                <div className="coordinates">
                                    <p>{address.addressLine1}</p>
                                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                                    <p>{address.city}, {address.state} - {address.zipCode}</p>
                                </div>
                                <div className="contact-strip">
                                    <Phone size={14} />
                                    <span>{address.phone}</span>
                                </div>
                            </div>

                            <div className="card-actions">
                                <button className="action-btn edit">
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                                <button className="action-btn delete">
                                    <Trash2 size={16} />
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .logistics-hub {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 48px;
          gap: 24px;
        }

        h1 {
          font-size: clamp(2rem, 4vw, 2.6rem);
          font-weight: 950;
          margin: 0;
          letter-spacing: -2px;
        }

        .text-primary {
          color: var(--color-primary);
        }

        p {
          margin: 8px 0 0;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 1.1rem;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 20px rgba(255, 140, 0, 0.2);
        }

        .add-btn:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 15px 30px rgba(255, 140, 0, 0.3);
        }

        /* GRID */
        .address-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }

        .address-card {
          background: rgba(var(--bg-card-rgb), 0.5);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
          border-radius: 32px;
          padding: 32px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .address-card:hover {
          transform: translateY(-8px);
          border-color: var(--color-primary);
          background: rgba(var(--bg-card-rgb), 0.7);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .label-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--color-primary);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--color-primary);
        }

        .label-badge span {
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: -0.5px;
        }

        .primary-pill {
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          background: rgba(var(--status-success-rgb, 52, 199, 89), 0.1);
          color: var(--status-success);
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid rgba(var(--status-success-rgb, 52, 199, 89), 0.2);
        }

        .card-body h4 {
          margin: 0 0 12px;
          font-size: 1.3rem;
          font-weight: 900;
        }

        .coordinates p {
          margin: 0;
          font-size: 1rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .contact-strip {
          margin-top: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-body);
          font-weight: 600;
        }

        .card-actions {
          margin-top: 32px;
          display: flex;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: 0.2s;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-body);
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--text-muted);
        }

        .action-btn.delete {
          color: var(--status-error);
        }

        .action-btn.delete:hover {
          background: rgba(255, 59, 48, 0.05);
          border-color: var(--status-error);
        }

        /* VOID STATE */
        .void-pane {
          text-align: center;
          padding: 100px 40px;
          background: rgba(var(--bg-card-rgb), 0.2);
          border: 2px dashed var(--border-color);
          border-radius: 40px;
          backdrop-filter: blur(10px);
        }

        .void-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: var(--text-muted);
        }

        /* SKELETON */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }

        .skeleton-orb {
          height: 280px;
          border-radius: 32px;
          background: rgba(var(--bg-card-rgb), 0.3);
          border: 1px solid var(--border-color);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .add-btn {
            width: 100%;
            justify-content: center;
          }
          .address-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </section>
    );
}
