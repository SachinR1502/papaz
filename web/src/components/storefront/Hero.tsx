'use client';

import { ArrowRight, ShieldCheck, Zap, Star, Package, Box, Activity, ChevronRight, Globe } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function Hero() {
    return (
        <section className="relative min-h-screen bg-background flex items-center overflow-hidden pt-48 lg:pt-32 pb-20">
            {/* Technical Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                {/* Ambient Glows */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

                {/* Scanning Line */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[2px] w-full animate-[scan_8s_linear_infinite]" />
            </div>

            <div className="container relative z-10 px-6 lg:px-12 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-24 items-center">

                    {/* Left Column: Simple Content */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-10">
                        <div className="space-y-4 animate-fade-in translate-y-0 opacity-100 transition-all duration-1000">
                            <Badge variant="premium" className="px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-black border border-primary/20 bg-primary/5 flex items-center gap-2 w-fit mx-auto lg:mx-0">
                                <Activity size={12} className="text-primary animate-pulse" />
                                Trusted by 10k+ Customers
                            </Badge>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[0.95] tracking-tighter uppercase italic">
                                Quality Parts. <br />
                                <span className="text-primary drop-shadow-[0_0_15px_rgba(255,140,0,0.3)]">Fast Service.</span>
                            </h1>
                        </div>

                        <p className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl font-medium border-l-2 border-border pl-6 lg:pl-10 lg:ml-2">
                            Find original spare parts for your vehicle from the best brands. Quality you can trust, delivered straight to your door.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto pt-4 animate-fade-in delay-300">
                            <Link href="/search" className="w-full sm:w-auto">
                                <Button variant="premium" size="xl" className="w-full gap-3 group px-12 rounded-2xl">
                                    Shop Now
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/register?role=technician" className="w-full sm:w-auto">
                                <Button variant="outline" size="xl" className="w-full border-border bg-card/50 backdrop-blur-xl hover:bg-card px-12 rounded-2xl font-black italic uppercase tracking-widest text-xs">
                                    Book a Service
                                </Button>
                            </Link>
                        </div>

                        {/* Interactive Metrics */}
                        <div className="grid grid-cols-3 gap-8 sm:gap-16 pt-12 border-t border-border w-full lg:w-fit animate-fade-in delay-500">
                            {[
                                { label: 'Total Products', val: '48k+', sub: 'Original Brands' },
                                { label: 'Service Hubs', val: '250+', sub: 'Verified Pros' },
                                { label: 'Delivery', val: 'Fast', sub: 'Across India' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center lg:items-start group cursor-crosshair">
                                    <span className="text-2xl md:text-3xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">{item.val}</span>
                                    <span className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mt-1 group-hover:tracking-[0.3em] transition-all">{item.label}</span>
                                    <span className="text-[8px] text-primary/60 font-black uppercase tracking-widest mt-2">{item.sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Visual Core */}
                    <div className="relative group animate-fade-in delay-700">
                        {/* 3D-like Box Frame */}
                        <div className="relative aspect-[4/5] sm:aspect-square rounded-[60px] overflow-hidden border border-border bg-card shadow-[0_40px_100px_rgba(0,0,0,0.5)] transition-all duration-700 group-hover:scale-[1.02] group-hover:-rotate-1">
                            {/* Technical Overlay */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10 pointer-events-none" />
                            <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
                                <div className="w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <Globe size={20} className="text-primary animate-spin-[10s]" />
                                </div>
                                <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Original Quality</p>
                                    <p className="text-[8px] font-bold text-primary uppercase mt-1">Status: Verified</p>
                                </div>
                            </div>

                            <img
                                src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1200"
                                alt="High Quality Auto Parts"
                                className="w-full h-full object-cover grayscale-[0.3] brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 scale-110 group-hover:scale-100"
                            />

                            {/* Floating Highlight Card */}
                            <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[32px] flex items-center justify-between z-20 group-hover:-translate-y-2 transition-transform duration-500">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                                        <Package size={28} className="animate-[bounce_3s_infinite]" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-white tracking-tight">Express Shipping</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-1 w-12 bg-primary/30 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary w-2/3 animate-[loading_2s_ease-in-out_infinite]" />
                                            </div>
                                            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Order Processing</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-full border border-white/10">
                                    <ShieldCheck className="text-primary" size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Outer Glows */}
                        <div className="absolute -inset-4 bg-primary/20 blur-[80px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-1000 -z-10" />

                        {/* Corner Accents */}
                        <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-primary/40 rounded-tr-[60px] pointer-events-none translate-x-4 -translate-y-4" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/20 rounded-bl-[60px] pointer-events-none -translate-x-6 translate-y-6" />
                    </div>

                </div>
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100vh); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </section>
    );
}
