'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { technicianService } from '@/services/technicianService';
import { supplierService } from '@/services/supplierService';
import { toast } from 'sonner';
import {
    User,
    Mail,
    Phone,
    ShieldCheck,
    ArrowRight,
    UserCircle,
    Store,
    Wrench,
    Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/services/apiClient';

// Components
import { AuthInput } from './components/Shared';
import { TechnicianForm } from './components/TechnicianForm';
import { SupplierForm } from './components/SupplierForm';

export default function RegisterPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Info, 2: OTP, 3: Onboarding Details
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        mobile: '',
        role: 'customer' as 'customer' | 'supplier' | 'technician'
    });

    const [details, setDetails] = useState<any>({
        // Common
        address: '',
        city: '',
        state: '',
        zipCode: '',
        aadharNo: '',
        panNo: '',
        bankDetails: {
            holderName: '',
            accountNo: '',
            ifsc: '',
            bankName: '',
            upiId: ''
        },
        documents: {},
        agreedToPlatformTerms: false,

        // Tech specific
        registrationType: 'individual',
        garageName: '', // Also used for workshopName
        dob: '',
        gender: '',
        alternateNumber: '',
        profilePhoto: '',
        vehicleTypes: [], // TRD skills
        technicalSkills: [],
        serviceRadius: '10',
        experienceYears: '',
        baseVisitCharge: '',
        perHourCharge: '',
        emergencyServiceCharge: '',
        workingDays: [],
        workingHours: { from: '09:00', to: '18:00' },
        availableForEmergency: false,

        // Supplier specific
        storeName: '',
        gstin: '',
        udyamNumber: '',
        businessCategories: []
    });

    const [otp, setOtp] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.mobile.length !== 10) return toast.error('Check Mobile Number', { description: 'Please enter a valid 10-digit number.' });

        setIsLoading(true);
        try {
            await authService.sendOtp(form.mobile, form.role, true);
            setStep(2);
            toast.success('Code Dispatched', { description: `Verification OTP sent to ${form.mobile}` });
        } catch (err: any) {
            toast.error('Registration Blocked', { description: err.response?.data?.message || 'Failed to send OTP' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 4) return toast.error('Invalid OTP');

        setIsLoading(true);
        try {
            const data = await authService.verifyOtp(form.mobile, otp);
            localStorage.setItem('auth_token', data.token);

            await authService.updateProfile({
                fullName: form.fullName,
                email: form.email,
                phoneNumber: form.mobile
            });

            if (form.role === 'customer') {
                login(data.token, { id: data._id, role: data.role, profile: { fullName: form.fullName, email: form.email } });
                toast.success('Welcome Aboard!');
                router.push('/');
            } else {
                setStep(3);
                toast.success('Identity Verified', { description: 'Now, let\'s configure your professional profile.' });
            }
        } catch (err: any) {
            toast.error('Identity Check Failed', { description: err.response?.data?.message || 'Verification failed' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(field);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await apiClient.post('/upload', formData);
            setDetails((prev: any) => ({
                ...prev,
                documents: { ...prev.documents, [field]: response.data.url }
            }));
            toast.success("Document Uploaded");
        } catch (err) {
            toast.error("Upload Failed");
        } finally {
            setIsUploading(null);
        }
    };

    const finishRegistration = async () => {
        setIsLoading(true);
        try {
            if (form.role === 'technician') {
                const submission = {
                    ...details,
                    fullName: form.fullName,
                    aadharNo: details.aadharNo,
                    panNo: details.panNo,
                    avatar: details.profilePhoto, // Mapping profile photo to avatar as per schema
                    bankAccounts: [{
                        accountHolderName: details.bankDetails.holderName,
                        accountNumber: details.bankDetails.accountNo,
                        ifscCode: details.bankDetails.ifsc,
                        bankName: details.bankDetails.bankName,
                        upiId: details.bankDetails.upiId,
                        isDefault: true
                    }],
                    // Mapping TRD specific fields
                    workingRadius: details.serviceRadius,
                    pricing: {
                        baseVisit: details.baseVisitCharge,
                        perHour: details.perHourCharge,
                        emergency: details.emergencyServiceCharge
                    },
                    availability: {
                        workingDays: details.workingDays,
                        workingTime: details.workingHours,
                        availableForEmergency: details.availableForEmergency
                    }
                };
                await technicianService.updateProfile(submission);
                router.push('/technician/dashboard');
            } else if (form.role === 'supplier') {
                const submission = {
                    ...details,
                    phoneNumber: form.mobile,
                    email: form.email,
                    fullName: form.fullName,
                    aadharNumber: details.aadharNo,
                    panNumber: details.panNo,
                    bankDetails: {
                        accountHolderName: details.bankDetails.holderName,
                        accountNumber: details.bankDetails.accountNo,
                        ifscCode: details.bankDetails.ifsc,
                        bankName: details.bankDetails.bankName
                    }
                };
                await supplierService.updateProfile(submission);
                router.push('/supplier/dashboard');
            }
            toast.success('Protocol Activated', { description: 'Welcome to the inner network.' });
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Submission Failed';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-body)] flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative w-full max-w-[550px] z-10 py-8">
                {/* Logo Section */}
                <div className="text-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-orange-500 rounded-[20px] sm:rounded-2xl shadow-xl shadow-orange-500/20 mb-4 sm:mb-6 group hover:rotate-6 transition-transform cursor-pointer">
                        <Rocket size={28} className="sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase mb-2">
                        PAPAZ <span className="text-orange-500">PLATFORM</span>
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm sm:text-base font-medium px-4">Revolutionizing the Automotive Ecosystem</p>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl bg-opacity-80 animate-in fade-in zoom-in-95 duration-500 mx-auto">
                    {/* Progress Header */}
                    <div className="flex items-center justify-between mb-8 sm:mb-10">
                        <div className="flex-1">
                            <h2 className="text-xl sm:text-2xl font-black mb-1">
                                {step === 1 ? 'Start Journey' : step === 2 ? 'Secure Entry' : 'Expert Protocol'}
                            </h2>
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60 italic leading-none">
                                {step === 1 ? `${form.role} Registration` : step === 2 ? 'Verifying Identity' : `Step 0${onboardingStep} Onboarding`}
                            </p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] sm:border-4 border-orange-500/10 flex items-center justify-center relative flex-shrink-0">
                            <div
                                className="absolute inset-[-3px] sm:inset-[-4px] rounded-full border-[3px] sm:border-4 border-orange-500 border-t-transparent transition-all duration-700"
                                style={{ transform: `rotate(${step === 1 ? '45deg' : step === 2 ? '180deg' : '315deg'})` }}
                            />
                            <span className="text-xs sm:text-sm font-black text-orange-500">0{step}</span>
                        </div>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            {/* Role Switcher Tabs */}
                            <div className="flex flex-wrap sm:flex-nowrap p-1 bg-[var(--bg-body)]/50 rounded-2xl border border-[var(--border-color)] mb-6 gap-1">
                                {(['customer', 'technician', 'supplier'] as const).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setForm({ ...form, role: r })}
                                        className={cn(
                                            "flex-1 py-3 px-1 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 min-w-[30%] sm:min-w-0",
                                            form.role === r
                                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                                : "text-[var(--text-muted)] hover:text-orange-500"
                                        )}
                                    >
                                        {r === 'customer' && <UserCircle size={14} className="sm:w-3.5 sm:h-3.5" />}
                                        {r === 'technician' && <Wrench size={14} className="sm:w-3.5 sm:h-3.5" />}
                                        {r === 'supplier' && <Store size={14} className="sm:w-3.5 sm:h-3.5" />}
                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:gap-5">
                                <AuthInput
                                    label="Full Legal Name"
                                    icon={<User size={18} />}
                                    placeholder="Enter your name"
                                    value={form.fullName}
                                    onChange={v => setForm({ ...form, fullName: v })}
                                    required
                                />
                                <AuthInput
                                    label="Business Email"
                                    type="email"
                                    icon={<Mail size={18} />}
                                    placeholder="email@example.com"
                                    value={form.email}
                                    onChange={v => setForm({ ...form, email: v })}
                                    required
                                />
                                <AuthInput
                                    label="Primary Mobile"
                                    type="tel"
                                    icon={<Phone size={18} />}
                                    placeholder="10-digit number"
                                    value={form.mobile}
                                    onChange={v => setForm({ ...form, mobile: v.replace(/\D/g, '').slice(0, 10) })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || form.fullName.length < 2 || form.mobile.length < 10}
                                className="w-full h-14 sm:h-16 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group mt-2"
                            >
                                {isLoading ? (
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                ) : (
                                    <>
                                        Initiate Verification <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : step === 2 ? (
                        <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="text-center p-5 sm:p-6 bg-orange-500/5 border border-orange-500/10 rounded-3xl">
                                <ShieldCheck size={32} className="mx-auto text-orange-500 mb-3 sm:mb-4 animate-pulse w-8 h-8 sm:w-9 sm:h-9" />
                                <p className="text-xs sm:text-sm font-bold leading-relaxed">
                                    A 4-digit verification code has been dispatched to <span className="text-orange-500 font-black">+91 {form.mobile}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center block mb-4">Enter Signature Secret</label>
                                <div className="flex justify-center max-w-[280px] mx-auto">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full h-16 sm:h-20 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-[24px] sm:rounded-3xl text-center text-3xl sm:text-4xl font-black tracking-[8px] sm:tracking-[12px] focus:border-orange-500 transition-all outline-none"
                                        placeholder="0000"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length < 4}
                                    className="w-full h-14 sm:h-16 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? 'Decrypting Access...' : 'Complete Authentication'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-orange-500 transition-colors"
                                >
                                    ← Revise Connection Details
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {form.role === 'technician' && (
                                <TechnicianForm
                                    onboardingStep={onboardingStep}
                                    setOnboardingStep={setOnboardingStep}
                                    details={details}
                                    setDetails={setDetails}
                                    isUploading={isUploading}
                                    handleFileUpload={handleFileUpload}
                                    finishRegistration={finishRegistration}
                                    isLoading={isLoading}
                                />
                            )}
                            {form.role === 'supplier' && (
                                <SupplierForm
                                    onboardingStep={onboardingStep}
                                    setOnboardingStep={setOnboardingStep}
                                    details={details}
                                    setDetails={setDetails}
                                    isUploading={isUploading}
                                    handleFileUpload={handleFileUpload}
                                    finishRegistration={finishRegistration}
                                    isLoading={isLoading}
                                    form={form}
                                    setForm={setForm}
                                />
                            )}
                        </>
                    )}

                    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[var(--border-color)] text-center">
                        <p className="text-xs sm:text-sm font-bold text-[var(--text-muted)]">
                            Already part of the network? <Link href="/login" className="text-orange-500 font-black hover:underline underline-offset-4 ml-1">Authenticate here</Link>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-6 sm:mt-8 space-y-2">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-30 px-6">
                        &copy; 2026 PAPAZ AUTOMOTIVE TECHNOLOGIES • SECURE CORE v2.4
                    </p>
                </div>
            </div>
        </div>
    );
}
