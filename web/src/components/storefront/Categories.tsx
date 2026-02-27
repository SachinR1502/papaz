'use client';

import Link from "next/link";
import { CATEGORIES } from "@/data/storefront";
import { ArrowUpRight } from "lucide-react";

const categoryMap: Record<string, string> = {
    Tyres: "Tires",
    "Oil & Fluids": "Engine Oil",
    "Engine Parts": "Spare Parts",
};

export default function Categories() {
    return (
        <section
            className="relative bg-[var(--bg-body)] py-16 sm:py-20 lg:py-24 overflow-hidden"
            aria-labelledby="categories-heading"
        >
            {/* Background Glow */}
            <div className="absolute top-1/2 right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,140,0,0.05)_0%,transparent_70%)] blur-[80px]" />

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <header className="max-w-3xl mb-12 sm:mb-16">
                    <h2
                        id="categories-heading"
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-[var(--text-body)]"
                    >
                        Strategic{" "}
                        <span className="text-[var(--color-primary)]">
                            Component
                        </span>{" "}
                        Groups
                    </h2>

                    <p className="mt-4 text-sm sm:text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
                        Explore our curated selection of high-performance replacement
                        parts and integrated vehicle systems designed for reliability,
                        durability, and precision engineering.
                    </p>
                </header>

                {/* Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">

                    {CATEGORIES.map((cat) => {
                        const backendName = categoryMap[cat.name] || cat.name;

                        return (
                            <Link
                                key={cat.id}
                                href={`/search?category=${encodeURIComponent(backendName)}`}
                                aria-label={`Browse ${cat.name} category`}
                                className="group relative flex flex-col items-center justify-center text-center p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] transition-all duration-300 hover:-translate-y-2 hover:border-[var(--color-primary)]/40 hover:bg-[rgba(var(--color-primary-rgb),0.02)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            >
                                {/* Icon */}
                                <div className="text-4xl sm:text-5xl md:text-6xl transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                                    {cat.icon}
                                </div>

                                {/* Title */}
                                <span className="mt-4 font-bold text-sm sm:text-base lg:text-lg tracking-tight text-[var(--text-body)]">
                                    {cat.name}
                                </span>

                                {/* Sub Label */}
                                <span className="mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1 opacity-70 group-hover:opacity-100 group-hover:text-[var(--color-primary)] transition-all">
                                    Catalog
                                    <ArrowUpRight className="w-3 h-3" />
                                </span>

                                {/* Hover Glow */}
                                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[var(--color-primary)]/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </Link>
                        );
                    })}

                </div>
            </div>
        </section>
    );
}