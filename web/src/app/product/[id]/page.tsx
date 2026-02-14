'use client';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

// Mock data fetch helper
const getProduct = (id: string) => {
    return {
        id,
        name: 'Brembo High Performance Brake Pads',
        price: 3500,
        rating: 4.9,
        reviews: 128,
        category: 'Brakes',
        brand: 'Brembo',
        description: 'Brembo High Performance brake pads provide incredible stopping power and consistent performance under extreme conditions. Designed for luxury vehicles and performance-oriented driving.',
        specs: [
            { key: 'Material', value: 'Semi-Metallic' },
            { key: 'Vehicle Compatibility', value: 'BMW 3 Series, Audi A4, Mercedes C-Class' },
            { key: 'Wear Indicator', value: 'Electronic' },
            { key: 'Position', value: 'Front Axle' }
        ],
        images: [
            'https://placehold.co/800x600/1e1e1e/FFF?text=Main+Image',
            'https://placehold.co/800x600/1e1e1e/FFF?text=Close+Up',
            'https://placehold.co/800x600/1e1e1e/FFF?text=Label'
        ]
    };
};

export default function ProductDetail() {
    const { id } = useParams();
    const product = getProduct(id as string);
    const { addToCart } = useCart();
    const [activeImage, setActiveImage] = useState(0);

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px' }}>

                    {/* Gallery */}
                    <div>
                        <div className="glass-panel" style={{
                            height: '500px',
                            borderRadius: '32px',
                            backgroundImage: `url(${product.images[activeImage]})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            marginBottom: '20px',
                            border: 'none'
                        }} />
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {product.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className="glass-panel"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        backgroundImage: `url(${img})`,
                                        backgroundSize: 'cover',
                                        cursor: 'pointer',
                                        border: activeImage === idx ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                                        opacity: activeImage === idx ? 1 : 0.6
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            {product.brand} • {product.category}
                        </span>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '12px 0 20px', lineHeight: 1.1 }}>{product.name}</h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800 }}>₹{product.price.toLocaleString()}</div>
                            <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#F1C40F', fontSize: '1.2rem' }}>★★★★★</span>
                                <span style={{ fontWeight: 600 }}>{product.rating}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({product.reviews} reviews)</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '40px' }}>
                            {product.description}
                        </p>

                        <div style={{ display: 'flex', gap: '16px', marginBottom: '60px' }}>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 2, padding: '18px', fontSize: '1.1rem' }}
                                onClick={() => addToCart({ ...product, image: product.images[0] })}
                            >
                                Add to Bag
                            </button>
                            <button className="btn btn-secondary" style={{ flex: 1, padding: '18px' }}>
                                Wishlist
                            </button>
                        </div>

                        <div className="glass-panel" style={{ padding: '32px' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Technical Specifications</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {product.specs.map((spec, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{spec.key}</span>
                                        <span style={{ fontWeight: 600 }}>{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
