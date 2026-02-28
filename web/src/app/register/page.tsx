'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { technicianService } from '@/services/technicianService';
import { supplierService } from '@/services/supplierService';
import { toast } from 'sonner';
import { Rocket, ShieldCheck, User, Mail, Phone, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/services/apiClient';

// Components
import { AuthInput } from './components/Shared';
import { TechnicianForm } from './components/TechnicianForm';
import { SupplierForm } from './components/SupplierForm';

export default function RegisterPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1); // 1: Basic, 2: OTP, 3: Onboarding
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        mobile: '',
        role: 'customer' as 'customer' | 'technician' | 'supplier'
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
        garageName: '',
        dob: '',
        gender: '',
        alternateNumber: '',
        profilePhoto: '',
        vehicleTypes: [],
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

    /* ============================= */
    /* LOGIC */
    /* ============================= */

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.fullName) return toast.error('Please enter your full name');
        if (!form.email || !form.email.includes('@')) return toast.error('Please enter a valid email');
        if (form.mobile.length !== 10) return toast.error('Enter valid 10-digit number');

        setIsLoading(true);
        try {
            await authService.sendOtp(form.mobile, form.role, true);
            setStep(2);
            toast.success('OTP sent successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 4) return toast.error('Enter 4-digit OTP');

        setIsLoading(true);
        try {
            const data = await authService.verifyOtp(form.mobile, otp);

            // For customers, login and redirect immediately
            if (form.role === 'customer') {
                login(data.token, {
                    id: data._id,
                    role: data.role,
                    profile: { fullName: form.fullName }
                });

                await authService.updateProfile({
                    fullName: form.fullName,
                    email: form.email,
                    phoneNumber: form.mobile
                });

                toast.success('Welcome to Papaz!');
                router.push('/');
            } else {
                // For Pro roles, hide token first, then move to onboarding
                localStorage.setItem('auth_token', data.token);
                setStep(3);
                toast.success('Identity Verified', { description: 'Complete your professional profile.' });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Verification failed');
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
                documents: { ...prev.documents, [field]: response.data.url },
                // Special handling for profile photo to match Schema 'avatar'
                ...(field === 'profilePhoto' ? { profilePhoto: response.data.url } : {})
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
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error('Auth session expired');

            if (form.role === 'technician') {
                const submission = {
                    ...details,
                    fullName: form.fullName,
                    avatar: details.profilePhoto,
                    bankAccounts: [{
                        accountHolderName: details.bankDetails.holderName,
                        accountNumber: details.bankDetails.accountNo,
                        ifscCode: details.bankDetails.ifsc,
                        bankName: details.bankDetails.bankName,
                        upiId: details.bankDetails.upiId,
                        isDefault: true
                    }],
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
                    panNumber: details.panNo || details.panNumber,
                    aadharNumber: details.aadharNo || details.aadharNumber,
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

            // Finalize login context
            login(token, { id: 'pro', role: form.role, profile: { fullName: form.fullName } });
            toast.success('Professional Profile Activated');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Submission Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className={cn(
                "w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 space-y-8 transition-all duration-500",
                step === 3 ? "max-w-4xl" : "max-w-xl"
            )}>
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="mx-auto w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                        <Rocket size={26} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                            {step === 3 ? 'Complete Your Profile' : 'Create Account'}
                        </h1>
                        <p className="text-sm text-gray-400 mt-1 font-medium">
                            {step === 3 ? `Section: Professional Profile` : 'Join the Papaz automotive network'}
                        </p>
                    </div>
                </div>

                {/* Progress Indicator for Step 1 & 2 */}
                {step < 3 && (
                    <div className="flex items-center justify-between pb-2">
                        <div className="flex gap-2">
                            {[1, 2].map((s) => (
                                <div key={s} className={cn("h-1.5 w-12 rounded-full transition-all duration-500", step >= s ? "bg-orange-500" : "bg-gray-100")} />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {step === 1 ? 'Credential Entry' : 'Security Check'}
                        </span>
                    </div>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                            {(['customer', 'technician', 'supplier'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setForm({ ...form, role: r })}
                                    className={cn(
                                        "py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all",
                                        form.role === r ? "bg-white text-orange-600 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <AuthInput label="Full Name" icon={<User />} value={form.fullName} onChange={v => setForm({ ...form, fullName: v })} placeholder="Enter your full name" required />
                            <AuthInput label="Email Address" type="email" icon={<Mail />} value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="email@example.com" required />
                            <AuthInput label="Mobile Number" type="tel" icon={<Phone />} value={form.mobile} onChange={v => setForm({ ...form, mobile: v.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit number" required />
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 group">
                            {isLoading ? 'Processing...' : 'Verify Mobile'}
                            {!isLoading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 text-center">
                            <ShieldCheck size={32} className="mx-auto text-orange-500 mb-3" />
                            <p className="text-sm font-medium text-gray-600">
                                Verify your identity. We sent a code to
                                <span className="text-orange-600 font-bold ml-1">+91 {form.mobile}</span>
                            </p>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                maxLength={4}
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full h-16 text-center text-3xl font-bold tracking-[1em] border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-50/50 outline-none transition-all placeholder:text-gray-200"
                                placeholder="0000"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3">
                            <button type="submit" disabled={isLoading || otp.length < 4} className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all">
                                {isLoading ? 'Verifying...' : 'Complete Registration'}
                            </button>
                            <button type="button" onClick={() => setStep(1)} className="w-full text-xs font-bold text-gray-400 hover:text-orange-500 flex items-center justify-center gap-1.5 transition-colors">
                                <ChevronLeft size={14} /> Edit Information
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 3 - ONBOARDING */}
                {step === 3 && (
                    <div className="animate-in fade-in duration-700">
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
                    </div>
                )}

                {step < 3 && (
                    <div className="pt-6 border-t border-gray-50 text-center">
                        <p className="text-sm font-medium text-gray-400">
                            Already have an account?
                            <Link href="/login" className="text-orange-500 font-bold ml-1 hover:underline">Log in</Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}