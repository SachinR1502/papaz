'use client';

import React from 'react';
import { Store, User, MapPin, Hash, ShieldCheck, CreditCard, FileText, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthInput, OnboardingUploader } from './Shared';

const SUPPLIER_CATEGORIES = ['Two Wheeler Parts', 'Three Wheeler Parts', 'Four Wheeler Parts', 'Commercial Vehicles', 'Electric Vehicle Parts', 'EV Accessories', 'Other'];

interface SupplierFormProps {
    onboardingStep: number;
    setOnboardingStep: (step: number) => void;
    details: any;
    setDetails: (details: any) => void;
    isUploading: string | null;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
    finishRegistration: () => void;
    isLoading: boolean;
    form: any;
    setForm: (form: any) => void;
}

export function SupplierForm({
    onboardingStep,
    setOnboardingStep,
    details,
    setDetails,
    isUploading,
    handleFileUpload,
    finishRegistration,
    isLoading,
    form,
    setForm
}: SupplierFormProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {onboardingStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <AuthInput label="Store Name" value={details.storeName} onChange={v => setDetails({ ...details, storeName: v })} icon={<Store size={18} />} />
                    <AuthInput label="Proprietor Name" value={form.fullName} onChange={v => setForm({ ...form, fullName: v })} icon={<User size={18} />} />
                    <AuthInput label="Operating City" value={details.city} onChange={v => setDetails({ ...details, city: v })} icon={<MapPin size={18} />} />
                    <AuthInput label="Operating State" value={details.state} onChange={v => setDetails({ ...details, state: v })} icon={<MapPin size={18} />} />
                    <AuthInput label="Pincode" value={details.zipCode} onChange={v => setDetails({ ...details, zipCode: v })} icon={<Hash size={18} />} />
                    <div className="col-span-1 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 mb-2 block">Complete Business Address</label>
                        <textarea value={details.address} onChange={e => setDetails({ ...details, address: e.target.value })} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 text-sm font-bold min-h-[100px] outline-none focus:border-orange-500 transition-all" />
                    </div>
                </div>
            )}
            {onboardingStep === 2 && (
                <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Supplied Categories</label>
                    <div className="grid grid-cols-2 gap-2">
                        {SUPPLIER_CATEGORIES.map(cat => (
                            <button key={cat} type="button" onClick={() => setDetails({ ...details, businessCategories: details.businessCategories.includes(cat) ? details.businessCategories.filter((c: any) => c !== cat) : [...details.businessCategories, cat] })} className={cn("py-3 px-2 rounded-xl text-[10px] font-black uppercase border transition-all text-left truncate", details.businessCategories.includes(cat) ? "bg-orange-500 border-orange-500 text-white" : "border-white/10 text-muted")}>{cat}</button>
                        ))}
                    </div>
                </div>
            )}
            {onboardingStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AuthInput label="GSTIN" value={details.gstin} onChange={v => setDetails({ ...details, gstin: v })} icon={<ShieldCheck size={18} />} />
                    <AuthInput label="PAN" value={details.panNo} onChange={v => setDetails({ ...details, panNo: v })} icon={<CreditCard size={18} />} />
                    <AuthInput label="Aadhaar" value={details.aadharNo} onChange={v => setDetails({ ...details, aadharNo: v })} icon={<User size={18} />} />
                    <AuthInput label="UDYAM Number" value={details.udyamNumber} onChange={v => setDetails({ ...details, udyamNumber: v })} icon={<FileText size={18} />} />
                </div>
            )}
            {onboardingStep === 4 && (
                <div className="grid grid-cols-2 gap-4">
                    <OnboardingUploader label="GST Cert" value={details.documents.gstCertificate} isUploading={isUploading === 'gstCertificate'} onUpload={e => handleFileUpload(e, 'gstCertificate')} />
                    <OnboardingUploader label="PAN Card" value={details.documents.panCard} isUploading={isUploading === 'panCard'} onUpload={e => handleFileUpload(e, 'panCard')} />
                    <OnboardingUploader label="Aadhaar" value={details.documents.aadharCard} isUploading={isUploading === 'aadharCard'} onUpload={e => handleFileUpload(e, 'aadharCard')} />
                    <OnboardingUploader label="Cheque" value={details.documents.cancelledCheque} isUploading={isUploading === 'cancelledCheque'} onUpload={e => handleFileUpload(e, 'cancelledCheque')} />
                </div>
            )}
            {onboardingStep === 5 && (
                <div className="space-y-4">
                    <AuthInput label="Bank Name" value={details.bankDetails.bankName} onChange={v => setDetails({ ...details, bankDetails: { ...details.bankDetails, bankName: v } })} icon={<Building2 size={18} />} />
                    <AuthInput label="Account No" value={details.bankDetails.accountNo} onChange={v => setDetails({ ...details, bankDetails: { ...details.bankDetails, accountNo: v } })} icon={<Hash size={18} />} />
                    <label className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer">
                        <input type="checkbox" className="mt-1 accent-orange-500" checked={details.agreedToPlatformTerms} onChange={e => setDetails({ ...details, agreedToPlatformTerms: e.target.checked })} />
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">I agree to platform terms and verify all business identities.</span>
                    </label>
                </div>
            )}

            <div className="flex justify-between pt-8">
                {onboardingStep > 1 && <button type="button" onClick={() => setOnboardingStep(onboardingStep - 1)} className="px-6 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase text-muted hover:text-white transition-all">Back</button>}
                <div className="flex-1" />
                {onboardingStep < 5 ? (
                    <button type="button" onClick={() => setOnboardingStep(onboardingStep + 1)} className="px-8 py-4 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Next Stage</button>
                ) : (
                    <button type="button" onClick={finishRegistration} disabled={!details.agreedToPlatformTerms || isLoading} className="px-8 py-4 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Activate Partner</button>
                )}
            </div>
        </div>
    );
}
