'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
    CreditCard,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    Download,
    Filter,
    MoreVertical,
    ShieldCheck,
    Clock,
    IndianRupee,
    FileText,
    TrendingUp,
    ExternalLink
} from 'lucide-react';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await adminService.getAllTransactions();
            if (Array.isArray(data)) {
                setTransactions(data);
            } else if (data && typeof data === 'object' && Array.isArray((data as any).transactions)) {
                setTransactions((data as any).transactions);
            } else {
                console.warn('Unexpected API response format for transactions:', data);
                setTransactions([]);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        (t.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.customer || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ position: 'relative' }}>
            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>
                        Transactions
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '4px' }}>
                        View and manage all platform financial transactions
                    </p>
                </div>
                <button className="btn btn-secondary" style={{ borderRadius: '14px', padding: '12px 24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={18} /> Export CSV
                </button>
            </header>

            {/* Stats Summary Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ color: '#34c759', marginBottom: '12px' }}><TrendingUp size={24} /></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>TOTAL VOLUME (24H)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '4px' }}>₹1,24,500</div>
                </div>
                <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ color: 'var(--color-primary)', marginBottom: '12px' }}><ShieldCheck size={24} /></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>SECURITY DEPOSITS</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '4px' }}>₹4,50,000</div>
                </div>
            </div>

            {/* Controls Bar */}
            <div style={{ marginBottom: '32px', display: 'flex', gap: '16px' }}>
                <div className="glass-panel" style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '0 20px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                    <Search size={20} color="var(--color-primary)" opacity={0.6} />
                    <input
                        type="text"
                        placeholder="Search by Reference ID or Customer Name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '16px 0',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-body)',
                            outline: 'none',
                            fontWeight: 500
                        }}
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="glass-panel" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>USER</th>
                            <th style={thStyle}>AMOUNT</th>
                            <th style={thStyle}>STATUS</th>
                            <th style={thStyle}>DATE</th>
                            <th style={thStyle}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '100px' }}>
                                    <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(var(--color-primary-rgb), 0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                                </td>
                            </tr>
                        ) : filteredTransactions.length > 0 ? filteredTransactions.map((tx: any, index: number) => (
                            <tr key={tx.id || index} className="row-hover" style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: 'rgba(var(--color-primary-rgb), 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--color-primary)'
                                        }}>
                                            <CreditCard size={18} />
                                        </div>
                                        <span style={{ fontWeight: 800, color: 'var(--text-body)' }}>#{(tx.id || 'N/A').slice(-10).toUpperCase()}</span>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 700 }}>{tx.customer || tx.userName || 'Unknown Entity'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{tx.type || 'Fulfillment Payment'}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>₹{(tx.amount || 0).toLocaleString()}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34C759', fontWeight: 800, fontSize: '0.8rem' }}>
                                        <ShieldCheck size={16} /> SUCCESS
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 600 }}>{new Date(tx.createdAt || Date.now()).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(tx.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td style={tdStyle}>
                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                                    No transactions found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .row-hover:hover { background: rgba(255, 255, 255, 0.015); }
            `}</style>
        </div>
    );
}

const thStyle = {
    padding: '20px 24px',
    fontWeight: 800,
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    letterSpacing: '1px'
};

const tdStyle = {
    padding: '24px 24px',
    fontSize: '0.95rem'
};
