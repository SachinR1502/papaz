'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
    UserCheck,
    ShieldAlert,
    UserX,
    CheckCircle2,
    XCircle,
    Phone,
    MapPin,
    Navigation,
    Calendar,
    Briefcase,
    Building2,
    Search
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(var(--color-primary-rgb), 0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}></div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>LOADING REQUESTS...</p>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* Background glow */}
            <div style={{
                position: 'fixed',
                top: '10%',
                left: '20%',
                width: '400px',
                height: '400px',
                background: 'var(--color-primary)',
                filter: 'blur(200px)',
                opacity: 0.03,
                zIndex: -1,
                pointerEvents: 'none'
            }} />

            <header style={{ marginBottom: '48px' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>
                    Pending Approvals
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '4px' }}>
                    Review and approve new technician and supplier accounts
                </p>
            </header>

            {pending.length === 0 ? (
                <div className="glass-panel" style={{
                    padding: '120px 40px',
                    textAlign: 'center',
                    borderRadius: '40px',
                    border: '1px dashed rgba(255,255,255,0.1)',
                    background: 'transparent'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '30px',
                        background: 'rgba(255,255,255,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 32px',
                        color: 'var(--color-primary)',
                        opacity: 0.5
                    }}>
                        <CheckCircle2 size={48} />
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '12px' }}>All Caught Up</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto' }}>
                        No pending requests at this moment.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '32px' }}>
                    {pending.map(user => {
                        const displayName = user.fullName || user.name || 'Unknown User';
                        const businessName = user.garageName || user.storeName || user.businessName || 'N/A';
                        const displayLocation = user.city || user.address || user.location || 'Unknown Location';
                        const appliedDate = user.createdAt || user.appliedDate || new Date().toISOString();

                        return (
                            <div key={user.id || user._id} className="glass-panel card-hover" style={{
                                padding: '32px',
                                borderRadius: '32px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '16px',
                                            background: user.type === 'technician' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(0, 122, 255, 0.1)',
                                            color: user.type === 'technician' ? '#34c759' : '#007aff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {user.type === 'technician' ? <Briefcase size={28} /> : <Building2 size={28} />}
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                color: user.type === 'technician' ? '#34c759' : '#007aff',
                                                letterSpacing: '1.5px',
                                                marginBottom: '4px'
                                            }}>
                                                {user.type.toUpperCase()} APPLICATION
                                            </div>
                                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{displayName}</h3>
                                            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>{businessName}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>APPLIED</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{new Date(appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'rgba(255,255,255,0.015)',
                                    padding: '20px',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr',
                                    gap: '12px'
                                }}>
                                    <InfoRow icon={<Phone size={14} />} label="Contact Number" value={user.phone || user.phoneNumber || 'N/A'} />
                                    <InfoRow icon={<MapPin size={14} />} label="Location" value={displayLocation} />
                                    {user.type === 'technician' && <InfoRow icon={<Navigation size={14} />} label="Service Area" value={`${user.serviceRadius || 0} KM Coverage`} />}
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
                                    <button
                                        onClick={() => handleAction(user.id || user._id, user.type, 'approve')}
                                        disabled={actionLoading === (user.id || user._id)}
                                        style={{
                                            flex: 2,
                                            height: '56px',
                                            borderRadius: '16px',
                                            background: 'var(--color-primary)',
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: 900,
                                            fontSize: '0.95rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            boxShadow: '0 10px 20px rgba(var(--color-primary-rgb), 0.15)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        {actionLoading === (user.id || user._id) ? 'VERIFYING...' : <><CheckCircle2 size={18} /> Approve</>}
                                    </button>
                                    <button
                                        onClick={() => handleAction(user.id || user._id, user.type, 'reject')}
                                        disabled={actionLoading === (user.id || user._id)}
                                        style={{
                                            flex: 1,
                                            height: '56px',
                                            borderRadius: '16px',
                                            background: 'rgba(255, 59, 48, 0.05)',
                                            border: '1px solid rgba(255, 59, 48, 0.1)',
                                            color: '#ff3b30',
                                            fontWeight: 800,
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span style={{ color: 'var(--color-primary)', opacity: 0.6 }}>{icon}</span>
                {label}
            </div>
            <div style={{ fontWeight: 800, color: 'var(--text-body)' }}>{value}</div>
        </div>
    );
}
