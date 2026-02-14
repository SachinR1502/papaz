'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '60px 24px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '40px' }}>Your Shopping Bag</h1>

                {cart.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '100px 40px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '10px' }}>Your bag is empty</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Looks like you haven't added anything yet.</p>
                        <Link href="/">
                            <button className="btn btn-primary">Start Shopping</button>
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                        {/* Cart Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {cart.map(item => (
                                <div key={item.id} className="glass-panel" style={{
                                    display: 'flex',
                                    gap: '24px',
                                    padding: '24px',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '16px',
                                        backgroundImage: `url(${item.image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        flexShrink: 0
                                    }} />

                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>{item.name}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Part ID: {item.id}</p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                background: 'var(--bg-card)',
                                                padding: '4px 12px',
                                                borderRadius: '100px',
                                                border: '1px solid var(--border-color)'
                                            }}>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-body)' }}
                                                >-</button>
                                                <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-body)' }}
                                                >+</button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                style={{ border: 'none', background: 'transparent', color: 'var(--status-error)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                                            >Remove</button>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>₹{item.price.toLocaleString()} / unit</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div>
                            <div className="glass-panel" style={{ position: 'sticky', top: '120px', padding: '32px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Order Summary</h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                        <span>Subtotal ({totalItems} items)</span>
                                        <span>₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                        <span>Shipping</span>
                                        <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>FREE</span>
                                    </div>
                                    <div style={{ height: '1px', background: 'var(--border-color)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 800 }}>
                                        <span>Total</span>
                                        <span>₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>Coupon Code</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Enter code"
                                            style={{
                                                flex: 1,
                                                padding: '10px 16px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-card)',
                                                outline: 'none',
                                                color: 'var(--text-body)'
                                            }}
                                        />
                                        <button className="btn btn-secondary" style={{ padding: '10px 16px' }}>Apply</button>
                                    </div>
                                </div>

                                <Link href="/checkout">
                                    <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>Proceed to Checkout</button>
                                </Link>

                                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '16px' }}>
                                    🔒 Secure checkout with 256-bit encryption
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
