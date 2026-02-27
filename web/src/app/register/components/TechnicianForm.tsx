'use client';

import React from 'react';
import {
    Briefcase,
    FileText,
    MapPin,
    ShieldCheck,
    CreditCard,
    Building2,
    Hash,
    User,
    Phone,
    Calendar,
    Clock,
    Wallet,
    Award,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthInput, OnboardingUploader } from './Shared';

const SKILLS = [
    'Two Wheeler Mechanic',
    'Three Wheeler Mechanic',
    'Four Wheeler Mechanic',
    'Electric Vehicle Technician',
    'Battery Specialist',
    'Engine Specialist',
    'AC Specialist',
    'General Service'
];

const WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const GENDERS = ['Male', 'Female', 'Other'];

interface TechnicianFormProps {
    onboardingStep: number;
    setOnboardingStep: (step: number) => void;
    details: any;
    setDetails: (details: any) => void;
    isUploading: string | null;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
    finishRegistration: () => void;
    isLoading: boolean;
}

export function TechnicianForm({
    onboardingStep,
    setOnboardingStep,
    details,
    setDetails,
    isUploading,
    handleFileUpload,
    finishRegistration,
    isLoading
}: TechnicianFormProps) {
    const totalSteps = 8;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Step 1: Basic Personal Information */}
            {onboardingStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center mb-4">
                        <OnboardingUploader
                            label="Profile Photo"
                            value={details.profilePhoto}
                            isUploading={isUploading === 'profilePhoto'}
                            onUpload={e => handleFileUpload(e, 'profilePhoto')}
                        />
                    </div>
                    <AuthInput label="Date of Birth" type="date" value={details.dob} onChange={v => setDetails({ ...details, dob: v })} icon={<Calendar size={18} />} />
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Gender</label>
                        <select
                            value={details.gender}
                            onChange={e => setDetails({ ...details, gender: e.target.value })}
                            className="w-full h-14 bg-[var(--bg-body)]/50 border border-[var(--border-color)] rounded-2xl px-5 focus:border-orange-500 transition-all font-bold text-sm outline-none appearance-none"
                        >
                            <option value="">Select Gender</option>
                            {GENDERS.map(g => <option key={g} value={g.toLowerCase()}>{g}</option>)}
                        </select>
                    </div>
                    <AuthInput label="Alternate Number" value={details.alternateNumber} onChange={v => setDetails({ ...details, alternateNumber: v })} icon={<Phone size={18} />} />
                    <div className="col-span-1 md:col-span-2 flex gap-3 p-1 bg-white/5 rounded-2xl">
                        <button type="button" onClick={() => setDetails({ ...details, registrationType: 'individual' })} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all", details.registrationType === 'individual' ? "bg-orange-500 text-white" : "text-muted")}>Individual</button>
                        <button type="button" onClick={() => setDetails({ ...details, registrationType: 'garage' })} className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all", details.registrationType === 'garage' ? "bg-orange-500 text-white" : "text-muted")}>Service Center</button>
                    </div>
                </div>
            )}

            {/* Step 2: Address Details */}
            {onboardingStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-1 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 mb-2 block">Current Address</label>
                        <textarea
                            value={details.address}
                            onChange={e => setDetails({ ...details, address: e.target.value })}
                            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 text-sm font-bold min-h-[100px] outline-none focus:border-orange-500 transition-all"
                            placeholder="Enter full address"
                        />
                    </div>
                    <AuthInput label="City" value={details.city} onChange={v => setDetails({ ...details, city: v })} icon={<MapPin size={18} />} />
                    <AuthInput label="State" value={details.state} onChange={v => setDetails({ ...details, state: v })} icon={<MapPin size={18} />} />
                    <AuthInput label="Pincode" value={details.zipCode} onChange={v => setDetails({ ...details, zipCode: v })} icon={<Hash size={18} />} />
                </div>
            )}

            {/* Step 3: Skill & Category Selection */}
            {onboardingStep === 3 && (
                <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Specialized Skills (Multi-select)</label>
                    <div className="grid grid-cols-2 gap-2">
                        {SKILLS.map(skill => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => setDetails({ ...details, vehicleTypes: details.vehicleTypes.includes(skill) ? details.vehicleTypes.filter((s: string) => s !== skill) : [...details.vehicleTypes, skill] })}
                                className={cn("py-3 px-2 text-left rounded-xl text-[10px] font-black uppercase border transition-all truncate", details.vehicleTypes.includes(skill) ? "bg-orange-500 border-orange-500 text-white" : "border-white/10 text-muted")}
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                    <AuthInput label="Experience Years" value={details.experienceYears} onChange={v => setDetails({ ...details, experienceYears: v })} icon={<Briefcase size={18} />} />
                </div>
            )}

            {/* Step 4: Working Radius */}
            {onboardingStep === 4 && (
                <div className="space-y-8 text-center py-6">
                    <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapPin size={40} className="text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Operating Range</h3>
                        <p className="text-sm font-bold text-muted mb-8 italic uppercase opacity-60 tracking-widest">Set your technician deployment radius</p>
                    </div>
                    <div className="relative pt-6">
                        <div className="text-4xl font-black text-orange-500 mb-4">{details.serviceRadius} KM</div>
                        <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={details.serviceRadius}
                            onChange={e => setDetails({ ...details, serviceRadius: e.target.value })}
                            className="w-full h-2 bg-white/5 rounded-full appearance-none outline-none accent-orange-500 cursor-pointer"
                        />
                        <div className="flex justify-between mt-4 text-[10px] font-black text-muted uppercase">
                            <span>5 KM</span>
                            <span>50 KM</span>
                            <span>100 KM</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 5: Certification & Qualification */}
            {onboardingStep === 5 && (
                <div className="space-y-6">
                    {details.registrationType === 'garage' && (
                        <AuthInput label="Workshop Name" value={details.garageName} onChange={v => setDetails({ ...details, garageName: v })} icon={<Briefcase size={18} />} />
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <OnboardingUploader label="ITI Certificate" value={details.documents.itiCert} isUploading={isUploading === 'itiCert'} onUpload={e => handleFileUpload(e, 'itiCert')} />
                        <OnboardingUploader label="Technical Diploma" value={details.documents.diploma} isUploading={isUploading === 'diploma'} onUpload={e => handleFileUpload(e, 'diploma')} />
                        <div className="col-span-2 h-[1px] bg-white/5 my-2" />
                        <OnboardingUploader label="EV Certification" value={details.documents.evCert} isUploading={isUploading === 'evCert'} onUpload={e => handleFileUpload(e, 'evCert')} />
                        <OnboardingUploader label="Police Clearance" value={details.documents.policeClearance} isUploading={isUploading === 'policeClearance'} onUpload={e => handleFileUpload(e, 'policeClearance')} />
                    </div>
                </div>
            )}

            {/* Step 6: Legal Verification (KYC) */}
            {onboardingStep === 6 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        <AuthInput label="Aadhaar Number" value={details.aadharNo} onChange={v => setDetails({ ...details, aadharNo: v })} icon={<ShieldCheck size={18} />} placeholder="XXXX XXXX XXXX" />
                        <AuthInput label="PAN Number" value={details.panNo} onChange={v => setDetails({ ...details, panNo: v })} icon={<CreditCard size={18} />} placeholder="ABCDE1234F" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <OnboardingUploader label="Aadhaar Upload" value={details.documents.idProof} isUploading={isUploading === 'idProof'} onUpload={e => handleFileUpload(e, 'idProof')} />
                        <OnboardingUploader label="PAN Upload" value={details.documents.panCard} isUploading={isUploading === 'panCard'} onUpload={e => handleFileUpload(e, 'panCard')} />
                    </div>
                </div>
            )}

            {/* Step 7: Service Charges & Availability */}
            {onboardingStep === 7 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                        <AuthInput label="Base Visit" value={details.baseVisitCharge} onChange={v => setDetails({ ...details, baseVisitCharge: v })} icon={<Wallet size={14} />} />
                        <AuthInput label="Per Hour" value={details.perHourCharge} onChange={v => setDetails({ ...details, perHourCharge: v })} icon={<Clock size={14} />} />
                        <AuthInput label="Emergency" value={details.emergencyServiceCharge} onChange={v => setDetails({ ...details, emergencyServiceCharge: v })} icon={<Award size={14} />} />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Working Days</label>
                        <div className="flex flex-wrap gap-2">
                            {WORKING_DAYS.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => setDetails({ ...details, workingDays: details.workingDays.includes(day) ? details.workingDays.filter((d: string) => d !== day) : [...details.workingDays, day] })}
                                    className={cn("py-2 px-3 rounded-lg text-[9px] font-black uppercase border transition-all", details.workingDays.includes(day) ? "bg-orange-500 border-orange-500 text-white" : "border-white/10 text-muted")}
                                >
                                    {day.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">From Time</label>
                            <input type="time" value={details.workingHours.from} onChange={e => setDetails({ ...details, workingHours: { ...details.workingHours, from: e.target.value } })} className="w-full h-12 bg-[var(--bg-body)]/50 border border-[var(--border-color)] rounded-xl px-4 text-sm font-bold outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">To Time</label>
                            <input type="time" value={details.workingHours.to} onChange={e => setDetails({ ...details, workingHours: { ...details.workingHours, to: e.target.value } })} className="w-full h-12 bg-[var(--bg-body)]/50 border border-[var(--border-color)] rounded-xl px-4 text-sm font-bold outline-none" />
                        </div>
                    </div>

                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-2xl cursor-pointer">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Available for Emergency</span>
                        <input
                            type="checkbox"
                            className="w-10 h-6 accent-orange-500"
                            checked={details.availableForEmergency}
                            onChange={e => setDetails({ ...details, availableForEmergency: e.target.checked })}
                        />
                    </label>
                </div>
            )}

            {/* Step 8: Bank Details */}
            {onboardingStep === 8 && (
                <div className="space-y-4">
                    <AuthInput label="Account Holder" value={details.bankDetails.holderName} onChange={v => setDetails({ ...details, bankDetails: { ...details.bankDetails, holderName: v } })} icon={<User size={18} />} />
                    <AuthInput label="Bank Name" value={details.bankDetails.bankName} onChange={v => setDetails({ ...details, bankDetails: { ...details.bankDetails, bankName: v } })} icon={<Building2 size={18} />} />
                    <AuthInput label="Account Number" value={details.bankDetails.accountNo} onChange={v => setDetails({ ...details, bankDetails: { ...details.bankDetails, accountNo: v } })} icon={<Hash size={18} />} />
                    <AuthInput label="IFSC Code" value={details.bankDetails.ifsc} onChange={v => setDetails({ ...details, bankDetails: { ...details.bankDetails, ifsc: v } })} icon={<Activity size={18} />} />
                    <AuthInput label="UPI ID" value={details.bankDetails.upiId} onChange={v => setDetails({ ...details, bankDetails: { ...details.bankDetails, upiId: v } })} icon={<Wallet size={18} />} />

                    <label className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer mt-6">
                        <input type="checkbox" className="mt-1 accent-orange-500" checked={details.agreedToPlatformTerms} onChange={e => setDetails({ ...details, agreedToPlatformTerms: e.target.checked })} />
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">I verify that all expertise and legal documents are authentic.</span>
                    </label>
                </div>
            )}

            <div className="flex justify-between pt-8">
                {onboardingStep > 1 && (
                    <button
                        type="button"
                        onClick={() => setOnboardingStep(onboardingStep - 1)}
                        className="px-6 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase text-muted hover:text-white transition-all"
                    >
                        Back
                    </button>
                )}
                <div className="flex-1" />
                {onboardingStep < totalSteps ? (
                    <button
                        type="button"
                        onClick={() => setOnboardingStep(onboardingStep + 1)}
                        className="px-8 py-4 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                    >
                        Next Stage
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={finishRegistration}
                        disabled={!details.agreedToPlatformTerms || isLoading}
                        className="px-8 py-4 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                    >
                        Activate Protocol
                    </button>
                )}
            </div>
        </div>
    );
}
