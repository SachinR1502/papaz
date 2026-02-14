'use client';
import { FEATURED_PRODUCTS } from '@/data/storefront';
import ProductCard from '@/components/ui/ProductCard';

export default function FeaturedProducts() {
    return (
        <section style={{ padding: '100px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '48px' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Hot Items 🔥</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Top selling parts for your vehicle this week</p>
                    </div>

                    <div style={{ display: 'flex', background: 'var(--bg-body)', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <button style={{
                            padding: '12px 28px',
                            borderRadius: '12px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>All Parts</button>
                        <button style={{
                            padding: '12px 28px',
                            borderRadius: '12px',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}>Car</button>
                        <button style={{
                            padding: '12px 28px',
                            borderRadius: '12px',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}>Bike</button>
                    </div>
                </div>

                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                    {FEATURED_PRODUCTS.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
