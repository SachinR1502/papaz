'use client';
import Link from 'next/link';
import { CATEGORIES } from '@/data/storefront';

export default function Categories() {
    return (
        <section style={{ padding: '100px 24px', position: 'relative' }}>
            {/* Decorative Background Element */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(255, 140, 0, 0.03) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Popular Categories</h2>
                    <Link href="#" className="btn-link" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                        View All Categories <span>→</span>
                    </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
                    {CATEGORIES.map((cat) => (
                        <div key={cat.id} className="glass-panel section-hover" style={{
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px',
                            cursor: 'pointer',
                            borderRadius: '24px',
                            textAlign: 'center',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            transition: 'all 0.3s'
                        }}>
                            <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>{cat.icon}</span>
                            <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
