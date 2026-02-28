'use client';

import {
    Briefcase,
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
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthInput, OnboardingUploader } from './Shared';
import { toast } from 'sonner';

const VEHICLE_TYPES = [
    { id: 'Car', label: 'Car' },
    { id: 'Bike', label: 'Bike' },
    { id: 'Scooter', label: 'Scooter' },
    { id: 'Truck', label: 'Truck' },
    { id: 'Bus', label: 'Bus' },
    { id: 'Tractor', label: 'Tractor' },
    { id: 'Van', label: 'Van' },
    { id: 'Rickshaw', label: 'Rickshaw' },
    { id: 'EV Vehicle', label: 'EV Tech' },
    { id: 'Other', label: 'Other' }
];

const WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function TechnicianForm({
    onboardingStep,
    setOnboardingStep,
    details,
    setDetails,
    isUploading,
    handleFileUpload,
    finishRegistration,
    isLoading
}: any) {

    const totalSteps = 8;

    const validateAndContinue = () => {
        if (onboardingStep === 1) {
            if (!details.dob) return toast.error("Date of Birth is required");
        }
        if (onboardingStep === 2) {
            if (!details.address) return toast.error("Address is required");
            if (!details.city) return toast.error("City is required");
            if (!details.state) return toast.error("State is required");
            if (!details.zipCode) return toast.error("Pincode is required");
        }
        if (onboardingStep === 3) {
            if (details.vehicleTypes.length === 0) return toast.error("Select at least one skill");
            if (!details.experienceYears) return toast.error("Experience is required");
        }
        if (onboardingStep === 5) {
            if (!details.aadharNo) return toast.error("Aadhaar is required");
            if (!details.panNo) return toast.error("PAN is required");
        }
        if (onboardingStep === 6) {
            if (!details.baseVisitCharge) return toast.error("Base visit charge is required");
        }
        if (onboardingStep === 7) {
            if (details.workingDays.length === 0) return toast.error("Select working days");
        }
        if (onboardingStep === 8) {
            if (!details.bankDetails.holderName || !details.bankDetails.accountNo) return toast.error("Bank details are required");
        }

        setOnboardingStep(onboardingStep + 1);
    };

    return (
        <div className="space-y-8">

            {/* STEP HEADER */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                    Step {onboardingStep} of {totalSteps}
                </h3>

                <div className="flex gap-2">
                    {[...Array(totalSteps)].map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-full ${onboardingStep > i
                                ? 'bg-orange-500'
                                : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* STEP CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">

                {/* STEP 1 — PROFILE */}
                {onboardingStep === 1 && (
                    <div className="space-y-6">

                        <div className="flex flex-col items-center space-y-3">
                            <OnboardingUploader
                                label="Profile Photo"
                                value={details.profilePhoto}
                                isUploading={isUploading === 'profilePhoto'}
                                onUpload={(e: any) =>
                                    handleFileUpload(e, 'profilePhoto')
                                }
                            />
                            <p className="text-xs text-gray-400">
                                Upload a clear professional photo
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <AuthInput
                                label="Date of Birth"
                                type="date"
                                required
                                value={details.dob}
                                onChange={(v: string) =>
                                    setDetails({ ...details, dob: v })
                                }
                                icon={<Calendar size={16} />}
                            />

                            <AuthInput
                                label="Alternate Phone"
                                value={details.alternateNumber}
                                onChange={(v: string) =>
                                    setDetails({ ...details, alternateNumber: v })
                                }
                                icon={<Phone size={16} />}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2 — LOCATION */}
                {onboardingStep === 2 && (
                    <div className="space-y-6">

                        <div>
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 ml-1">
                                Base Address <span className="text-orange-500">*</span>
                            </label>
                            <textarea
                                value={details.address}
                                required
                                onChange={(e) =>
                                    setDetails({
                                        ...details,
                                        address: e.target.value
                                    })
                                }
                                className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition font-medium"
                                rows={3}
                                placeholder="House no, Street, Area"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <AuthInput
                                label="City"
                                required
                                value={details.city}
                                onChange={(v: string) =>
                                    setDetails({ ...details, city: v })
                                }
                                icon={<MapPin size={16} />}
                            />

                            <AuthInput
                                label="State"
                                required
                                value={details.state}
                                onChange={(v: string) =>
                                    setDetails({ ...details, state: v })
                                }
                                icon={<MapPin size={16} />}
                            />

                            <AuthInput
                                label="Pincode"
                                required
                                value={details.zipCode}
                                onChange={(v: string) =>
                                    setDetails({ ...details, zipCode: v })
                                }
                                icon={<Hash size={16} />}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 3 — SKILLS */}
                {onboardingStep === 3 && (
                    <div className="space-y-6">

                        <h4 className="text-base font-semibold text-gray-900">
                            Select Your Expertise <span className="text-orange-500 text-xs">*</span>
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {VEHICLE_TYPES.map((type) => {
                                const selected =
                                    details.vehicleTypes.includes(type.id);

                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() =>
                                            setDetails({
                                                ...details,
                                                vehicleTypes: selected
                                                    ? details.vehicleTypes.filter(
                                                        (s: string) => s !== type.id
                                                    )
                                                    : [...details.vehicleTypes, type.id]
                                            })
                                        }
                                        className={cn(
                                            "py-3 text-[11px] rounded-lg border transition font-bold uppercase tracking-wider",
                                            selected
                                                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                                : "bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50/30"
                                        )}
                                    >
                                        {type.label}
                                    </button>
                                );
                            })}
                        </div>

                        <AuthInput
                            label="Experience (Years)"
                            required
                            type="number"
                            value={details.experienceYears}
                            onChange={(v: string) =>
                                setDetails({ ...details, experienceYears: v })
                            }
                            icon={<Briefcase size={16} />}
                        />
                    </div>
                )}

                {/* STEP 4 — SERVICE RADIUS */}
                {onboardingStep === 4 && (
                    <div className="space-y-8 text-center py-4">

                        <h4 className="text-base font-semibold text-gray-900">
                            Maximum Service Radius
                        </h4>

                        <div className="relative inline-flex items-center justify-center">
                            <div className="text-5xl font-black text-gray-900 tracking-tighter">
                                {details.serviceRadius}<span className="text-orange-500 text-2xl ml-1">KM</span>
                            </div>
                        </div>

                        <div className="px-4">
                            <input
                                type="range"
                                min="5"
                                max="100"
                                step="5"
                                value={details.serviceRadius}
                                onChange={(e) =>
                                    setDetails({
                                        ...details,
                                        serviceRadius: e.target.value
                                    })
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>5 KM</span>
                                <span>100 KM</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5 — KYC */}
                {onboardingStep === 5 && (
                    <div className="space-y-6">

                        <AuthInput
                            label="Aadhaar Number"
                            required
                            value={details.aadharNo}
                            onChange={(v: string) =>
                                setDetails({ ...details, aadharNo: v })
                            }
                            icon={<ShieldCheck size={16} />}
                        />

                        <AuthInput
                            label="PAN Number"
                            required
                            value={details.panNo}
                            onChange={(v: string) =>
                                setDetails({ ...details, panNo: v })
                            }
                            icon={<CreditCard size={16} />}
                        />

                    </div>
                )}

                {/* STEP 6 — PRICING */}
                {onboardingStep === 6 && (
                    <div className="space-y-6">
                        <h4 className="text-base font-semibold text-gray-900">
                            Service Charges
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <AuthInput
                                label="Base Visit (₹)"
                                required
                                value={details.baseVisitCharge}
                                onChange={(v: string) =>
                                    setDetails({ ...details, baseVisitCharge: v })
                                }
                                icon={<Wallet size={16} />}
                            />

                            <AuthInput
                                label="Hourly Charge (₹)"
                                value={details.perHourCharge}
                                onChange={(v: string) =>
                                    setDetails({ ...details, perHourCharge: v })
                                }
                                icon={<Clock size={16} />}
                            />

                            <AuthInput
                                label="Emergency (₹)"
                                value={details.emergencyServiceCharge}
                                onChange={(v: string) =>
                                    setDetails({
                                        ...details,
                                        emergencyServiceCharge: v
                                    })
                                }
                                icon={<Briefcase size={16} />}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 7 — WORKING DAYS */}
                {onboardingStep === 7 && (
                    <div className="space-y-6">

                        <h4 className="text-base font-semibold text-gray-900">
                            Working Availability <span className="text-orange-500 text-xs">*</span>
                        </h4>

                        <div className="flex flex-wrap gap-2">
                            {WORKING_DAYS.map((day) => {
                                const selected =
                                    details.workingDays.includes(day);

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() =>
                                            setDetails({
                                                ...details,
                                                workingDays: selected
                                                    ? details.workingDays.filter(
                                                        (d: string) => d !== day
                                                    )
                                                    : [...details.workingDays, day]
                                            })
                                        }
                                        className={cn(
                                            "px-4 py-2 text-[11px] font-bold rounded-xl border transition uppercase tracking-wider",
                                            selected
                                                ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                        )}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 8 — BANK DETAILS */}
                {onboardingStep === 8 && (
                    <div className="space-y-6">

                        <AuthInput
                            label="Account Holder Name"
                            required
                            value={details.bankDetails.holderName}
                            onChange={(v: string) =>
                                setDetails({
                                    ...details,
                                    bankDetails: {
                                        ...details.bankDetails,
                                        holderName: v
                                    }
                                })
                            }
                            icon={<User size={16} />}
                        />

                        <AuthInput
                            label="Bank Name"
                            required
                            value={details.bankDetails.bankName}
                            onChange={(v: string) =>
                                setDetails({
                                    ...details,
                                    bankDetails: {
                                        ...details.bankDetails,
                                        bankName: v
                                    }
                                })
                            }
                            icon={<Building2 size={16} />}
                        />

                        <AuthInput
                            label="Account Number"
                            required
                            value={details.bankDetails.accountNo}
                            onChange={(v: string) =>
                                setDetails({
                                    ...details,
                                    bankDetails: {
                                        ...details.bankDetails,
                                        accountNo: v
                                    }
                                })
                            }
                            icon={<Hash size={16} />}
                        />
                    </div>
                )}

            </div>

            {/* FOOTER NAVIGATION */}
            <div className="flex justify-between items-center px-2">

                {onboardingStep > 1 ? (
                    <button
                        type="button"
                        onClick={() =>
                            setOnboardingStep(onboardingStep - 1)
                        }
                        className="text-sm font-bold text-gray-500 hover:text-gray-900 transition flex items-center gap-2"
                    >
                        Back
                    </button>
                ) : (
                    <div />
                )}

                {onboardingStep < totalSteps ? (
                    <button
                        type="button"
                        onClick={validateAndContinue}
                        className="px-8 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-100 flex items-center gap-2 active:scale-95"
                    >
                        Continue <ChevronRight size={18} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={finishRegistration}
                        disabled={isLoading}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition disabled:opacity-50 shadow-lg shadow-gray-200 active:scale-95"
                    >
                        {isLoading
                            ? 'Processing...'
                            : 'Activate Account'}
                    </button>
                )}

            </div>
        </div>
    );
}