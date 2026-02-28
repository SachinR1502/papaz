'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { customerService } from '@/services/customerService';
import ProductCard from '@/components/ui/ProductCard';
import { Package, RefreshCw, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function FeaturedProducts() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlCategory = searchParams.get('category') || 'All';
    const urlSearch = searchParams.get('search');

    const [activeCategory, setActiveCategory] = useState(urlCategory);
    const [products, setProducts] = useState<any[]>([]);
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categories = [
        'All',
        'Engine Parts',
        'Electrical',
        'Body Parts',
        'Brakes',
        'Suspension',
        'Filters',
        'Batteries',
    ];

    const fetchWishlist = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            if (!token) return;

            const data = await customerService.getWishlist();
            setWishlistIds((data || []).map((p: any) => (p._id || p.id).toString()));
        } catch (err: any) { }
    };

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params: any = {};
            if (activeCategory !== 'All') params.category = activeCategory;
            if (urlSearch) params.search = urlSearch;

            const productsData = await customerService.getProducts(params);
            setProducts((productsData || []).slice(0, 8)); // Show top 8 for featured

            fetchWishlist();
        } catch (err) {
            setError('System synchronization failed. Please refresh catalog.');
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
            className="relative bg-white py-16 sm:py-24 overflow-hidden border-b border-gray-100"
        >
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 sm:mb-20">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-[1px] w-8 bg-orange-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600">Premium Inventory</span>
                        </div>
                        <h2
                            id="featured-products-heading"
                            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none"
                        >
                            Featured <span className="text-orange-600">Hardware</span>
                        </h2>
                        <p className="mt-6 text-sm sm:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                            Elite-grade components meticulously vetted for durability, performance, and industrial precision.
                        </p>
                    </div>

                    <Link
                        href="/search"
                        className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200"
                    >
                        Explore Catalog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </header>

                {/* Category Navigation */}
                <div className="mb-12 overflow-x-auto no-scrollbar pb-2">
                    <div className="flex gap-2 min-w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border shrink-0",
                                    activeCategory === cat
                                        ? "bg-white border-orange-500 text-orange-600 shadow-lg shadow-orange-500/5 translate-y-[-2px]"
                                        : "bg-gray-50/50 border-transparent text-gray-400 hover:text-slate-900 hover:bg-gray-100"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-10">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-square bg-gray-100 rounded-[32px] mb-6" />
                                    <div className="h-4 bg-gray-50 rounded-full w-3/4 mb-3" />
                                    <div className="h-4 bg-gray-50 rounded-full w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-red-100 rounded-[40px] bg-red-50/30">
                            <div className="w-16 h-16 bg-white border border-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-sm">
                                <RefreshCw size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 uppercase italic tracking-tighter mb-2">Sync Error</h3>
                            <p className="text-sm text-slate-500 max-w-xs mb-8">{error}</p>
                            <Button variant="premium" onClick={fetchProducts} className="rounded-2xl px-8 italic">Retry Catalog Sync</Button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-gray-100 rounded-[40px] bg-gray-50/50">
                            <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-6 shadow-sm">
                                <Package size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2 uppercase italic tracking-tighter">No Items indexed</h2>
                            <p className="text-sm text-slate-500 max-w-xs mb-8">
                                New component batches are currently being processed. Please refresh in a moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-10">
                            {products.map((product, idx) => {
                                const id = (product.id || product._id) as string;
                                return (
                                    <div
                                        key={id}
                                        className="animate-fade-in"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <ProductCard
                                            {...product}
                                            id={id}
                                            initialWishlisted={wishlistIds.includes(id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Bottom CTA */}
                {!loading && products.length > 0 && (
                    <div className="mt-16 sm:mt-24 text-center">
                        <Link
                            href="/search"
                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-orange-600 transition-all group"
                        >
                            Review All 500+ Components <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}