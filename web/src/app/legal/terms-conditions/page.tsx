'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TermsConditions() {
    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '40px 24px', flex: 1 }}>
                <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>Terms and Conditions</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Last updated: {new Date().toLocaleDateString()}</p>

                    <div style={{ lineHeight: 1.8, color: 'var(--text-body)' }}>
                        <p style={{ marginBottom: '16px' }}>
                            Welcome to Papaz Vehicle Solutions. By accessing or using our website and services, you agree to be bound by these Terms and Conditions.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
                        <p style={{ marginBottom: '16px' }}>
                            By registering for an account or using any part of our services, you confirm that you have read, understood, and agree to these Terms. If you do not agree, you must not use our services.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>2. User Accounts</h2>
                        <p style={{ marginBottom: '16px' }}>
                            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>3. Purchases and Payments</h2>
                        <p style={{ marginBottom: '16px' }}>
                            All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time. Payment must be made at the time of order via our accepted payment methods.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>4. Limitation of Liability</h2>
                        <p style={{ marginBottom: '16px' }}>
                            To the fullest extent permitted by law, Papaz Vehicle Solutions shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the services.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>5. Governing Law</h2>
                        <p style={{ marginBottom: '16px' }}>
                            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [City/State].
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
