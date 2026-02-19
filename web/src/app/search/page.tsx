'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/ui/ProductCard';
import { customerService } from '@/services/customerService';
import { Filter, SlidersHorizontal, X, ArrowLeft, Search as SearchIcon, ChevronDown, ChevronRight, Trash2, Tag, Box, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES, BRANDS } from '@/data/storefront';
import { Button } from '@/components/ui/Button';

interface Product {
    id: string;
    _id?: string;
    name: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    supplier?: {
        storeName: string;
        rating: number;
    };
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating';

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // URL Params
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || 'All';
    const brandParam = searchParams.get('brand') || 'All';
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const sortParam = (searchParams.get('sort') as SortOption) || 'newest';

    // Local State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>(sortParam);

    // Filter State
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [selectedBrand, setSelectedBrand] = useState(brandParam);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        minPriceParam ? parseInt(minPriceParam) : 0,
        maxPriceParam ? parseInt(maxPriceParam) : 50000
    ]);

    // Sidebar Collapsible State
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        brands: true,
        price: true
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const activeCategories = ['All', ...CATEGORIES.map(c => c.name)];
    const activeBrands = ['All', ...BRANDS.map(b => b.name)];

    const getActiveFilters = useCallback(() => {
        const active = [];
        if (selectedCategory !== 'All') active.push({ id: 'category', label: `Category: ${selectedCategory}`, value: selectedCategory });
        if (selectedBrand !== 'All') active.push({ id: 'brand', label: `Brand: ${selectedBrand}`, value: selectedBrand });
        if (priceRange[0] > 0 || priceRange[1] < 50000) {
            active.push({ id: 'price', label: `₹${priceRange[0]} - ₹${priceRange[1]}`, value: priceRange });
        }
        if (query) active.push({ id: 'q', label: `Search: ${query}`, value: query });
        return active;
    }, [selectedCategory, selectedBrand, priceRange, query]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {};
            let searchQuery = query;
            if (selectedBrand !== 'All') {
                searchQuery = searchQuery ? `${searchQuery} ${selectedBrand}` : selectedBrand;
            }
            if (searchQuery) params.search = searchQuery;

            let backendCategory = selectedCategory;
            if (selectedCategory === 'Tyres') backendCategory = 'Tires';
            if (selectedCategory === 'Oil & Fluids') backendCategory = 'Engine Oil';
            if (selectedCategory === 'Engine Parts') backendCategory = 'Spare Parts';

            if (backendCategory && backendCategory !== 'All') params.category = backendCategory;

            let data = await customerService.getProducts(params);

            data = data.filter((p: Product) =>
                p.price >= priceRange[0] && p.price <= priceRange[1]
            );

            const sortedData = [...data].sort((a, b) => {
                if (sortBy === 'price-low') return a.price - b.price;
                if (sortBy === 'price-high') return b.price - a.price;
                if (sortBy === 'rating') return b.rating - a.rating;
                return 0;
            });

            setProducts(sortedData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [query, selectedCategory, selectedBrand, priceRange, sortBy]);

    useEffect(() => {
        const timeoutId = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchProducts]);

    const updateURL = useCallback((updates: any) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === 'All' || value === '') {
                params.delete(key);
            } else {
                params.set(key, value as string);
            }
        });
        router.push(`/search?${params.toString()}`);
    }, [searchParams, router]);

    const removeFilter = (id: string) => {
        if (id === 'category') {
            setSelectedCategory('All');
            updateURL({ category: 'All' });
        } else if (id === 'brand') {
            setSelectedBrand('All');
            updateURL({ brand: 'All' });
        } else if (id === 'price') {
            setPriceRange([0, 50000]);
            updateURL({ minPrice: null, maxPrice: null });
        } else if (id === 'q') {
            updateURL({ q: '' });
        }
    };

    const clearAll = () => {
        setSelectedCategory('All');
        setSelectedBrand('All');
        setPriceRange([0, 50000]);
        setSortBy('newest');
        router.push('/search');
    };

    return (
        <main className="min-h-screen bg-background pb-20">
            <Navbar />

            <div className="pt-32">
                <div className="container px-6">
                    {/* Header Section */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 text-muted text-sm font-medium mb-6">
                            <span onClick={() => router.push('/')} className="cursor-pointer hover:text-primary transition-colors">Home</span>
                            <span>/</span>
                            <span className="text-foreground font-bold">Search</span>
                        </div>

                        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                            <div className="max-w-2xl">
                                <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tighter leading-none italic uppercase">
                                    {query ? `Search: "${query}"` : 'Product Catalog'}
                                </h1>
                                <p className="text-muted text-lg font-medium">
                                    Found <span className="text-foreground font-bold">{products.length}</span> products.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                                <div className="relative group flex-1 lg:flex-none">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => {
                                            const val = e.target.value as SortOption;
                                            setSortBy(val);
                                            updateURL({ sort: val });
                                        }}
                                        className="appearance-none bg-card border border-border px-6 py-3.5 rounded-2xl font-black text-sm text-foreground cursor-pointer outline-none min-w-[220px] w-full focus:ring-2 focus:ring-primary/20 transition-all"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Top Rated</option>
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} />
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(true)}
                                    className="h-[52px] px-8 rounded-2xl gap-2 font-black border-border bg-card group-hover:border-primary/50 transition-all"
                                >
                                    <SlidersHorizontal size={18} />
                                    Filters
                                </Button>
                            </div>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex flex-wrap items-center gap-3 mt-8">
                            {getActiveFilters().map(filter => (
                                <div key={filter.id} className="bg-card border border-border px-5 py-2.5 rounded-2xl flex items-center gap-3 text-xs font-black text-foreground shadow-sm animate-fade-in group">
                                    <span className="opacity-60 uppercase tracking-widest">{filter.id}:</span>
                                    <span>{filter.label.replace(/.*: /, '')}</span>
                                    <button
                                        onClick={() => removeFilter(filter.id)}
                                        className="p-1 hover:bg-muted rounded-lg transition-colors text-muted hover:text-red-500"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            ))}
                            {getActiveFilters().length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="px-4 py-2 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-all flex items-center gap-2 ml-2"
                                >
                                    <Trash2 size={14} /> Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="h-[480px] rounded-[40px] bg-card border border-border p-8 animate-pulse flex flex-col gap-6">
                                        <div className="h-60 bg-muted/50 rounded-3xl" />
                                        <div className="h-6 bg-muted/50 rounded-full w-3/4" />
                                        <div className="h-4 bg-muted/50 rounded-full w-1/2" />
                                        <div className="mt-auto h-12 bg-muted/50 rounded-2xl" />
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {products.map(product => (
                                    <div key={product.id || product._id || Math.random().toString()} className="animate-fade-in">
                                        <ProductCard {...product} id={(product.id || product._id) as string} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-32 px-12 bg-card border border-border rounded-[48px] border-dashed">
                                <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-4xl mb-8">
                                    🔍
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter mb-4 italic uppercase">No Products Found</h2>
                                <p className="text-muted text-lg max-w-sm font-medium mb-12">
                                    We couldn't find any products matching your search criteria.
                                </p>
                                <Button
                                    variant="premium"
                                    size="xl"
                                    onClick={clearAll}
                                    className="px-12 rounded-2xl uppercase tracking-widest text-xs"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Overlay */}
            {showFilters && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex justify-end animate-in fade-in duration-300">
                    <div className="w-[85%] max-w-[420px] bg-card h-full p-10 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Filters</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="rounded-xl">
                                <X size={24} />
                            </Button>
                        </div>

                        <div className="flex-1 space-y-12">
                            {/* Categories */}
                            <div className="space-y-6">
                                <div
                                    onClick={() => toggleSection('categories')}
                                    className="flex justify-between items-center cursor-pointer group"
                                >
                                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-muted group-hover:text-foreground transition-colors">Categories</h4>
                                    <ChevronDown className={`transition-transform duration-300 ${expandedSections.categories ? '' : '-rotate-90'}`} size={16} />
                                </div>
                                {expandedSections.categories && (
                                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                                        {activeCategories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    setSelectedCategory(cat);
                                                    updateURL({ category: cat });
                                                }}
                                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                                    : 'bg-muted/50 text-muted hover:bg-muted hover:text-foreground border border-transparent'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Brands */}
                            <div className="space-y-6">
                                <div
                                    onClick={() => toggleSection('brands')}
                                    className="flex justify-between items-center cursor-pointer group"
                                >
                                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-muted group-hover:text-foreground transition-colors">Brands</h4>
                                    <ChevronDown className={`transition-transform duration-300 ${expandedSections.brands ? '' : '-rotate-90'}`} size={16} />
                                </div>
                                {expandedSections.brands && (
                                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                                        {activeBrands.map(brand => (
                                            <button
                                                key={brand}
                                                onClick={() => {
                                                    setSelectedBrand(brand);
                                                    updateURL({ brand: brand });
                                                }}
                                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedBrand === brand
                                                    ? 'bg-primary/10 text-primary border border-primary/30 shadow-sm'
                                                    : 'bg-muted/50 text-muted hover:bg-muted hover:text-foreground border border-transparent'
                                                    }`}
                                            >
                                                {brand}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Price */}
                            <div className="space-y-6">
                                <div
                                    onClick={() => toggleSection('price')}
                                    className="flex justify-between items-center cursor-pointer group"
                                >
                                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-muted group-hover:text-foreground transition-colors">Price Range</h4>
                                    <ChevronDown className={`transition-transform duration-300 ${expandedSections.price ? '' : '-rotate-90'}`} size={16} />
                                </div>
                                {expandedSections.price && (
                                    <div className="space-y-6 animate-fade-in">
                                        <input
                                            type="range"
                                            min="0"
                                            max="50000"
                                            step="1000"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                            onMouseUp={() => updateURL({ maxPrice: priceRange[1] })}
                                            onTouchEnd={() => updateURL({ maxPrice: priceRange[1] })}
                                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-muted/50 p-4 rounded-2xl border border-border">
                                                <span className="block text-[8px] font-black uppercase tracking-widest text-muted mb-1">Min</span>
                                                <span className="font-black">₹{priceRange[0]}</span>
                                            </div>
                                            <div className="bg-muted/50 p-4 rounded-2xl border border-border">
                                                <span className="block text-[8px] font-black uppercase tracking-widest text-muted mb-1">Max</span>
                                                <span className="font-black">₹{priceRange[1]}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="premium"
                            size="xl"
                            onClick={() => setShowFilters(false)}
                            className="w-full mt-12 rounded-2xl uppercase tracking-[0.2em] text-[10px]"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="h-screen bg-background flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <span className="font-black text-xs uppercase tracking-[0.3em] text-muted animate-pulse">Loading Results</span>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}

