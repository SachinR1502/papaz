'use client';

export default function Hero() {
    return (
        <section style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-body)',
            overflow: 'hidden',
            padding: 'clamp(100px, 15vh, 180px) 0 clamp(60px, 10vh, 120px)'
        }}>
            {/* Animated Background Gradients - More Vibrant */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '60%',
                height: '80%',
                background: 'radial-gradient(circle, rgba(255, 140, 0, 0.18) 0%, transparent 70%)',
                filter: 'blur(100px)',
                zIndex: 0,
                animation: 'pulse 12s infinite alternate'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                left: '-10%',
                width: '50%',
                height: '70%',
                background: 'radial-gradient(circle, rgba(74, 20, 140, 0.12) 0%, transparent 70%)',
                filter: 'blur(100px)',
                zIndex: 0,
                animation: 'pulse 10s infinite alternate-reverse'
            }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '80px', alignItems: 'center' }} className="responsive-hero">
                    <div className="animate-fade-in" style={{ textAlign: 'left' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'rgba(255, 140, 0, 0.12)',
                            border: '1px solid rgba(255, 140, 0, 0.25)',
                            padding: '10px 24px',
                            borderRadius: '100px',
                            marginBottom: '40px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 20px rgba(255, 140, 0, 0.05)'
                        }} className="hero-badge">
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF8C00', boxShadow: '0 0 15px #FF8C00' }} className="ping-animation"></span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                India's Premier Auto Ecosystem
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2.8rem, 8vw, 5.8rem)',
                            fontWeight: 900,
                            lineHeight: 1.05,
                            letterSpacing: '-3px',
                            marginBottom: '28px',
                            color: 'var(--text-body)',
                            maxWidth: '900px'
                        }}>
                            Precision Engineering <br />
                            <span style={{ color: 'var(--color-primary)' }}>Exceptional</span> Service.
                        </h1>

                        <p style={{
                            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                            color: 'var(--text-muted)',
                            lineHeight: 1.7,
                            marginBottom: '48px',
                            maxWidth: '650px',
                            fontWeight: 500
                        }}>
                            Unlock a world of premium spare parts, industrial-grade tools, and verified technician expertise. From express delivery to AI-assisted diagnostics, we redefine how India moves.
                        </p>

                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }} className="hero-buttons">
                            <button className="btn btn-primary" style={{ padding: '20px 52px', borderRadius: '18px', fontSize: '1.1rem', fontWeight: 800 }}>
                                Explore Store
                            </button>
                            <button style={{
                                padding: '20px 48px',
                                borderRadius: '18px',
                                fontSize: '1.1rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-body)',
                                fontWeight: 800,
                                cursor: 'pointer',
                                backdropFilter: 'blur(12px)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                                className="hero-secondary-btn"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Book Technician
                            </button>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '60px',
                            marginTop: '80px',
                            paddingTop: '48px',
                            borderTop: '1px solid var(--border-color)',
                            flexWrap: 'wrap'
                        }} className="hero-stats">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-body)' }}>24k+</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Global Brands</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-body)' }}>4.95/5</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Satisfaction</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--text-body)' }}>20m</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Delivery</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block animate-fade-in delay-200" style={{ position: 'relative' }}>
                        <div className="hero-image-wrapper" style={{
                            width: '100%',
                            aspectRatio: '0.9',
                            borderRadius: '50px',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                            position: 'relative',
                            overflow: 'visible',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
                        }}>
                            <img
                                src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=1000"
                                alt="Premium Vehicle Engine"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '48px',
                                    filter: 'contrast(1.1) brightness(0.85)',
                                    transform: 'scale(1.02)'
                                }}
                            />

                            {/* Floating Analytics Card */}
                            <div className="glass-panel highlight floating-card" style={{
                                position: 'absolute',
                                bottom: '60px',
                                right: '-40px',
                                padding: '28px',
                                width: '280px',
                                borderRadius: '32px',
                                background: 'rgba(20,20,20,0.85)',
                                border: '1px solid rgba(255,140,0,0.4)',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(20px)'
                            }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'var(--color-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>⚙️</div>
                                    <div>
                                        <p style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '2px' }}>Turbo G-32</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>In Transit - Now</p>
                                    </div>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                                    <div style={{ width: '85%', height: '100%', background: 'var(--color-primary)', borderRadius: '10px' }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                    <span>Track Order</span>
                                    <span style={{ color: 'var(--color-primary)' }}>85% Complete</span>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div style={{
                                position: 'absolute',
                                top: '-30px',
                                left: '-30px',
                                background: 'rgba(255,140,0,0.1)',
                                border: '1px solid var(--color-primary)',
                                padding: '12px 24px',
                                borderRadius: '20px',
                                backdropFilter: 'blur(10px)',
                                fontWeight: 900,
                                fontSize: '0.8rem',
                                color: 'var(--text-body)'
                            }}>
                                VERIFIED SOURCING ✅
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    from { transform: scale(1); opacity: 0.15; }
                    to { transform: scale(1.15); opacity: 0.28; }
                }
                @keyframes ping {
                    0% { transform: scale(1); opacity: 1; }
                    70%, 100% { transform: scale(2.5); opacity: 0; }
                }
                .ping-animation {
                    position: relative;
                }
                .ping-animation::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    background: inherit;
                    border-radius: inherit;
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                .floating-card {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(-2deg); }
                    50% { transform: translateY(-20px) rotate(1deg); }
                }
                @media (max-width: 992px) {
                    .responsive-hero {
                        grid-template-columns: 1fr !important;
                        text-align: center;
                    }
                    .responsive-hero p {
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
                    .responsive-hero > div:first-child {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .hero-buttons {
                        justify-content: center !important;
                    }
                    .hero-stats {
                        justify-content: center !important;
                        gap: 40px !important;
                    }
                    .hero-badge {
                        margin-bottom: 24px !important;
                    }
                }
                @media (max-width: 576px) {
                    .hero-stats {
                        gap: 30px !important;
                    }
                    .hero-buttons {
                        flex-direction: column;
                        width: 100%;
                    }
                    .hero-buttons button {
                        width: 100%;
                    }
                }
            `}</style>
        </section>
    );
}
