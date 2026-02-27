'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { customerService } from '@/services/customerService';
import ProductCard from '@/components/ui/ProductCard';
import { Package, RefreshCw } from 'lucide-react';

export default function FeaturedProducts() {
    const searchParams = useSearchParams();
    const urlCategory = searchParams.get('category') || 'All';
    const urlSearch = searchParams.get('search');

    const [activeCategory, setActiveCategory] = useState(urlCategory);
    const [products, setProducts] = useState<any[]>([]);
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categories = [
        'All',
        'Batteries',
        'Tires',
        'Engine Oil',
        'Brakes',
        'Spare Parts',
        'Accessories',
    ];

    const fetchWishlist = async () => {
        try {
            // Only attempt to fetch if we have a token
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            if (!token) return;

            const data = await customerService.getWishlist();
            setWishlist(data || []);
        } catch (err: any) {
            // Silently handle 401 - user just isn't logged in
            if (err.response?.status !== 401) {
                console.error('Wishlist fetch error:', err);
            }
        }
    };

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params: any = {};

            if (activeCategory !== 'All') {
                params.category = activeCategory;
            }

            if (urlSearch) {
                params.search = urlSearch;
            }

            // Fetch products first, then wishlist separately to avoid blocking on 401
            const productsData = await customerService.getProducts(params);
            setProducts(productsData || []);

            // Attempt wishlist fetch in background
            fetchWishlist();
        } catch (err) {
            console.error(err);
            setError('Unable to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [activeCategory, urlSearch]);

    useEffect(() => {
        setActiveCategory(urlCategory);
    }, [urlCategory]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <section
            id="products"
            aria-labelledby="featured-products-heading"
            className="relative bg-[var(--bg-body)] py-16 sm:py-20 lg:py-24 overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-[radial-gradient(circle,rgba(255,140,0,0.04)_0%,transparent_70%)] blur-[80px] sm:blur-[100px]" />

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER */}
                <header className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
                    <div className="inline-block bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-5">
                        <span className="text-[9px] sm:text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest">
                            Pick of the Week
                        </span>
                    </div>

                    <h2
                        id="featured-products-heading"
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-body)] leading-[1.1]"
                    >
                        Premium{' '}
                        <span className="text-[var(--color-primary)] italic">
                            Hardware
                        </span>{' '}
                        & Parts
                    </h2>

                    <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
                        Precision-engineered components sourced from elite manufacturers
                        for professional-grade performance.
                    </p>
                </header>

                {/* CATEGORY TABS - Improved Scroll Experience */}
                <div className="relative mb-10 sm:mb-14">
                    {/* Horizontal Fade Masks for Mobile Scroll */}
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[var(--bg-body)] to-transparent z-20 pointer-events-none sm:hidden" />
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--bg-body)] to-transparent z-20 pointer-events-none sm:hidden" />

                    <div className="overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
                        <div
                            role="tablist"
                            className="flex gap-2 sm:gap-3 bg-[var(--bg-card)]/50 p-1.5 sm:p-2 rounded-2xl border border-[var(--border-color)] w-max mx-auto min-w-full sm:min-w-0"
                        >
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    role="tab"
                                    aria-selected={activeCategory === cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-bold transition-all duration-300 whitespace-nowrap snap-center
                                        ${activeCategory === cat
                                            ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-orange-500/20'
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--bg-body)]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* STATES */}

                {/* Loading Skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 min-h-[300px]">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl bg-[var(--bg-card)]/50 border border-[var(--border-color)] h-[350px] sm:h-[400px] animate-pulse relative overflow-hidden"
                            >
                                <div className="h-48 sm:h-56 bg-zinc-800/20" />
                                <div className="p-4 sm:p-6 space-y-3">
                                    <div className="h-4 bg-zinc-800/20 rounded w-2/3" />
                                    <div className="h-3 bg-zinc-800/20 rounded w-full" />
                                    <div className="h-8 bg-zinc-800/20 rounded-lg w-1/3 pt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="text-center py-16 sm:py-20 bg-red-500/5 border border-red-500/10 rounded-[32px] max-w-xl mx-auto px-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="text-red-500/50" size={32} />
                        </div>
                        <p className="text-[var(--text-body)] font-bold mb-2">Sync Error</p>
                        <p className="text-red-500/80 text-sm mb-6">{error}</p>
                        <button
                            onClick={fetchProducts}
                            className="inline-flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:scale-105 transition active:scale-95 shadow-lg shadow-red-500/20"
                        >
                            <RefreshCw size={16} />
                            Retry Sync
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-20 sm:py-32 bg-[var(--bg-card)]/30 border border-dashed border-[var(--border-color)] rounded-[32px] max-w-2xl mx-auto px-6">
                        <div className="w-20 h-20 bg-[var(--bg-body)] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-[var(--border-color)]">
                            <Package className="text-[var(--text-muted)] opacity-20" size={40} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black mb-3 text-[var(--text-body)] tracking-tight">Catalog Updating</h3>
                        <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                            New high-performance components are arriving at our distribution centers. Please check back shortly.
                        </p>
                    </div>
                )}

                {/* Products Grid - Improved Responsive Columns */}
                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id || product._id}
                                {...product}
                                id={product.id || product._id}
                                initialWishlisted={wishlist.some(item => (item.id || item._id) === (product.id || product._id))}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Additional CSS for better UX */}
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @media (min-width: 480px) {
                    .xs\\:grid-cols-2 {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
            `}</style>
        </section>
    );
}