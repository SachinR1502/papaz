'use client';

import React, { useState } from 'react';
import { useTechnician } from '@/context/TechnicianContext';
import {
    Wrench,
    Clock,
    MapPin,
    ChevronRight,
    Search,
    Filter,
    AlertCircle,
    CheckCircle2,
    Calendar,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type JobStatus = 'all' | 'pending' | 'accepted' | 'in_progress' | 'completed';
type ViewType = 'assigned' | 'available';

export default function TechnicianJobsPage() {
    const { jobs, availableJobs, isLoading, isApproved } = useTechnician();
    const [view, setView] = useState<ViewType>('assigned');
    const [filter, setFilter] = useState<JobStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const currentJobs = view === 'assigned' ? jobs : availableJobs;

    const filteredJobs = (Array.isArray(currentJobs) ? currentJobs : []).filter(job => {
        const matchesStatus = filter === 'all' || job.status === filter;
        const vehicleInfo = `${job.vehicle?.make || ''} ${job.vehicle?.model || ''}`.toLowerCase();
        const matchesSearch =
            vehicleInfo.includes(searchQuery.toLowerCase()) ||
            (job._id?.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
            (job.customerName?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse p-6">
                <div className="h-12 bg-gray-100 rounded-xl w-1/4" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Service Protocol</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <p className="text-xs text-gray-500 font-medium">Monitoring Regional Service Grid</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button
                            onClick={() => setView('assigned')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                view === 'assigned' ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Active ({jobs.length})
                        </button>
                        <button
                            onClick={() => setView('available')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                view === 'available' ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Market ({availableJobs.length})
                        </button>
                    </div>

                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find specific jobs..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-white border border-gray-200 h-10 pl-9 pr-4 rounded-xl text-xs font-medium w-48 lg:w-64 focus:border-orange-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Sub Filter */}
            {view === 'assigned' && (
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
                    {(['all', 'accepted', 'in_progress', 'completed'] as JobStatus[]).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
                                filter === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Verification Alert if Not Approved */}
            {!isApproved && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-4 text-amber-800">
                    <AlertCircle size={20} />
                    <p className="text-xs font-medium">Your profile is under review. You can browse active jobs, but acceptance is limited to verified experts.</p>
                </div>
            )}

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => (
                        <JobCard key={job._id || job.id || index} job={job} view={view} />
                    ))
                ) : (
                    <div className="col-span-full py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <Wrench size={40} className="text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No Services Found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function JobCard({ job, view }: { job: any; view: ViewType }) {
    const statusConfig: Record<string, { color: string, icon: any, label: string }> = {
        'pending': { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'Pending' },
        'accepted': { color: 'text-[var(--color-secondary-light)] bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/20', icon: CheckCircle2, label: 'Confirmed' },
        'in_progress': { color: 'text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20', icon: Wrench, label: 'Active Service' },
        'completed': { color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: CheckCircle2, label: 'Completed' },
    };

    const config = statusConfig[job.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
        <div className="group relative overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-3xl)] p-8 hover:border-[var(--color-primary)]/20 transition-all duration-500 shadow-lg shadow-black/5 hover:shadow-black/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-primary)]/10 transition-all" />

            <div className="flex justify-between items-start mb-8 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.2em]">Request #{job._id?.slice(-8).toUpperCase() || 'UNKNOWN'}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-body)]">
                        {job.vehicle?.make || 'Vehicle'} {job.vehicle?.model || 'Model'}
                    </h3>
                </div>
                <div className={cn("px-4 py-2 rounded-xl flex items-center gap-2 border whitespace-nowrap", config.color)}>
                    <StatusIcon size={14} className={cn(job.status === 'in_progress' && "animate-pulse")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{config.label}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <User size={12} className="text-[var(--text-muted)]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Customer</p>
                    </div>
                    <p className="text-sm font-bold text-[var(--text-body)] truncate">{job.customerName || 'Anonymous Client'}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/[0.08] transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin size={12} className="text-[var(--color-primary)]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Location</p>
                    </div>
                    <p className="text-sm font-bold text-[var(--text-body)] truncate">
                        {typeof job.location === 'string' ? job.location : (job.location?.address || job.address || 'Field Site')}
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[var(--border-color)] gap-4">
                <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-[var(--text-muted)]" />
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Scheduled: Today, 2:30 PM</span>
                </div>
                <Link
                    href={`/technician/jobs/${job._id || job.id}`}
                    className={cn(
                        "w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all group/btn active:scale-95 shadow-lg",
                        view === 'available'
                            ? "bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-light)] shadow-[var(--color-secondary)]/10"
                            : "bg-[var(--bg-body)] text-[var(--text-body)] border border-[var(--border-color)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] shadow-black/5"
                    )}
                >
                    {view === 'available' ? 'Accept Protocol' : 'Job Details'}
                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
