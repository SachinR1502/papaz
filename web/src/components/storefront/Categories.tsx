'use client';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/data/storefront';

export default function Categories() {
    const router = useRouter();

    const handleCategoryClick = (categoryName: string) => {
        // Map UI names to backend names if necessary
        let backendName = categoryName;
        if (categoryName === 'Tyres') backendName = 'Tires';
        if (categoryName === 'Oil & Fluids') backendName = 'Engine Oil';
        if (categoryName === 'Engine Parts') backendName = 'Spare Parts';

        router.push(`/search?category=${backendName}`);
    };

    return (
        <section style={{ padding: '120px 24px', background: 'var(--bg-body)', position: 'relative', overflow: 'hidden' }}>
            {/* Background Decorative Element */}
            <div style={{
                position: 'absolute',
                top: '50%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(255, 140, 0, 0.05) 0%, transparent 70%)',
                filter: 'blur(80px)',
                zIndex: 0
            }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.8rem)', fontWeight: 900, marginBottom: '16px', letterSpacing: '-2px', lineHeight: 1 }}>
                            Strategic <span style={{ color: 'var(--color-primary)' }}>Component</span> Groups
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', maxWidth: '650px', fontWeight: 500 }}>
                            Explore our curated selection of high-performance replacement parts and integrated vehicle systems.
                        </p>
                    </div>
                </div>

                <div className="categories-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '24px'
                }}>
                    {CATEGORIES.map((cat) => (
                        <div
                            key={cat.id}
                            className="glass-panel cat-card"
                            onClick={() => handleCategoryClick(cat.name)}
                            style={{
                                padding: '48px 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '24px',
                                cursor: 'pointer',
                                borderRadius: '32px',
                                textAlign: 'center',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-12px)';
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.background = 'rgba(255, 140, 0, 0.04)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.background = 'var(--bg-card)';
                            }}
                        >
                            <div style={{
                                fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                                marginBottom: '4px',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                                className="cat-icon"
                            >
                                {cat.icon}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--text-body)', letterSpacing: '-0.5px' }}>{cat.name}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Explore Catalogue →</span>
                            </div>

                            {/* Card Accent */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-20px',
                                right: '-20px',
                                width: '100px',
                                height: '100px',
                                background: 'var(--color-primary)',
                                opacity: 0,
                                filter: 'blur(40px)',
                                transition: 'opacity 0.4s ease'
                            }} className="cat-accent"></div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .cat-card:hover .cat-icon {
                    transform: scale(1.2) translateY(-5px);
                }
                .cat-card:hover .cat-accent {
                    opacity: 0.1 !important;
                }
                .cat-card:active {
                    transform: scale(0.96);
                }
                @media (max-width: 992px) {
                    section {
                        padding: 100px 16px !important;
                    }
                    .categories-grid {
                        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
                    }
                }
                @media (max-width: 640px) {
                    .categories-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 16px !important;
                    }
                    .cat-card {
                        padding: 32px 16px !important;
                        border-radius: 24px !important;
                    }
                }
            `}</style>
        </section>
    );
}
