'use client';

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, ChevronRight } from "lucide-react";

export default function Hero() {
    return (
        <section
            className="relative w-full bg-background overflow-hidden mt-20"
            aria-label="Premium Auto Spare Parts Hero Section"
        >
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* LEFT CONTENT */}
                    <div className="flex flex-col space-y-8 text-center lg:text-left">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 border border-primary/20 bg-primary/5 rounded-full text-xs uppercase tracking-widest font-semibold mx-auto lg:mx-0">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                            Trusted by 10k+ Customers
                        </div>

                        {/* Heading */}
                        <h1 className="font-black uppercase italic leading-tight tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                            Quality Parts. <br />
                            <span className="text-primary">Fast Service.</span>
                        </h1>

                        {/* Description */}
                        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto lg:mx-0">
                            Buy original spare parts online from trusted brands. Fast shipping,
                            secure checkout, and delivery across India. Get quality parts
                            delivered straight to your doorstep.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">

                            <Link
                                href="/search"
                                aria-label="Shop original spare parts"
                                className="inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
                            >
                                Shop Now
                                <ChevronRight className="ml-2 w-4 h-4" />
                            </Link>

                            {/* <Link
                                href="/book-service"
                                aria-label="Book vehicle repair service"
                                className="inline-flex items-center justify-center border border-border px-6 py-3 rounded-xl font-semibold hover:bg-muted transition"
                            >
                                Book a Service
                            </Link> */}

                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border text-center lg:text-left">

                            <div>
                                <p className="text-2xl font-bold">48k+</p>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                    Total Products
                                </p>
                            </div>

                            <div>
                                <p className="text-2xl font-bold">250+</p>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                    Service Hubs
                                </p>
                            </div>

                            <div>
                                <p className="text-2xl font-bold">Fast</p>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                    Delivery Across India
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px]">

                        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">

                            <Image
                                src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1200"
                                alt="High quality original auto spare parts"
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40"></div>

                            {/* Floating Card */}
                            <div className="absolute bottom-6 left-6 right-6 bg-black/70 backdrop-blur-md p-4 rounded-xl flex items-center justify-between">

                                <div>
                                    <p className="text-white font-semibold text-sm">
                                        Express Shipping
                                    </p>
                                    <p className="text-xs text-gray-300">
                                        Fast & Secure Delivery
                                    </p>
                                </div>

                                <ShieldCheck className="text-primary w-6 h-6" />

                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}