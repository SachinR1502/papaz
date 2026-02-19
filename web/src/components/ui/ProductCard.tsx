'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Star, ShoppingCart, Check, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    id: string | number;
    name: string;
    price: number;
    rating: number;
    image: string;
    category: string;
}

export default function ProductCard({ id, name, price, rating, image, category }: ProductCardProps) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart({ id, name, price, image, category });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="group bg-card border border-border rounded-[40px] overflow-hidden flex flex-col h-full transition-all duration-500 hover:border-primary/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden p-3">
                <div className="w-full h-full rounded-[32px] overflow-hidden relative">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className="bg-black/60 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg w-fit">
                        {category}
                    </div>
                </div>

                <div className="absolute top-6 right-6 bg-orange-500/10 backdrop-blur-xl text-primary flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 shadow-lg">
                    <Star size={10} className="fill-primary" />
                    <span className="text-[10px] font-black">{rating}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-7 pt-2 flex flex-col flex-1">
                <Link href={`/product/${id}`} className="block mb-5">
                    <h3 className="text-lg font-black text-foreground leading-[1.2] tracking-tight group-hover:text-primary transition-colors line-clamp-2 italic uppercase">
                        {name}
                    </h3>
                </Link>

                <div className="mt-auto pt-6 flex items-center justify-between gap-4 border-t border-border/50">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-1">Price / Unit</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-foreground tracking-tighter italic">₹{price.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={isAdded}
                        className={cn(
                            "h-12 w-12 sm:w-auto sm:px-6 rounded-2xl flex items-center justify-center gap-2.5 text-xs font-black uppercase tracking-widest transition-all duration-500 transition-all",
                            isAdded
                                ? "bg-green-500 text-white shadow-xl shadow-green-500/20 w-32"
                                : "bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 group-hover:scale-105"
                        )}
                    >
                        {isAdded ? (
                            <div className="flex items-center gap-2 animate-fade-in">
                                <Check size={16} strokeWidth={3} />
                                <span className="hidden sm:inline">Stored</span>
                            </div>
                        ) : (
                            <>
                                <ShoppingCart size={16} strokeWidth={3} className="group-hover:-translate-y-0.5 transition-transform" />
                                <span className="hidden sm:inline">Add</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

