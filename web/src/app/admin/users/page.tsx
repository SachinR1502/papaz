'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
    Users,
    Search,
    Shield,
    BadgeCheck,
    UserCircle,
    MoreVertical
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
        <div className="relative pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                        Users
                    </h1>
                    <p className="text-muted text-sm md:text-base font-medium mt-2">
                        Manage all platform users and roles
                    </p>
                </div>
            </header>

            {/* Controls Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="flex-1 flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus-within:bg-white/10 transition-colors">
                    <Search size={20} className="text-primary opacity-60" />
                    <input
                        type="text"
                        placeholder="Search by name, email or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-foreground font-medium placeholder:text-muted/50 w-full"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                    {['All', 'Customer', 'Technician', 'Supplier'].map(type => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-5 py-3 rounded-xl border text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${typeFilter === type
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-white/5 border-transparent text-muted hover:bg-white/10'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel p-0 rounded-[24px] overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="p-5 text-xs font-black text-muted tracking-widest uppercase border-b border-white/5">User</th>
                                <th className="p-5 text-xs font-black text-muted tracking-widest uppercase border-b border-white/5">Role</th>
                                <th className="p-5 text-xs font-black text-muted tracking-widest uppercase border-b border-white/5">Approval</th>
                                <th className="p-5 text-xs font-black text-muted tracking-widest uppercase border-b border-white/5">Profile</th>
                                <th className="p-5 text-xs font-black text-muted tracking-widest uppercase border-b border-white/5">Joined</th>
                                <th className="p-5 text-xs font-black text-muted tracking-widest uppercase border-b border-white/5">Account</th>
                                <th className="p-5 text-right border-b border-white/5"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="p-24 text-center">
                                        <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"></div>
                                        <p className="text-muted font-bold text-xs tracking-widest uppercase">Loading Users...</p>
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
                                    <tr key={user.id || user._id} className="group hover:bg-white/[0.02] border-b border-white/5 last:border-0 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <UserCircle size={24} />
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-foreground text-sm">{displayName}</div>
                                                    <div className="text-xs text-muted font-medium mt-0.5">{displayEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="inline-block px-2.5 py-1 rounded-lg bg-white/5 text-xs font-black text-foreground uppercase tracking-wide">
                                                {userType}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            {isApproved ? (
                                                <div className="flex items-center gap-1.5 text-green-500 font-extrabold text-xs">
                                                    <BadgeCheck size={16} className="fill-green-500 text-white" /> VERIFIED
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-red-500 font-extrabold text-xs">
                                                    <Shield size={16} /> PENDING
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            {isProfileCompleted ? (
                                                <div className="flex items-center gap-2 text-foreground/80 font-bold text-xs">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    COMPLETE
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-muted font-bold text-xs opacity-60">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                    INCOMPLETE
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="font-semibold text-sm text-muted">{new Date(user.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className={`font-bold text-xs ${isActive ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isActive ? 'ACTIVE' : 'SUSPENDED'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors">
                                                    Manage
                                                </button>
                                                <button className="text-muted hover:text-foreground transition-colors">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center text-muted">
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                            <Users size={48} strokeWidth={1} />
                                            <span>No users matching your search criteria</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
