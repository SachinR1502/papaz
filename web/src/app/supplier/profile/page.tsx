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
    Store,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        setCurrentLang(langs[nextIndex]);
    };

    const stats = [
        { label: 'Listings', value: inventory?.length || 0, icon: <Package size={18} /> },
        { label: 'Total Orders', value: orders?.length || 0, icon: <CircleDollarSign size={18} /> },
        { label: 'Store Rating', value: profile?.rating || '4.8', icon: <Star size={18} /> },
    ];

    return (
        <div className="flex flex-col gap-10 md:gap-14 animate-fade-in pb-20">
            {/* Header */}
            <header className="text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 lg:mb-6">
                    <Settings size={10} className="text-primary" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-primary">Store Configuration</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                    Store <span className="text-primary">Settings</span>
                </h1>
                <p className="mt-4 text-base md:text-lg text-muted font-bold max-w-2xl opacity-80 leading-relaxed">
                    Manage your business profile, operational details, and account security.
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.6fr] gap-12">
                {/* Left Column: Business Identity */}
                <div className="flex flex-col gap-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/10 to-primary/20 rounded-[40px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />

                        <div className="relative p-10 md:p-12 rounded-[40px] border border-border bg-card/20 backdrop-blur-3xl shadow-2xl overflow-hidden text-center">
                            <div className="relative w-40 h-40 mx-auto mb-8">
                                <div className="w-full h-full rounded-full p-1 bg-gradient-to-br from-primary via-orange-500 to-blue-600 relative overflow-hidden group/avatar shadow-2xl shadow-primary/20">
                                    <img
                                        src={profile?.avatar || 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=400&fit=crop'}
                                        alt="Store Logo"
                                        className="w-full h-full rounded-full object-cover border-4 border-card transition-transform duration-700 group-hover/avatar:scale-110"
                                    />
                                </div>
                                <button className="absolute bottom-1 right-1 w-12 h-12 bg-primary text-white rounded-full border-4 border-card flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
                                    <Camera size={20} />
                                </button>
                            </div>

                            <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter mb-2">
                                {profile?.storeName || 'Partner Shop'}
                            </h2>
                            <div className="flex items-center justify-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-10">
                                <BadgeCheck size={16} className="fill-primary text-card" />
                                Verified Enterprise
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-10">
                                {stats.map((stat, i) => (
                                    <div key={i} className="bg-card/40 border border-border/50 p-4 rounded-2xl flex flex-col items-center gap-2">
                                        <div className="text-primary">{stat.icon}</div>
                                        <div className="text-xl font-black text-foreground italic">{stat.value}</div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-muted opacity-60">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => router.push('/supplier/profile/edit')}
                                className="w-full py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 italic"
                            >
                                Update Store Details
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => { if (confirm('Are you sure you want to sign out?')) logout(); }}
                        className="flex items-center gap-4 px-8 py-5 rounded-[28px] bg-red-500/5 border border-red-500/10 text-red-500 font-black text-[11px] uppercase tracking-widest transition-all hover:bg-red-500/10 hover:-translate-y-px active:scale-95 shadow-sm"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <LogOut size={20} />
                        </div>
                        Sign Out of Portal
                    </button>
                </div>

                {/* Right Column: Detailed Sections */}
                <div className="flex flex-col gap-10">
                    {/* Business Info */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-1">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/5">
                                <Shield size={20} />
                            </div>
                            <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tight">Business Profile</h3>
                        </div>

                        <div className="rounded-[40px] border border-border bg-card/10 backdrop-blur-xl overflow-hidden divide-y divide-border/50">
                            <ProfileRow icon={<User size={18} />} label="Registered Owner" value={profile?.fullName || 'Business Owner'} />
                            <ProfileRow icon={<Phone size={18} />} label="Contact Phone" value={profile?.phoneNumber || '+91 99000 00000'} />
                            <ProfileRow icon={<MapPin size={18} />} label="Store Address" value={profile?.address || 'Indiranagar, Bangalore'} />
                            <ProfileRow icon={<Navigation size={18} />} label="Service City" value={profile?.city || 'Bangalore'} isLast />
                        </div>
                    </section>

                    {/* Operational Settings */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 px-1">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                                <Settings size={20} />
                            </div>
                            <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tight">System Preferences</h3>
                        </div>

                        <div className="rounded-[40px] border border-border bg-card/10 backdrop-blur-xl overflow-hidden divide-y divide-border/50">
                            <SettingsItem icon={<Bell size={18} />} label="Push Notifications" />
                            <SettingsItem
                                icon={<Globe size={18} />}
                                label="Portal Language"
                                detail={getLanguageLabel(currentLang)}
                                onClick={handleLanguageCycle}
                            />
                            <SettingsItem icon={<CreditCard size={18} />} label="Payments & Settlement" />
                            <SettingsItem icon={<CircleDollarSign size={18} />} label="Trading Currency" detail="INR (₹)" />
                            <SettingsItem icon={<Lock size={18} />} label="Security Settings" isLast />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function ProfileRow({ icon, label, value, isLast = false }: { icon: React.ReactNode, label: string, value: string, isLast?: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 gap-4 group hover:bg-card/20 transition-colors">
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform">{icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted opacity-60 m-0">{label}</span>
            </div>
            <span className="text-base font-black text-foreground italic tracking-tight sm:text-right">{value}</span>
        </div>
    );
}

function SettingsItem({ icon, label, detail, onClick, isLast = false }: { icon: React.ReactNode, label: string, detail?: string, onClick?: () => void, isLast?: boolean }) {
    return (
        <div
            className="flex items-center justify-between p-8 group cursor-pointer hover:bg-card/20 transition-all active:bg-card/30"
            onClick={onClick}
        >
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/5 text-indigo-500 flex items-center justify-center border border-indigo-500/10 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-base font-black text-foreground italic uppercase tracking-tight group-hover:text-primary transition-colors">{label}</span>
            </div>
            <div className="flex items-center gap-6">
                {detail && (
                    <span className="px-4 py-2 bg-card border border-border rounded-xl text-[9px] font-black uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">
                        {detail}
                    </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted group-hover:text-primary group-hover:border-primary/30 group-hover:shadow-lg transition-all">
                    <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </div>
    );
}