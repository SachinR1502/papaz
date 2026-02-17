'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicy() {
    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
                <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Privacy Policy</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Last updated: {new Date().toLocaleDateString()}</p>

                    <div style={{ lineHeight: 1.8, color: 'var(--text-body)' }}>
                        <p style={{ marginBottom: '16px' }}>
                            At Papaz LLP ("we", "our", or "us"), we align with industry standards to respect and protect your privacy. This Privacy Policy describes how we collect, use, and disclose your information when you use our website and services.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>1. Information We Collect</h2>
                        <p style={{ marginBottom: '16px' }}>
                            We collect information that you provide directly to us, such as when you create an account, make a purchase, or contact support. This may include your name, email address, phone number, payment information, and vehicle details.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>2. How We Use Your Information</h2>
                        <ul style={{ listStyle: 'disc', paddingLeft: '24px', marginBottom: '16px' }}>
                            <li>To provide, maintain, and improve our services.</li>
                            <li>To process transactions and send you related information.</li>
                            <li>To allow technicians and garages to fulfill service requests.</li>
                            <li>To communicate with you about products, services, offers, and events.</li>
                        </ul>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>3. Information Sharing</h2>
                        <p style={{ marginBottom: '16px' }}>
                            We share your information with third-party service providers who act on our behalf (e.g., payment processors, logistics partners). We do not sell your personal data to advertisers.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>4. Data Security</h2>
                        <p style={{ marginBottom: '16px' }}>
                            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>5. Contact Us</h2>
                        <p style={{ marginBottom: '16px' }}>
                            If you have any questions about this Privacy Policy, please contact us at support@papaz.com.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
