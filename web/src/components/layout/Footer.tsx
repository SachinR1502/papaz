'use client';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{
            marginTop: 'auto',
            background: 'var(--bg-card)',
            padding: '80px 24px 40px',
            borderTop: '1px solid var(--border-color)',
            zIndex: 10,
            position: 'relative'
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
                    <div style={{ gridColumn: 'span 1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <img
                                src="/icon.png"
                                alt="Papaz Logo"
                                style={{ width: '40px', height: '40px', borderRadius: '10px' }}
                            />
                            <span style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.5px', color: 'var(--text-body)' }}>PAPAZ</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                            The ultimate platform for vehicle service management. connecting garages, suppliers, and customers in one seamless ecosystem.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 800, marginBottom: '20px', fontSize: '1rem', color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shop</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, fontSize: '0.95rem' }}>
                            <li><Link href="#" className="footer-link">Engine Parts</Link></li>
                            <li><Link href="#" className="footer-link">Body Parts</Link></li>
                            <li><Link href="#" className="footer-link">Tyres & Wheels</Link></li>
                            <li><Link href="#" className="footer-link">Accessories</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 800, marginBottom: '20px', fontSize: '1rem', color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, fontSize: '0.95rem' }}>
                            <li><Link href="#" className="footer-link">About Us</Link></li>
                            <li><Link href="/supplier/onboarding" className="footer-link">Become a Supplier</Link></li>
                            <li><Link href="/technician/register" className="footer-link">For Technicians</Link></li>
                            <li><Link href="#" className="footer-link">Contact Support</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 800, marginBottom: '20px', fontSize: '1rem', color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Legal</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, fontSize: '0.95rem' }}>
                            <li><Link href="/legal/privacy-policy" className="footer-link">Privacy Policy</Link></li>
                            <li><Link href="/legal/terms-conditions" className="footer-link">Terms & Conditions</Link></li>
                            <li><Link href="/legal/refund-policy" className="footer-link">Refund Policy</Link></li>
                            <li><Link href="/legal/shipping-policy" className="footer-link">Shipping Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 800, marginBottom: '20px', fontSize: '1rem', color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stay Updated</h4>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.9rem' }}>Get the latest offers and updates.</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="email" placeholder="Your email address" style={{
                                flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-body)', color: 'var(--text-body)', minWidth: 0
                            }} />
                            <button className="btn btn-primary" style={{ padding: '12px 16px', borderRadius: '12px' }}>→</button>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'center', paddingTop: '40px', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <p>&copy; {new Date().getFullYear()} Papaz Vehicle Solutions. All rights reserved.</p>
                </div>
            </div>
            <style jsx global>{`
                .footer-link:hover {
                    color: var(--color-primary);
                    transition: color 0.2s;
                }
            `}</style>
        </footer>
    );
}
