'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
    Activity,
    Users,
    Wrench,
    TrendingUp,
    Banknote,
    MoreVertical,
    Target
} from 'lucide-react';
import { RevenueBarChart } from '@/components/admin/charts/RevenueBarChart';

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
    revenueHistory: { date: string; amount: number }[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('week');

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        try {
            const data = await adminService.getDashboard(period);
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"></div>
                <p className="text-muted font-bold tracking-widest text-xs">INITIALIZING DASHBOARD...</p>
            </div>
        );
    }

    return (
        <div className="relative pb-20">
            {/* Background Ambient Glow */}
            <div className="fixed bottom-[10%] right-[10%] w-[400px] h-[400px] bg-primary blur-[180px] opacity-[0.04] -z-10 pointer-events-none" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                        Dashboard
                    </h1>
                    <p className="text-muted text-sm md:text-base font-medium mt-2">
                        Platform governance & real-time operational overview
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all active:scale-95">
                        <TrendingUp size={18} /> Analytics Suite
                    </button>
                </div>
            </header>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Platform Revenue"
                    value={`₹${stats?.totalRevenue.toLocaleString()}`}
                    subtitle="Gross Transaction Value"
                    icon={<TrendingUp size={24} />}
                    color="text-green-500"
                    bg="bg-green-500/10"
                    borderColor="border-green-500/20"
                />
                <StatCard
                    title="System Commission"
                    value={`₹${stats?.platformCommission.toLocaleString()}`}
                    subtitle="Operational Revenue"
                    icon={<Banknote size={24} />}
                    color="text-indigo-500"
                    bg="bg-indigo-500/10"
                    borderColor="border-indigo-500/20"
                />
                <StatCard
                    title="Workforce"
                    value={stats?.totalTechnicians.toString() || '0'}
                    subtitle={`${stats?.pendingApprovals} Pending Verification`}
                    icon={<Users size={24} />}
                    color="text-primary"
                    bg="bg-primary/10"
                    borderColor="border-primary/20"
                />
                <StatCard
                    title="Active Traffic"
                    value={stats?.activeJobs.toString() || '0'}
                    subtitle="Jobs currently in transit"
                    icon={<Activity size={24} />}
                    color="text-red-500"
                    bg="bg-red-500/10"
                    borderColor="border-red-500/20"
                />
            </div>

            {/* Revenue Bar Chart Section */}
            <div className="mb-8">
                <div className="glass-panel p-8 rounded-[32px] border border-white/5 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <TrendingUp size={20} className="text-primary" /> Revenue Trend
                            </h3>
                            <p className="text-sm text-muted">
                                {period === 'week' ? 'Last 7 Days (Daily)' : period === 'month' ? 'Current Month (Weekly)' : 'Current Year (Monthly)'} transaction volume
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="glass-panel flex p-1 rounded-xl bg-white/5 border border-white/10 h-fit">
                                {[
                                    { label: 'Week', value: 'week' },
                                    { label: 'Month', value: 'month' },
                                    { label: 'Year', value: 'year' }
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setPeriod(opt.value)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all ${period === opt.value
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'text-muted hover:text-foreground hover:bg-white/5'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        <RevenueBarChart data={stats?.revenueHistory || []} period={period} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1fr] gap-8 animate-slide-up-fade">
                {/* Live Activity Stream */}
                <div className="glass-panel p-0 overflow-hidden border border-white/5 rounded-[32px] flex flex-col">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/5">
                                <Wrench size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black m-0 tracking-tight">Recent Jobs</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    <p className="m-0 text-[10px] font-bold text-muted uppercase tracking-widest">Live Feed</p>
                                </div>
                            </div>
                        </div>
                        <button className="px-5 py-2.5 text-xs font-bold bg-white/5 hover:bg-white/10 rounded-xl transition-all hover:scale-105 active:scale-95 border border-white/5">
                            View All Jobs
                        </button>
                    </div>

                    <div className="flex flex-col">
                        {recentJobs.length > 0 ? recentJobs.map((job, i) => (
                            <div key={job.id} className="group p-6 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-xs text-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-sm tracking-wide">#{job.id.slice(-6).toUpperCase()}</span>
                                            <span className="text-[10px] font-bold text-muted px-2 py-0.5 rounded bg-white/5">
                                                {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted">
                                            <span className="text-foreground">{job.customer}</span>
                                            <span className="text-white/20">→</span>
                                            <span className="text-primary">{job.technician}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pl-14 md:pl-0">
                                    <StatusPill status={job.status} />
                                    <div className="text-right min-w-[80px]">
                                        <div className="text-sm font-black text-foreground">₹{job.totalAmount.toLocaleString()}</div>
                                        <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Valuation</div>
                                    </div>
                                    <button className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="p-20 text-center text-muted flex flex-col items-center justify-center gap-4 min-h-[300px]">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                    <Target size={40} className="opacity-20" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-foreground">No Live Activity</h4>
                                    <p className="text-sm opacity-60">Operations are currently quiet</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vertical Bar Chart for Job Status */}
                <div className="flex flex-col gap-8">
                    <div className="glass-panel p-8 rounded-[32px] border border-white/5">
                        <h2 className="text-xl font-extrabold mb-6 flex items-center gap-3">
                            <Activity size={20} className="text-primary" />
                            Job Overview
                        </h2>

                        {/* Job Status Bar Chart */}
                        <div className="flex flex-col gap-6 h-[200px] justify-end">
                            <JobStatusBarChart
                                active={stats?.activeJobs || 0}
                                completed={stats?.completedJobs || 0}
                                pending={stats?.pendingApprovals || 0} // Using pending approvals as proxy for 'Pending' jobs for demo visual
                            />
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-primary"></div>
                                    <span className="font-bold">Active Jobs</span>
                                </div>
                                <span className="font-mono">{stats?.activeJobs || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-green-500"></div>
                                    <span className="font-bold">Completed</span>
                                </div>
                                <span className="font-mono">{stats?.completedJobs || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



function JobStatusBarChart({ active, completed, pending }: { active: number, completed: number, pending: number }) {
    const total = active + completed + pending || 1;
    const maxVal = Math.max(active, completed, pending);

    return (
        <div className="w-full h-full flex items-end justify-around gap-4 px-4">
            {/* Active Bar */}
            <div className="flex flex-col items-center gap-2 w-1/3 h-full justify-end group">
                <div
                    className="w-full max-w-[40px] rounded-t-lg bg-primary transition-all duration-500 hover:brightness-110 relative"
                    style={{ height: `${(active / maxVal) * 100}%`, minHeight: '4px' }}
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-primary">
                        {active}
                    </div>
                </div>
                <span className="text-[10px] font-bold text-muted uppercase">Active</span>
            </div>

            {/* Completed Bar */}
            <div className="flex flex-col items-center gap-2 w-1/3 h-full justify-end group">
                <div
                    className="w-full max-w-[40px] rounded-t-lg bg-green-500 transition-all duration-500 hover:brightness-110 relative"
                    style={{ height: `${(completed / maxVal) * 100}%`, minHeight: '4px' }}
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-green-500">
                        {completed}
                    </div>
                </div>
                <span className="text-[10px] font-bold text-muted uppercase">Done</span>
            </div>

            {/* Pending Bar */}
            <div className="flex flex-col items-center gap-2 w-1/3 h-full justify-end group">
                <div
                    className="w-full max-w-[40px] rounded-t-lg bg-white/20 transition-all duration-500 hover:brightness-125 relative"
                    style={{ height: `${(pending / maxVal) * 100}%`, minHeight: '4px' }}
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-muted">
                        {pending}
                    </div>
                </div>
                <span className="text-[10px] font-bold text-muted uppercase">Pend</span>
            </div>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const isSuccess = status.toLowerCase() === 'completed' || status.toLowerCase() === 'active' || status.toLowerCase() === 'vehicle_delivered';
    const isWarn = status.toLowerCase() === 'preparing' || status.toLowerCase() === 'pending' || status.toLowerCase() === 'diagnosing';

    // Additional status mapping
    let colorClass = 'bg-white/5 text-muted';
    if (isSuccess) colorClass = 'bg-green-500/10 text-green-500';
    else if (isWarn) colorClass = 'bg-orange-500/10 text-orange-500';
    else if (['cancelled', 'failed'].includes(status.toLowerCase())) colorClass = 'bg-red-500/10 text-red-500';

    const formatted = status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${colorClass}`}>
            {formatted}
        </span>
    );
}

function StatCard({ title, value, subtitle, icon, color, bg, borderColor }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string, bg: string, borderColor: string }) {
    return (
        <div className={`glass-panel p-7 rounded-[32px] border ${borderColor} relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
            {/* Decorative element */}
            <div className={`absolute -top-5 -right-2 w-20 h-20 ${bg} blur-[50px] opacity-50 z-0`} />

            <div className="relative z-10 flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center ${color} shadow-inner`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-extrabold text-muted tracking-wide uppercase mb-1">{title}</p>
                    <h3 className="text-3xl font-black tracking-tight leading-none mb-1">{value}</h3>
                    <p className={`text-xs font-bold ${color} opacity-80`}>{subtitle}</p>
                </div>
            </div>
        </div>
    );
}
