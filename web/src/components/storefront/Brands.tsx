'use client';

import Link from "next/link";
import { BRANDS } from "@/data/storefront";

export default function Brands() {
    return (
        <section
            className="relative bg-zinc-950 border-b border-white/5 py-16 sm:py-20 lg:py-24"
            aria-labelledby="brands-heading"
        >
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <header className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <h2
                        id="brands-heading"
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white"
                    >
                        Verified{" "}
                        <span className="text-orange-500">Manufacturer</span> Network
                    </h2>

                    <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed">
                        Sourced directly from global industry leaders to ensure
                        uncompromising quality, reliability, and precision engineering.
                    </p>
                </header>

                {/* Horizontal Scroll Brand List */}
                <div
                    className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-zinc-800"
                    style={{
                        maskImage:
                            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                        WebkitMaskImage:
                            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                    }}
                >
                    {BRANDS.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/search?q=${encodeURIComponent(brand.name)}`}
                            aria-label={`Browse ${brand.name} spare parts`}
                            className="snap-start flex-shrink-0 w-36 sm:w-44 md:w-52 lg:w-56 group rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 flex flex-col items-center justify-center transition-all duration-500 hover:border-orange-500/60 hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {/* Brand Logo */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white border border-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                {brand.logo}
                            </div>

                            {/* Brand Name */}
                            <span className="mt-4 text-xs sm:text-sm font-semibold tracking-widest uppercase text-zinc-400 group-hover:text-orange-500 transition-colors text-center">
                                {brand.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}