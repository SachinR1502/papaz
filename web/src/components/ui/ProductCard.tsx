import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

interface ProductCardProps {
    id: string | number;
    name: string;
    price: number;
    rating: number;
    image: string;
    category: string;
}

export default function ProductCard({ id, name, price, rating, image, category }: ProductCardProps) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart({ id, name, price, image, category });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="glass-panel" style={{
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            cursor: 'default'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(255, 140, 0, 0.3)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                height: '240px',
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {category}
                </div>
            </div>

            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <Link href={`/product/${id}`} style={{ flex: 1 }}>
                        <h3 style={{
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            margin: 0,
                            lineHeight: 1.3,
                            color: 'var(--text-body)',
                            transition: 'color 0.2s'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-body)'}
                        >
                            {name}
                        </h3>
                    </Link>
                    <div style={{
                        background: 'rgba(241, 196, 15, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#F1C40F',
                        fontSize: '0.9rem',
                        fontWeight: 700
                    }}>
                        <span>★</span> {rating}
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Price</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>₹{price.toLocaleString()}</span>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleAddToCart}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '14px',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: isAdded ? 'var(--status-success)' : 'var(--color-primary)'
                        }}
                    >
                        {isAdded ? (
                            <><span>✓</span> Added</>
                        ) : (
                            <><span>+</span> Add to Cart</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
