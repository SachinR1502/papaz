'use client';

import Link from 'next/link';
import { Heart, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { customerService } from '@/services/customerService';
import { toast } from 'sonner';
import { WishlistItem } from '@/components/wishlist/WishlistItem';

const WishlistHeader = ({ count }: { count: number }) => (
  <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-sm">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

      <div>
        <div className="flex items-center gap-2 text-orange-500 mb-3">
          <Heart size={18} className="fill-orange-500" />
          <span className="text-sm font-medium">Saved Items</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          My Wishlist
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {count} item{count !== 1 ? 's' : ''} saved for later
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
      >
        <Search size={16} />
        Continue Shopping
      </Link>

    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-dashed border-gray-300 text-center">

    <Heart size={48} className="text-gray-300 mb-6" />

    <h3 className="text-xl font-semibold text-gray-900">
      Your wishlist is empty
    </h3>

    <p className="mt-3 text-gray-500 text-sm max-w-md">
      Save items you like so you can easily find them later.
    </p>

    <Link
      href="/"
      className="mt-8 px-6 py-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
    >
      Start Shopping
    </Link>

  </div>
);

const LoadingSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
    {[1, 2, 3, 4].map(i => (
      <div
        key={i}
        className="aspect-[4/6] rounded-xl bg-gray-100 animate-pulse"
      />
    ))}
  </div>
);

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
      setWishlist(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      setWishlist(prev =>
        prev.filter(item => item._id !== productId && item.id !== productId)
      );
      toast.success('Item removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">

      <WishlistHeader count={wishlist.length} />

      {loading ? (
        <LoadingSkeleton />
      ) : wishlist.length === 0 ? (
        <EmptyState />
      ) : (
        /* ✅ UPDATED GRID */
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {wishlist.map(item => (
            <WishlistItem
              key={item._id || item.id}
              item={item}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

    </div>
  );
}