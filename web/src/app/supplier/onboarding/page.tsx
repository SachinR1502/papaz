'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import {
    Store,
    User,
    Phone,
    MapPin,
    ShieldCheck,
    ArrowRight,
    Rocket,
    CheckCircle2,
    Briefcase,
    Building2,
    Mail,
    Hash,
    Truck,
    CreditCard,
    FileText,
    Upload,
    Check,
    AlertCircle,
    ChevronLeft,
    Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import apiClient from '@/services/apiClient';

const STEPS = [
    { id: 1, title: 'Identity', icon: <Store size={18} /> },
    { id: 2, title: 'Business', icon: <Truck size={18} /> },
    { id: 3, title: 'Legal', icon: <ShieldCheck size={18} /> },
    { id: 4, title: 'Verification', icon: <FileText size={18} /> },
    { id: 5, title: 'Settlement', icon: <CheckCircle2 size={18} /> },
];

const CATEGORIES = [
    'Two Wheeler Parts',
    'Three Wheeler Parts',
    'Four Wheeler Parts',
    'Commercial Vehicles',
    'Electric Vehicle Parts',
    'EV Accessories',
    'Other'
];

export default function SupplierRegistrationPage() {
    const { submitRegistration, isLoading } = useSupplier();
    const [currentStep, setCurrentStep] = useState(1);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    const [form, setForm] = useState({
        // Basic Info
        storeName: '',
        fullName: '',
        phoneNumber: '',
        alternatePhoneNumber: '',
        email: '',
        city: '',
        address: '',
        zipCode: '',

        // Categories
        businessCategories: [] as string[],
        otherCategory: '',

        // Legal
        gstin: '',
        udyamNumber: '',
        panNumber: '',
        aadharNumber: '',

        // Documents
        documents: {
            gstCertificate: '',
            udyamCertificate: '',
            aadharCard: '',
            panCard: '',
            electricityBill: '',
            cancelledCheque: ''
        },

        // Bank
        bankDetails: {
            accountHolderName: '',
            bankName: '',
            accountNumber: '',
            ifscCode: ''
        },

        // Terms
        agreedToPlatformTerms: false,
        declarationConfirmed: false
    });

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            return toast.error('File too large', { description: 'Max allowed size is 5MB' });
        }

        setIsUploading(field);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setForm(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [field]: response.data.url
                }
            }));
            toast.success(`Document uploaded: ${field}`);
        } catch (err) {
            toast.error('Upload failed', { description: 'Please try again' });
        } finally {
            setIsUploading(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation for the last step
        if (!form.agreedToPlatformTerms || !form.declarationConfirmed) {
            return toast.error('Agreement Required', { description: 'Please accept the declaration to proceed.' });
        }

        try {
            await submitRegistration(form);
            toast.success('Application Received', {
                description: 'Your supplier profile is being verified.'
            });
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Registration failed. Please attempt again.');
        }
    };

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                return form.storeName.length >= 3 && form.fullName.length >= 2 && form.phoneNumber.length === 10 && form.email.includes('@') && form.city && form.address.length >= 20;
            case 2:
                return form.businessCategories.length > 0;
            case 3:
                return form.gstin.length === 15 && form.panNumber.length === 10 && form.aadharNumber.length === 12;
            case 4:
                return form.documents.gstCertificate && form.documents.aadharCard && form.documents.panCard && form.documents.electricityBill;
            default:
                return true;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-body)] flex flex-col md:flex-row overflow-hidden relative">
            {/* Visual Side Panel */}
            <div className="md:w-1/3 bg-[var(--bg-card)] border-r border-[var(--border-color)] p-12 flex flex-col justify-between hidden md:flex relative z-10">
                <div>
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 mb-10">
                        <Rocket size={24} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-6 drop-shadow-sm">
                        PAPAZ <span className="text-orange-500">Partner</span>
                    </h1>
                    <p className="text-lg text-[var(--text-muted)] font-medium leading-relaxed">
                        Join India's most advanced supply chain ecosystem for auto-components.
                    </p>
                </div>

                <div className="flex flex-col gap-8">
                    {STEPS.map((step) => (
                        <div key={step.id} className={cn(
                            "flex items-center gap-4 transition-all duration-500",
                            currentStep === step.id ? "opacity-100 translate-x-2" : "opacity-40"
                        )}>
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border-2",
                                currentStep === step.id ? "bg-orange-500 border-orange-500 text-white" : "border-[var(--border-color)] text-[var(--text-muted)]"
                            )}>
                                {currentStep > step.id ? <Check size={18} /> : step.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Step 0{step.id}</span>
                                <span className="text-sm font-bold text-[var(--text-body)]">{step.title}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-30 mt-12">
                    &copy; 2026 PAPAZ AUTOMOTIVE TECHNOLOGIES
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 p-6 md:p-20 overflow-y-auto relative bg-[var(--bg-body)]">
                <div className="max-w-2xl mx-auto">
                    <header className="mb-12">
                        <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-black uppercase tracking-widest mb-4 opacity-50">
                            <ShieldCheck size={14} className="text-orange-500" /> Secure Business Onboarding
                        </div>
                        <h2 className="text-3xl font-black mb-2 tracking-tight">
                            {STEPS.find(s => s.id === currentStep)?.title} Information
                        </h2>
                        <p className="text-[var(--text-muted)] font-medium">Please provide accurate details for platform verification.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                        {/* Step 1: Basic Identity */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput
                                        label="Store / Shop Name"
                                        placeholder="Enter registered store name"
                                        value={form.storeName}
                                        onChange={(v: string) => setForm({ ...form, storeName: v })}
                                        icon={<Store size={18} />}
                                        required
                                    />
                                    <FormInput
                                        label="Owner / Proprietor Name"
                                        placeholder="Full legal name"
                                        value={form.fullName}
                                        onChange={(v: string) => setForm({ ...form, fullName: v })}
                                        icon={<User size={18} />}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput
                                        label="Contact Number"
                                        placeholder="10-digit mobile"
                                        value={form.phoneNumber}
                                        onChange={(v: string) => setForm({ ...form, phoneNumber: v.replace(/\D/g, '').slice(0, 10) })}
                                        icon={<Phone size={18} />}
                                        required
                                    />
                                    <FormInput
                                        label="Alternate Number"
                                        placeholder="Optional fallback contact"
                                        value={form.alternatePhoneNumber}
                                        onChange={(v: string) => setForm({ ...form, alternatePhoneNumber: v.replace(/\D/g, '').slice(0, 10) })}
                                        icon={<Phone size={18} />}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput
                                        label="Email ID"
                                        placeholder="business@example.com"
                                        type="email"
                                        value={form.email}
                                        onChange={(v: string) => setForm({ ...form, email: v })}
                                        icon={<Mail size={18} />}
                                        required
                                    />
                                    <FormInput
                                        label="Operating City"
                                        placeholder="e.g. Bangalore"
                                        value={form.city}
                                        onChange={(v: string) => setForm({ ...form, city: v })}
                                        icon={<MapPin size={18} />}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Complete Business Address (Min 20 chars)</label>
                                    <div className="relative group">
                                        <Building2 size={18} className="absolute left-4 top-4 text-orange-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <textarea
                                            value={form.address}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, address: e.target.value })}
                                            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 min-h-[120px] focus:border-orange-500 transition-all outline-none font-medium text-sm"
                                            placeholder="Floor, Building, Area, Landmkark..."
                                        />
                                    </div>
                                </div>
                                <div className="max-w-[200px]">
                                    <FormInput
                                        label="Pincode"
                                        placeholder="6 digits"
                                        value={form.zipCode}
                                        onChange={(v: string) => setForm({ ...form, zipCode: v.replace(/\D/g, '').slice(0, 6) })}
                                        icon={<Hash size={18} />}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Categories */}
                        {currentStep === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="p-8 bg-orange-500/5 border border-orange-500/20 rounded-3xl">
                                    <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Truck size={18} className="text-orange-500" /> Business Categories
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {CATEGORIES.map(cat => (
                                            <label
                                                key={cat}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                                                    form.businessCategories.includes(cat)
                                                        ? "bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/20"
                                                        : "bg-[var(--bg-card)] border-[var(--border-color)] hover:border-orange-500/50"
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={form.businessCategories.includes(cat)}
                                                    onChange={(e) => {
                                                        const updated = e.target.checked
                                                            ? [...form.businessCategories, cat]
                                                            : form.businessCategories.filter(c => c !== cat);
                                                        setForm({ ...form, businessCategories: updated });
                                                    }}
                                                />
                                                <div className={cn(
                                                    "w-5 h-5 rounded-md flex items-center justify-center border transition-colors",
                                                    form.businessCategories.includes(cat) ? "bg-orange-500 border-orange-500" : "border-[var(--border-color)]"
                                                )}>
                                                    {form.businessCategories.includes(cat) && <Check size={14} className="text-white" />}
                                                </div>
                                                <span className="text-sm font-bold">{cat}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {form.businessCategories.includes('Other') && (
                                        <div className="mt-6 animate-in slide-in-from-top-2">
                                            <FormInput
                                                label="Specify Other Category"
                                                placeholder="e.g. Performance Exhausts"
                                                value={form.otherCategory}
                                                onChange={(v: string) => setForm({ ...form, otherCategory: v })}
                                                icon={<AlertCircle size={18} />}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Legal Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput
                                        label="GSTIN"
                                        placeholder="15-digit GST Number"
                                        value={form.gstin}
                                        onChange={(v: string) => setForm({ ...form, gstin: v.toUpperCase() })}
                                        icon={<ShieldCheck size={18} />}
                                        required
                                    />
                                    <FormInput
                                        label="PAN Number"
                                        placeholder="Permanent Account Number"
                                        value={form.panNumber}
                                        onChange={(v: string) => setForm({ ...form, panNumber: v.toUpperCase() })}
                                        icon={<CreditCard size={18} />}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput
                                        label="Aadhaar Number (Masked Display)"
                                        type="password"
                                        placeholder="12-digit number"
                                        value={form.aadharNumber}
                                        onChange={(v: string) => setForm({ ...form, aadharNumber: v.replace(/\D/g, '').slice(0, 12) })}
                                        icon={<User size={18} />}
                                        required
                                    />
                                    <FormInput
                                        label="UDYAM Number (Recommended)"
                                        placeholder="UDYAM-XX-XX-XXXXXXX"
                                        value={form.udyamNumber}
                                        onChange={(v: string) => setForm({ ...form, udyamNumber: v })}
                                        icon={<Briefcase size={18} />}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Documents */}
                        {currentStep === 4 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <DocumentUploader
                                    label="GST Certificate"
                                    field="gstCertificate"
                                    value={form.documents.gstCertificate}
                                    isUploading={isUploading === 'gstCertificate'}
                                    onUpload={(e) => handleFileUpload(e, 'gstCertificate')}
                                />
                                <DocumentUploader
                                    label="PAN Card"
                                    field="panCard"
                                    value={form.documents.panCard}
                                    isUploading={isUploading === 'panCard'}
                                    onUpload={(e) => handleFileUpload(e, 'panCard')}
                                />
                                <DocumentUploader
                                    label="Aadhaar Card (Front/Back)"
                                    field="aadharCard"
                                    value={form.documents.aadharCard}
                                    isUploading={isUploading === 'aadharCard'}
                                    onUpload={(e) => handleFileUpload(e, 'aadharCard')}
                                />
                                <DocumentUploader
                                    label="Electricity Bill (Last 3m)"
                                    field="electricityBill"
                                    value={form.documents.electricityBill}
                                    isUploading={isUploading === 'electricityBill'}
                                    onUpload={(e) => handleFileUpload(e, 'electricityBill')}
                                />
                                <DocumentUploader
                                    label="Udyam Certificate"
                                    field="udyamCertificate"
                                    value={form.documents.udyamCertificate}
                                    isUploading={isUploading === 'udyamCertificate'}
                                    onUpload={(e) => handleFileUpload(e, 'udyamCertificate')}
                                    required={false}
                                />
                            </div>
                        )}

                        {/* Step 5: Bank & Terms */}
                        {currentStep === 5 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="p-8 bg-zinc-500/5 rounded-3xl space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <Banknote size={18} className="text-orange-500" /> Settlement Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormInput
                                            label="Account Holder Name"
                                            value={form.bankDetails.accountHolderName}
                                            onChange={(v: string) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountHolderName: v } })}
                                            icon={<User size={18} />}
                                        />
                                        <FormInput
                                            label="Bank Name"
                                            value={form.bankDetails.bankName}
                                            onChange={(v: string) => setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: v } })}
                                            icon={<Building2 size={18} />}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormInput
                                            label="Account Number"
                                            value={form.bankDetails.accountNumber}
                                            onChange={(v: string) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: v } })}
                                            icon={<CreditCard size={18} />}
                                        />
                                        <FormInput
                                            label="IFSC Code"
                                            value={form.bankDetails.ifscCode}
                                            onChange={(v: string) => setForm({ ...form, bankDetails: { ...form.bankDetails, ifscCode: v.toUpperCase() } })}
                                            icon={<Hash size={18} />}
                                        />
                                    </div>
                                    <DocumentUploader
                                        label="Cancelled Cheque Upload"
                                        field="cancelledCheque"
                                        value={form.documents.cancelledCheque}
                                        isUploading={isUploading === 'cancelledCheque'}
                                        onUpload={(e) => handleFileUpload(e, 'cancelledCheque')}
                                    />
                                </div>

                                <div className="space-y-4 pt-4">
                                    <label className="flex items-start gap-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="mt-1 w-5 h-5 rounded accent-orange-500"
                                            checked={form.declarationConfirmed}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, declarationConfirmed: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium leading-relaxed group-hover:text-orange-500 transition-colors">
                                            I confirm that all provided information is true and legally valid.
                                        </span>
                                    </label>
                                    <label className="flex items-start gap-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="mt-1 w-5 h-5 rounded accent-orange-500"
                                            checked={form.agreedToPlatformTerms}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, agreedToPlatformTerms: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium leading-relaxed group-hover:text-orange-500 transition-colors">
                                            I agree to platform terms & supplier policy. I understand that admin approval is required before account activation.
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !form.agreedToPlatformTerms}
                                    className="w-full py-6 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? 'Processing Registration...' : 'Complete Registration'}
                                </button>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between pt-12 border-t border-[var(--border-color)]">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={prevStep}
                                    className="gap-2 h-14 px-8 rounded-2xl font-bold"
                                >
                                    <ChevronLeft size={20} /> Back
                                </Button>
                            )}
                            <div className="flex-1" />
                            {currentStep < STEPS.length && (
                                <Button
                                    type="button"
                                    variant="premium"
                                    disabled={!validateStep(currentStep)}
                                    onClick={nextStep}
                                    className="gap-2 h-14 px-12 rounded-2xl font-black uppercase text-xs"
                                >
                                    Continue <ArrowRight size={20} />
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function FormInput({ label, value, onChange, placeholder, icon, type = 'text', required = false }: {
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder?: string,
    icon: React.ReactNode,
    type?: string,
    required?: boolean
}) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {icon}
                </div>
                <Input
                    type={type}
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="pl-12 h-14 bg-[var(--bg-card)] border-[var(--border-color)] rounded-2xl focus:border-orange-500 transition-all font-semibold"
                />
            </div>
        </div>
    );
}

function DocumentUploader({ label, value, isUploading, onUpload, required = true }: {
    label: string,
    value: string,
    field?: string,
    isUploading: boolean,
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
    required?: boolean
}) {
    const fileRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                onClick={() => fileRef.current?.click()}
                className={cn(
                    "relative w-full h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all p-4 group overflow-hidden",
                    value ? "bg-emerald-500/5 border-emerald-500/50" : "bg-[var(--bg-card)] border-[var(--border-color)] hover:border-orange-500/50 hover:bg-orange-500/5"
                )}
            >
                <input type="file" ref={fileRef} className="hidden" onChange={onUpload} accept="image/*,.pdf" />

                {isUploading ? (
                    <div className="animate-spin text-orange-500"><Upload size={24} /></div>
                ) : value ? (
                    <>
                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Check size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Document Linked</span>
                    </>
                ) : (
                    <>
                        <Upload size={24} className="text-[var(--text-muted)] group-hover:text-orange-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Click to Upload</span>
                    </>
                )}

                {value && (
                    <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="text-[10px] font-black text-emerald-700 uppercase">Update File</span>
                    </div>
                )}
            </div>
        </div>
    );
}

