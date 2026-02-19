'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
    CheckCircle2,
    XCircle,
    Phone,
    MapPin,
    Navigation,
    Briefcase,
    Building2
} from 'lucide-react';

export default function PendingApprovals() {
    const [pending, setPending] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await adminService.getPendingUsers();
            setPending(data);
        } catch (error) {
            console.error('Failed to fetch pending users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: string, type: 'technician' | 'supplier', action: 'approve' | 'reject') => {
        setActionLoading(id);
        try {
            if (action === 'approve') {
                await adminService.approveUser(id, type);
            } else {
                const reason = prompt('Enter rejection reason:');
                if (!reason) return;
                await adminService.rejectUser(id, type, reason);
            }
            // Refresh list
            setPending(pending.filter(p => p.id !== id));
        } catch (error) {
            console.error(`Failed to ${action} user:`, error);
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"></div>
                <p className="text-muted font-bold tracking-widest text-xs">LOADING REQUESTS...</p>
            </div>
        );
    }

    return (
        <div className="relative pb-20">
            {/* Background glow */}
            <div className="fixed top-[10%] left-[20%] w-[400px] h-[400px] bg-primary blur-[200px] opacity-[0.03] -z-10 pointer-events-none" />

            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                    Pending Approvals
                </h1>
                <p className="text-muted text-sm md:text-base font-medium mt-2">
                    Review and approve new technician and supplier accounts
                </p>
            </header>

            {pending.length === 0 ? (
                <div className="glass-panel py-32 px-10 text-center rounded-[40px] border border-dashed border-white/10 bg-transparent flex flex-col items-center">
                    <div className="w-24 h-24 rounded-3xl bg-white/[0.02] flex items-center justify-center mb-8 text-primary opacity-50">
                        <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-3xl font-black mb-3">All Caught Up</h3>
                    <p className="text-muted text-lg max-w-sm mx-auto">
                        No pending requests at this moment.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {pending.map(user => {
                        const displayName = user.fullName || user.name || 'Unknown User';
                        const businessName = user.garageName || user.storeName || user.businessName || 'N/A';
                        const displayLocation = user.city || user.address || user.location || 'Unknown Location';
                        const appliedDate = user.createdAt || user.appliedDate || new Date().toISOString();

                        return (
                            <div key={user.id || user._id} className="glass-panel p-8 rounded-[32px] border border-white/5 flex flex-col gap-6 hover:bg-white/[0.02] transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${user.type === 'technician' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {user.type === 'technician' ? <Briefcase size={28} /> : <Building2 size={28} />}
                                        </div>
                                        <div>
                                            <div className={`text-[10px] font-black tracking-widest uppercase mb-1 ${user.type === 'technician' ? 'text-green-500' : 'text-blue-500'
                                                }`}>
                                                {user.type} APPLICATION
                                            </div>
                                            <h3 className="text-xl font-black tracking-tight m-0">{displayName}</h3>
                                            <p className="text-sm font-bold text-primary m-0">{businessName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col gap-1">
                                        <div className="text-xs font-extrabold text-muted tracking-wide">APPLIED</div>
                                        <div className="font-bold text-sm">{new Date(appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                    </div>
                                </div>

                                <div className="bg-white/[0.015] p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                                    <InfoRow icon={<Phone size={14} />} label="Contact Number" value={user.phone || user.phoneNumber || 'N/A'} />
                                    <InfoRow icon={<MapPin size={14} />} label="Location" value={displayLocation} />
                                    {user.type === 'technician' && <InfoRow icon={<Navigation size={14} />} label="Service Area" value={`${user.serviceRadius || 0} KM Coverage`} />}
                                </div>

                                <div className="flex gap-4 mt-auto pt-2">
                                    <button
                                        onClick={() => handleAction(user.id || user._id, user.type, 'approve')}
                                        disabled={actionLoading === (user.id || user._id)}
                                        className="flex-2 h-14 rounded-2xl bg-primary text-white font-black text-sm hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {actionLoading === (user.id || user._id) ? 'VERIFYING...' : <><CheckCircle2 size={18} /> Approve</>}
                                    </button>
                                    <button
                                        onClick={() => handleAction(user.id || user._id, user.type, 'reject')}
                                        disabled={actionLoading === (user.id || user._id)}
                                        className="flex-1 h-14 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 font-extrabold text-sm hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2.5 text-muted font-semibold">
                <span className="text-primary opacity-60">{icon}</span>
                {label}
            </div>
            <div className="font-extrabold text-foreground">{value}</div>
        </div>
    );
}
