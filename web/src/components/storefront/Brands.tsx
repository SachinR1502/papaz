'use client';
import { useRouter } from 'next/navigation';
import { BRANDS } from '@/data/storefront';

export default function Brands() {
    const router = useRouter();

    const handleBrandClick = (brandName: string) => {
        router.push(`/search?q=${brandName}`);
    };

    return (
        <section style={{ padding: '80px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="container">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '48px' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 900, marginBottom: '12px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                        Verified <span style={{ color: 'var(--color-primary)' }}>Manufacturer</span> Network
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: '700px', fontWeight: 500 }}>
                        Sourced directly from global industry leaders to ensure uncompromising quality and precision engineering.
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '20px',
                        overflowX: 'auto',
                        padding: '30px 0',
                        scrollbarWidth: 'none',
                        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                    }}
                    className="hide-scrollbar brands-scroll"
                >
                    {BRANDS.map((brand) => (
                        <div
                            key={brand.id}
                            onClick={() => handleBrandClick(brand.name)}
                            style={{
                                minWidth: '180px',
                                padding: '32px 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                borderRadius: '28px',
                                background: 'var(--bg-body)',
                                border: '1px solid var(--border-color)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexShrink: 0,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                            }}
                            className="brand-card shadow-hover"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 140, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
                            }}
                        >
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'white',
                                borderRadius: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                fontSize: '1.8rem',
                                fontWeight: 900,
                                color: '#111',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                                transition: 'all 0.3s ease'
                            }} className="brand-logo-container">
                                {brand.logo}
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-body)', letterSpacing: '-0.5px' }}>{brand.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .brand-card:active {
                    transform: scale(0.96) translateY(0);
                }
                .brand-card:hover .brand-logo-container {
                    transform: scale(1.1) rotate(5deg);
                }
                @media (max-width: 768px) {
                    section {
                        padding: 80px 16px !important;
                    }
                    .brands-scroll {
                        gap: 12px !important;
                        padding: 20px 0 !important;
                    }
                    .brand-card {
                        minWidth: 150px !important;
                        padding: 24px 16px !important;
                    }
                }
            `}</style>
        </section>
    );
}
