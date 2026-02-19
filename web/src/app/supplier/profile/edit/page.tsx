'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Pencil,
    Store,
    User,
    Phone,
    MapPin,
    Locate,
    FileText,
    Save,
    Loader2,
    CheckCircle2,
    Shield,
    BadgeCheck,
    Globe,
    Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SupplierEditProfilePage() {
    const { updateProfile, profile, isLoading } = useSupplier();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        storeName: '',
        fullName: '',
        address: '',
        phoneNumber: '',
        gst: '',
        city: ''
    });

    useEffect(() => {
        if (profile) {
            setForm({
                storeName: profile.storeName || '',
                fullName: profile.fullName || '',
                address: profile.address || '',
                phoneNumber: profile.phoneNumber || '',
                gst: profile.gst || '',
                city: profile.city || ''
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.storeName || !form.fullName || !form.phoneNumber || !form.address || !form.city) {
            toast.error('Required Fields Missing', {
                description: 'Please ensure all business identity and contact details are provided.'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await updateProfile(form);
            toast.success('Profile Refined', {
                description: 'Your business identity has been updated successfully.'
            });
            router.push('/supplier/profile');
        } catch (e) {
            toast.error('Update Failed', {
                description: 'We encountered an error while synchronizing your profile.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-10 md:gap-14 animate-fade-in pb-20">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all active:scale-90 shadow-sm"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
                            <Pencil size={10} className="text-primary" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-primary">Identity Modification</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                            Refine <span className="text-primary">Profile</span>
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-muted font-bold opacity-80 leading-relaxed italic uppercase tracking-tight">
                            Update your business credentials and operational parameters.
                        </p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-3 px-6 py-3 bg-green-500/10 text-green-500 rounded-2xl border border-green-500/20 text-[10px] font-black uppercase tracking-widest italic animate-in fade-in duration-1000">
                    <CheckCircle2 size={16} />
                    Verified Enterprise Status
                </div>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                {/* Identity Section */}
                <section className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-xl group relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Store size={20} />
                        </div>
                        <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">Business Identity</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Store / Business Name"
                            required
                            placeholder="Enter your registered shop name"
                            value={form.storeName}
                            onChange={(v: string) => setForm({ ...form, storeName: v })}
                            icon={<Store size={18} />}
                        />
                        <FormInput
                            label="Designated Representative"
                            required
                            placeholder="Full name of the owner/manager"
                            value={form.fullName}
                            onChange={(v: string) => setForm({ ...form, fullName: v })}
                            icon={<User size={18} />}
                        />
                    </div>
                </section>

                {/* Logistics Section */}
                <section className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-xl group relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                            <Locate size={20} />
                        </div>
                        <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">Operational Access</h3>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Primary Contact"
                                required
                                placeholder="+91 00000 00000"
                                value={form.phoneNumber}
                                onChange={(v: string) => setForm({ ...form, phoneNumber: v })}
                                icon={<Phone size={18} />}
                            />
                            <FormInput
                                label="HQ Jurisdiction"
                                required
                                placeholder="Operational city hub"
                                value={form.city}
                                onChange={(v: string) => setForm({ ...form, city: v })}
                                icon={<Globe size={18} />}
                            />
                        </div>

                        <div className="space-y-3 group">
                            <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60">
                                Full Logistic Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-6 top-6 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity">
                                    <MapPin size={20} />
                                </div>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Enter complete physical address for order mapping..."
                                    className="w-full min-h-[140px] bg-card/40 border border-border rounded-[28px] py-6 pl-16 pr-8 text-sm font-bold outline-none focus:border-primary/50 transition-all placeholder:text-muted/40 placeholder:italic resize-none leading-relaxed italic"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Compliance Section */}
                <section className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-xl group relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                            <Shield size={20} />
                        </div>
                        <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">Legal & Compliance</h3>
                    </div>

                    <div className="max-w-md">
                        <FormInput
                            label="GST Identification"
                            placeholder="Valid GSTIN number"
                            value={form.gst}
                            onChange={(v: string) => setForm({ ...form, gst: v.toUpperCase() })}
                            icon={<Building2 size={18} />}
                        />
                    </div>
                </section>

                {/* Control Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full sm:w-1/3 py-5 bg-card border border-border rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-muted hover:text-foreground hover:bg-card/60 transition-all active:scale-95 italic text-center"
                    >
                        Abort Modification
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full sm:w-2/3 py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 italic flex items-center justify-center gap-4"
                    >
                        {isSubmitting || isLoading ? (
                            <Loader2 size={24} className="animate-spin text-white" />
                        ) : (
                            <>
                                <Save size={20} />
                                Synchronize Identity
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function FormInput({ label, placeholder, value, onChange, icon, required = false, type = "text" }: any) {
    return (
        <div className="space-y-3 flex-1 group">
            <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity">
                    {icon}
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-card/40 border border-border rounded-2xl py-4.5 pl-14 pr-6 text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:text-muted/30 placeholder:italic italic"
                />
            </div>
        </div>
    );
}
