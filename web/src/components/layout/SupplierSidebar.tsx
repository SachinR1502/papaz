'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SupplierNavLinkProps {
    href: string;
    icon: string;
    label: string;
    active?: boolean;
}

function SupplierNavLink({ href, icon, label, active = false }: SupplierNavLinkProps) {
    return (
        <Link href={href} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            textDecoration: 'none',
            color: active ? 'white' : 'var(--text-muted)',
            background: active ? 'var(--color-primary)' : 'transparent',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => !active && (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => !active && (e.currentTarget.style.background = 'transparent')}
        >
            <span style={{ fontSize: '1.1rem', opacity: active ? 1 : 0.7 }}>{icon}</span>
            <span>{label}</span>
        </Link>
    );
}

export default function SupplierSidebar() {
    const pathname = usePathname();

    return (
        <aside style={{
            width: '260px',
            borderRight: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.01)',
            padding: '32px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            flexShrink: 0
        }}>
            <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', paddingLeft: '16px', marginBottom: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Management</p>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <SupplierNavLink href="/supplier/dashboard" icon="📊" label="Dashboard" active={pathname === '/supplier/dashboard'} />
                    <SupplierNavLink href="/supplier/orders" icon="📦" label="Orders" active={pathname === '/supplier/orders'} />
                    <SupplierNavLink href="/supplier/inventory" icon="⚙️" label="Inventory" active={pathname.includes('/supplier/inventory')} />
                </nav>
            </div>

            <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', paddingLeft: '16px', marginBottom: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Financials</p>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <SupplierNavLink href="/supplier/payments" icon="💰" label="Payments" active={pathname === '/supplier/payments'} />
                    <SupplierNavLink href="/supplier/profile" icon="👤" label="Store Settings" active={pathname === '/supplier/profile'} />
                </nav>
            </div>

            <div style={{ marginTop: 'auto', padding: '16px' }}>
                <div className="glass-panel" style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0, 122, 255, 0.05)', border: '1px solid rgba(0, 122, 255, 0.1)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--color-primary)' }}>Need Help?</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Contact partner support at support@papaz.com</p>
                </div>
            </div>
        </aside>
    );
}
