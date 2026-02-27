'use client';

import Link from 'next/link';
import { Sparkles, Users, ArrowRight } from 'lucide-react';

export default function CTA() {
    return (
        <section
            aria-labelledby="cta-heading"
            className="relative bg-[var(--bg-body)] py-16 sm:py-20 lg:py-24 overflow-hidden"
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-orange-600/5" />

            {/* Decorative Blurs */}
            <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-[radial-gradient(circle,var(--color-primary)_0%,transparent_70%)] blur-[120px] opacity-10" />
            <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] bg-[radial-gradient(circle,#7E57C2_0%,transparent_70%)] blur-[120px] opacity-10" />

            <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl sm:rounded-[40px] lg:rounded-[48px] p-8 sm:p-12 lg:p-20 text-center shadow-xl backdrop-blur-xl overflow-hidden">

                    {/* Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 sm:w-64 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent rounded-full" />

                    {/* Icon */}
                    <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                        <Sparkles size={28} />
                    </div>

                    {/* Heading */}
                    <h2
                        id="cta-heading"
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-[var(--text-body)]"
                    >
                        Scale Your{' '}
                        <span className="text-[var(--color-primary)] italic">
                            Automotive
                        </span>{' '}
                        Vision
                    </h2>

                    {/* Description */}
                    <p className="mt-5 text-sm sm:text-base md:text-lg lg:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
                        Integrate with India's most advanced B2B auto network. Verified
                        sourcing, rapid logistics, and tech-driven partner growth.
                    </p>

                    {/* Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">

                        <Link
                            href="/supplier/onboarding"
                            aria-label="Join Supplier Hub"
                            className="w-full sm:w-auto"
                        >
                            <button className="w-full sm:w-auto bg-[var(--color-primary)] text-white px-6 sm:px-8 py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold shadow-lg hover:opacity-90 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2">
                                Join Supplier Hub
                                <ArrowRight size={18} />
                            </button>
                        </Link>

                        <Link
                            href="/technician/register"
                            aria-label="Register as Partner"
                            className="w-full sm:w-auto"
                        >
                            <button className="w-full sm:w-auto px-6 sm:px-8 py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold border border-[var(--border-color)] bg-white/5 backdrop-blur-md text-[var(--text-body)] hover:bg-white/10 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Users size={18} />
                                Partner Registration
                            </button>
                        </Link>

                    </div>
                </div>
            </div>
        </section>
    );
}