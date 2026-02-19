'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { customerService } from '@/services/customerService';
import ProductCard from '@/components/ui/ProductCard';
import { Package, RefreshCw } from 'lucide-react';

export default function FeaturedProducts() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category') || 'All';

    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categories = ['All', 'Batteries', 'Tires', 'Engine Oil', 'Brakes', 'Spare Parts', 'Accessories'];

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setActiveCategory(cat);
        fetchProducts();
    }, [searchParams, activeCategory]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const params: any = {};
            if (activeCategory !== 'All') {
                params.category = activeCategory;
            }

            const urlSearch = searchParams.get('search');
            if (urlSearch) {
                params.search = urlSearch;
            }

            const data = await customerService.getProducts(params);
            setProducts(data);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="products" className="py-24 px-6 bg-[var(--bg-body)] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,140,0,0.03)_0%,transparent_70%)] blur-[100px] z-0" />

            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 px-5 py-2 rounded-full mb-6">
                        <span className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[2px]">
                            Pick of the Week
                        </span>
                    </div>

                    <h2 className="text-[clamp(2.4rem,6vw,3.8rem)] font-black mb-6 tracking-tighter leading-tight text-[var(--text-body)]">
                        Premium <span className="text-[var(--color-primary)] italic">Hardware</span> & Parts
                    </h2>
                    <p className="text-[var(--text-muted)] text-[clamp(1rem,2.5vw,1.2rem)] max-w-2xl font-medium leading-relaxed">
                        Precision-engineered components sourced from elite global manufacturers for professional performance.
                    </p>

                    {/* Filter Tabs */}
                    <div className="w-full max-w-4xl mx-auto mt-12 overflow-x-auto hide-scrollbar">
                        <div className="inline-flex bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-color)] backdrop-blur-xl shadow-lg relative overflow-hidden">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`
                                        px-8 py-3 rounded-xl text-sm font-black tracking-tight transition-all duration-300 whitespace-nowrap
                                        ${activeCategory === cat
                                            ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-orange-500/30 translate-y-[-1px]'
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--bg-body)]'
                                        }
                                    `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* State Handling */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[400px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-[450px] rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden">
                                <div className="h-60 bg-white/5 animate-pulse" />
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-white/5 rounded-full animate-pulse w-3/4" />
                                    <div className="h-4 bg-white/5 rounded-full animate-pulse w-1/2" />
                                    <div className="pt-4 flex justify-between items-center">
                                        <div className="h-8 bg-white/5 rounded-full animate-pulse w-1/4" />
                                        <div className="h-10 bg-white/5 rounded-xl animate-pulse w-1/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 px-8 glass-panel border border-red-500/20 bg-red-500/5 rounded-[40px] max-w-2xl mx-auto">
                        <p className="text-red-500 text-lg font-black mb-6 uppercase tracking-widest">{error}</p>
                        <button
                            onClick={fetchProducts}
                            className="bg-red-500 text-white px-10 py-4 rounded-2xl text-sm font-black shadow-lg shadow-red-500/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                            <RefreshCw size={18} />
                            Try Again
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-24 px-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[48px] max-w-3xl mx-auto flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-[var(--bg-body)] rounded-3xl flex items-center justify-center mb-2">
                            <Package size={48} className="text-[var(--text-muted)] opacity-30" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-[var(--text-body)] tracking-tighter mb-2">Inventory Updating</h3>
                            <p className="text-[var(--text-muted)] font-medium max-w-md mx-auto">Our suppliers are restocking. Check back in a few minutes or explore our other collections.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id || product._id}
                                {...product}
                                id={product.id || product._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
