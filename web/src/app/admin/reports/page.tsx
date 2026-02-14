'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
    PieChart,
    TrendingUp,
    Calendar,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Target,
    Users,
    Wrench,
    IndianRupee,
    BarChart3
} from 'lucide-react';

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('7');

    useEffect(() => {
        fetchReports();
    }, [period]);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getReports(period);
            setReports(data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>
                        Reports
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '4px' }}>
                        Platform performance and growth analytics
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="glass-panel" style={{ display: 'flex', borderRadius: '14px', padding: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                        {[
                            { label: '7D', value: '7' },
                            { label: '30D', value: '30' },
                            { label: '90D', value: '90' },
                            { label: '1Y', value: '365' }
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setPeriod(opt.value)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: period === opt.value ? 'var(--color-primary)' : 'transparent',
                                    color: period === opt.value ? 'white' : 'var(--text-muted)',
                                    fontWeight: 800,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '20px' }}>
                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(var(--color-primary-rgb), 0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}></div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>LOADING DATA...</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* Top Row: Core Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        <ReportStatCard
                            title="Total Revenue"
                            value={`₹${(reports?.totalVolume || 0).toLocaleString()}`}
                            growth="+18.4%"
                            icon={<TrendingUp size={24} />}
                            trend="up"
                        />
                        <ReportStatCard
                            title="Net Earnings"
                            value={`₹${(reports?.netEarnings || 0).toLocaleString()}`}
                            growth="+12.1%"
                            icon={<IndianRupee size={24} />}
                            trend="up"
                        />
                        <ReportStatCard
                            title="Conversion"
                            value="84.2%"
                            growth="+2.4%"
                            icon={<Target size={24} />}
                            trend="up"
                        />
                        <ReportStatCard
                            title="Churn Rate"
                            value="1.2%"
                            growth="-0.5%"
                            icon={<Activity size={24} />}
                            trend="down"
                        />
                    </div>

                    {/* Mid Section: Charts & Detailed Data */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
                        <div className="glass-panel" style={{ padding: '40px', borderRadius: '32px', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                            <BarChart3 size={64} opacity={0.1} color="var(--color-primary)" style={{ marginBottom: '24px' }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px' }}>Transaction Volume</h3>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontWeight: 500 }}>
                                Transaction data for the selected {period}-day period.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px' }}>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: '24px' }}>TRAFFIC SOURCE</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <SourceRow label="Organic" value="45%" color="var(--color-primary)" />
                                    <SourceRow label="Referral" value="32%" color="#5856D6" />
                                    <SourceRow label="Direct" value="23%" color="#007AFF" />
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1), transparent)' }}>
                                <div style={{ color: 'var(--color-primary)', marginBottom: '16px' }}><Download size={24} /></div>
                                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>Download Report</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', fontWeight: 500, marginBottom: '20px' }}>
                                    Export a detailed PDF report for the current period.
                                </p>
                                <button className="btn btn-primary" style={{ width: '100%', borderRadius: '12px', padding: '12px', fontWeight: 800 }}>
                                    Export PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ReportStatCard({ title, value, growth, icon, trend }: { title: string, value: string, growth: string, icon: React.ReactNode, trend: 'up' | 'down' }) {
    return (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ color: 'var(--color-primary)', background: 'rgba(var(--color-primary-rgb), 0.1)', padding: '12px', borderRadius: '14px' }}>{icon}</div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: trend === 'up' ? '#34c759' : '#ff3b30',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    background: trend === 'up' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '8px'
                }}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {growth}
                </div>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>{title.toUpperCase()}</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900 }}>{value}</div>
        </div>
    );
}

function SourceRow({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-body)' }}>{label}</span>
                <span style={{ fontWeight: 800 }}>{value}</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ width: value, height: '100%', background: color, borderRadius: '100px' }} />
            </div>
        </div>
    );
}
