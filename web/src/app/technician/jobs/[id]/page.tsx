'use client';

import React, { useEffect, useState, use } from 'react';
import { technicianService } from '@/services/technicianService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft,
    Wrench,
    MapPin,
    Phone,
    User,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    Camera,
    Navigation,
    CircleDashed,
    ArrowRight,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTechnician } from '@/context/TechnicianContext';
import { useAuth } from '@/context/AuthContext';

export default function TechnicianJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { isApproved } = useTechnician();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const data = await technicianService.getJob(id);
            setJob(data);
        } catch (error) {
            console.error("Error fetching job details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!isApproved && (newStatus === 'accepted' || newStatus === 'in_progress')) {
            alert("Verification Required: Your profile is under review. You cannot proceed with active protocols until verified.");
            return;
        }

        try {
            setUpdating(true);
            await technicianService.updateJobStatus(id, newStatus);
            await fetchJobDetails();
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Protocol Update Failed. Please check your data connection.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Syncing Protocol Instance...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <AlertCircle size={48} className="text-gray-200 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Protocol Entry Missing</h2>
                <p className="text-gray-500 mt-2 max-w-sm">The job registry could not locate reference #{id.slice(-8).toUpperCase()}.</p>
                <Link href="/technician/jobs" className="mt-8 px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all">
                    Return to Grid
                </Link>
            </div>
        );
    }

    const nextAction = getNextAction(job.status);

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
            {/* Header Navigation */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div className="flex items-center gap-4">
                    <Link href="/technician/jobs" className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Job Terminal</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">#{id.slice(-8).toUpperCase()}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <StatusBadge status={job.status} />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {/* Main Intel Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Vehicle Identity */}
                    <section className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Wrench size={18} className="text-orange-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Vehicle Profile</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Make & Model</p>
                                <p className="text-2xl font-bold text-gray-900">{job.vehicleModel || 'Legacy Unit'}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="px-3 py-1 bg-gray-100 rounded-md text-[10px] font-mono font-bold text-gray-600 border border-gray-200 uppercase whitespace-nowrap">
                                        {job.vehicleNumber || 'N/A'}
                                    </span>
                                    {job.serviceType && (
                                        <span className="px-3 py-1 bg-orange-50 rounded-md text-[10px] font-bold text-orange-600 border border-orange-100 uppercase">
                                            {job.serviceType}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Service Brief</p>
                                <p className="text-sm font-medium text-gray-600 italic leading-relaxed">
                                    "{job.description || 'Routine maintenance and diagnostics required.'}"
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Operational Actions */}
                    <section className="bg-gray-900 rounded-[32px] p-8 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-3">
                                <Navigation size={18} className="text-orange-500" />
                                Execution Protocol
                            </h3>
                            {updating && <CircleDashed size={18} className="animate-spin text-orange-500" />}
                        </div>

                        {nextAction ? (
                            <div className="flex flex-col md:flex-row gap-4">
                                <button
                                    onClick={() => handleUpdateStatus(nextAction.status)}
                                    disabled={updating}
                                    className="flex-1 py-5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 active:scale-95"
                                >
                                    {nextAction.label}
                                    <ArrowRight size={16} />
                                </button>

                                {job.status === 'pending' && (
                                    <button
                                        onClick={() => handleUpdateStatus('cancelled')}
                                        disabled={updating}
                                        className="px-8 py-5 border border-white/10 hover:bg-white/5 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-gray-400 hover:text-white transition-all"
                                    >
                                        Ignore Request
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="py-2 text-center border border-dashed border-white/10 rounded-2xl">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Protocol Complete / No Further Action</p>
                            </div>
                        )}
                    </section>

                    {/* Mission Logistics (Location) */}
                    <section className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin size={18} className="text-orange-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Service Grid Location</h3>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Address</p>
                                <p className="text-lg font-bold text-gray-900 leading-snug">
                                    {typeof job.location === 'string' ? job.location : (job.location?.address || job.address || 'Field Deployment')}
                                </p>
                                <button className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600 hover:underline">
                                    Open Navigation Matrix <ChevronRight size={14} />
                                </button>
                            </div>

                            <div className="w-full md:w-48 h-32 bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-300">
                                <Camera size={24} />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Context */}
                <div className="space-y-8">
                    {/* Client Identity */}
                    <section className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <User size={18} className="text-orange-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Contact Intel</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-400">
                                    {job.customer?.fullName?.[0] || 'C'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{job.customer?.fullName || 'Anonymous Client'}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Subscriber ID: {job.customer?._id?.slice(-6) || 'N/A'}</p>
                                </div>
                            </div>

                            <a href={`tel:${job.customer?.phoneNumber}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors group">
                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors">
                                    <Phone size={18} />
                                </div>
                                <span className="font-bold text-sm text-gray-700">Encrypted Call Connect</span>
                            </a>
                        </div>
                    </section>

                    {/* Protocol History */}
                    <section className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock size={16} className="text-orange-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Event Logs</h3>
                        </div>

                        <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-[24px] h-[24px] rounded-full border-4 border-white bg-orange-500 shadow-sm" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Entry Created</p>
                                <p className="text-xs font-bold text-gray-900">{new Date(job.createdAt).toLocaleTimeString()}</p>
                            </div>

                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-[24px] h-[24px] rounded-full border-4 border-white bg-gray-200 shadow-sm" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status Sync</p>
                                <p className="text-xs font-bold text-gray-600">Updated: {new Date(job.updatedAt).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string, color: string, icon: any }> = {
        'pending': { label: 'Assigned', color: 'bg-amber-100 text-amber-600 border-amber-200', icon: Clock },
        'accepted': { label: 'Confirmed', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: CheckCircle2 },
        'arrived': { label: 'On Site', color: 'bg-orange-50 text-orange-600 border-orange-200', icon: MapPin },
        'in_progress': { label: 'Live Service', color: 'bg-orange-600 text-white border-orange-700 shadow-md', icon: Wrench },
        'completed': { label: 'Success', color: 'bg-green-100 text-green-600 border-green-200', icon: CheckCircle2 },
        'cancelled': { label: 'Aborted', color: 'bg-red-50 text-red-600 border-red-200', icon: AlertCircle },
    };

    const s = config[status] || config.pending;
    const Icon = s.icon;

    return (
        <span className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2", s.color)}>
            <Icon size={12} className={status === 'in_progress' ? 'animate-pulse' : ''} />
            {s.label}
        </span>
    );
}

function getNextAction(status: string) {
    switch (status) {
        case 'pending': return { status: 'accepted', label: 'Accept Protocol' };
        case 'accepted': return { status: 'arrived', label: 'Signal Arrival' };
        case 'arrived': return { status: 'in_progress', label: 'Start Operations' };
        case 'in_progress': return { status: 'completed', label: 'Signal Job Success' };
        default: return null;
    }
}
