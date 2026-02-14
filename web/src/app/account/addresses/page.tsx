'use client';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import AccountSidebar from '@/components/account/AccountSidebar';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '40px' }} className="account-grid">

                    <AccountSidebar />

                    {/* Content */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Saved Addresses</h1>
                            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>+ Add New</button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading addresses...</div>
                        ) : addresses.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                <div style={{ fontSize: '3rem' }}>📍</div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>No addresses saved</h3>
                                    <p style={{ color: 'var(--text-muted)', margin: '8px 0 0' }}>Add an address for faster checkout.</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {addresses.map(address => (
                                    <div key={address._id || address.id} className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{address.label}</span>
                                            {address.isDefault && (
                                                <span style={{ fontSize: '0.75rem', background: 'rgba(46,204,113,0.1)', color: 'var(--status-success)', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>Default</span>
                                            )}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                            <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-body)' }}>{address.fullName}</p>
                                            <p style={{ margin: 0 }}>{address.addressLine1}</p>
                                            {address.addressLine2 && <p style={{ margin: 0 }}>{address.addressLine2}</p>}
                                            <p style={{ margin: 0 }}>{address.city}, {address.state} - {address.zipCode}</p>
                                            <p style={{ margin: '4px 0 0' }}>Ph: {address.phone}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Edit</button>
                                            <button style={{ background: 'none', border: 'none', color: 'var(--status-error)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Delete</button>
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
