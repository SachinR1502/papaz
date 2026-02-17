'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/ui/ProductCard';
import { customerService } from '@/services/customerService';
import { Filter, SlidersHorizontal, X, ArrowLeft, Search as SearchIcon, ChevronDown, ChevronRight, Trash2, Tag, Box } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES, BRANDS } from '@/data/storefront';

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
            // If brand selected, we include it in search
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

            // Client-side price filtering
            data = data.filter((p: Product) =>
                p.price >= priceRange[0] && p.price <= priceRange[1]
            );

            // Sorting
            const sortedData = [...data].sort((a, b) => {
                if (sortBy === 'price-low') return a.price - b.price;
                if (sortBy === 'price-high') return b.price - a.price;
                if (sortBy === 'rating') return b.rating - a.rating;
                return 0; // Default to natural/newest
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
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)', paddingBottom: '100px' }}>
            <Navbar />

            <div style={{ paddingTop: '100px' }}>
                <div className="container" style={{ padding: '24px', maxWidth: '1440px' }}>

                    {/* Header Section */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            <span onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>Home</span>
                            <span>/</span>
                            <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>Search</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1.5px' }}>
                                    {query ? `Search Results for "${query}"` : 'Premium Automotive Catalog'}
                                </h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                    Found <span style={{ color: 'var(--text-body)', fontWeight: 700 }}>{products.length}</span> high-performance parts
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                {/* Sort Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => {
                                            const val = e.target.value as SortOption;
                                            setSortBy(val);
                                            updateURL({ sort: val });
                                        }}
                                        style={{
                                            appearance: 'none',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)',
                                            padding: '12px 40px 12px 20px',
                                            borderRadius: '16px',
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            color: 'var(--text-body)',
                                            cursor: 'pointer',
                                            outline: 'none',
                                            minWidth: '200px'
                                        }}
                                    >
                                        <option value="newest">Newest Arrivals</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Highest Rated</option>
                                    </select>
                                    <ChevronDown size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                                </div>

                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="btn"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        padding: '12px 24px',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <SlidersHorizontal size={18} /> Filters
                                </button>
                            </div>
                        </div>

                        {/* Active Filter Chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '24px' }}>
                            {getActiveFilters().map(filter => (
                                <div key={filter.id} style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    padding: '8px 16px',
                                    borderRadius: '100px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    color: 'var(--text-body)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                }}>
                                    {filter.label}
                                    <X size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => removeFilter(filter.id)} />
                                </div>
                            ))}
                            {getActiveFilters().length > 0 && (
                                <button
                                    onClick={clearAll}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-primary)',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        padding: '8px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Trash2 size={16} /> Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'block' }} className="search-layout">

                        {/* Main Grid Content */}
                        <div style={{ flex: 1 }}>
                            {loading ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} style={{ height: '450px', borderRadius: '32px', background: 'var(--bg-card)', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
                                    ))}
                                </div>
                            ) : products.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                                    {products.map(product => (
                                        <div key={product.id || product._id || Math.random().toString()} className="animate-fade-in" style={{ height: '100%' }}>
                                            <ProductCard {...product} id={(product.id || product._id) as string} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '120px 48px',
                                    background: 'var(--bg-card)',
                                    borderRadius: '48px',
                                    border: '2px dashed var(--border-color)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ width: '120px', height: '120px', background: 'rgba(255, 140, 0, 0.05)', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', marginBottom: '32px' }}>🏙️</div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px' }}>No matches found</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '400px', lineHeight: 1.6 }}>
                                        We couldn't find any results for your current filters. Try resetting or browsing our featured products.
                                    </p>
                                    <button onClick={clearAll} className="btn btn-primary" style={{ marginTop: '40px', padding: '16px 40px', borderRadius: '18px', fontSize: '1.1rem' }}>
                                        Browse All Collection
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filters Overlay */}
            {showFilters && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '85%', maxWidth: '400px', background: 'var(--bg-card)', height: '100%', padding: '40px', overflowY: 'auto' }} className="animate-slide-in-right">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Filters</h2>
                            <X size={24} style={{ cursor: 'pointer' }} onClick={() => setShowFilters(false)} />
                        </div>

                        {/* Categories Mobile Collapsible */}
                        <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
                            <div
                                onClick={() => toggleSection('categories')}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: expandedSections.categories ? '20px' : '0' }}
                            >
                                <h4 style={{ fontWeight: 800 }}>Categories</h4>
                                {expandedSections.categories ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                            {expandedSections.categories && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="animate-fade-in">
                                    {activeCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                updateURL({ category: cat });
                                            }}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                background: selectedCategory === cat ? 'var(--color-primary)' : 'var(--bg-body)',
                                                color: selectedCategory === cat ? 'white' : 'var(--text-body)',
                                                border: 'none',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Brands Mobile Collapsible */}
                        <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
                            <div
                                onClick={() => toggleSection('brands')}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: expandedSections.brands ? '20px' : '0' }}
                            >
                                <h4 style={{ fontWeight: 800 }}>Brands</h4>
                                {expandedSections.brands ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                            {expandedSections.brands && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="animate-fade-in">
                                    {activeBrands.map(brand => (
                                        <button
                                            key={brand}
                                            onClick={() => {
                                                setSelectedBrand(brand);
                                                updateURL({ brand: brand });
                                            }}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                background: selectedBrand === brand ? 'rgba(255, 140, 0, 0.1)' : 'var(--bg-body)',
                                                color: selectedBrand === brand ? 'var(--color-primary)' : 'var(--text-body)',
                                                border: selectedBrand === brand ? '1px solid var(--color-primary)' : 'none',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                textAlign: 'center'
                                            }}
                                        >
                                            {brand}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price Range Mobile Collapsible */}
                        <div style={{ marginBottom: '32px' }}>
                            <div
                                onClick={() => toggleSection('price')}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: expandedSections.price ? '20px' : '0' }}
                            >
                                <h4 style={{ fontWeight: 800 }}>Price Range</h4>
                                {expandedSections.price ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                            {expandedSections.price && (
                                <div className="animate-fade-in">
                                    <input
                                        type="range"
                                        min="0"
                                        max="50000"
                                        step="1000"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                        onTouchEnd={() => updateURL({ maxPrice: priceRange[1] })}
                                        style={{ width: '100%', accentColor: 'var(--color-primary)', marginBottom: '20px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1, background: 'var(--bg-body)', padding: '12px', borderRadius: '12px' }}>
                                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Min Price</label>
                                            <div style={{ fontWeight: 800 }}>₹{priceRange[0]}</div>
                                        </div>
                                        <div style={{ flex: 1, background: 'var(--bg-body)', padding: '12px', borderRadius: '12px' }}>
                                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max Price</label>
                                            <div style={{ fontWeight: 800 }}>₹{priceRange[1]}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowFilters(false)}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '40px', padding: '16px', borderRadius: '16px' }}
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes pulse {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                    100% { opacity: 0.3; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                input[type='range']::-webkit-slider-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: white;
                    border: 4px solid var(--color-primary);
                    cursor: pointer;
                    -webkit-appearance: none;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 10px;
                }
            `}</style>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-body)',
                color: 'var(--color-primary)',
                fontSize: '1.5rem',
                fontWeight: 800
            }}>
                <div className="animate-pulse">Loading Collection...</div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
