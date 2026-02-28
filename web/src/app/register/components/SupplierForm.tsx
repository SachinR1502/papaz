'use client';

import {
    Store,
    User,
    MapPin,
    Hash,
    ShieldCheck,
    CreditCard,
    FileText,
    Building2,
    ChevronRight,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthInput, OnboardingUploader } from './Shared';
import { toast } from 'sonner';

const SUPPLIER_CATEGORIES = [
    'Two Wheeler Parts',
    'Three Wheeler Parts',
    'Four Wheeler Parts',
    'Commercial Vehicles',
    'Electric Vehicle Parts',
    'EV Accessories',
    'Other'
];

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
}: any) {
    const totalSteps = 5;

    const validateAndContinue = () => {
        if (onboardingStep === 1) {
            if (!details.storeName) return toast.error("Store Name is required");
            if (!form.fullName) return toast.error("Owner Name is required");
            if (!details.city) return toast.error("City is required");
            if (!details.address) return toast.error("Address is required");
        }
        if (onboardingStep === 2) {
            if (details.businessCategories.length === 0) return toast.error("Select at least one category");
        }
        if (onboardingStep === 3) {
            if (!details.gstin) return toast.error("GSTIN is required");
            if (!details.panNo) return toast.error("PAN is required");
            if (!details.aadharNo) return toast.error("Aadhaar is required");
        }
        if (onboardingStep === 5) {
            if (!details.bankDetails.holderName || !details.bankDetails.accountNo) return toast.error("Bank details are required");
        }

        setOnboardingStep(onboardingStep + 1);
    };

    return (
        <div className="space-y-8">

            {/* Step Header */}
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

            {/* Step Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">

                {/* STEP 1 */}
                {onboardingStep === 1 && (
                    <div className="space-y-6">
                        <h4 className="text-base font-semibold text-gray-900">
                            Business Information
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <AuthInput
                                label="Store Name"
                                required
                                value={details.storeName}
                                onChange={(v: string) =>
                                    setDetails({ ...details, storeName: v })
                                }
                                icon={<Store size={16} />}
                            />

                            <AuthInput
                                label="Owner Name"
                                required
                                value={form.fullName}
                                onChange={(v: string) =>
                                    setForm({ ...form, fullName: v })
                                }
                                icon={<User size={16} />}
                            />

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
                                value={details.state}
                                onChange={(v: string) =>
                                    setDetails({ ...details, state: v })
                                }
                                icon={<MapPin size={16} />}
                            />

                            <AuthInput
                                label="Pincode"
                                value={details.zipCode}
                                onChange={(v: string) =>
                                    setDetails({ ...details, zipCode: v })
                                }
                                icon={<Hash size={16} />}
                            />

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 ml-1">
                                    Business Address <span className="text-orange-500">*</span>
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
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition font-medium"
                                    rows={3}
                                    placeholder="Enter full business address"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2 */}
                {onboardingStep === 2 && (
                    <div className="space-y-6">
                        <h4 className="text-base font-semibold text-gray-900">
                            Product Categories <span className="text-orange-500 text-xs">*</span>
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {SUPPLIER_CATEGORIES.map((cat) => {
                                const selected =
                                    details.businessCategories.includes(cat);

                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() =>
                                            setDetails({
                                                ...details,
                                                businessCategories: selected
                                                    ? details.businessCategories.filter(
                                                        (c: any) => c !== cat
                                                    )
                                                    : [...details.businessCategories, cat]
                                            })
                                        }
                                        className={cn(
                                            "py-3 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition",
                                            selected
                                                ? "bg-orange-500 text-white border-orange-500"
                                                : "bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50/30"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {onboardingStep === 3 && (
                    <div className="space-y-6">
                        <h4 className="text-base font-semibold text-gray-900">
                            Legal & Tax Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <AuthInput
                                label="GSTIN"
                                required
                                value={details.gstin}
                                onChange={(v: string) =>
                                    setDetails({ ...details, gstin: v })
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

                            <AuthInput
                                label="Aadhaar"
                                required
                                value={details.aadharNo}
                                onChange={(v: string) =>
                                    setDetails({ ...details, aadharNo: v })
                                }
                                icon={<User size={16} />}
                            />

                            <AuthInput
                                label="UDYAM Number"
                                value={details.udyamNumber}
                                onChange={(v: string) =>
                                    setDetails({ ...details, udyamNumber: v })
                                }
                                icon={<FileText size={16} />}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 4 */}
                {onboardingStep === 4 && (
                    <div className="space-y-6">
                        <h4 className="text-base font-semibold text-gray-900">
                            Upload Documents
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <OnboardingUploader
                                label="GST Certificate"
                                value={details.documents.gstCertificate}
                                isUploading={isUploading === 'gstCertificate'}
                                onUpload={(e: any) =>
                                    handleFileUpload(e, 'gstCertificate')
                                }
                            />
                            <OnboardingUploader
                                label="PAN Card"
                                value={details.documents.panCard}
                                isUploading={isUploading === 'panCard'}
                                onUpload={(e: any) =>
                                    handleFileUpload(e, 'panCard')
                                }
                            />
                            <OnboardingUploader
                                label="Aadhaar"
                                value={details.documents.aadharCard}
                                isUploading={isUploading === 'aadharCard'}
                                onUpload={(e: any) =>
                                    handleFileUpload(e, 'aadharCard')
                                }
                            />
                            <OnboardingUploader
                                label="Cancelled Cheque"
                                value={details.documents.cancelledCheque}
                                isUploading={isUploading === 'cancelledCheque'}
                                onUpload={(e: any) =>
                                    handleFileUpload(e, 'cancelledCheque')
                                }
                            />
                        </div>
                    </div>
                )}

                {/* STEP 5 */}
                {onboardingStep === 5 && (
                    <div className="space-y-6">
                        <h4 className="text-base font-semibold text-gray-900">
                            Bank Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                        <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={details.agreedToPlatformTerms}
                                onChange={(e) =>
                                    setDetails({
                                        ...details,
                                        agreedToPlatformTerms:
                                            e.target.checked
                                    })
                                }
                                className="w-5 h-5 rounded-md border-gray-300 text-orange-500 focus:ring-orange-500 accent-orange-500"
                            />
                            <span className="font-medium group-hover:text-gray-900 transition-colors">
                                I agree to platform terms and confirm all
                                details are correct.
                            </span>
                        </label>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
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
                        disabled={
                            !details.agreedToPlatformTerms ||
                            isLoading
                        }
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