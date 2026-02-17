'use client';
import Link from 'next/link';

export default function CTA() {
    return (
        <section style={{ padding: 'clamp(100px, 15vh, 160px) 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #FF4500 100%)',
                opacity: 0.1,
                zIndex: 0
            }}></div>

            {/* Decorative Animated Elements */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
                filter: 'blur(120px)',
                opacity: 0.15,
                zIndex: 0,
                animation: 'pulse 10s infinite alternate'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, #7E57C2 0%, transparent 70%)',
                filter: 'blur(120px)',
                opacity: 0.12,
                zIndex: 0,
                animation: 'pulse 8s infinite alternate-reverse'
            }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '1000px' }}>
                <div style={{
                    background: 'var(--bg-card)',
                    padding: 'clamp(56px, 10vw, 100px) clamp(24px, 6vw, 60px)',
                    borderRadius: '48px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
                    backdropFilter: 'blur(32px)',
                    position: 'relative',
                    overflow: 'hidden'
                }} className="cta-card glass-panel">
                    {/* Inner Accent */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '300px',
                        height: '4px',
                        background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
                        borderRadius: '0 0 100px 100px'
                    }}></div>

                    <h2 style={{
                        fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
                        fontWeight: 900,
                        marginBottom: '24px',
                        letterSpacing: '-2.5px',
                        lineHeight: 1,
                        color: 'var(--text-body)'
                    }}>
                        Scale Your <span style={{ color: 'var(--color-primary)' }}>Automotive</span> Vision.
                    </h2>
                    <p style={{
                        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                        color: 'var(--text-muted)',
                        marginBottom: '56px',
                        lineHeight: 1.7,
                        maxWidth: '750px',
                        margin: '0 auto 56px',
                        fontWeight: 500
                    }}>
                        Integrate with India's most advanced B2B auto-network. Verified sourcing, rapid logistics, and tech-driven partner growth.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }} className="cta-actions">
                        <Link href="/supplier/onboarding">
                            <button className="btn btn-primary" style={{
                                padding: '20px 52px',
                                fontSize: '1.1rem',
                                borderRadius: '18px',
                                fontWeight: 900,
                                boxShadow: '0 10px 30px rgba(255, 140, 0, 0.25)'
                            }}>
                                Join Supplier Hub
                            </button>
                        </Link>
                        <Link href="/technician/register">
                            <button style={{
                                padding: '20px 48px',
                                fontSize: '1.1rem',
                                borderRadius: '18px',
                                fontWeight: 900,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-body)',
                                cursor: 'pointer',
                                backdropFilter: 'blur(12px)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                                className="cta-secondary-btn"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Partner Registration
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes pulse {
                    from { transform: scale(1); opacity: 0.12; }
                    to { transform: scale(1.15); opacity: 0.25; }
                }
                @media (max-width: 768px) {
                    section {
                        padding: 80px 16px !important;
                    }
                    .cta-card {
                        border-radius: 32px !important;
                        padding: 50px 24px !important;
                    }
                    .cta-actions {
                        width: 100%;
                    }
                    .cta-actions a, .cta-actions button {
                        width: 100%;
                    }
                }
            `}</style>
        </section>
    );
}
