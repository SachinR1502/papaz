'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function RefundPolicy() {
    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
                <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Refund & Cancellation Policy</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Last updated: {new Date().toLocaleDateString()}</p>

                    <div style={{ lineHeight: 1.8, color: 'var(--text-body)' }}>
                        <p style={{ marginBottom: '16px' }}>
                            We strive to ensure your satisfaction with every purchase. However, if you are not entirely satisfied, we are here to help.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>1. Returns</h2>
                        <p style={{ marginBottom: '16px' }}>
                            You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. It must be in the original packaging.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>2. Refunds</h2>
                        <p style={{ marginBottom: '16px' }}>
                            Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item. If your return is approved, we will initiate a refund to your original method of payment.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>3. Cancellations</h2>
                        <p style={{ marginBottom: '16px' }}>
                            You can cancel your order before it has been dispatched for shipping. Once dispatched, the order implies a commitment to purchase. Service bookings can be cancelled up to 24 hours before the scheduled time for a full refund.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>4. Non-Refundable Items</h2>
                        <ul style={{ listStyle: 'disc', paddingLeft: '24px', marginBottom: '16px' }}>
                            <li>Electrical parts once installed.</li>
                            <li>Lubricants and fluids if seal is broken.</li>
                            <li>Service charges after the service has been performed.</li>
                        </ul>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>5. Contact Us</h2>
                        <p style={{ marginBottom: '16px' }}>
                            If you have any questions on how to return your item to us, contact us at support@papaz.com.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
