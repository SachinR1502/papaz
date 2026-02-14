'use client';

import { useSupplier } from '@/context/SupplierContext';
import {
    Wallet,
    ArrowUpRight,
    TrendingUp,
    Clock,
    Banknote,
    ArrowDownRight,
    Search,
    Download,
    CreditCard,
    History,
    ShieldCheck
} from 'lucide-react';

export default function SupplierPaymentsPage() {
    const { walletBalance } = useSupplier();

    return (
        <div style={{ padding: '40px', minHeight: '100vh', position: 'relative' }}>
            {/* Ambient Background */}
            <div style={{
                position: 'fixed',
                top: '5%',
                right: '5%',
                width: '400px',
                height: '400px',
                background: 'var(--color-primary)',
                filter: 'blur(160px)',
                opacity: 0.03,
                zIndex: -1,
                pointerEvents: 'none'
            }} />

            <header style={{ marginBottom: '48px' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1.5px' }}>
                    Finance & Payouts
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                    Manage your revenue, tracking earnings and direct bank transfers.
                </p>
            </header>

            {/* Financial Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '48px' }}>
                <div className="glass-panel card-hover" style={{
                    background: 'linear-gradient(135deg, var(--color-primary), #5856D6)',
                    color: 'white',
                    border: 'none',
                    padding: '36px',
                    borderRadius: '40px',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '260px'
                }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.15, transform: 'rotate(-15deg)' }}>
                        <Wallet size={200} />
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.9, marginBottom: '8px' }}>
                            <Wallet size={18} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px' }}>AVAILABLE BALANCE</span>
                        </div>
                        <div style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-2px' }}>
                            ₹{walletBalance.toLocaleString()}
                        </div>
                    </div>

                    <button className="btn" style={{
                        background: 'white',
                        color: 'var(--color-primary)',
                        marginTop: '32px',
                        borderRadius: '20px',
                        padding: '16px 32px',
                        fontWeight: 900,
                        fontSize: '1rem',
                        width: 'fit-content',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }}>
                        Instant Withdrawal <ArrowUpRight size={20} />
                    </button>
                </div>

                <div className="glass-panel" style={{ padding: '36px', borderRadius: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            <TrendingUp size={18} color="#34C759" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px' }}>LIFETIME GENERATED</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4px' }}>₹4,50,000</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34C759', fontSize: '0.9rem', fontWeight: 800 }}>
                            <ArrowUpRight size={16} /> +12% growth vs last month
                        </div>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border-color)', opacity: 0.5 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Auto-settlement status</span>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-primary)', marginTop: '4px' }}>NEXT MONDAY</div>
                        </div>
                        <Clock size={24} opacity={0.3} />
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '36px', borderRadius: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            <Banknote size={18} color="#FF9500" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px' }}>PENDING SETTLEMENT</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4px' }}>₹12,400</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                            In-transit from customer payments
                        </div>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border-color)', opacity: 0.5 }} />
                    <button className="btn btn-secondary" style={{ width: '100%', borderRadius: '18px', padding: '14px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.08)' }}>
                        View Detailed Breakdown
                    </button>
                </div>
            </div>

            {/* Transaction History Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <History size={24} color="var(--color-primary)" />
                            Transaction & Payout History
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Detailed logs of all financial movements on your portal.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', borderRadius: '12px' }}>
                            <Search size={16} opacity={0.5} />
                            <input type="text" placeholder="Ref ID..." style={{ background: 'transparent', border: 'none', color: 'white', padding: '10px 0', outline: 'none', fontSize: '0.9rem' }} />
                        </div>
                        <button className="btn btn-secondary" style={{ borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={18} /> Export
                        </button>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={thStyle}>PAYOUT DATE</th>
                                <th style={thStyle}>REFERENCE ID</th>
                                <th style={thStyle}>BANK DESTINATION</th>
                                <th style={thStyle}>NET AMOUNT</th>
                                <th style={thStyle}>GATEWAY STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { date: 'Feb 01, 2026', ref: '#PAY-9921', bank: 'HDFC BANK **** 4321', amount: '45,000', status: 'COMPLETED' },
                                { date: 'Jan 15, 2026', ref: '#PAY-8812', bank: 'ICICI BANK **** 9912', amount: '32,000', status: 'COMPLETED' },
                                { date: 'Jan 01, 2026', ref: '#PAY-7761', bank: 'HDFC BANK **** 4321', amount: '58,400', status: 'COMPLETED' }
                            ].map((row, i) => (
                                <tr key={i} className="row-hover" style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 700 }}>{row.date}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>02:14 PM</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 800, color: 'var(--text-body)' }}>{row.ref}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CreditCard size={16} color="var(--color-primary)" />
                                            </div>
                                            <div style={{ fontWeight: 600 }}>{row.bank}</div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>₹{row.amount}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34C759', fontWeight: 800, fontSize: '0.8rem' }}>
                                            <ShieldCheck size={16} /> {row.status}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <style jsx>{`
                .row-hover:hover {
                    background: rgba(255, 255, 255, 0.015);
                }
            `}</style>
        </div>
    );
}

const thStyle = {
    padding: '24px',
    fontWeight: 800,
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    letterSpacing: '1.5px'
};

const tdStyle = {
    padding: '28px 24px',
    fontSize: '0.95rem'
};
