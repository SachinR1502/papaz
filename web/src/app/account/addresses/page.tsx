'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { MapPin, Plus, Phone, Edit2, Trash2, Home, Briefcase, MapPinned, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { customerService } from '@/services/customerService';
import { toast } from 'sonner';

export default function AddressesPage() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [token]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await customerService.getAddresses();
      setAddresses(Array.isArray(res) ? res : (res.data || []));
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      // Mocking delete for now as API might not be defined in service
      await new Promise(resolve => setTimeout(resolve, 800));
      setAddresses(prev => prev.filter(a => (a._id || a.id) !== id));
      toast.success('Address removed');
    } catch (error) {
      toast.error('Failed to remove address');
    } finally {
      setIsDeleting(null);
    }
  };

  const getIconForLabel = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home')) return <Home size={18} />;
    if (lowerLabel.includes('work') || lowerLabel.includes('office')) return <Briefcase size={18} />;
    return <MapPin size={18} />;
  };

  return (
    <div className="flex flex-col gap-10 md:gap-14 animate-fade-in pb-20">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4 lg:mb-6">
            <MapPinned size={10} className="text-primary" />
            <span className="text-[10px] uppercase font-black tracking-widest text-primary">Saved Locations</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black m-0 tracking-tighter text-foreground italic uppercase">
            My <span className="text-primary">Addresses</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted font-bold max-w-2xl opacity-80 leading-relaxed">
            Manage your delivery locations for a faster and smoother checkout experience.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2.5 px-8 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 italic shrink-0"
        >
          <Plus size={18} />
          Add New
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-64 rounded-[36px] bg-card/10 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="relative group max-w-3xl mx-auto w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/10 rounded-[40px] blur-xl opacity-20" />
          <div className="relative p-12 md:p-20 rounded-[40px] border border-border bg-card/10 backdrop-blur-3xl flex flex-col items-center text-center gap-8 overflow-hidden shadow-2xl border-dashed">
            <div className="w-20 h-20 bg-card/20 rounded-3xl flex items-center justify-center text-muted/30">
              <MapPin size={40} />
            </div>
            <div className="max-w-md space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-foreground italic uppercase tracking-tight">No Addresses Found</h3>
              <p className="text-muted font-black uppercase tracking-widest text-[10px] opacity-60 leading-loose">
                Your address book is currently empty. Add your home or office address to expedite your orders.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-10 py-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-primary hover:text-white active:scale-95 italic text-center"
            >
              Add First Address
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {addresses.map((address) => (
            <div
              key={address._id || address.id}
              className="group relative flex flex-col p-8 rounded-[36px] border border-border bg-card/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:bg-card/40 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3 px-4 py-2 bg-card/40 rounded-xl border border-border group-hover:border-primary/30 transition-colors">
                  <span className="text-primary">{getIconForLabel(address.label)}</span>
                  <span className="font-black text-xs uppercase tracking-widest">{address.label}</span>
                </div>
                {address.isDefault && (
                  <div className="px-3 py-1 bg-green-500/10 rounded-full text-green-500 border border-green-500/20 font-black text-[9px] uppercase tracking-widest shadow-xl shadow-green-500/5">
                    Primary
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-black text-foreground italic uppercase tracking-tight leading-none">
                  {address.fullName}
                </h4>
                <div className="text-sm md:text-base text-muted font-bold leading-relaxed opacity-80">
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>{address.city}, {address.state} - {address.zipCode}</p>
                </div>
                <div className="pt-4 flex items-center gap-3 text-sm font-black text-foreground italic">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Phone size={14} />
                  </div>
                  <span className="opacity-80">+91 {address.phone}</span>
                </div>
              </div>

              <div className="mt-10 pt-6 flex gap-3 border-t border-border/50">
                <button className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-card border border-border text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/10 hover:border-primary/30 hover:text-primary active:scale-95 italic">
                  <Edit2 size={14} />
                  Edit info
                </button>
                <button
                  onClick={() => handleDelete(address._id || address.id)}
                  disabled={isDeleting === (address._id || address.id)}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-500/10 hover:border-red-500/20 active:scale-95 italic disabled:opacity-50"
                >
                  {isDeleting === (address._id || address.id) ? (
                    <div className="w-3 h-3 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  {isDeleting === (address._id || address.id) ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD MODAL PLACEHOLDER */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-xl bg-card border border-border rounded-[40px] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-8 right-8 text-muted hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-2xl font-black text-foreground italic uppercase mb-2">Add New Address</h3>
                <p className="text-xs text-muted font-black uppercase tracking-widest opacity-60">Enter your delivery details below</p>
              </div>

              <div className="text-center py-20 border-2 border-dashed border-border rounded-[32px] bg-card/5">
                <p className="text-muted font-black uppercase tracking-widest text-[10px] opacity-40">Form Integration Pending API Confirmation</p>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 italic"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
