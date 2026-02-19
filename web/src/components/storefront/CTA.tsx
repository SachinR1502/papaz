'use client';

import Link from 'next/link';
import { Sparkles, Users, ArrowRight } from 'lucide-react';

export default function CTA() {
    return (
        <section className="py-24 px-6 relative overflow-hidden">
            {/* Background Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-orange-600/5 z-0" />

            {/* Decorative Animated Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,var(--color-primary)_0%,transparent_70%)] blur-[120px] opacity-10 z-0 animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[radial-gradient(circle,#7E57C2_0%,transparent_70%)] blur-[120px] opacity-10 z-0 animate-pulse-slow-reverse" />

            <div className="container mx-auto max-w-6xl relative z-10 text-center">
                <div className="bg-[var(--bg-card)] p-12 md:p-24 rounded-[48px] border border-white/10 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">

                    {/* Top Top Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent rounded-full" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mb-8 text-[var(--color-primary)] shadow-lg shadow-orange-500/5">
                            <Sparkles size={32} />
                        </div>

                        <h2 className="text-[clamp(2.4rem,6vw,4.2rem)] font-black mb-6 tracking-tighter leading-[1.05] text-[var(--text-body)]">
                            Scale Your <span className="text-[var(--color-primary)] italic">Automotive</span> Vision.
                        </h2>
                        <p className="text-[clamp(1.1rem,2.5vw,1.4rem)] text-[var(--text-muted)] mb-12 leading-relaxed max-w-3xl font-medium">
                            Integrate with India's most advanced B2B auto-network. Verified sourcing, rapid logistics, and tech-driven partner growth.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 w-full justify-center">
                            <Link href="/supplier/onboarding" className="w-full sm:w-auto">
                                <button className="w-full bg-[var(--color-primary)] text-white px-10 py-5 rounded-2xl text-lg font-black shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 group/btn">
                                    Join Supplier Hub
                                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/technician/register" className="w-full sm:w-auto">
                                <button className="w-full px-10 py-5 rounded-2xl text-lg font-black bg-white/5 border border-[var(--border-color)] text-[var(--text-body)] backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <Users size={20} />
                                    Partner Registration
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Right Ornament */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--color-primary)]/5 blur-[50px] rounded-full group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </section>
    );
}
