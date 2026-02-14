'use client';
import Link from 'next/link';

export default function CTA() {
    return (
        <section style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #FF4500 100%)',
                opacity: 0.05,
                zIndex: 0
            }}></div>
            <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-1px' }}>
                    Join the Papaz Network
                </h2>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: 1.6 }}>
                    Whether you're a garage owner, a parts supplier, or a skilled technician, Papaz provides the tools you need to grow your business.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/supplier/onboarding">
                        <button className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '12px', fontWeight: 700 }}>
                            Become a Seller
                        </button>
                    </Link>
                    <Link href="/technician/register">
                        <button style={{
                            padding: '16px 40px', fontSize: '1.1rem', borderRadius: '12px', fontWeight: 700,
                            background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-body)', cursor: 'pointer'
                        }}>
                            For Technicians
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
