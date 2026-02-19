'use client';

import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/data/storefront';
import { ArrowUpRight } from 'lucide-react';

export default function Categories() {
    const router = useRouter();

    const handleCategoryClick = (categoryName: string) => {
        let backendName = categoryName;
        if (categoryName === 'Tyres') backendName = 'Tires';
        if (categoryName === 'Oil & Fluids') backendName = 'Engine Oil';
        if (categoryName === 'Engine Parts') backendName = 'Spare Parts';

        router.push(`/search?category=${backendName}`);
    };

    return (
        <section className="py-24 px-6 bg-[var(--bg-body)] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,140,0,0.05)_0%,transparent_70%)] blur-[80px] z-0" />

            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-3xl">
                        <h2 className="text-[clamp(2.5rem,6vw,3.8rem)] font-black mb-4 tracking-tighter leading-none text-[var(--text-body)]">
                            Strategic <span className="text-[var(--color-primary)]">Component</span> Groups
                        </h2>
                        <p className="text-[var(--text-muted)] text-[clamp(1rem,2vw,1.25rem)] font-medium leading-[1.6]">
                            Explore our curated selection of high-performance replacement parts and integrated vehicle systems.
                        </p>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {CATEGORIES.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.name)}
                            className="group relative flex flex-col items-center gap-6 p-10 text-center rounded-[32px] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--color-primary)]/40 hover:-translate-y-2 hover:bg-[rgba(var(--color-primary-rgb),0.02)] transition-all duration-300 cursor-pointer overflow-hidden shadow-sm"
                        >
                            {/* Icon */}
                            <div className="text-6xl sm:text-7xl group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-500">
                                {cat.icon}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-1 z-10">
                                <span className="font-black text-lg text-[var(--text-body)] tracking-tight">
                                    {cat.name}
                                </span>
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 group-hover:text-[var(--color-primary)] transition-all">
                                    Catalog <ArrowUpRight className="w-3 h-3" />
                                </span>
                            </div>

                            {/* Hover Glow */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--color-primary)]/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
