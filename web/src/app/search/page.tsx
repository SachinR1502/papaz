'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/ui/ProductCard';
import { customerService } from '@/services/customerService';
import { X, ChevronDown, ChevronRight, Tag, Box, IndianRupee, ListFilter, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES, BRANDS } from '@/data/storefront';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// --- Types ---
interface Product {
    id: string;
    _id?: string;
    name: string;
    price: number;
    mrp?: number;
    image: string;
    category: string;
    rating: number;
    supplier?: {
        storeName: string;
        rating: number;
    };
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
];

// --- Sub-components ---

function SortDropdown({ sortBy, setSortBy, updateURL }: { sortBy: SortOption, setSortBy: (v: SortOption) => void, updateURL: (v: any) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={sortRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-md text-sm text-gray-700 hover:bg-gray-50 transition"
            >
                <span>
                    Sort by{" "}
                    <span className="font-medium text-gray-900">
                        {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                    </span>
                </span>

                <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-md z-50">
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                setSortBy(opt.value);
                                updateURL({ sort: opt.value });
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition ${sortBy === opt.value
                                ? "bg-gray-100 text-gray-900 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function FilterSidebar({
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    selectedVehicleType,
    setSelectedVehicleType,
    priceRange,
    setPriceRange,
    activeFilters = [],
    removeFilter,
    clearAll,
    updateURL,
}: any) {
    const activeCategories = ["All", ...CATEGORIES.map(c => c.name)];
    const activeBrands = ["All", ...BRANDS.map(b => b.name)];
    const vehicleTypes = ["All", "Car", "Two Wheeler", "Three Wheeler", "Commercial Vehicle"];

    return (
        <div className="space-y-8 text-sm">

            {/* Active Filters */}
            {activeFilters?.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-800">
                            Active Filters
                        </span>
                        <button
                            onClick={clearAll}
                            className="text-xs text-red-500 hover:underline"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {activeFilters.map((f: any) => (
                            <div
                                key={f.id}
                                className="flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded-full text-xs"
                            >
                                {f.label.includes(":")
                                    ? f.label.split(": ")[1]
                                    : f.label}
                                <X
                                    size={12}
                                    className="cursor-pointer text-gray-400 hover:text-red-500"
                                    onClick={() => removeFilter?.(f.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Filter */}
            <div className="border-b border-gray-200 pb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                    Price
                </h4>

                <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    onMouseUp={() =>
                        updateURL({ maxPrice: priceRange[1] })
                    }
                    className="w-full accent-orange-600"
                />

                <div className="mt-2 text-gray-600">
                    Up to ₹{priceRange[1].toLocaleString()}
                </div>
            </div>

            {/* Categories */}
            <div className="border-b border-gray-200 pb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                    Categories
                </h4>

                <div className="space-y-1">
                    {activeCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setSelectedCategory(cat);
                                updateURL({ category: cat });
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded transition ${selectedCategory === cat
                                ? "text-orange-600 font-medium"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Brands */}
            <div className="border-b border-gray-200 pb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                    Brands
                </h4>

                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {activeBrands.slice(0, 15).map(brand => (
                        <button
                            key={brand}
                            onClick={() => {
                                setSelectedBrand(brand);
                                updateURL({ brand: brand });
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded transition ${selectedBrand === brand
                                ? "text-orange-600 font-medium"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            {brand}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vehicle Type */}
            <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                    Vehicle Type
                </h4>

                <div className="space-y-1">
                    {vehicleTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => {
                                setSelectedVehicleType(type);
                                updateURL({ vehicleType: type });
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded transition ${selectedVehicleType === type
                                ? "text-orange-600 font-medium"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


function EmptyResults({ onReset }: { onReset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-gray-200 rounded-[32px] bg-gray-50">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm">
                🔍
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tighter">No Parts Found</h2>
            <p className="text-sm text-gray-500 max-w-xs mb-8">
                We couldn't track down any items matching your criteria. Try adjusting your scope.
            </p>
            <Button
                variant="premium"
                size="xl"
                onClick={onReset}
                className="px-8 py-6 rounded-2xl uppercase font-black italic tracking-widest text-[10px] shadow-xl shadow-primary/10"
            >
                Clear All Filters
            </Button>
        </div>
    );
}

// --- Main Content Logic ---

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || 'All';
    const brandParam = searchParams.get('brand') || 'All';
    const vehicleTypeParam = searchParams.get('vehicleType') || 'All';
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const sortParam = (searchParams.get('sort') as SortOption) || 'newest';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>(sortParam);
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);

    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [selectedBrand, setSelectedBrand] = useState(brandParam);
    const [selectedVehicleType, setSelectedVehicleType] = useState(vehicleTypeParam);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        minPriceParam ? parseInt(minPriceParam) : 0,
        maxPriceParam ? parseInt(maxPriceParam) : 50000,
    ]);

    const activeFiltersList = useCallback(() => {
        const active = [];
        if (selectedCategory !== 'All') active.push({ id: 'category', label: `Category: ${selectedCategory}` });
        if (selectedBrand !== 'All') active.push({ id: 'brand', label: `Brand: ${selectedBrand}` });
        if (selectedVehicleType !== 'All') active.push({ id: 'vehicleType', label: `Vehicle: ${selectedVehicleType}` });
        if (priceRange[1] < 50000) active.push({ id: 'price', label: `Price: ≤₹${priceRange[1]}` });
        if (query) active.push({ id: 'q', label: `Search: ${query}` });
        return active;
    }, [selectedCategory, selectedBrand, selectedVehicleType, priceRange, query]);

    const updateURL = useCallback(
        (updates: any) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (!value || value === 'All') params.delete(key);
                else params.set(key, value as string);
            });
            router.push(`/search?${params.toString()}`);
        },
        [searchParams, router]
    );

    const removeFilter = (id: string) => {
        if (id === 'category') { setSelectedCategory('All'); updateURL({ category: null }); }
        else if (id === 'brand') { setSelectedBrand('All'); updateURL({ brand: null }); }
        else if (id === 'vehicleType') { setSelectedVehicleType('All'); updateURL({ vehicleType: null }); }
        else if (id === 'price') { setPriceRange([0, 50000]); updateURL({ maxPrice: null }); }
        else if (id === 'q') { updateURL({ q: '' }); }
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {};
            let searchQuery = query;
            if (selectedBrand !== 'All')
                searchQuery = `${searchQuery} ${selectedBrand}`.trim();

            if (selectedVehicleType !== 'All')
                params.vehicleType = selectedVehicleType;

            if (searchQuery) params.search = searchQuery;

            if (selectedCategory !== 'All')
                params.category = selectedCategory;

            let data = await customerService.getProducts(params);

            data = data.filter(
                (p: Product) =>
                    p.price >= priceRange[0] && p.price <= priceRange[1]
            );

            data.sort((a: Product, b: Product) => {
                if (sortBy === 'price-low') return a.price - b.price;
                if (sortBy === 'price-high') return b.price - a.price;
                if (sortBy === 'rating') return b.rating - a.rating;
                return 0;
            });

            setProducts(data);
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            if (token) {
                const wishlist = await customerService.getWishlist();
                setWishlistIds(wishlist.map((p: any) => (p._id || p.id).toString()));
            }
        } catch (err) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [query, selectedCategory, selectedBrand, selectedVehicleType, priceRange, sortBy]);

    useEffect(() => {
        const timeout = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timeout);
    }, [fetchProducts]);

    const clearAll = () => {
        setSelectedCategory('All');
        setSelectedBrand('All');
        setSelectedVehicleType('All');
        setPriceRange([0, 50000]);
        setSortBy('newest');
        router.push('/search');
    };

    return (
        <main className="min-h-screen bg-white pb-16">
            <Navbar />

            <div className="pt-28 md:pt-36">
                <div className="container mx-auto px-4 md:px-6">

                    {/* Breadcrumbs */}
                    <nav className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-10">
                        <span onClick={() => router.push('/')} className="cursor-pointer hover:text-primary transition-colors text-slate-900/40">Home</span>
                        <ChevronRight size={10} className="text-slate-900/20" />
                        <span className="text-slate-900">Inventory Catalog</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-72 shrink-0 h-fit sticky top-36">
                            <FilterSidebar
                                selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                                selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand}
                                selectedVehicleType={selectedVehicleType} setSelectedVehicleType={setSelectedVehicleType}
                                priceRange={priceRange} setPriceRange={setPriceRange}
                                activeFilters={activeFiltersList()} removeFilter={removeFilter}
                                clearAll={clearAll} updateURL={updateURL}
                            />
                        </aside>

                        {/* Results Column */}
                        <div className="flex-1 min-w-0">
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12">
                                <div>
                                    <h1 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none mb-4">
                                        {query ? `"${query}"` : 'The Catalog'}
                                    </h1>
                                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        Inventory Count: <span className="text-slate-900">{products.length}</span> Parts
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <SortDropdown sortBy={sortBy} setSortBy={setSortBy} updateURL={updateURL} />
                                    <Button
                                        variant="premium"
                                        onClick={() => setShowFilters(true)}
                                        className="lg:hidden h-[54px] md:h-[60px] px-6 md:px-8 rounded-2xl gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/10"
                                    >
                                        <ListFilter size={18} /> Filters
                                    </Button>
                                </div>
                            </div>

                            {/* Products Grid */}
                            {loading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="bg-gray-50 rounded-[32px] border border-gray-100 p-6 md:p-8 animate-pulse">
                                            <div className="aspect-square bg-gray-200/50 rounded-2xl mb-6 md:mb-8" />
                                            <div className="h-4 bg-gray-200/50 rounded-full w-3/4 mb-4" />
                                            <div className="h-4 bg-gray-200/50 rounded-full w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : products.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
                                    {products.map((product, idx) => {
                                        const id = (product.id || product._id) as string;
                                        return (
                                            <div key={id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 40}ms` }}>
                                                <ProductCard
                                                    {...product}
                                                    id={id}
                                                    initialWishlisted={wishlistIds.includes(id)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <EmptyResults onReset={clearAll} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {showFilters && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex justify-end animate-in fade-in duration-300">
                    <div className="w-full max-w-[400px] bg-white h-full p-8 md:p-10 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Filters</h2>
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary mt-1">Refine Catalog Results</p>
                            </div>
                            <button onClick={() => setShowFilters(false)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1">
                            <FilterSidebar
                                selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                                selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand}
                                selectedVehicleType={selectedVehicleType} setSelectedVehicleType={setSelectedVehicleType}
                                priceRange={priceRange} setPriceRange={setPriceRange}
                                activeFilters={activeFiltersList()} removeFilter={removeFilter}
                                clearAll={clearAll} updateURL={updateURL}
                            />
                        </div>
                        <Button
                            variant="premium"
                            size="xl"
                            onClick={() => setShowFilters(false)}
                            className="mt-12 w-full py-6 rounded-2xl uppercase font-black italic tracking-widest text-[10px] shadow-2xl shadow-primary/10"
                        >
                            Apply Selection
                        </Button>
                    </div>
                </div>
            )}
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center gap-10">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-gray-50 border-t-primary animate-spin" />
                        <ShoppingBag className="absolute inset-0 m-auto text-primary animate-pulse" size={28} />
                    </div>
                    <div className="text-center">
                        <span className="block font-black text-xl tracking-tighter text-slate-900 italic uppercase">Accessing Catalog</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 mt-2 block animate-pulse">Syncing Inventory</span>
                    </div>
                </div>
            }
        >
            <SearchContent />
        </Suspense>
    );
}