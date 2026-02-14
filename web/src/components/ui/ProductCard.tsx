import React from 'react';
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
    return (
        <div className="glass-panel" style={{
            overflow: 'hidden',
            transition: 'transform 0.2s',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <div style={{
                height: '200px',
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
            }}>
                <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    backdropFilter: 'blur(4px)'
                }}>
                    {category}
                </span>
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Link href={`/product/${id}`} style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0, lineHeight: 1.3 }}>{name}</h3>
                    </Link>
                    <span style={{ color: '#F1C40F', fontWeight: 600, display: 'flex', gap: '4px' }}>
                        <span>★</span> {rating}
                    </span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{price.toLocaleString()}</span>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                        onClick={() => addToCart({ id, name, price, image, category })}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
