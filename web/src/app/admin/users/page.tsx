'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    Shield,
    BadgeCheck,
    UserCircle,
    MailCheck,
    UserCog,
    ExternalLink
} from 'lucide-react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getAllUsers();
            console.log("data", data);
            if (Array.isArray(data)) {
                setUsers(data);
            } else if (data && typeof data === 'object' && Array.isArray((data as any).users)) {
                setUsers((data as any).users);
            } else {
                console.warn('Unexpected API response format for users:', data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const nameMatch = (user.profile?.fullName || user.profile?.name || user.name || '').toLowerCase().includes(search.toLowerCase());
        const emailMatch = (user.profile?.email || user.email || '').toLowerCase().includes(search.toLowerCase());
        const phoneMatch = (user.phoneNumber || user.phone || '').includes(search);
        const idMatch = (user.id || user._id || '').toLowerCase().includes(search.toLowerCase());

        const matchesSearch = nameMatch || emailMatch || phoneMatch || idMatch;
        const userType = user.type || user.role || '';
        const matchesType = typeFilter === 'All' || userType.toLowerCase() === typeFilter.toLowerCase();

        return matchesSearch && matchesType;
    });

    return (
        <div style={{ position: 'relative' }}>
            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>
                        Users
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '4px' }}>
                        Manage all platform users and roles
                    </p>
                </div>
            </header>

            {/* Controls Bar */}
            <div style={{ marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
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
                        placeholder="Search by name, email or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '16px 0',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-body)',
                            outline: 'none',
                            fontWeight: 500,
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {['All', 'Customer', 'Technician', 'Supplier'].map(type => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: '1px solid',
                                borderColor: typeFilter === type ? 'var(--color-primary)' : 'var(--border-color)',
                                background: typeFilter === type ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                                color: typeFilter === type ? 'white' : 'var(--text-muted)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={thStyle}>USER</th>
                            <th style={thStyle}>ROLE</th>
                            <th style={thStyle}>APPROVAL</th>
                            <th style={thStyle}>PROFILE</th>
                            <th style={thStyle}>JOINED</th>
                            <th style={thStyle}>ACCOUNT</th>
                            <th style={thStyle}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '100px' }}>
                                    <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(var(--color-primary-rgb), 0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                                </td>
                            </tr>
                        ) : filteredUsers.length > 0 ? filteredUsers.map((user: any) => {
                            // Backend getAllUsers returns flat structure with 'type', 'name', 'email'
                            const userType = user.type || user.role || 'Guest';
                            const displayName = user.name || user.fullName || user.profile?.fullName || user.phoneNumber || 'Unknown';
                            const displayEmail = user.email || user.profile?.email || user.phoneNumber || 'No Contact';

                            // Status Logic
                            const isApproved = userType.toLowerCase() === 'customer' ? true : (user.isApproved === true);
                            const isProfileCompleted = user.profileCompleted === true;
                            const isActive = user.status !== 'blocked' && user.status !== 'suspended';

                            return (
                                <tr key={user.id || user._id} className="row-hover" style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '12px',
                                                background: 'rgba(var(--color-primary-rgb), 0.1)',
                                                color: 'var(--color-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <UserCircle size={24} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: 'var(--text-body)', fontSize: '1rem' }}>{displayName}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{displayEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 900,
                                                letterSpacing: '0.5px',
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'var(--text-body)'
                                            }}>
                                                {userType.toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        {isApproved ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34c759', fontWeight: 800, fontSize: '0.8rem' }}>
                                                <BadgeCheck size={16} fill="#34c759" color="white" /> VERIFIED
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff3b30', fontWeight: 800, fontSize: '0.8rem' }}>
                                                <Shield size={16} /> PENDING
                                            </div>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        {isProfileCompleted ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-body)', fontWeight: 700, fontSize: '0.8rem', opacity: 0.8 }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34c759' }}></div>
                                                COMPLETE
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', opacity: 0.5 }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff9500' }}></div>
                                                INCOMPLETE
                                            </div>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 600 }}>{new Date(user.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? '#34c759' : '#ff3b30' }} />
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isActive ? '#34c759' : '#ff3b30' }}>
                                                {isActive ? 'ACTIVE' : 'SUSPENDED'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '10px' }}>
                                                Manage
                                            </button>
                                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                                    No users matching your search criteria
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
