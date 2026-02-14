'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/ui/ProductCard';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    supplier: {
        storeName: string;
        rating: number;
    };
}

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // URL Params
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || 'All';
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');

    // Local State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filter State
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        minPriceParam ? parseInt(minPriceParam) : 0,
        maxPriceParam ? parseInt(maxPriceParam) : 50000
    ]);

    const categories = ['All', 'Engine', 'Brakes', 'Suspension', 'Electrical', 'Body', 'Interior', 'Accessories'];

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Build dynamic query string
                const params = new URLSearchParams();
                if (query) params.append('search', query);
                if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
                // params.append('minPrice', priceRange[0].toString()); // API might not support range yet, filter client side if needed
                // params.append('maxPrice', priceRange[1].toString());

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/products?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch products');

                const data = await res.json();

                // Client-side filtering for price (if API doesn't support it yet)
                const filtered = data.filter((p: Product) =>
                    p.price >= priceRange[0] && p.price <= priceRange[1]
                );

                setProducts(filtered);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        // Debounce fetching slightly to avoid too many requests on slider change
        const timeoutId = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timeoutId);

    }, [query, selectedCategory, priceRange]);

    // Update URL on filter change (optional, better UX to reflect state in URL)
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (selectedCategory !== 'All') params.set('category', selectedCategory);
        params.set('minPrice', priceRange[0].toString());
        params.set('maxPrice', priceRange[1].toString());

        router.push(`/search?${params.toString()}`);
        setShowFilters(false); // Close mobile filters
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '40px 24px', maxWidth: '1400px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
                            {query ? `Results for "${query}"` : 'All Products'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {loading ? 'Searching...' : `${products.length} items found`}
                        </p>
                    </div>

                    <button
                        className="btn btn-secondary md:hidden"
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                    >
                        <SlidersHorizontal size={18} /> Filters
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 4fr', gap: '40px' }} className="search-layout">

                    {/* Sidebar Filters (Desktop) */}
                    <div className={`filters-sidebar ${showFilters ? 'show' : ''}`} style={{
                        // Basic desktop styles, mobile toggle class handles visibility
                        background: 'var(--bg-card)',
                        padding: '24px',
                        borderRadius: '24px',
                        border: '1px solid var(--border-color)',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '120px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Filter size={20} /> Filters
                            </h3>
                            {showFilters && <button onClick={() => setShowFilters(false)} className="md:hidden" style={{ background: 'none', border: 'none' }}><X /></button>}
                        </div>

                        {/* Category Filter */}
                        <div style={{ marginBottom: '32px' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {categories.map(cat => (
                                    <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '1rem' }}>
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat}
                                            onChange={() => setSelectedCategory(cat)}
                                            style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }}
                                        />
                                        <span style={{ color: selectedCategory === cat ? 'var(--color-primary)' : 'var(--text-body)', fontWeight: selectedCategory === cat ? 600 : 400 }}>
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div style={{ marginBottom: '32px' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Range</h4>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ flex: 1, background: 'var(--bg-body)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Min</span>
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                        style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 600, fontSize: '1rem', outline: 'none' }}
                                    />
                                </div>
                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                                <div style={{ flex: 1, background: 'var(--bg-body)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Max</span>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                                        style={{ width: '100%', border: 'none', background: 'transparent', fontWeight: 600, fontSize: '1rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="50000"
                                step="100"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                            />
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={applyFilters}
                        >
                            Apply Filters
                        </button>
                    </div>

                    {/* Results Grid */}
                    <div style={{ flex: 1 }}>
                        {loading ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="glass-panel" style={{ height: '380px', animation: 'pulse 1.5s infinite' }}></div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                                {products.map((product) => (
                                    <ProductCard key={product.id} {...product} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>No products found</h3>
                                <p>Try adjusting your search or filters to find what you're looking for.</p>
                                <button
                                    onClick={() => {
                                        setPriceRange([0, 50000]);
                                        setSelectedCategory('All');
                                        router.push('/search');
                                    }}
                                    className="btn btn-secondary"
                                    style={{ marginTop: '24px' }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <style jsx global>{`
                @media (max-width: 768px) {
                    .search-layout {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchContent />
        </Suspense>
    );
}
