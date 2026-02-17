'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ShippingPolicy() {
    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
                <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Shipping Policy</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Last updated: {new Date().toLocaleDateString()}</p>

                    <div style={{ lineHeight: 1.8, color: 'var(--text-body)' }}>
                        <p style={{ marginBottom: '16px' }}>
                            We aim to deliver your parts and accessories as quickly and safely as possible.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>1. Shipment Processing Time</h2>
                        <p style={{ marginBottom: '16px' }}>
                            All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>2. Shipping Rates & Delivery Estimates</h2>
                        <p style={{ marginBottom: '16px' }}>
                            Shipping charges for your order will be calculated and displayed at checkout. Standard delivery typically takes 3-5 business days across major cities in India. Express delivery options are available at checkout.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>3. Shipment Confirmation & Order Tracking</h2>
                        <p style={{ marginBottom: '16px' }}>
                            You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>4. Damages</h2>
                        <p style={{ marginBottom: '16px' }}>
                            Papaz LLP is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
