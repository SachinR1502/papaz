'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AccountSidebar() {
    const { user } = useAuth();
    const pathname = usePathname();

    const links = [
        { name: 'My Orders', href: '/account/orders' },
        { name: 'Wishlist', href: '/account/wishlist' },
        { name: 'Manage Addresses', href: '/account/addresses' },
        { name: 'Settings', href: '/account/settings' }
    ];

    return (
        <aside>
            <div className="glass-panel" style={{ padding: '32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem', color: 'white', fontWeight: 800 }}>
                        {user?.name?.[0] || user?.profile?.fullName?.[0] || 'U'}
                    </div>
                    <h3 style={{ margin: 0 }}>{user?.name || user?.profile?.fullName || 'User'}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email || user?.phoneNumber || ''}</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {links.map(link => (
                        <Link
                            key={link.name}
                            href={link.href}
                            style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                background: pathname === link.href ? 'rgba(255,140,0,0.1)' : 'transparent',
                                color: pathname === link.href ? 'var(--color-primary)' : 'var(--text-muted)',
                                fontWeight: pathname === link.href ? 700 : 500,
                                transition: 'all 0.2s',
                                textDecoration: 'none'
                            }}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
