'use client';

import Link from 'next/link';
import { Heart, Search, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { customerService } from '@/services/customerService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchWishlist();
  }, [token]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await customerService.getWishlist();
      setWishlist(Array.isArray(res) ? res : (res.data || []));
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      // Mocking remove for now as API might not be defined in service
      // customerService.removeFromWishlist(productId)
      setWishlist(prev => prev.filter(item => item._id !== productId && item.id !== productId));
      toast.success('Removed from favorites');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="flex flex-col gap-10 md:gap-14 animate-fade-in pb-20">
      {/* HEADER */}
      <header className="text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4 lg:mb-6">
          <Heart size={10} className="text-red-500 fill-red-500" />
          <span className="text-[10px] uppercase font-black tracking-widest text-red-500">My Collection</span>
        </div>
        <h1 className="text-4xl lg:text-6xl font-black m-0 tracking-tighter text-foreground italic uppercase">
          My <span className="text-primary">Favorites</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted font-bold max-w-2xl opacity-80 leading-relaxed">
          Products you've saved for later. Keep an eye on price changes and stock availability here.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-[36px] bg-card/10 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="relative group max-w-4xl mx-auto w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-red-500/10 to-primary/20 rounded-[40px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

          <div className="relative p-12 md:p-24 rounded-[40px] border border-border bg-card/20 backdrop-blur-3xl flex flex-col items-center text-center gap-8 md:gap-10 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-500 opacity-[0.03] blur-[100px] -mr-40 -mt-40 pointer-events-none" />

            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-red-500/10 rounded-[32px] flex items-center justify-center text-red-500 shadow-xl shadow-red-500/5 animate-float border border-red-500/10">
                <Heart size={48} className="md:size-64 fill-red-500/20" />
              </div>
            </div>

            <div className="max-w-md space-y-4">
              <h3 className="text-3xl md:text-4xl font-black text-foreground italic uppercase tracking-tight">
                No Favorites Yet
              </h3>
              <p className="text-muted font-black uppercase tracking-widest text-[10px] md:text-xs opacity-60 leading-loose">
                Your list is currently empty. Start exploring our catalog to save the items you want to keep an eye on.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/"
                className="flex items-center justify-center gap-3 px-10 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 italic text-center"
              >
                <Search size={18} />
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {wishlist.map((item) => (
            <div
              key={item._id || item.id}
              className="group relative flex flex-col p-6 rounded-[36px] border border-border bg-card/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:bg-card/40 hover:shadow-2xl"
            >
              <div className="aspect-square rounded-[24px] overflow-hidden bg-card/40 mb-6 border border-border group-hover:border-primary/20 transition-colors">
                <img
                  src={item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop'}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <button
                  onClick={() => handleRemove(item._id || item.id)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md text-white/50 flex items-center justify-center transition-all hover:bg-red-500 hover:text-white group-hover:translate-x-0 sm:translate-x-4 sm:opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-2 px-2">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-lg font-black text-foreground italic uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xl font-black text-foreground tracking-tighter whitespace-nowrap">
                    ₹{item.price?.toLocaleString()}
                  </p>
                </div>
                <p className="text-[10px] text-muted font-black uppercase tracking-widest opacity-60 line-clamp-1">
                  {item.category || 'Product Category'}
                </p>
              </div>

              <div className="mt-8 px-2 flex gap-3">
                <Link
                  href={`/product/${item._id || item.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 italic"
                >
                  View Item <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 5s ease-in-out infinite;
                }
            `}</style>
    </div>
  );
}
