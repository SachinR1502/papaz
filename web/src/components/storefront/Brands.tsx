'use client';

import Link from "next/link";
import { VEHICLE_TYPES } from "@/data/storefront";
import { ChevronRight } from "lucide-react";

export default function VehicleTypes() {
    return (
        <section
            className="bg-gray-50/50 border-b border-gray-100 py-16 sm:py-24 relative overflow-hidden"
            aria-labelledby="vehicles-heading"
        >
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">

                {/* Section Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-20">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-[1px] w-8 bg-orange-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600">Classification</span>
                        </div>
                        <h2
                            id="vehicles-heading"
                            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none"
                        >
                            Select your <span className="text-orange-600">Category</span>
                        </h2>
                        <p className="mt-6 text-sm sm:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                            Precision-engineered parts indexed by vehicle class for seamless compatibility and peak performance.
                        </p>
                    </div>

                    <Link
                        href="/search"
                        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        View Full Catalog <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </header>

                {/* Grid / Horizontal Scroll */}
                <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-8 scroll-smooth no-scrollbar snap-x">
                    {VEHICLE_TYPES.map((type) => (
                        <Link
                            key={type.id}
                            href={`/search?vehicleType=${encodeURIComponent(type.name)}`}
                            className="snap-start flex-shrink-0 w-44 sm:w-64 aspect-[4/5] group bg-white border border-gray-100 rounded-[40px] p-8 flex flex-col items-center justify-between text-center transition-all duration-500 hover:border-orange-500/30 hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.12)] hover:-translate-y-2"
                        >
                            {/* Icon Container */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-100 rounded-3xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                                <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-center text-4xl sm:text-6xl transition-all duration-500 group-hover:bg-white group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                                    {type.icon}
                                </div>
                            </div>

                            {/* Name & Action */}
                            <div className="w-full">
                                <span className="block text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-slate-400 group-hover:text-slate-900 transition-colors mb-2 italic">
                                    {type.name}
                                </span>
                                <div className="h-1 w-0 bg-orange-500 mx-auto group-hover:w-8 transition-all duration-500" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}