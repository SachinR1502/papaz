'use client';

import {
    Home,
    Briefcase,
    MapPin,
    Phone,
    Edit2,
    Trash2,
    ShieldCheck
} from 'lucide-react';

interface Address {
    _id?: string;
    id?: string;
    label: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
}

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

export const AddressCard = ({
    address,
    onEdit,
    onDelete,
    isDeleting
}: AddressCardProps) => {
    const id = address._id || address.id || '';

    const getIcon = (label: string) => {
        const l = label?.toLowerCase();
        if (l?.includes('home')) return <Home size={16} />;
        if (l?.includes('work') || l?.includes('office'))
            return <Briefcase size={16} />;
        return <MapPin size={16} />;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="text-orange-500">
                        {getIcon(address.label)}
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">
                        {address.label}
                    </h3>
                </div>

                {address.isDefault && (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                        <ShieldCheck size={12} />
                        Primary
                    </span>
                )}
            </div>

            {/* Name */}
            <p className="text-sm font-medium text-gray-900">
                {address.fullName}
            </p>

            {/* Address */}
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {address.addressLine1}
                {address.addressLine2 && `, ${address.addressLine2}`}
                <br />
                {address.city}, {address.state} - {address.zipCode}
            </p>

            {/* Phone */}
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <Phone size={14} />
                +91 {address.phone}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
                <button
                    onClick={() => onEdit(address)}
                    className="flex-1 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                    Edit
                </button>

                <button
                    onClick={() => onDelete(id)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
};