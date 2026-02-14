import Link from 'next/link';
import { SupplierProduct } from '@/types/models';

interface InventoryItemCardProps {
    item: SupplierProduct;
    currencySymbol?: string;
}

export default function InventoryItemCard({ item, currencySymbol = '₹' }: InventoryItemCardProps) {
    const isLowStock = item.quantity < 5;

    return (
        <div className="glass-panel" style={{
            padding: '24px',
            marginBottom: '16px',
            transition: 'transform 0.2s',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: 'var(--color-primary-light)',
                        opacity: 0.1, // This opacity actually hides the color, better to use RGBA
                        position: 'absolute'
                    }} />
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: 'rgba(255, 140, 0, 0.15)', // --color-primary with opacity
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary)',
                        fontSize: '1.5rem'
                    }}>
                        {item.type === 'Car' ? '🚗' : '🏍️'}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{item.name || 'Unknown Product'}</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {item.type || 'Spare'} Part
                        </span>
                    </div>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currencySymbol}{item.price}</span>
            </div>

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>📦</span>
                        <span style={{
                            color: isLowStock ? 'var(--status-error)' : 'var(--text-muted)',
                            fontWeight: 500
                        }}>
                            Stock: <strong style={{ color: isLowStock ? 'var(--status-error)' : 'var(--text-body)' }}>{item.quantity}</strong>
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>⏱️</span>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{item.localDeliveryTime || '2-3 Days'}</span>
                    </div>
                </div>

                <Link href={`/supplier/inventory/edit/${item.id}`}>
                    <button style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 140, 0, 0.15)',
                        color: 'var(--color-primary)',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                    }}>
                        Edit
                    </button>
                </Link>
            </div>
        </div>
    );
}
