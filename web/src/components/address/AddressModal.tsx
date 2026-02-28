'use client';

import { X } from 'lucide-react';

interface AddressFormData {
    label: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    taluka: string;
    district: string;
    division: string;
    region: string;
    isDefault: boolean;
}

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: AddressFormData;
    setFormData: React.Dispatch<React.SetStateAction<AddressFormData>>;
    isEditing: boolean;
    isSubmitting: boolean;
}

export const AddressModal = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    isEditing,
    isSubmitting
}: AddressModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            {/* Overlay */}
            <div
                className="absolute inset-0"
                onClick={() => !isSubmitting && onClose()}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isEditing ? 'Edit Address' : 'Add Address'}
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-gray-100 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            <Input
                                label="Label (Home, Work, etc.)"
                                value={formData.label}
                                onChange={v => setFormData({ ...formData, label: v })}
                                required
                            />

                            <Input
                                label="Full Name"
                                value={formData.fullName}
                                onChange={v => setFormData({ ...formData, fullName: v })}
                                required
                            />

                            <Input
                                label="Phone Number"
                                type="tel"
                                value={formData.phone}
                                onChange={v => setFormData({ ...formData, phone: v })}
                                required
                            />

                            <Input
                                label="City"
                                value={formData.city}
                                onChange={v => setFormData({ ...formData, city: v })}
                                required
                            />

                            <Input
                                label="Address Line 1"
                                value={formData.addressLine1}
                                onChange={v => setFormData({ ...formData, addressLine1: v })}
                                required
                                className="sm:col-span-2"
                            />

                            <Input
                                label="Address Line 2"
                                value={formData.addressLine2}
                                onChange={v => setFormData({ ...formData, addressLine2: v })}
                                className="sm:col-span-2"
                            />

                            <Input
                                label="Taluka"
                                value={formData.taluka}
                                onChange={v => setFormData({ ...formData, taluka: v })}
                            />

                            <Input
                                label="Zip Code"
                                value={formData.zipCode}
                                onChange={v => setFormData({ ...formData, zipCode: v })}
                                required
                            />

                        </div>

                        {/* Default checkbox */}
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={e =>
                                    setFormData({ ...formData, isDefault: e.target.checked })
                                }
                                className="w-4 h-4 text-orange-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">
                                Set as default address
                            </span>
                        </label>

                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            {isSubmitting
                                ? 'Saving...'
                                : isEditing
                                    ? 'Update Address'
                                    : 'Save Address'}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};


/* Input Component */

interface InputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    className?: string;
}

function Input({
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    className = ''
}: InputProps) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label className="text-sm font-medium text-gray-700">
                {label}
            </label>

            <input
                type={type}
                required={required}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
        </div>
    );
}