'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
            <Navbar />

            <main style={{ flex: 1, paddingTop: '120px', paddingBottom: '80px' }}>
                <div className="container" style={{ padding: '0 24px' }}>
                    <div style={{ marginBottom: '48px' }}>
                        <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', fontWeight: 900, letterSpacing: '-2px', margin: 0, lineHeight: 1 }}>
                            Procurement <span style={{ color: 'var(--color-primary)' }}>Terminal</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '12px', fontWeight: 500 }}>
                            Review your selected high-performance components before final assembly.
                        </p>
                    </div>

                    {cart.length === 0 ? (
                        <div className="glass-panel" style={{
                            textAlign: 'center',
                            padding: '120px 40px',
                            borderRadius: '48px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '32px'
                        }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '40px',
                                background: 'rgba(255,140,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '4rem'
                            }}>🛒</div>
                            <div>
                                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '12px', letterSpacing: '-1px' }}>Inventory Empty</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '500px', fontWeight: 500 }}>Your digital procurement bag is empty. Start sourcing from our verified network.</p>
                            </div>
                            <Link href="/">
                                <div className="btn btn-primary" style={{ padding: '20px 52px', borderRadius: '18px', fontWeight: 900, fontSize: '1.1rem', textAlign: 'center' }}>Sourcing Network</div>
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '48px' }} className="cart-grid">
                            {/* Cart Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {cart.map((item: any) => (
                                    <div key={item.id} className="glass-panel cart-item-card" style={{
                                        display: 'flex',
                                        gap: '32px',
                                        padding: '32px',
                                        alignItems: 'center',
                                        borderRadius: '32px',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}>
                                        <div style={{
                                            width: '140px',
                                            height: '140px',
                                            borderRadius: '24px',
                                            backgroundImage: `url(${item.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            flexShrink: 0,
                                            border: '1px solid var(--border-color)'
                                        }} />

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.5px' }}>{item.name}</h3>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, background: 'var(--bg-body)', padding: '4px 12px', borderRadius: '8px' }}>
                                                        SKU: {item.id}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    style={{ border: 'none', background: 'transparent', color: '#e74c3c', fontWeight: 800, cursor: 'pointer', fontSize: '1.4rem', padding: '10px' }}
                                                    aria-label="Remove item"
                                                >×</button>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '16px',
                                                    background: 'var(--bg-body)',
                                                    padding: '8px 16px',
                                                    borderRadius: '16px',
                                                    border: '1px solid var(--border-color)'
                                                }}>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--text-body)', fontWeight: 900, width: '30px' }}
                                                    >-</button>
                                                    <span style={{ fontWeight: 900, minWidth: '30px', textAlign: 'center', fontSize: '1.1rem' }}>{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--text-body)', fontWeight: 900, width: '30px' }}
                                                    >+</button>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-primary)' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>₹{item.price.toLocaleString()} / unit</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div>
                                <div className="glass-panel" style={{
                                    position: 'sticky',
                                    top: '120px',
                                    padding: '40px',
                                    borderRadius: '40px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: '0 40px 100px rgba(0,0,0,0.1)'
                                }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '32px', letterSpacing: '-1px' }}>Order Analytics</h2>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.05rem' }}>
                                            <span>Subtotal ({totalItems} items)</span>
                                            <span style={{ color: 'var(--text-body)' }}>₹{totalPrice.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.05rem' }}>
                                            <span>Eco-Logistics</span>
                                            <span style={{ color: 'var(--status-success)', fontWeight: 800 }}>FREE</span>
                                        </div>
                                        <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.8rem', fontWeight: 900 }}>
                                            <span>Total</span>
                                            <span style={{ color: 'var(--color-primary)' }}>₹{totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '32px' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Discount Protocol</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder="Enter code"
                                                style={{
                                                    flex: 1,
                                                    padding: '14px 20px',
                                                    borderRadius: '16px',
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--bg-body)',
                                                    outline: 'none',
                                                    color: 'var(--text-body)',
                                                    fontWeight: 600,
                                                    transition: 'all 0.3s'
                                                }}
                                                className="promo-input"
                                            />
                                            <button className="btn btn-secondary" style={{ padding: '14px 24px', borderRadius: '16px', fontWeight: 800 }}>Apply</button>
                                        </div>
                                    </div>

                                    <Link href="/checkout">
                                        <div className="btn btn-primary" style={{ width: '100%', padding: '20px', borderRadius: '18px', fontWeight: 900, fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(255,140,0,0.2)', textAlign: 'center' }}>Execute Procurement</div>
                                    </Link>

                                    <div style={{ textAlign: 'center', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            🔒 End-to-end encrypted checkout
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                            By proceeding, you agree to the PAPAZ B2B Terms.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            <style jsx>{`
                .cart-item-card:hover {
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                    border-color: var(--color-primary) !important;
                    transform: translateX(8px);
                }
                .promo-input:focus {
                    border-color: var(--color-primary) !important;
                }
                @media (max-width: 992px) {
                    .cart-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
