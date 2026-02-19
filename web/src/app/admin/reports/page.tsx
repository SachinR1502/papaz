'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
    TrendingUp,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Target,
    IndianRupee,
    BarChart3
} from 'lucide-react';
import { RevenueBarChart } from '@/components/admin/charts/RevenueBarChart';

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('week');

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
        <div className="relative pb-20">
            {/* Background Ambient Glow */}
            <div className="fixed top-[20%] right-[10%] w-[400px] h-[400px] bg-primary blur-[180px] opacity-[0.03] -z-10 pointer-events-none" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                        Reports
                    </h1>
                    <p className="text-muted text-sm md:text-base font-medium mt-2">
                        Platform performance and growth analytics
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="glass-panel flex p-1 rounded-2xl bg-white/5 border border-white/10">
                        {[
                            { label: 'Week', value: 'week' },
                            { label: 'Month', value: 'month' },
                            { label: 'Year', value: 'year' }
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setPeriod(opt.value)}
                                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${period === opt.value
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-muted hover:text-foreground hover:bg-white/5'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
                    <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"></div>
                    <p className="text-muted font-bold tracking-widest text-xs">LOADING DATA...</p>
                </div>
            ) : (
                <div className="flex flex-col gap-8 md:gap-12">
                    {/* Top Row: Core Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <ReportStatCard
                            title="Period Revenue"
                            value={`₹${(reports?.revenueByDay?.reduce((acc: number, d: any) => acc + d.total, 0) || 0).toLocaleString()}`}
                            growth="Gross Volume"
                            icon={<TrendingUp size={24} />}
                            trend="up"
                        />
                        <ReportStatCard
                            title="Est. Net Earnings"
                            value={`₹${((reports?.revenueByDay?.reduce((acc: number, d: any) => acc + d.total, 0) || 0) * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                            growth="~10% Commission"
                            icon={<IndianRupee size={24} />}
                            trend="up"
                        />
                        <ReportStatCard
                            title="Active Jobs"
                            value={(Object.values(reports?.jobsByStatus || {}).reduce((a: any, b: any) => a + b, 0) as number).toString()}
                            growth="Total Requests"
                            icon={<Target size={24} />}
                            trend="up"
                        />
                        <ReportStatCard
                            title="Top Performer"
                            value={`₹${(reports?.topTechnicians?.[0]?.totalEarnings || 0).toLocaleString()}`}
                            growth={reports?.topTechnicians?.[0]?.fullName || 'N/A'}
                            icon={<Activity size={24} />}
                            trend="up"
                        />
                    </div>

                    {/* Mid Section: Charts & Detailed Data */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="glass-panel lg:col-span-2 p-8 md:p-10 rounded-[32px] min-h-[400px] flex flex-col justify-start bg-white/[0.01] relative overflow-hidden border border-white/5">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-lg font-black flex items-center gap-2">
                                        <BarChart3 size={20} className="text-primary" /> Revenue Trend
                                    </h3>
                                    <p className="text-sm text-muted">Daily revenue performance over the selected period</p>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                    {period === 'week' ? 'Last 7 Days (Daily)' : period === 'month' ? 'Current Month (Weekly)' : 'Current Year (Monthly)'}
                                </div>
                            </div>

                            <div className="flex-1 w-full h-[250px] flex items-end justify-between gap-2 md:gap-4 px-2">
                                <RevenueBarChart data={reports?.revenueByDay || []} period={period} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-8">
                            <div className="glass-panel p-8 rounded-[32px] border border-white/5">
                                <h4 className="text-xs font-black text-muted tracking-[0.15em] mb-6">JOB STATUS BREAKDOWN</h4>
                                <div className="flex flex-col gap-5">
                                    {Object.entries(reports?.jobsByStatus || {}).length > 0 ? Object.entries(reports?.jobsByStatus || {}).map(([status, count]: [string, any]) => {
                                        const total = Object.values(reports?.jobsByStatus || {}).reduce((a: any, b: any) => a + b, 0) as number;
                                        return <SourceRow key={status} label={status.toUpperCase()} value={count.toString()} total={total} />;
                                    }) : <p className="text-sm text-muted font-medium">No jobs found</p>}
                                </div>

                                <div className="h-px bg-white/5 my-8"></div>

                                <h4 className="text-xs font-black text-muted tracking-[0.15em] mb-6">TOP TECHNICIANS</h4>
                                <div className="flex flex-col gap-4">
                                    {(reports?.topTechnicians || []).map((tech: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-sm group hover:bg-white/5 p-2 rounded-lg transition-colors">
                                            <span className="font-bold text-foreground/90 group-hover:text-primary transition-colors">{tech.fullName}</span>
                                            <span className="font-extrabold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-md">₹{tech.totalEarnings.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-panel p-8 rounded-[32px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden group">
                                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="text-primary mb-4 p-3 bg-primary/10 w-fit rounded-xl border border-primary/20"><Download size={24} /></div>
                                <h4 className="font-extrabold text-lg mb-1">Download Report</h4>
                                <p className="text-sm text-muted font-medium leading-relaxed mb-6">
                                    Export a detailed PDF report for the current period analytics.
                                </p>
                                <button className="w-full py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                    <Download size={18} /> Export PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}

function ReportStatCard({ title, value, growth, icon, trend }: { title: string, value: string, growth: string, icon: React.ReactNode, trend: 'up' | 'down' }) {
    return (
        <div className="glass-panel p-7 rounded-[28px] border border-white/5 group hover:bg-white/[0.02] transition-colors relative overflow-hidden hover:-translate-y-1 duration-300">
            {/* Decorative BG */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity"></div>

            <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="text-primary bg-primary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-inner border border-primary/5">{icon}</div>
                <div className={`flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-lg border ${trend === 'up'
                    ? 'text-green-500 bg-green-500/10 border-green-500/20'
                    : 'text-red-500 bg-red-500/10 border-red-500/20'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {growth}
                </div>
            </div>
            <div className="text-xs font-black text-muted tracking-widest uppercase mb-1">{title}</div>
            <div className="text-3xl font-black tracking-tight">{value}</div>
        </div>
    );
}

function SourceRow({ label, value, total }: { label: string, value: string, total: number }) {
    const val = parseInt(value);
    const percentage = total > 0 ? (val / total) * 100 : 0;

    return (
        <div>
            <div className="flex justify-between mb-2 text-sm">
                <span className="font-bold text-foreground/80">{label}</span>
                <span className="font-extrabold text-foreground">{value}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
