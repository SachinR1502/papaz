'use client';

import { useAuth } from '@/context/AuthContext';
import { useSupplier } from '@/context/SupplierContext';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
    Camera,
    Phone,
    MapPin,
    Navigation,
    Bell,
    Globe,
    CreditCard,
    BadgeCheck,
    LogOut,
    ChevronRight,
    CircleDollarSign,
    User,
    Lock,
    Settings,
    Shield,
    Package,
    Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SupplierProfilePage() {
    const { logout } = useAuth();
    const { profile, inventory, orders } = useSupplier();
    const router = useRouter();
    const [currentLang, setCurrentLang] = useState('en');

    const getLanguageLabel = (lang: string) => {
        const labels: Record<string, string> = {
            'en': 'English', 'hi': 'Hindi', 'mr': 'Marathi',
            'kn': 'Kannada', 'ta': 'Tamil', 'te': 'Telugu'
        };
        return labels[lang] || 'English';
    };

    const handleLanguageCycle = () => {
        const langs = ['en', 'hi', 'mr', 'kn', 'ta', 'te'];
        const nextIndex = (langs.indexOf(currentLang) + 1) % langs.length;
        const nextLang = langs[nextIndex];
        setCurrentLang(nextLang);
        toast.info(`Language changed to ${getLanguageLabel(nextLang)}`);
    };

    const stats = [
        { label: 'Listings', value: inventory?.length || 0, icon: <Package size={16} /> },
        { label: 'Orders', value: orders?.length || 0, icon: <CircleDollarSign size={16} /> },
        { label: 'Rating', value: profile?.rating || '4.8', icon: <Star size={16} /> },
    ];

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Store <span className="text-orange-500">Settings</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your business profile and operational details.
                    </p>
                </div>

                <button
                    onClick={() => { if (confirm('Are you sure you want to sign out?')) logout(); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition shadow-sm active:scale-95"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.8fr] gap-8">
                {/* Left Column: Business Identity */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="w-full h-full rounded-full p-1 bg-gray-100 relative overflow-hidden group shadow-inner">
                                <img
                                    src={profile?.avatar || 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=400&fit=crop'}
                                    alt="Store Logo"
                                    className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <button className="absolute bottom-1 right-1 w-10 h-10 bg-orange-500 text-white rounded-full border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                                <Camera size={18} />
                            </button>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                            {profile?.storeName || 'Partner Shop'}
                        </h2>
                        <div className="flex items-center justify-center gap-1.5 text-orange-500 font-bold text-[10px] uppercase tracking-widest mb-8">
                            <BadgeCheck size={14} className="fill-orange-500 text-white" />
                            Verified Enterprise
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl flex flex-col items-center gap-1">
                                    <div className="text-orange-500">{stat.icon}</div>
                                    <div className="text-lg font-black text-gray-900 leading-none">{stat.value}</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => router.push('/supplier/profile/edit')}
                            className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition shadow-lg shadow-gray-200 active:scale-95"
                        >
                            Update Store Details
                        </button>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6">
                        <div className="flex items-center gap-3 text-orange-600 mb-2">
                            <Shield size={18} />
                            <span className="text-sm font-bold uppercase tracking-widest">Business Security</span>
                        </div>
                        <p className="text-xs text-orange-700/70 font-medium leading-relaxed">
                            Your store data is protected with 256-bit encryption. Always use a strong password for your portal access.
                        </p>
                    </div>
                </div>

                {/* Right Column: Detailed Sections */}
                <div className="space-y-8">
                    {/* Business Info */}
                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                            <User size={18} className="text-gray-400" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Business Identity</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            <ProfileRow icon={<User size={16} />} label="Registered Owner" value={profile?.fullName || 'Business Owner'} />
                            <ProfileRow icon={<Phone size={16} />} label="Primary Phone" value={profile?.phoneNumber || '+91 99000 00000'} />
                            <ProfileRow icon={<MapPin size={16} />} label="Store Address" value={profile?.address || 'Indiranagar, Bangalore'} />
                            <ProfileRow icon={<Navigation size={16} />} label="Service Area" value={profile?.city || 'Bangalore'} />
                        </div>
                    </div>

                    {/* Portal Settings */}
                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                            <Settings size={18} className="text-gray-400" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Portal Preferences</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            <SettingsItem icon={<Bell size={16} />} label="Push Notifications" detail="Enabled" />
                            <SettingsItem
                                icon={<Globe size={16} />}
                                label="Platform Language"
                                detail={getLanguageLabel(currentLang)}
                                onClick={handleLanguageCycle}
                            />
                            <SettingsItem icon={<CreditCard size={16} />} label="Payout Configuration" />
                            <SettingsItem icon={<Lock size={16} />} label="Security & Password" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center border border-gray-100">{icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
            </div>
            <span className="text-sm font-bold text-gray-900 sm:text-right">{value}</span>
        </div>
    );
}

function SettingsItem({ icon, label, detail, onClick }: { icon: React.ReactNode, label: string, detail?: string, onClick?: () => void }) {
    return (
        <div
            className="flex items-center justify-between p-5 group cursor-pointer hover:bg-gray-50/50 transition-all active:bg-gray-100/50"
            onClick={onClick}
        >
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center border border-gray-100 group-hover:text-orange-500 group-hover:border-orange-100 transition-colors">
                    {icon}
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
            </div>
            <div className="flex items-center gap-4">
                {detail && (
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {detail}
                    </span>
                )}
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all" />
            </div>
        </div>
    );
}