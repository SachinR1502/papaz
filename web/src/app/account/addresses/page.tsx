'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Phone,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  X
} from 'lucide-react';
import { customerService } from '@/services/customerService';
import { toast } from 'sonner';

export default function AddressesPage() {
  const { token } = useAuth();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchAddresses();
  }, [token]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await customerService.getAddresses();
      setAddresses(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await new Promise(r => setTimeout(r, 500)); // mock
      setAddresses(prev => prev.filter(a => (a._id || a.id) !== id));
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    } finally {
      setDeletingId(null);
    }
  };

  const getIcon = (label: string) => {
    const l = label?.toLowerCase();
    if (l?.includes('home')) return <Home size={16} />;
    if (l?.includes('work') || l?.includes('office'))
      return <Briefcase size={16} />;
    return <MapPin size={16} />;
  };

  return (
    <div className="flex flex-col gap-8">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            My Addresses
          </h1>
          <p className="mt-2 text-gray-500">
            Manage your delivery locations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
        >
          <Plus size={16} />
          Add Address
        </button>
      </header>

      {/* LOADING */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div
              key={i}
              className="h-40 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : addresses.length === 0 ? (

        /* EMPTY STATE */
        <div className="p-12 text-center border border-dashed border-gray-300 rounded-xl bg-white">
          <MapPin size={40} className="mx-auto text-gray-300 mb-4" />

          <h3 className="text-lg font-medium text-gray-800">
            No addresses added
          </h3>

          <p className="text-gray-500 text-sm mt-2">
            Add your home or office address for faster checkout.
          </p>

          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
          >
            Add First Address
          </button>
        </div>

      ) : (

        /* ADDRESS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(address => (
            <div
              key={address._id || address.id}
              className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition"
            >
              {/* TOP */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  {getIcon(address.label)}
                  {address.label}
                </div>

                {address.isDefault && (
                  <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-md">
                    Default
                  </span>
                )}
              </div>

              {/* BODY */}
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium text-gray-800">
                  {address.fullName}
                </p>

                <p>
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </p>

                <p>
                  {address.city}, {address.state} - {address.zipCode}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <Phone size={14} />
                  +91 {address.phone}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                  <Edit2 size={14} />
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDelete(address._id || address.id)
                  }
                  disabled={deletingId === (address._id || address.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {deletingId === (address._id || address.id)
                    ? 'Removing...'
                    : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add New Address
            </h3>

            <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500 text-sm">
              Address form integration pending.
            </div>

            <button
              onClick={() => setShowAddModal(false)}
              className="mt-6 w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}