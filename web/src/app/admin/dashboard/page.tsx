'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
    Activity,
    Users,
    Wrench,
    TrendingUp,
    Banknote,
    Clock,
    ChevronRight,
    ArrowUpRight,
    Search,
    Filter,
    MoreVertical,
    Target
} from 'lucide-react';

interface DashboardStats {
    totalCustomers: number;
    totalTechnicians: number;
    totalSuppliers: number;
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    pendingApprovals: number;
    totalRevenue: number;
    platformCommission: number;
    revenueHistory: any[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await adminService.getDashboard();
            setStats(data.stats);
            setRecentJobs(data.recentJobs);
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(var(--color-primary-rgb), 0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}></div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>INITIALIZING DASHBOARD...</p>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* Background Ambient Glow */}
            <div style={{
                position: 'fixed',
                bottom: '10%',
                right: '10%',
                width: '400px',
                height: '400px',
                background: 'var(--color-primary)',
                filter: 'blur(180px)',
                opacity: 0.04,
                zIndex: -1,
                pointerEvents: 'none'
            }} />

            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>
                        Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '4px' }}>
                        Platform governance & real-time operational overview
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ borderRadius: '14px', padding: '12px 20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={18} /> Analytics Suite
                    </button>
                </div>
            </header>

            {/* Core Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '48px'
            }}>
                <StatCard
                    title="Platform Revenue"
                    value={`₹${stats?.totalRevenue.toLocaleString()}`}
                    subtitle="Gross Transaction Value"
                    icon={<TrendingUp size={24} />}
                    color="#34c759"
                />
                <StatCard
                    title="System Commission"
                    value={`₹${stats?.platformCommission.toLocaleString()}`}
                    subtitle="Operational Revenue"
                    icon={<Banknote size={24} />}
                    color="#5856d6"
                />
                <StatCard
                    title="Workforce"
                    value={stats?.totalTechnicians.toString() || '0'}
                    subtitle={`${stats?.pendingApprovals} Pending Verification`}
                    icon={<Users size={24} />}
                    color="var(--color-primary)"
                />
                <StatCard
                    title="Active Traffic"
                    value={stats?.activeJobs.toString() || '0'}
                    subtitle="Jobs currently in transit"
                    icon={<Activity size={24} />}
                    color="#ff3b30"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '32px' }}>
                {/* Live Activity Stream */}
                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--color-primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                <Wrench size={20} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Recent Jobs</h2>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Live transactional activity</p>
                            </div>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '12px' }}>View Ledger</button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <tr>
                                    <th style={thStyle}>TRACE ID</th>
                                    <th style={thStyle}>STAKEHOLDERS</th>
                                    <th style={thStyle}>STATUS</th>
                                    <th style={thStyle}>VALUATION</th>
                                    <th style={thStyle}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentJobs.length > 0 ? recentJobs.map(job => (
                                    <tr key={job.id} className="row-hover" style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: 800, color: 'var(--text-body)', letterSpacing: '0.5px' }}>#{job.id.slice(-8).toUpperCase()}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{job.customer}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>→ {job.technician}</div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <StatusPill status={job.status} />
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 900, fontSize: '1rem' }}>₹{job.totalAmount.toLocaleString()}</div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <MoreVertical size={16} opacity={0.3} cursor="pointer" />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <Target size={40} opacity={0.2} style={{ marginBottom: '16px' }} />
                                            <div style={{ fontWeight: 600 }}>No live jobs detected</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* User Distribution */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Users size={20} color="var(--color-primary)" />
                            User Distribution
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <DistributionRow label="Direct Customers" value={stats?.totalCustomers || 0} total={stats ? stats.totalCustomers + stats.totalTechnicians + stats.totalSuppliers : 1} color="#007aff" />
                            <DistributionRow label="Service Experts" value={stats?.totalTechnicians || 0} total={stats ? stats.totalCustomers + stats.totalTechnicians + stats.totalSuppliers : 1} color="var(--color-primary)" />
                            <DistributionRow label="Parts Suppliers" value={stats?.totalSuppliers || 0} total={stats ? stats.totalCustomers + stats.totalTechnicians + stats.totalSuppliers : 1} color="#ff3b30" />
                        </div>

                        <div style={{ marginTop: '32px', padding: '20px', borderRadius: '20px', background: 'rgba(var(--color-primary-rgb), 0.05)', border: '1px solid rgba(var(--color-primary-rgb), 0.1)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>PLATFORM HEALTH</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34c759' }} />
                                <span style={{ fontWeight: 900, color: '#34c759', fontSize: '1rem' }}>OPTIMAL</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1), transparent)' }}>
                        <div style={{ marginBottom: '16px', color: 'var(--color-primary)' }}><Clock size={24} /></div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>System Integrity</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', fontWeight: 500 }}>
                            Daily automated audit of technician certifications and supplier listings is scheduled for 02:00 UTC.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .row-hover:hover { background: rgba(255, 255, 255, 0.015); }
            `}</style>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const isSuccess = status.toLowerCase() === 'completed' || status.toLowerCase() === 'active';
    const isWarn = status.toLowerCase() === 'preparing' || status.toLowerCase() === 'pending';

    return (
        <span style={{
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: 800,
            background: isSuccess ? 'rgba(52, 199, 89, 0.1)' : isWarn ? 'rgba(255, 149, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            color: isSuccess ? '#34c759' : isWarn ? '#ff9500' : 'var(--text-muted)',
            letterSpacing: '0.5px'
        }}>
            {status.toUpperCase()}
        </span>
    );
}

function StatCard({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
    return (
        <div className="glass-panel" style={{
            padding: '28px',
            borderRadius: '32px',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative element */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-10px',
                width: '80px',
                height: '80px',
                background: color,
                filter: 'blur(50px)',
                opacity: 0.1,
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color,
                    boxShadow: `inset 0 0 20px ${color}10`
                }}>
                    {icon}
                </div>
                <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.5px', margin: '0 0 4px' }}>{title.toUpperCase()}</p>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 2px', letterSpacing: '-0.5px' }}>{value}</h3>
                    <p style={{ color: color, fontSize: '0.75rem', fontWeight: 800, margin: 0, opacity: 0.8 }}>{subtitle}</p>
                </div>
            </div>
        </div>
    );
}

function DistributionRow({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
    const percentage = Math.round((value / total) * 100);
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-body)' }}>{label}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{value} users</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '100px', boxShadow: `0 0 10px ${color}40` }} />
            </div>
        </div>
    );
}

const thStyle = {
    padding: '16px 32px',
    textAlign: 'left' as const,
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: 800,
    letterSpacing: '1px'
};

const tdStyle = {
    padding: '24px 32px',
    fontSize: '0.95rem'
};
