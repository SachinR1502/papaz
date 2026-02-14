'use client';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import AccountSidebar from '@/components/account/AccountSidebar';

export default function WishlistPage() {
    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '60px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '40px' }} className="account-grid">

                    <AccountSidebar />

                    {/* Content */}
                    <section>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px' }}>My Wishlist</h1>

                        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '3rem' }}>❤️</div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Your wishlist is empty</h3>
                                <p style={{ color: 'var(--text-muted)', margin: '8px 0 0' }}>Save items you love to buy later.</p>
                            </div>
                            <Link href="/shop" className="btn btn-primary" style={{ marginTop: '16px' }}>
                                Browse Shop
                            </Link>
                        </div>
                    </section>

                </div>
            </div>

            <style jsx global>{`
                @media (max-width: 768px) {
                    .account-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </main>
    );
}
