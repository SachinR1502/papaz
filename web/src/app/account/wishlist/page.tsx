'use client';

import Link from 'next/link';
import { Heart, Search, Trash2, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { customerService } from '@/services/customerService';
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
      setWishlist(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
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
    <div className="flex flex-col gap-8">

      {/* HEADER */}
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">
          Wishlist
        </h1>

        <p className="mt-2 text-gray-500">
          Products you saved for later.
        </p>
      </header>

      {/* LOADING */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-64 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : wishlist.length === 0 ? (

        /* EMPTY STATE */
        <div className="p-12 text-center border border-dashed border-gray-300 rounded-xl bg-white">
          <Heart size={40} className="mx-auto text-gray-300 mb-4" />

          <h3 className="text-lg font-medium text-gray-800">
            Your wishlist is empty
          </h3>

          <p className="text-gray-500 text-sm mt-2">
            Browse products and save items you like.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
          >
            <Search size={16} />
            Browse Products
          </Link>
        </div>

      ) : (

        /* PRODUCT GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(item => (
            <div
              key={item._id || item.id}
              className="border border-gray-200 rounded-xl bg-white hover:shadow-md transition overflow-hidden"
            >
              {/* IMAGE */}
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={
                    item.image ||
                    item.images?.[0] ||
                    'https://via.placeholder.com/400'
                  }
                  alt={item.name}
                  className="w-full h-full object-cover"
                />

                <button
                  onClick={() =>
                    handleRemove(item._id || item.id)
                  }
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white shadow text-red-500 flex items-center justify-center hover:bg-red-50 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* CONTENT */}
              <div className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                    {item.name}
                  </h4>

                  <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                    ₹{item.price?.toLocaleString()}
                  </p>
                </div>

                <p className="text-xs text-gray-500">
                  {item.category || 'Category'}
                </p>

                <Link
                  href={`/product/${item._id || item.id}`}
                  className="mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                >
                  View Product
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}