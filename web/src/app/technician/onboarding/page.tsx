'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { technicianService } from '@/services/technicianService';
import {
    User,
    ShieldCheck,
    Wrench,
    MapPin,
    Briefcase,
    CreditCard,
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Camera,
    Plus,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import apiClient from '@/services/apiClient';

const STEPS = [
    { id: 1, title: 'Identity', icon: <User size={18} /> },
    { id: 2, title: 'Expertise', icon: <Wrench size={18} /> },
    { id: 3, title: 'Service Reach', icon: <MapPin size={18} /> },
    { id: 4, title: 'Verification', icon: <ShieldCheck size={18} /> },
    { id: 5, title: 'Settlement', icon: <CreditCard size={18} /> }
];

const VEHICLE_TYPES = ['Car', 'Bike', 'Scooter', 'Truck', 'Bus', 'Tractor', 'Van', 'Rickshaw', 'Earthmover', 'EV Vehicle', 'Other'];

export default function TechnicianOnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    const [form, setForm] = useState({
        registrationType: 'individual',
        fullName: '',
        garageName: '',
        dob: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        aadharNo: '',
        panNo: '',
        udyamNo: '',
        profession: '',
        workType: 'full-time',
        serviceRadius: '10',
        vehicleTypes: [] as string[],
        technicalSkills: [] as string[],
        newSkill: '',
        bankDetails: {
            holderName: '',
            accountNo: '',
            ifsc: '',
            bankName: ''
        },
        documents: {
            idProof: '',
            garagePhoto: '',
            license: ''
        },
        declarationConfirmed: false,
        agreedToPlatformTerms: false
    });

    useEffect(() => {
        if (user?.profile) {
            setForm(prev => ({
                ...prev,
                fullName: user.profile.fullName || '',
                address: user.profile.address || '',
                city: user.profile.city || '',
            }));
        }
    }, [user]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            return toast.error("File oversized", { description: "Maximum limit is 5MB." });
        }

        setIsUploading(field);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/upload', formData);
            setForm(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [field]: response.data.url
                }
            }));
            toast.success("Document Uploaded", { description: `${field.toUpperCase()} verified and stored.` });
        } catch (err) {
            toast.error("Upload Failed", { description: "Please try again or check your connection." });
        } finally {
            setIsUploading(null);
        }
    };

    const validateStep = () => {
        if (currentStep === 1) {
            if (!form.fullName || !form.address || !form.city || !form.dob) {
                toast.error("Incomplete Info", { description: "Name, Location, and DOB are required." });
                return false;
            }
            if (form.registrationType === 'garage' && !form.garageName) {
                toast.error("Garage Name Required", { description: "Please enter your registered garage name." });
                return false;
            }
        }
        if (currentStep === 2) {
            if (form.vehicleTypes.length === 0) {
                toast.error("Select Vehicles", { description: "Choose at least one category you repair." });
                return false;
            }
        }
        if (currentStep === 4) {
            if (!form.aadharNo || !form.panNo) {
                toast.error("Legal Info Missing", { description: "Aadhaar and PAN numbers are mandatory." });
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.agreedToPlatformTerms) {
            return toast.error("Agreement Required", { description: "Please review and accept our platform terms." });
        }

        setIsLoading(true);
        try {
            // Map web field names to backend model
            const submissionData = {
                ...form,
                aadharNo: form.aadharNo,
                panNo: form.panNo,
                udyamNo: form.udyamNo,
                bankAccounts: [{
                    accountHolderName: form.bankDetails.holderName,
                    accountNumber: form.bankDetails.accountNo,
                    ifscCode: form.bankDetails.ifsc,
                    bankName: form.bankDetails.bankName,
                    isDefault: true
                }]
            };

            await technicianService.updateProfile(submissionData);
            toast.success("Registration Dispatched", {
                description: "Our team will verify your credentials within 24-48 hours."
            });
            router.push('/technician/dashboard');
        } catch (err: any) {
            toast.error("Submission Failed", {
                description: err.response?.data?.message || "Internal server error."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVehicleType = (type: string) => {
        setForm(prev => ({
            ...prev,
            vehicleTypes: prev.vehicleTypes.includes(type)
                ? prev.vehicleTypes.filter(t => t !== type)
                : [...prev.vehicleTypes, type]
        }));
    };

    const addSkill = () => {
        if (form.newSkill.trim() && !form.technicalSkills.includes(form.newSkill.trim())) {
            setForm(prev => ({
                ...prev,
                technicalSkills: [...prev.technicalSkills, prev.newSkill.trim()],
                newSkill: ''
            }));
        }
    };

    const removeSkill = (skill: string) => {
        setForm(prev => ({
            ...prev,
            technicalSkills: prev.technicalSkills.filter(s => s !== skill)
        }));
    };

    return (
        <div className="min-h-screen bg-[var(--bg-body)] p-6 flex items-center justify-center">
            <div className="w-full max-w-[900px]">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2 text-white italic uppercase tracking-tighter">Expert Onboarding</h1>
                        <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px] py-1 pl-4 border-l-2 border-[var(--color-primary)]">Configure your expert profile and verify identity.</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-2">
                        {STEPS.map((s) => (
                            <div
                                key={s.id}
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                    currentStep === s.id ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20" :
                                        currentStep > s.id ? "bg-green-500/10 text-green-500" : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]"
                                )}
                            >
                                {currentStep > s.id ? <CheckCircle2 size={18} /> : s.icon}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-3xl)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    <form onSubmit={handleSubmit}>
                        {/* Step Content */}
                        <div className="p-8 md:p-12">
                            {currentStep === 1 && (
                                <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-1 md:col-span-2 space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Expert Type</label>
                                            <div className="flex gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, registrationType: 'individual' })}
                                                    className={cn(
                                                        "flex-1 py-4 px-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest",
                                                        form.registrationType === 'individual' ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20" : "bg-transparent border-[var(--border-color)] text-[var(--text-muted)]"
                                                    )}
                                                >
                                                    <User size={16} /> Individual
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, registrationType: 'garage' })}
                                                    className={cn(
                                                        "flex-1 py-4 px-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest",
                                                        form.registrationType === 'garage' ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20" : "bg-transparent border-[var(--border-color)] text-[var(--text-muted)]"
                                                    )}
                                                >
                                                    <Briefcase size={16} /> Service Center
                                                </button>
                                            </div>
                                        </div>

                                        <FormInput
                                            label="Full Name"
                                            value={form.fullName}
                                            onChange={v => setForm({ ...form, fullName: v })}
                                            placeholder="Expert's legal name"
                                            icon={<User size={18} />}
                                        />

                                        {form.registrationType === 'garage' && (
                                            <FormInput
                                                label="Service Center Name"
                                                value={form.garageName}
                                                onChange={v => setForm({ ...form, garageName: v })}
                                                placeholder="Registered shop name"
                                                icon={<Briefcase size={18} />}
                                            />
                                        )}

                                        <FormInput
                                            label="Date of Birth"
                                            type="date"
                                            value={form.dob}
                                            onChange={v => setForm({ ...form, dob: v })}
                                            icon={<FileText size={18} />}
                                        />

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 mb-2 block">Permanent Address</label>
                                            <textarea
                                                value={form.address}
                                                onChange={e => setForm({ ...form, address: e.target.value })}
                                                className="w-full bg-[var(--bg-body)]/50 border border-[var(--border-color)] rounded-2xl p-4 text-sm font-bold min-h-[100px] outline-none focus:border-[var(--color-primary)] transition-all text-white"
                                                placeholder="Complete business/home address"
                                            />
                                        </div>

                                        <FormInput label="City" value={form.city} onChange={v => setForm({ ...form, city: v })} />
                                        <FormInput label="Pincode" value={form.zipCode} onChange={v => setForm({ ...form, zipCode: v })} />
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Technical Specialty</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {VEHICLE_TYPES.map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => toggleVehicleType(type)}
                                                    className={cn(
                                                        "py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                                        form.vehicleTypes.includes(type) ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg" : "bg-white/5 border-white/5 text-[var(--text-muted)] hover:border-[var(--color-primary)]/50"
                                                    )}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Core Skills (e.g., Engine, Electrical, Painting)</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={form.newSkill}
                                                onChange={e => setForm({ ...form, newSkill: e.target.value })}
                                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                                className="flex-1 bg-[var(--bg-body)]/50 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[var(--color-primary)] text-white"
                                                placeholder="Type skill & press enter"
                                            />
                                            <button
                                                type="button"
                                                onClick={addSkill}
                                                className="bg-[var(--color-primary)] text-white px-6 rounded-xl font-black uppercase tracking-widest text-[10px]"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {form.technicalSkills.map(skill => (
                                                <span key={skill} className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                    {skill}
                                                    <X size={12} className="cursor-pointer" onClick={() => removeSkill(skill)} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                    <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 rounded-[var(--radius-3xl)] p-8 text-center space-y-6">
                                        <MapPin size={48} className="mx-auto text-[var(--color-primary)] animate-bounce" />
                                        <div className="max-w-[400px] mx-auto">
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Service Reach</h3>
                                            <p className="text-sm font-bold text-[var(--text-muted)] mb-8 opacity-60">Define how far you are willing to travel for on-spot services.</p>

                                            <div className="space-y-6">
                                                <div className="flex justify-between font-black text-xs uppercase tracking-widest">
                                                    <span className="text-[var(--text-muted)]">Radius</span>
                                                    <span className="text-[var(--color-primary)]">{form.serviceRadius} Kilometers</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="5"
                                                    max="100"
                                                    step="5"
                                                    value={form.serviceRadius}
                                                    onChange={e => setForm({ ...form, serviceRadius: e.target.value })}
                                                    className="w-full h-2 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                                />
                                                <div className="flex justify-between text-[10px] font-bold opacity-30 text-[var(--text-muted)]">
                                                    <span>5 KM</span>
                                                    <span>100 KM+</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormInput label="Aadhaar Number" value={form.aadharNo} onChange={v => setForm({ ...form, aadharNo: v })} placeholder="12 Digit Aadhaar" />
                                        <FormInput label="PAN Number" value={form.panNo} onChange={v => setForm({ ...form, panNo: v })} placeholder="10 Digit PAN" />
                                        <div className="col-span-1 md:col-span-2">
                                            <FormInput label="Udyam Registration (Optional)" value={form.udyamNo} onChange={v => setForm({ ...form, udyamNo: v })} placeholder="Registration Number" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[var(--border-color)]">
                                        <DocumentUploader
                                            label="Aadhaar/ID"
                                            value={form.documents.idProof}
                                            isUploading={isUploading === 'idProof'}
                                            onUpload={(e) => handleFileUpload(e, 'idProof')}
                                        />
                                        <DocumentUploader
                                            label="Driving License"
                                            value={form.documents.license}
                                            isUploading={isUploading === 'license'}
                                            onUpload={(e) => handleFileUpload(e, 'license')}
                                        />
                                        <DocumentUploader
                                            label="Garage/Self Photo"
                                            value={form.documents.garagePhoto}
                                            isUploading={isUploading === 'garagePhoto'}
                                            onUpload={(e) => handleFileUpload(e, 'garagePhoto')}
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormInput label="Account Holder Name" value={form.bankDetails.holderName} onChange={v => setForm({ ...form, bankDetails: { ...form.bankDetails, holderName: v } })} />
                                        <FormInput label="Bank Name" value={form.bankDetails.bankName} onChange={v => setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: v } })} />
                                        <FormInput label="Account Number" value={form.bankDetails.accountNo} onChange={v => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNo: v } })} />
                                        <FormInput label="IFSC Code" value={form.bankDetails.ifsc} onChange={v => setForm({ ...form, bankDetails: { ...form.bankDetails, ifsc: v } })} />
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                                        <label className="flex items-start gap-4 p-4 rounded-3xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 cursor-pointer group hover:bg-[var(--color-primary)]/10 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={form.declarationConfirmed}
                                                onChange={e => setForm({ ...form, declarationConfirmed: e.target.checked })}
                                                className="mt-1 w-5 h-5 rounded accent-[var(--color-primary)]"
                                            />
                                            <span className="text-sm font-bold leading-relaxed text-white">I certify that all technical certifications and identity documents provided are legitimate and current.</span>
                                        </label>
                                        <label className="flex items-start gap-4 p-4 rounded-3xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 cursor-pointer group hover:bg-[var(--color-primary)]/10 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={form.agreedToPlatformTerms}
                                                onChange={e => setForm({ ...form, agreedToPlatformTerms: e.target.checked })}
                                                className="mt-1 w-5 h-5 rounded accent-[var(--color-primary)]"
                                            />
                                            <span className="text-sm font-bold leading-relaxed text-white">I agree to the Expert Service Agreement & Code of Conduct. I understand that account activation is subject to manual verification.</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Controls */}
                        <div className="bg-[var(--bg-body)]/40 p-8 flex items-center justify-between border-t border-[var(--border-color)]">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1 || isLoading}
                                className="flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-all disabled:opacity-30"
                            >
                                <ChevronLeft size={18} /> Previous Step
                            </button>

                            {currentStep === STEPS.length ? (
                                <button
                                    type="submit"
                                    disabled={isLoading || !form.agreedToPlatformTerms}
                                    className="px-10 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-zinc-800 text-white font-black rounded-2xl shadow-xl shadow-[var(--color-primary)]/20 transition-all flex items-center gap-3 active:scale-95"
                                >
                                    {isLoading ? 'Processing Verification...' : 'Submit Expert Profile'}
                                    <CheckCircle2 size={18} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-10 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-black rounded-2xl shadow-xl shadow-[var(--color-primary)]/20 transition-all flex items-center gap-3 active:scale-95"
                                >
                                    Continue Onboarding
                                    <ChevronRight size={18} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function FormInput({ label, value, onChange, placeholder, icon, type = 'text' }: {
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder?: string,
    icon?: React.ReactNode,
    type?: string
}) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">{label}</label>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)] opacity-60 group-hover:opacity-100 transition-opacity">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "w-full h-14 bg-[var(--bg-body)]/50 border border-[var(--border-color)] rounded-2xl pr-5 focus:border-[var(--color-primary)] transition-all font-bold text-sm outline-none text-white",
                        icon ? "pl-12" : "pl-5"
                    )}
                />
            </div>
        </div>
    );
}

function DocumentUploader({ label, value, isUploading, onUpload }: {
    label: string,
    value: string,
    isUploading: boolean,
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center block">{label}</label>
            <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                    value ? "bg-green-500/5 border-green-500/20" : "bg-white/5 border-white/10 hover:border-[var(--color-primary)]/30"
                )}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={onUpload}
                    accept="image/*,.pdf"
                />

                {isUploading ? (
                    <div className="animate-spin w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
                ) : value ? (
                    <>
                        <div className="bg-green-500 text-white p-1 rounded-full"><CheckCircle2 size={16} /></div>
                        <span className="text-[10px] font-black uppercase text-green-500">Verified</span>
                    </>
                ) : (
                    <>
                        <Camera size={24} className="text-[var(--color-primary)] opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Upload Copy</span>
                    </>
                )}
            </div>
        </div>
    );
}
