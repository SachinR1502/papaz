'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { customerService } from '@/services/customerService';
import ProductCard from '@/components/ui/ProductCard';

export default function FeaturedProducts() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || 'All';

    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categories = ['All', 'Batteries', 'Tires', 'Engine Oil', 'Brakes', 'Spare Parts', 'Accessories'];

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setActiveCategory(cat);
        fetchProducts();
    }, [searchParams, activeCategory]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const params: any = {};
            if (activeCategory !== 'All') {
                params.category = activeCategory;
            }

            const urlSearch = searchParams.get('search');
            if (urlSearch) {
                params.search = urlSearch;
            }

            const data = await customerService.getProducts(params);
            setProducts(data);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="products" style={{ padding: 'clamp(80px, 12vh, 120px) 24px', background: 'var(--bg-body)', position: 'relative', overflow: 'hidden' }}>
            {/* Background Decorative Element */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(255, 140, 0, 0.03) 0%, transparent 70%)',
                filter: 'blur(100px)',
                zIndex: 0
            }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '64px' }}>
                    <div className="hero-badge" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 140, 0, 0.1)',
                        padding: '8px 20px',
                        borderRadius: '100px',
                        marginBottom: '24px',
                        border: '1px solid rgba(255, 140, 0, 0.2)'
                    }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Pick of the Week</span>
                    </div>

                    <h2 style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', fontWeight: 900, marginBottom: '20px', letterSpacing: '-2px', lineHeight: 1.1 }}>
                        Premium <span style={{ color: 'var(--color-primary)' }}>Hardware</span> & Parts
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', maxWidth: '700px', fontWeight: 500, lineHeight: 1.6 }}>
                        Precision-engineered components sourced from elite global manufacturers for professional performance.
                    </p>

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        background: 'var(--bg-card)',
                        padding: '8px',
                        borderRadius: '24px',
                        marginTop: '48px',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        overflowX: 'auto',
                        maxWidth: '100%',
                        scrollbarWidth: 'none',
                        backdropFilter: 'blur(20px)'
                    }} className="hide-scrollbar category-selector">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: '12px 32px',
                                    borderRadius: '18px',
                                    background: activeCategory === cat ? 'var(--color-primary)' : 'transparent',
                                    color: activeCategory === cat ? 'white' : 'var(--text-muted)',
                                    border: 'none',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    whiteSpace: 'nowrap',
                                    boxShadow: activeCategory === cat ? '0 8px 20px rgba(255, 140, 0, 0.3)' : 'none'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px', minHeight: '400px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="skeleton-card" style={{
                                height: '420px',
                                borderRadius: '32px',
                                background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--border-color) 50%, var(--bg-card) 75%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 2s infinite linear'
                            }} />
                        ))}
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '80px', background: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
                        <p style={{ color: 'var(--status-error)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '24px' }}>{error}</p>
                        <button onClick={fetchProducts} className="btn btn-primary" style={{ padding: '16px 40px', borderRadius: '14px' }}>Try Again</button>
                    </div>
                ) : (
                    <div className="product-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '32px',
                        minHeight: '400px'
                    }}>
                        {products.map((product) => (
                            <div key={product.id || product._id} className="animate-fade-in" style={{ height: '100%' }}>
                                <ProductCard {...product} id={product.id || product._id} />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '100px 24px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div style={{ fontSize: '4rem', filter: 'grayscale(1)' }}>📦</div>
                        <div>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>Stock currently unavailable</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px' }}>Our suppliers are updating their inventories. Try selecting a different category or browsing our global catalog.</p>
                        </div>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @media (max-width: 768px) {
                    section {
                        padding: 80px 16px !important;
                    }
                    .category-selector {
                        padding: 6px !important;
                        margin-top: 32px !important;
                        border-radius: 20px !important;
                    }
                    .category-selector button {
                        padding: 10px 24px !important;
                        border-radius: 14px !important;
                    }
                    .product-grid {
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
                        gap: 20px !important;
                    }
                }
            `}</style>
        </section>
    );
}
