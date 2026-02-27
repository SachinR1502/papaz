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
    rating: number;
    image: string;
    category: string;
    initialWishlisted?: boolean;
}

export default function ProductCard({ id, name, price, rating, image, category, initialWishlisted = false }: ProductCardProps) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const handleAddToCart = () => {
        addToCart({ id, name, price, image, category });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (wishlistLoading) return;

        // Check if user is logged in
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) {
            toast.error('Authentication Required', {
                description: 'Please login to add items to your wishlist.',
            });
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
            console.error('Wishlist toggle error:', err);
            toast.error('Failed to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    return (
        <div className="group bg-card border border-border rounded-3xl sm:rounded-[40px] overflow-hidden flex flex-col h-full transition-all duration-500 hover:border-primary/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            {/* Image Section */}
            <div className="relative h-44 sm:h-56 md:h-64 overflow-hidden p-2 sm:p-3">
                <div className="w-full h-full rounded-2xl sm:rounded-[32px] overflow-hidden relative">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className={cn(
                        "absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300",
                        isWishlisted
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-white hover:text-red-500"
                    )}
                >
                    <Heart
                        size={18}
                        className={cn("transition-transform", isWishlisted && "fill-current scale-110")}
                    />
                </button>

                {/* Badges */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-2">
                    <div className="bg-black/60 backdrop-blur-xl text-white text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/10 shadow-lg w-fit">
                        {category}
                    </div>
                </div>

                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-orange-500/10 backdrop-blur-xl text-primary flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-primary/20 shadow-lg">
                    <Star size={8} className="fill-primary sm:w-[10px]" />
                    <span className="text-[9px] sm:text-[10px] font-black">{rating}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-7 pt-1 sm:pt-2 flex flex-col flex-1">
                <Link href={`/product/${id}`} className="block mb-3 sm:mb-5">
                    <h3 className="text-sm sm:text-base md:text-lg font-black text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2 italic uppercase">
                        {name}
                    </h3>
                </Link>

                <div className="mt-auto pt-4 sm:pt-6 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4 border-t border-border/50">
                    <div className="flex flex-col">
                        <span className="text-[8px] sm:text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-0.5 sm:mb-1">Price / Unit</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-base sm:text-lg md:text-xl font-black text-foreground tracking-tighter italic">₹{price.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={isAdded}
                        className={cn(
                            "h-10 w-full xs:w-10 sm:h-12 sm:w-auto sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-500",
                            isAdded
                                ? "bg-green-500 text-white shadow-xl shadow-green-500/20 px-4"
                                : "bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 group-hover:scale-105"
                        )}
                    >
                        {isAdded ? (
                            <div className="flex items-center gap-2 animate-fade-in">
                                <Check className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />
                                <span>Added</span>
                            </div>
                        ) : (
                            <>
                                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-y-0.5 transition-transform" strokeWidth={3} />
                                <span className="xs:hidden sm:inline">Add</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

