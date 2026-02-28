'use client';

import Link from 'next/link';
import { Trash2, ArrowRight, Star, ShoppingCart } from 'lucide-react';

export interface WishlistItemProps {
    item: {
        _id?: string;
        id?: string;
        name: string;
        price: number;
        originalPrice?: number;
        image?: string;
        images?: string[];
        category?: string;
        rating?: number;
        stockStatus?: string;
    };
    onRemove: (productId: string) => void;
}

export const WishlistItem = ({ item, onRemove }: WishlistItemProps) => {
    const id = item._id || item.id || '';
    const imageUrl =
        item.image || item.images?.[0] || 'https://via.placeholder.com/400';

    const discount = item.originalPrice
        ? Math.round(
            ((item.originalPrice - item.price) / item.originalPrice) * 100
        )
        : 0;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">

            {/* Image Section */}
            <div className="relative aspect-[4/5] bg-gray-50">
                <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />

                {discount > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] sm:text-xs font-medium rounded">
                        {discount}% OFF
                    </div>
                )}

                <button
                    onClick={() => onRemove(id)}
                    className="absolute top-2 right-2 w-8 h-8 sm:w-9 sm:h-9 bg-white border border-gray-200 rounded-md flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white transition"
                >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4">

                {/* Category + Rating */}
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] sm:text-xs text-gray-500 truncate">
                        {item.category || 'General'}
                    </span>

                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        {item.rating || 4.5}
                    </div>
                </div>

                {/* Product Name */}
                <h4 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 mb-2 leading-snug">
                    {item.name}
                </h4>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm sm:text-lg font-semibold text-gray-900">
                        ₹{item.price?.toLocaleString()}
                    </p>

                    {item.originalPrice && (
                        <p className="text-[11px] sm:text-sm text-gray-400 line-through">
                            ₹{item.originalPrice.toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2">

                    <button className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 bg-orange-500 text-white text-[11px] sm:text-sm font-medium rounded-md hover:bg-orange-600 transition">
                        <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Add to Cart</span>
                    </button>

                    <Link
                        href={`/product/${id}`}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-[11px] sm:text-sm rounded-md hover:bg-gray-100 transition flex items-center justify-center"
                    >
                        <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>

                </div>
            </div>
        </div>
    );
};