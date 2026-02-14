'use client';
import { BRANDS } from '@/data/storefront';

export default function Brands() {
    return (
        <section style={{ padding: '100px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>Shop by Brand</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Select your vehicle manufacturer to find compatible parts</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '32px', overflowX: 'auto', paddingBottom: '20px', scrollbarWidth: 'none' }} className="hide-scrollbar">
                    {BRANDS.map((brand) => (
                        <div key={brand.id} className="glass-panel hover-card" style={{
                            minWidth: '160px',
                            height: '160px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            borderRadius: '32px',
                            flexShrink: 0,
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-body)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{
                                width: '70px',
                                height: '70px',
                                background: 'var(--bg-card)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                fontSize: '2rem',
                                fontWeight: 900,
                                color: 'var(--color-primary)'
                            }}>
                                {brand.logo}
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-body)' }}>{brand.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
