'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Search,
    ExternalLink,
    MoreVertical,
    X,
    FileText
} from 'lucide-react';

export default function AdminJobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

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

    const handleCancelJob = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this job? This action cannot be undone.')) return;

        try {
            await adminService.cancelJob(id, 'Cancelled by Admin');
            // Refresh list
            fetchJobs();
            setActionMenuOpen(null);
        } catch (error) {
            console.error('Failed to cancel job:', error);
            alert('Failed to cancel job');
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
        <div className="relative pb-20">
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                    Service Jobs
                </h1>
                <p className="text-muted text-sm md:text-base font-medium mt-2">
                    Manage and track platform service requests
                </p>
            </header>

            {/* Controls */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex gap-4">
                    <div className="flex-1 flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus-within:bg-white/10 transition-colors">
                        <Search size={20} className="text-primary opacity-60" />
                        <input
                            type="text"
                            placeholder="Find target job by ID, customer or technician..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-foreground font-medium placeholder:text-muted/50 w-full"
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status === 'In Progress' ? 'in_progress' : status)}
                            className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${(statusFilter === 'in_progress' && status === 'In Progress') || statusFilter === status
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white/5 border-transparent text-muted hover:bg-white/10'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Jobs Data Grid */}
            <div className="glass-panel p-0 rounded-[24px] overflow-hidden border border-white/5">
                <div className="overflow-x-auto" style={{ minHeight: '400px' }}>
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="p-5 text-xs font-black text-muted tracking-widest uppercase border-b border-white/5">Job ID</th>
                                <th className="p-5 text-xs font-black text-muted tracking-widest uppercase border-b border-white/5">Status</th>
                                <th className="p-5 text-xs font-black text-muted tracking-widest uppercase border-b border-white/5">Parties</th>
                                <th className="p-5 text-xs font-black text-muted tracking-widest uppercase border-b border-white/5">Amount</th>
                                <th className="p-5 text-xs font-black text-muted tracking-widest uppercase border-b border-white/5">Date</th>
                                <th className="p-5 border-b border-white/5"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-24 text-center">
                                        <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"></div>
                                        <p className="text-muted font-bold text-xs tracking-widest uppercase">Loading Jobs...</p>
                                    </td>
                                </tr>
                            ) : filteredJobs.length > 0 ? filteredJobs.map((job: any) => (
                                <tr key={job.id} className="group hover:bg-white/[0.02] border-b border-white/5 last:border-0 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="font-extrabold text-foreground tracking-wide text-sm">#{job.id.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <StatusPill status={job.status} />
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="font-bold text-sm text-foreground">{job.customer}</div>
                                            <div className="text-muted text-xs font-medium">→ {job.technician}</div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="font-black text-base">₹{job.totalAmount.toLocaleString()}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="font-semibold text-sm">{new Date(job.createdAt).toLocaleDateString()}</div>
                                        <div className="text-xs text-muted font-medium mt-0.5">{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-end items-center gap-3 relative">
                                            <Link
                                                href={`/admin/jobs/${job.id}`}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors"
                                            >
                                                View Details <ExternalLink size={14} />
                                            </Link>

                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActionMenuOpen(actionMenuOpen === job.id ? null : job.id);
                                                    }}
                                                    className="p-2 rounded-lg text-muted hover:text-foreground transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {actionMenuOpen === job.id && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="py-1">
                                                            <Link
                                                                href={`/admin/jobs/${job.id}`}
                                                                className="w-full text-left px-4 py-3 text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 flex items-center gap-2"
                                                            >
                                                                <FileText size={14} /> View Details
                                                            </Link>
                                                            {job.status !== 'cancelled' && job.status !== 'completed' && (
                                                                <button
                                                                    onClick={() => handleCancelJob(job.id)}
                                                                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                                                                >
                                                                    <X size={14} /> Cancel Job
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-24 text-center text-muted">
                                        No service jobs detected matching current filters
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Click outside listener for dropdown */}
            {actionMenuOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setActionMenuOpen(null)} />
            )}
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

    let colorClass = 'text-muted bg-white/5';

    if (isSuccess) colorClass = 'text-green-500 bg-green-500/10';
    else if (isWarn) colorClass = 'text-orange-500 bg-orange-500/10';
    else if (isError) colorClass = 'text-red-500 bg-red-500/10';
    else if (isBlue) colorClass = 'text-blue-500 bg-blue-500/10';

    // Format snake_case to Title Case
    const formattedStatus = s
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase whitespace-nowrap ${colorClass}`}>
            {formattedStatus}
        </span>
    );
}
