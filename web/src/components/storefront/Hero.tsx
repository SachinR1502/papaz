'use client';

export default function Hero() {
    return (
        <section style={{
            position: 'relative',
            width: '100%',
            minHeight: '85vh',
            marginTop: '-85px',
            display: 'flex',
            alignItems: 'center',
            paddingTop: '85px', // Compensate for negative margin
            background: 'var(--bg-body)',
            overflow: 'hidden'
        }}>
            {/* Background Decorative Elements */}
            <div style={{
                position: 'absolute',
                top: 0, right: 0, bottom: 0, width: '60%',
                background: 'linear-gradient(90deg, var(--bg-body) 0%, transparent 100%), url(https://placehold.co/1920x1080/222/FFF?text=Auto+Parts)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.1,
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '50%',
                height: '140%',
                background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 60%)',
                opacity: 0.05,
                zIndex: 0,
                filter: 'blur(100px)'
            }}></div>

            <div className="container" style={{
                position: 'relative',
                zIndex: 2,
                paddingTop: '60px',
                paddingBottom: '80px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
                    <span style={{
                        background: 'rgba(255, 140, 0, 0.1)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(255, 140, 0, 0.2)',
                        padding: '8px 20px',
                        borderRadius: '100px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '32px',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 10px var(--color-primary)' }}></span>
                        India's #1 Auto Parts Store
                    </span>

                    <h1 style={{
                        fontSize: 'min(5rem, 12vw)',
                        fontWeight: 900,
                        marginBottom: '24px',
                        lineHeight: 1.1,
                        letterSpacing: '-2px',
                        color: 'var(--text-body)'
                    }}>
                        Keep Your Machine <br />
                        <span className="text-gradient" style={{
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundImage: 'linear-gradient(to right, #FF8C00, #FFD700, #FF8C00)',
                            backgroundSize: '200% auto'
                        }}>
                            Running Like New.
                        </span>
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-muted)',
                        marginBottom: '48px',
                        lineHeight: 1.6,
                        maxWidth: '600px',
                        fontWeight: 500
                    }}>
                        Authentic spare parts, certified technicians, and blazing fast delivery to your garage doorstep. Experience the future of auto care.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '60px', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" style={{
                            fontSize: '1.1rem',
                            padding: '16px 48px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            boxShadow: '0 10px 30px rgba(255, 140, 0, 0.25)'
                        }}>
                            Shop Now
                        </button>
                        <button style={{
                            fontSize: '1.1rem',
                            padding: '16px 40px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-body)',
                            cursor: 'pointer'
                        }}>
                            Book Service
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '60px', borderTop: '1px solid var(--border-color)', paddingTop: '32px' }}>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-body)' }}>10k+</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Genuine Parts</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-body)' }}>2hrs</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Avg Delivery</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-body)' }}>500+</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Verified Brands</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
