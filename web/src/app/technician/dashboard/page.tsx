'use client';

import React from 'react';
import { useTechnician } from '@/context/TechnicianContext';
import { useAuth } from '@/context/AuthContext';
import {
    Activity,
    Wrench,
    Clock,
    TrendingUp,
    Wallet,
    AlertCircle,
    ChevronRight,
    MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TechnicianDashboard() {
    const { jobs, availableJobs, walletBalance, isLoading, isApproved, profile, notifications, markNotificationRead } = useTechnician();
    const { user } = useAuth();

    // Stats calculations
    const activeJobs = jobs?.filter(j => j.status === 'accepted' || j.status === 'in_progress') || [];
    const completedToday = jobs?.filter(j => j.status === 'completed').length || 0;

    // Intelligence mapping
    const unreadNotifications = notifications?.filter(n => !n.read) || [];
    const intelligenceItems = notifications?.slice(0, 3).map(notif => ({
        id: notif._id,
        title: notif.title || 'System Update',
        body: notif.message || '',
        time: formatTimeAgo(notif.createdAt),
        type: (notif.type === 'job' ? 'new_job' : 'tip') as 'new_job' | 'tip',
        read: notif.read
    })) || [];

    if (isLoading) {
        return (
            <div className="space-y-12 animate-fade-in max-w-7xl mx-auto py-10">
                <div className="h-20 bg-[var(--bg-card)] rounded-3xl animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[var(--bg-card)] rounded-3xl animate-pulse" />)}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 h-96 bg-[var(--bg-card)] rounded-3xl animate-pulse" />
                    <div className="h-96 bg-[var(--bg-card)] rounded-3xl animate-pulse" />
                </div>
            </div>
        );
    }

    const expertName = profile?.fullName || user?.name || 'Expert';

    return (
        <div className="space-y-12 animate-fade-in pb-20 max-w-7xl mx-auto">
            {/* Expert Greetings */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        {isApproved ? (
                            <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Expert Verified
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                Verification Pending
                            </span>
                        )}
                        <span className="text-[var(--text-muted)] text-[10px] font-semibold uppercase tracking-widest">Technician Grid</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-body)]">
                        Hello, <span className="text-[var(--color-primary)]">{expertName.split(' ')[0]}</span>
                    </h1>
                    <p className="text-[var(--text-muted)] mt-2 font-medium">Ready for your daily service protocol?</p>
                </div>
                <div className="text-right">
                    <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px] mb-1">Terminal Sync</p>
                    <p className="text-[var(--text-body)] font-bold text-xl">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Current Load"
                    value={activeJobs.length}
                    sub="Active Assignments"
                    icon={Wrench}
                    color="primary"
                />
                <StatCard
                    label="Nearby Feed"
                    value={availableJobs.length}
                    sub="Open Requests"
                    icon={Activity}
                    color="secondary"
                />
                <StatCard
                    label="Wallet Credits"
                    value={`₹${walletBalance.toLocaleString()}`}
                    sub="Withdrawable"
                    icon={Wallet}
                    color="primary"
                />
                <StatCard
                    label="Performance"
                    value={profile?.stats?.csrScore || "100%"}
                    sub="CSR Rating"
                    icon={TrendingUp}
                    color="secondary"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Active Work Protocol */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold text-[var(--text-body)] flex items-center gap-3">
                            <Clock size={20} className="text-[var(--color-primary)]" />
                            Ongoing Assignments
                        </h3>
                        <Link href="/technician/jobs" className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
                            View All Jobs <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {activeJobs.length > 0 ? (
                            activeJobs.slice(0, 3).map((job, index) => (
                                <QuickJobCard key={job._id || job.id || index} job={job} />
                            ))
                        ) : (
                            <div className="p-16 bg-[var(--bg-card)]/30 rounded-[var(--radius-3xl)] border border-dashed border-[var(--border-color)] text-center">
                                <p className="text-[var(--text-muted)] font-bold text-sm tracking-wide">Your queue is currently empty.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications / Intelligence Sidebar */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-[var(--text-body)] flex items-center gap-3 px-2">
                        <AlertCircle size={20} className="text-[var(--color-secondary-light)]" />
                        Service Intelligence
                    </h3>

                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-3xl)] p-8 space-y-6 shadow-xl shadow-black/5">
                        {/* Always show Grid Discovery if there are available jobs */}
                        {availableJobs.length > 0 && (
                            <IntelligenceItem
                                title="Grid Discovery"
                                body={`${availableJobs.length} new service requests found in your region.`}
                                time="Active"
                                type="new_job"
                            />
                        )}

                        {/* Map dynamic notifications */}
                        {intelligenceItems.length > 0 ? (
                            intelligenceItems.map((item, index) => (
                                <IntelligenceItem
                                    key={item.id || index}
                                    title={item.title}
                                    body={item.body}
                                    time={item.time}
                                    type={item.type}
                                    onClick={() => !item.read && markNotificationRead(item.id)}
                                />
                            ))
                        ) : (
                            <div className="py-8 text-center bg-[var(--bg-card)]/30 rounded-[var(--radius-2xl)] border border-dashed border-[var(--border-color)]">
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">No Intelligence Logs</p>
                            </div>
                        )}

                        {profile?.stats?.avgResponseTime && (
                            <IntelligenceItem
                                title="Response Matrix"
                                body={`Your current average response time is ${profile?.stats?.avgResponseTime}.`}
                                time="Live"
                            />
                        )}

                        {unreadNotifications.length > 0 && (
                            <button
                                onClick={() => unreadNotifications.forEach(notif => markNotificationRead(notif._id))}
                                className="w-full py-4 mt-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:bg-white/10 hover:text-white transition-all active:scale-95"
                            >
                                Mark All As Read
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper to format time
function formatTimeAgo(dateString: string) {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
}

function StatCard({ label, value, sub, icon: Icon, color }: any) {
    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-3xl)] p-8 hover:border-[var(--color-primary)]/20 transition-all group relative overflow-hidden shadow-lg shadow-black/5">
            <div className={cn("absolute top-0 right-0 w-24 h-24 blur-[60px] -translate-y-1/2 translate-x-1/2 opacity-20",
                color === 'primary' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-secondary)]')} />

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">{label}</p>
            <div className="flex items-end justify-between">
                <div>
                    <h3 className="text-3xl font-bold text-[var(--text-body)] mb-1">{value}</h3>
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">{sub}</p>
                </div>
                <div className={cn("p-4 rounded-2xl border transition-all group-hover:scale-110 duration-500",
                    color === 'primary' ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20" : "text-[var(--color-secondary-light)] bg-[var(--color-secondary)]/10 border-[var(--color-secondary)]/20")}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

function QuickJobCard({ job }: any) {
    return (
        <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-2xl)] flex items-center justify-between group hover:border-[var(--color-primary)]/30 transition-all duration-500 shadow-md">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shadow-inner">
                    <Wrench size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-[var(--text-body)] text-lg group-hover:text-[var(--color-primary)] transition-colors">
                        {job.vehicle?.make || 'Vehicle'} {job.vehicle?.model || 'Model'}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        <span>#{job._id?.slice(-6).toUpperCase() || 'ID-ERR'}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span className="flex items-center gap-1">
                            <MapPin size={10} className="text-[var(--color-primary)]" />
                            {job.address || job.location?.address || 'On-Spot Service'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 rounded-xl text-[9px] font-bold uppercase tracking-widest">
                    {job.status?.replace('_', ' ')}
                </span>
                <Link href={`/technician/jobs/${job._id || job.id}`} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-white/10 transition-all active:scale-90">
                    <ChevronRight size={18} />
                </Link>
            </div>
        </div>
    );
}

function IntelligenceItem({ title, body, time, type, onClick }: any) {
    return (
        <div className="relative pl-6 border-l-2 border-white/5 space-y-1 group cursor-pointer" onClick={onClick}>
            <div className={cn("absolute left-0 top-0 w-2 h-2 -translate-x-1/2 rounded-full border-2 border-[var(--bg-card)]",
                type === 'new_job' ? 'bg-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/50' : type === 'tip' ? 'bg-[var(--color-secondary-light)]' : 'bg-zinc-600')} />
            <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-body)]">{title}</h5>
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{time}</span>
            </div>
            <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed group-hover:text-[var(--text-body)] transition-colors">{body}</p>
        </div>
    );
}

