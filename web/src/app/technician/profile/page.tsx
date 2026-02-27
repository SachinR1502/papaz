'use client';

import React, { useState } from 'react';
import { useTechnician } from '@/context/TechnicianContext';
import { useAuth } from '@/context/AuthContext';
import {
    User,
    Briefcase,
    MapPin,
    ShieldCheck,
    Clock,
    Wallet,
    CreditCard,
    Award,
    Edit3,
    Camera,
    Plus,
    Calendar,
    ChevronRight,
    Building2,
    Activity,
    Phone,
    Mail,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Helper functions for masking sensitive data
const maskData = (data: string | undefined | null, visibleStart = 0, visibleEnd = 4) => {
    if (!data) return 'N/A';
    const strData = String(data);
    const length = strData.length;
    if (length <= (visibleStart + visibleEnd)) return strData;
    const middle = '*'.repeat(length - visibleStart - visibleEnd);
    return strData.substring(0, visibleStart) + middle + strData.substring(length - visibleEnd);
};

export default function TechnicianProfilePage() {
    const { profile, isLoading, isApproved } = useTechnician();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'professional' | 'operations' | 'legal'>('professional');

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-10 animate-pulse">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Activity size={28} className="text-orange-500" />
                </div>
                <div className="h-6 w-32 bg-gray-100 rounded-lg mb-4" />
                <div className="h-4 w-48 bg-gray-100 rounded-lg" />
            </div>
        );
    }

    const techProfile = (profile || {}) as any;
    const techUser = (user || {}) as any;

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto p-6 md:p-8">
            {/* Header Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center bg-gray-50">
                            {techProfile.avatar ? (
                                <Image
                                    src={techProfile.avatar}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <User size={48} className="text-gray-300" />
                            )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2.5 bg-orange-500 text-white rounded-xl border-4 border-white hover:bg-orange-600 shadow-lg transition-all active:scale-95">
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {techProfile.fullName || techUser.fullName || techUser.name || 'Technician Core'}
                            </h1>
                            {isApproved ? (
                                <span className="px-2.5 py-1 bg-green-50 text-green-600 border border-green-100 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldCheck size={12} />
                                    Verified Expert
                                </span>
                            ) : (
                                <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Activity size={12} className="animate-pulse" />
                                    Pending Review
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-500 text-sm">
                            <div className="flex items-center gap-1.5">
                                <Briefcase size={14} className="text-orange-500" />
                                <span>{techProfile.experienceYears || '0'} Years Exp.</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-orange-500" />
                                <span>{techProfile.city || 'Location Pending'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Phone size={14} className="text-orange-500" />
                                <span>{techUser.phoneNumber || techProfile.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <button className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2">
                        <Edit3 size={14} />
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl w-fit border border-gray-200">
                <TabButton active={activeTab === 'professional'} onClick={() => setActiveTab('professional')} icon={Briefcase} label="Professional" />
                <TabButton active={activeTab === 'operations'} onClick={() => setActiveTab('operations')} icon={Clock} label="Operations" />
                <TabButton active={activeTab === 'legal'} onClick={() => setActiveTab('legal')} icon={ShieldCheck} label="Legal & Bank" />
            </div>

            {/* Views Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activeTab === 'professional' && <ProfessionalView profile={techProfile} user={techUser} />}
                {activeTab === 'operations' && <OperationsView profile={techProfile} />}
                {activeTab === 'legal' && <LegalView profile={techProfile} />}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                active ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
        >
            <Icon size={14} />
            {label}
        </button>
    );
}

function ProfessionalView({ profile, user }: any) {
    const skills = profile.vehicleTypes || ['General Diagnostics'];

    return (
        <>
            <ProfileSection title="Expertise" icon={Award}>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string) => (
                        <div key={skill} className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg text-[10px] font-bold uppercase">
                            {skill}
                        </div>
                    ))}
                    <button className="px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-[10px] font-bold text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-all">
                        + Add Skill
                    </button>
                </div>
            </ProfileSection>

            <ProfileSection title="Core Information" icon={User}>
                <div className="space-y-3">
                    <DetailItem label="Legal Name" value={profile.fullName || user.name || 'N/A'} icon={User} />
                    <DetailItem label="Expert Email" value={user.email || 'N/A'} icon={Mail} />
                    <DetailItem label="Workshop" value={profile.garageName || 'Independent'} icon={Building2} />
                    <DetailItem label="Service Address" value={profile.address || 'Address Pending'} icon={MapPin} />
                </div>
            </ProfileSection>
        </>
    );
}

function OperationsView({ profile }: any) {
    const pricing = profile.pricing || { base: 250, hour: 150, emergency: 500 };

    return (
        <>
            <ProfileSection title="Operational Range" icon={MapPin}>
                <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-orange-600">Active Radius</p>
                        <p className="text-3xl font-bold text-gray-900">{profile.serviceRadius || '10'} KM</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl shadow-sm text-orange-500">
                        <Activity size={24} />
                    </div>
                </div>
            </ProfileSection>

            <ProfileSection title="Service Rates" icon={Wallet}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <PricingBox label="Base Visit" value={pricing.base} />
                    <PricingBox label="Hourly" value={pricing.hour} />
                    <PricingBox label="Emergency" value={pricing.emergency} />
                </div>
            </ProfileSection>
        </>
    );
}

function LegalView({ profile }: any) {
    const bank = profile.bankAccounts?.[0] || {};

    return (
        <>
            <ProfileSection title="Identity Logs" icon={ShieldCheck}>
                <div className="space-y-3">
                    <DetailItem label="Aadhaar UID" value={maskData(profile.aadharNo, 0, 4)} icon={ShieldCheck} verified={!!profile.aadharNo} />
                    <DetailItem label="PAN Card" value={maskData(profile.panNo, 0, 4)} icon={CreditCard} verified={!!profile.panNo} />
                    <DetailItem label="Udyam Reg" value={profile.udyamNo || 'N/A'} icon={Award} />
                </div>
            </ProfileSection>

            <ProfileSection title="Settlement Node" icon={Building2}>
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-lg font-bold text-gray-900">{bank.bankName || 'No Bank Linked'}</p>
                            <p className="text-xs text-gray-500 uppercase font-bold">A/C: {maskData(bank.accountNumber, 0, 4)}</p>
                        </div>
                        <CreditCard className="text-orange-500" size={20} />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-orange-100 rounded-lg text-[10px] font-bold text-orange-600">
                        UPI: {profile.upiId || 'Pending'}
                    </div>
                </div>
            </ProfileSection>
        </>
    );
}

function ProfileSection({ title, icon: Icon, children }: any) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                    <Icon size={18} />
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}

function DetailItem({ label, value, icon: Icon, verified }: any) {
    return (
        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all">
            <div className="flex items-center gap-3">
                <Icon size={16} className="text-gray-400" />
                <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">{label}</p>
                    <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
            </div>
            {verified && <CheckCircle2 size={16} className="text-green-500" />}
        </div>
    );
}

function PricingBox({ label, value }: any) {
    return (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</p>
            <p className="text-base font-bold text-gray-900">₹{value}</p>
        </div>
    );
}
