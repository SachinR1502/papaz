'use client';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{
            marginTop: 'auto',
            background: 'var(--bg-card)',
            padding: 'clamp(60px, 10vh, 120px) 24px clamp(30px, 5vh, 60px)',
            borderTop: '1px solid var(--border-color)',
            zIndex: 10,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Accent */}
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-5%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
                filter: 'blur(120px)',
                opacity: 0.03,
                zIndex: 0
            }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr repeat(3, 1fr)',
                    gap: 'clamp(40px, 5vw, 80px)',
                    marginBottom: '80px'
                }} className="footer-grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'var(--color-primary)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.4rem',
                                boxShadow: '0 8px 20px rgba(255, 140, 0, 0.2)'
                            }}>🏎️</div>
                            <span style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--text-body)' }}>PAPAZ</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.05rem', maxWidth: '340px', fontWeight: 500 }}>
                            India's premier integrated automotive ecosystem. Engineering the future of vehicle lifecycle management through technology.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <SocialIcon icon="FB" />
                            <SocialIcon icon="TW" />
                            <SocialIcon icon="IG" />
                            <SocialIcon icon="LN" />
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 900, marginBottom: '32px', fontSize: '0.9rem', color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '2px' }}>Catalogue</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '18px', padding: 0, fontSize: '1rem' }}>
                            <FooterLink href="#">Engine Systems</FooterLink>
                            <FooterLink href="#">Dynamic Braking</FooterLink>
                            <FooterLink href="#">Performance Tyres</FooterLink>
                            <FooterLink href="#">Digital Electronics</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 900, marginBottom: '32px', fontSize: '0.9rem', color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '2px' }}>Enterprise</h4>
                        <ul style={{ listStyle: 'none', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '18px', padding: 0, fontSize: '1rem' }}>
                            <FooterLink href="#">Our Methodology</FooterLink>
                            <FooterLink href="/supplier/onboarding">Supplier Network</FooterLink>
                            <FooterLink href="/technician/register">Service Partners</FooterLink>
                            <FooterLink href="#">Strategic Media</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 900, marginBottom: '32px', fontSize: '0.9rem', color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '2px' }}>Intelligence</h4>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500 }}>Receive technical insights and market updates.</p>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                background: 'var(--bg-body)',
                                padding: '8px',
                                borderRadius: '18px',
                                border: '1px solid var(--border-color)',
                                transition: 'border-color 0.3s'
                            }} className="newsletter-input-container">
                                <input type="email" placeholder="Email address" style={{
                                    flex: 1, padding: '10px 16px', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-body)', fontSize: '0.95rem', fontWeight: 500
                                }} />
                                <button className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '14px', fontWeight: 800 }}>Join</button>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '12px' }}>Refined updates. No spam.</span>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    paddingTop: '60px',
                    borderTop: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    fontWeight: 600
                }}>
                    <p style={{ letterSpacing: '0.5px' }}>&copy; {new Date().getFullYear()} Papaz Vehicle Solutions Pvt Ltd. Innovation in every rotation.</p>
                    <div style={{ display: 'flex', gap: '32px', fontSize: '0.85rem' }}>
                        <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
                        <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
                        <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Sustainability</Link>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .newsletter-input-container:focus-within {
                    border-color: var(--color-primary) !important;
                }
                @media (max-width: 1100px) {
                    .footer-grid {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 48px !important;
                    }
                }
                @media (max-width: 768px) {
                    footer {
                        padding: 80px 16px 40px !important;
                    }
                    .footer-grid {
                        grid-template-columns: 1fr !important;
                        gap: 56px !important;
                        text-align: center;
                    }
                    .footer-grid > div {
                        align-items: center !important;
                    }
                    .footer-grid ul {
                        align-items: center !important;
                    }
                    .newsletter-input-container {
                        width: 100% !important;
                    }
                }
            `}</style>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                display: 'inline-block'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
            >
                {children}
            </Link>
        </li>
    );
}

function SocialIcon({ icon }: { icon: string }) {
    return (
        <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--bg-body)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {icon}
        </div>
    );
}
