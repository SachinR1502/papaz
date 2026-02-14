'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
    Wrench,
    Search,
    Filter,
    ExternalLink,
    MoreVertical,
    Clock,
    CheckCircle2,
    XCircle,
    Activity,
    MapPin,
    IndianRupee,
    Calendar,
    ChevronRight,
    LayoutGrid
} from 'lucide-react';

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await adminService.getAllJobs();
            if (Array.isArray(data)) {
                setJobs(data);
            } else if (data && typeof data === 'object' && Array.isArray((data as any).jobs)) {
                setJobs((data as any).jobs);
            } else {
                console.warn('Unexpected API response format for jobs:', data);
                setJobs([]);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = (job.id || '').toLowerCase().includes(search.toLowerCase()) ||
            (job.customer || '').toLowerCase().includes(search.toLowerCase()) ||
            (job.technician || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || (job.status || '').toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <div style={{ position: 'relative' }}>
            <header style={{ marginBottom: '48px' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>
                    Service Jobs
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '4px' }}>
                    Manage and track platform service requests
                </p>
            </header>

            {/* Controls */}
            <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
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
                            placeholder="Find target job by ID, customer or technician..."
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

                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                    {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status === 'In Progress' ? 'in_progress' : status)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: '1px solid',
                                borderColor: (statusFilter === 'in_progress' && status === 'In Progress') || statusFilter === status ? 'var(--color-primary)' : 'var(--border-color)',
                                background: (statusFilter === 'in_progress' && status === 'In Progress') || statusFilter === status ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                                color: (statusFilter === 'in_progress' && status === 'In Progress') || statusFilter === status ? 'white' : 'var(--text-muted)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Jobs Data Grid */}
            <div className="glass-panel" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={thStyle}>JOB ID</th>
                            <th style={thStyle}>STATUS</th>
                            <th style={thStyle}>PARTIES</th>
                            <th style={thStyle}>AMOUNT</th>
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
                        ) : filteredJobs.length > 0 ? filteredJobs.map((job: any) => (
                            <tr key={job.id} className="row-hover" style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                                        <span style={{ fontWeight: 800, color: 'var(--text-body)' }}>#{job.id.slice(-8).toUpperCase()}</span>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <StatusPill status={job.status} />
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{job.customer}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>→ {job.technician}</div>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>₹{job.totalAmount.toLocaleString()}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 600 }}>{new Date(job.createdAt).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            View Details <ExternalLink size={14} />
                                        </button>
                                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                                    No service jobs detected matching current filters
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

function StatusPill({ status }: { status: string }) {
    const s = (status || '').toLowerCase();

    // Status Groups based on ServiceRequest model
    const isSuccess = ['completed', 'vehicle_delivered', 'ready_for_delivery'].includes(s);
    const isWarn = ['pending', 'pending_pickup', 'quote_pending', 'payment_pending_cash'].includes(s);
    const isError = ['cancelled', 'bill_rejected', 'quote_rejected', 'failed'].includes(s);
    const isBlue = ['accepted', 'arrived', 'diagnosing', 'in_progress', 'parts_required', 'parts_ordered', 'quality_check', 'billing_pending'].includes(s);

    let color = '#777';
    let bg = 'rgba(120, 120, 120, 0.1)';

    if (isSuccess) { color = '#34C759'; bg = 'rgba(52, 199, 89, 0.1)'; }
    else if (isWarn) { color = '#FF9500'; bg = 'rgba(255, 149, 0, 0.1)'; }
    else if (isError) { color = '#FF3B30'; bg = 'rgba(255, 59, 48, 0.1)'; }
    else if (isBlue) { color = '#007AFF'; bg = 'rgba(0, 122, 255, 0.1)'; }

    // Format snake_case to Title Case
    const formattedStatus = s
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <span style={{
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '0.7rem',
            fontWeight: 800,
            color: color,
            background: bg,
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap'
        }}>
            {formattedStatus}
        </span>
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
