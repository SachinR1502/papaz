'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Star, ShoppingCart, Check, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { customerService } from '@/services/customerService';
import { toast } from 'sonner';

interface ProductCardProps {
    id: string | number;
    name: string;
    price: number;
    mrp?: number;
    rating: number;
    image: string;
    category: string;
    initialWishlisted?: boolean;
}

export default function ProductCard({
    id,
    name,
    price,
    mrp,
    rating,
    image,
    category,
    initialWishlisted = false,
}: ProductCardProps) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const discount =
        mrp && mrp > price
            ? Math.round(((mrp - price) / mrp) * 100)
            : 0;

    const handleAddToCart = () => {
        addToCart({ id, name, price, image, category });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
    };

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (wishlistLoading) return;

        const token =
            typeof window !== 'undefined'
                ? localStorage.getItem('auth_token')
                : null;

        if (!token) {
            toast.error('Please login to use wishlist');
            return;
        }

        try {
            setWishlistLoading(true);

            if (isWishlisted) {
                await customerService.removeFromWishlist(id);
                setIsWishlisted(false);
                toast.success('Removed from wishlist');
            } else {
                await customerService.addToWishlist(id);
                setIsWishlisted(true);
                toast.success('Added to wishlist');
            }
        } catch (err) {
            toast.error('Failed to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    return (
        <div className="bg-badass border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full transition hover:shadow-md">

            {/* Image */}
            <div className="relative aspect-square bg-gray-50">
                <Link href={`/product/${id}`}>
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </Link>

                {/* Wishlist */}
                <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className={cn(
                        "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-white border border-gray-200 shadow-sm transition",
                        isWishlisted
                            ? "text-red-500"
                            : "text-gray-400 hover:text-red-500"
                    )}
                >
                    <Heart
                        size={16}
                        className={cn(isWishlisted && "fill-current")}
                    />
                </button>

                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                        {discount}% OFF
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">

                {/* Category */}
                <span className="text-xs text-gray-500 mb-1">
                    {category}
                </span>

                {/* Name */}
                <Link href={`/product/${id}`}>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-orange-600 transition">
                        {name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                    <Star size={14} className="text-orange-500 fill-orange-500" />
                    <span className="text-xs text-gray-600">
                        {rating.toFixed(1)}
                    </span>
                </div>

                {/* Price + Cart */}
                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div>
                        <div className="text-base font-semibold text-gray-900">
                            ₹{price.toLocaleString()}
                        </div>

                        {mrp && mrp > price && (
                            <div className="text-xs text-gray-400 line-through">
                                ₹{mrp.toLocaleString()}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={isAdded}
                        className={cn(
                            "w-10 h-10 flex items-center justify-center rounded-md transition",
                            isAdded
                                ? "bg-green-500 text-white"
                                : "bg-orange-600 text-white hover:bg-orange-700"
                        )}
                    >
                        {isAdded ? (
                            <Check size={18} />
                        ) : (
                            <ShoppingCart size={18} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}