'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { customerService } from '@/services/customerService';
import { toast } from 'sonner';

import { AddressCard } from '@/components/address/AddressCard';
import { AddressModal } from '@/components/address/AddressModal';

/* ---------------- HEADER ---------------- */

const AddressHeader = ({ onAdd }: { onAdd: () => void }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-sm">

    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
        My Addresses
      </h1>
      <p className="text-sm text-gray-500 mt-2">
        Manage your delivery addresses for faster checkout.
      </p>
    </div>

    <button
      onClick={onAdd}
      className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
    >
      <Plus size={16} />
      Add Address
    </button>
  </div>
);

/* ---------------- EMPTY STATE ---------------- */

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center shadow-sm">
    <MapPin size={36} className="mx-auto text-gray-300 mb-6" />
    <h3 className="text-lg font-semibold text-gray-900">
      No addresses found
    </h3>
    <p className="text-sm text-gray-500 mt-2">
      Add your first delivery address to continue.
    </p>
    <button
      onClick={onAdd}
      className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
    >
      Add Address
    </button>
  </div>
);

/* ---------------- LOADING ---------------- */

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map(i => (
      <div
        key={i}
        className="h-48 bg-white border border-gray-200 rounded-xl animate-pulse"
      />
    ))}
  </div>
);

/* ---------------- MAIN PAGE ---------------- */

export default function AddressesPage() {
  const { token } = useAuth();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    label: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    taluka: '',
    district: '',
    division: '',
    region: '',
    isDefault: false
  });

  useEffect(() => {
    if (token) fetchAddresses();
  }, [token]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await customerService.getAddresses();
      setAddresses(res.success ? res.data : (Array.isArray(res) ? res : []));
    } catch {
      toast.error('Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (address?: any) => {
    if (address) {
      setEditingAddress(address);
      setFormData({ ...address });
    } else {
      setEditingAddress(null);
      setFormData({
        label: '',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        taluka: '',
        district: '',
        division: '',
        region: '',
        isDefault: false
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      if (editingAddress) {
        await customerService.updateAddress(
          editingAddress._id || editingAddress.id,
          formData
        );
        toast.success('Address updated');
      } else {
        await customerService.addAddress(formData);
        toast.success('Address added');
      }

      setShowModal(false);
      fetchAddresses();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this address?')) return;

    try {
      setDeletingId(id);
      await customerService.removeAddress(id);
      setAddresses(prev =>
        prev.filter(a => (a._id || a.id) !== id)
      );
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">

      <AddressHeader onAdd={() => handleOpenModal()} />

      {loading ? (
        <LoadingSkeleton />
      ) : addresses.length === 0 ? (
        <EmptyState onAdd={() => handleOpenModal()} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address._id || address.id}
              address={address}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              isDeleting={
                deletingId === (address._id || address.id)
              }
            />
          ))}
        </div>
      )}

      <AddressModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingAddress}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}