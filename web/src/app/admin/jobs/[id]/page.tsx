'use client';

import { useEffect, useState, use } from 'react';
import { adminService } from '@/services/adminService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft,
    Calendar,
    MapPin,
    User,
    Wrench,
    CreditCard,
    AlertTriangle,
    CheckCircle2,
    Clock,
    X,
    FileText,
    Truck,
    Phone,
    Mail,
    ShieldCheck,
    MoreVertical
} from 'lucide-react';

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await adminService.getJobDetails(id);
                setJob(data);
            } catch (error) {
                console.error("Error fetching job details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleCancelJob = async () => {
        if (!confirm('Are you sure you want to cancel this job? This action cannot be undone.')) return;

        try {
            await adminService.cancelJob(id, 'Cancelled by Admin');
            // Refresh
            const data = await adminService.getJobDetails(id);
            setJob(data);
        } catch (error) {
            console.error('Failed to cancel job:', error);
            alert('Failed to cancel job');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"></div>
                <p className="text-muted font-bold tracking-widest text-xs">LOADING JOB DATA...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                    <AlertTriangle size={40} className="text-red-500 opacity-80" />
                </div>
                <h2 className="text-2xl font-black text-foreground">Job Not Found</h2>
                <p className="text-muted">The requested service job ID could not be located.</p>
                <Link href="/admin/jobs" className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors mt-4">
                    Return to Jobs List
                </Link>
            </div>
        );
    }

    return (
        <div className="relative pb-20 max-w-7xl mx-auto">
            {/* Background Ambient Glow */}
            <div className="fixed top-[20%] right-[10%] w-[400px] h-[400px] bg-primary blur-[180px] opacity-[0.03] -z-10 pointer-events-none" />

            {/* Header */}
            <header className="flex flex-col gap-6 mb-8 md:mb-12">
                <div className="flex items-center gap-2 text-muted hover:text-foreground transition-colors w-fit">
                    <Link href="/admin/jobs" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                        <ChevronLeft size={14} /> Back to Jobs
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-muted tracking-widest">
                                SERVICE REQUEST
                            </span>
                            <div className="text-xs font-medium text-muted flex items-center gap-1.5">
                                <Calendar size={12} />
                                {new Date(job.createdAt).toLocaleDateString()} at {new Date(job.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                            #{id.slice(-8).toUpperCase()}
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <StatusPill status={job.status} size="lg" />

                        {job.status !== 'cancelled' && job.status !== 'completed' && (
                            <button
                                onClick={handleCancelJob}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wide hover:bg-red-500/20 transition-all active:scale-95"
                            >
                                <X size={16} /> Cancel Job
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Main Content - Left Column (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">

                    {/* Key Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-panel p-6 rounded-[24px] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <CreditCard size={64} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={14} className="text-primary" /> Total Valuation
                                </div>
                                <div className="text-3xl font-black tracking-tight mt-2">
                                    ₹{(job.bill?.totalAmount || job.quote?.totalAmount || 0).toLocaleString()}
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${job.bill?.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                                        PAYMENT: {(job.bill?.status || 'PENDING').toUpperCase()}
                                    </div>
                                    <div className="text-[10px] font-bold text-muted px-2 py-0.5 rounded border border-white/5 bg-white/5">
                                        METHOD: {(job.bill?.paymentMethod || 'N/A').toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-[24px] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <Truck size={64} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                    <Truck size={14} className="text-blue-500" /> Vehicle
                                </div>
                                <div className="text-2xl font-black tracking-tight mt-2 truncate">
                                    {job.vehicleModel}
                                </div>
                                <div className="mt-auto pt-2">
                                    <div className="text-lg font-mono font-bold text-foreground/80 tracking-wider">
                                        {job.vehicleNumber?.toUpperCase() || 'N/A'}
                                    </div>
                                    <div className="text-[10px] text-muted font-bold mt-1 uppercase">
                                        {job.serviceType} Service
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="glass-panel p-8 rounded-[32px] border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                        <h3 className="text-sm font-black text-muted uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Clock size={16} className="text-primary" /> Operational Timeline
                        </h3>

                        <div className="space-y-0 relative pl-4 border-l-2 border-dashed border-white/5 ml-3">
                            {/* Current Status */}
                            <div className="relative pl-8 pb-10 last:pb-0">
                                <div className="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#0a0a0a] border-4 border-[#0a0a0a] flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                                </div>
                                <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl relative group hover:bg-white/[0.05] transition-colors">
                                    <div className="absolute left-0 top-6 -translate-x-2 w-2 h-2 rotate-45 bg-white/5 border-l border-b border-white/5 group-hover:bg-white/10 transition-colors"></div>
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-lg text-primary">{formatStatus(job.status)}</div>
                                        <span className="text-[10px] font-bold text-muted bg-white/5 px-2 py-1 rounded">CURRENT</span>
                                    </div>
                                    <div className="text-sm text-muted mb-3">
                                        Status updated on {new Date(job.updatedAt).toLocaleString()}
                                    </div>

                                    {job.cancellationReason && (
                                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start">
                                            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-red-500 text-xs uppercase tracking-wide">Cancellation Reason</div>
                                                <p className="text-sm text-red-500/80 mt-1">{job.cancellationReason}</p>
                                            </div>
                                        </div>
                                    )}

                                    {job.description && (
                                        <div className="mt-3 p-3 bg-black/20 rounded-xl border border-white/5">
                                            <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Client Notes</div>
                                            <p className="text-sm text-foreground/80 italic leading-relaxed">"{job.description}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Created (Simplified previous step) */}
                            <div className="relative pl-8 pb-0">
                                <div className="absolute -left-[21px] top-0 w-10 h-10 rounded-full bg-[#0a0a0a] border-4 border-[#0a0a0a] flex items-center justify-center">
                                    <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                </div>
                                <div>
                                    <div className="font-bold text-base text-muted">Request Initiated</div>
                                    <div className="text-xs text-muted mt-0.5">{new Date(job.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="glass-panel p-8 rounded-[32px] border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={16} className="text-indigo-500" /> Service Location
                            </h3>
                            {job.location?.coordinates && (
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono font-bold text-indigo-400">
                                        {job.location.coordinates[1].toFixed(4)}, {job.location.coordinates[0].toFixed(4)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-muted uppercase mb-1">Address</div>
                                <p className="font-medium text-base leading-relaxed">
                                    {job.location?.address || 'No location data provided'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Right Column (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Technician Card */}
                    <div className="glass-panel p-1 rounded-[32px] border border-white/5 bg-white/[0.01]">
                        <div className="p-6 pb-2">
                            <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                <Wrench size={14} /> Technician
                            </h3>
                        </div>
                        {job.technician ? (
                            <div className="p-4 pt-2">
                                <div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/50 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                                            {(job.technician.fullName?.[0] || 'T').toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-bold text-lg truncate">{job.technician.fullName}</div>
                                            <div className="text-xs font-medium text-muted truncate">{job.technician.garageName || 'Freelance Partner'}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-foreground/80">
                                            <Phone size={14} className="text-muted" />
                                            <span className="font-medium">{job.technician.phoneNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted">
                                            <ShieldCheck size={14} className={job.technician.isVerified ? 'text-green-500' : 'text-muted'} />
                                            <span className="font-bold text-[10px] uppercase tracking-wider">
                                                {job.technician.isVerified ? 'Verified Partner' : 'Unverified'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                        <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors">View Profile</button>
                                        <button className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors">History</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-muted">
                                    <Wrench size={20} />
                                </div>
                                <div className="font-bold text-muted">No Technician Assigned</div>
                                <button className="mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">Assign Technician</button>
                            </div>
                        )}
                    </div>

                    {/* Customer Card */}
                    <div className="glass-panel p-1 rounded-[32px] border border-white/5 bg-white/[0.01]">
                        <div className="p-6 pb-2">
                            <h3 className="text-xs font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                <User size={14} /> Customer
                            </h3>
                        </div>
                        {job.customer ? (
                            <div className="p-4 pt-2">
                                <div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
                                            {(job.customer.fullName?.[0] || 'C').toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-bold text-lg truncate">{job.customer.fullName}</div>
                                            <div className="text-xs text-muted truncate">ID: {job.customer._id?.slice(-8)}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-foreground/80">
                                            <Phone size={14} className="text-muted" />
                                            <span className="font-medium">{job.customer.phoneNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-foreground/80">
                                            <Mail size={14} className="text-muted" />
                                            <span className="font-medium truncate">{job.customer.email}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors">View Customer Profile</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted">Unknown Customer</div>
                        )}
                    </div>


                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, isUpperCase = false }: { label: string, value: string, isUpperCase?: boolean }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
            <span className="text-sm font-medium text-muted">{label}</span>
            <span className={`text-sm font-bold ${isUpperCase ? 'uppercase' : ''}`}>{value || 'N/A'}</span>
        </div>
    );
}

function formatStatus(status: string) {
    return (status || '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function StatusPill({ status, size = 'md' }: { status: string, size?: 'md' | 'lg' }) {
    const s = (status || '').toLowerCase();
    const formatted = formatStatus(s);

    const isSuccess = ['completed', 'vehicle_delivered', 'ready_for_delivery'].includes(s);
    const isWarn = ['pending', 'pending_pickup', 'quote_pending', 'payment_pending_cash'].includes(s);
    const isError = ['cancelled', 'bill_rejected', 'quote_rejected', 'failed'].includes(s);
    const isBlue = ['accepted', 'arrived', 'diagnosing', 'in_progress', 'parts_required', 'parts_ordered', 'quality_check', 'billing_pending'].includes(s);

    let colorClass = 'text-muted bg-white/5 border-white/10';

    if (isSuccess) colorClass = 'text-green-500 bg-green-500/10 border-green-500/20';
    else if (isWarn) colorClass = 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    else if (isError) colorClass = 'text-red-500 bg-red-500/10 border-red-500/20';
    else if (isBlue) colorClass = 'text-blue-500 bg-blue-500/10 border-blue-500/20';

    const pX = size === 'lg' ? 'px-5' : 'px-4';
    const pY = size === 'lg' ? 'py-2.5' : 'py-2';
    const textSize = size === 'lg' ? 'text-sm' : 'text-xs';

    return (
        <span className={`${pX} ${pY} rounded-xl ${textSize} border font-extrabold tracking-wide uppercase whitespace-nowrap shadow-sm ${colorClass}`}>
            {formatted}
        </span>
    );
}
