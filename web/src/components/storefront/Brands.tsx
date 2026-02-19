'use client';

import { useRouter } from 'next/navigation';
import { BRANDS } from '@/data/storefront';

export default function Brands() {
    const router = useRouter();

    const handleBrandClick = (brandName: string) => {
        router.push(`/search?q=${brandName}`);
    };

    return (
        <section className="py-24 px-6 bg-zinc-950 border-b border-white/5">
            <div className="container mx-auto max-w-7xl">
                {/* Section Header */}
                <div className="flex flex-col items-center text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 tracking-tighter leading-none text-white">
                        Verified <span className="text-orange-500">Manufacturer</span> Network
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-2xl font-medium leading-relaxed">
                        Sourced directly from global industry leaders to ensure uncompromising quality and precision engineering.
                    </p>
                </div>

                {/* Brands Scroll Container */}
                <div
                    className="flex gap-6 overflow-x-auto py-10 hide-scrollbar scroll-smooth relative"
                    style={{
                        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                    }}
                >
                    {BRANDS.map((brand) => (
                        <div
                            key={brand.id}
                            onClick={() => handleBrandClick(brand.name)}
                            className="group flex-shrink-0 w-44 sm:w-56 p-10 flex flex-col items-center justify-center cursor-pointer rounded-[40px] bg-zinc-900/40 border border-white/5 hover:border-orange-500/50 hover:-translate-y-3 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500"
                        >
                            {/* Brand Logo Placeholder */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 text-3xl sm:text-4xl font-black text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/5">
                                {brand.logo}
                            </div>
                            <span className="text-sm font-bold text-zinc-400 tracking-widest uppercase group-hover:text-orange-500 transition-colors">
                                {brand.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
