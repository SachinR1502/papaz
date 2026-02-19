'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Send, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="mt-auto bg-card pt-24 pb-12 px-6 border-t border-border relative overflow-hidden z-10">
            {/* Background Decor */}
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[radial-gradient(circle,var(--color-primary)_0%,transparent_70%)] blur-[120px] opacity-10 pointer-events-none" />

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">

                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform duration-300">
                                <span className="text-white font-black text-2xl">P</span>
                            </div>
                            <span className="text-3xl font-black tracking-tighter text-foreground uppercase italic">PAPAZ</span>
                        </Link>
                        <p className="text-muted text-base font-medium leading-relaxed max-w-sm">
                            India's premier integrated automotive ecosystem. Engineering the future of vehicle lifecycle management through technology.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={Facebook} href="#" />
                            <SocialIcon icon={Twitter} href="#" />
                            <SocialIcon icon={Instagram} href="#" />
                            <SocialIcon icon={Linkedin} href="#" />
                        </div>
                    </div>

                    {/* Catalog Column */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black text-muted uppercase tracking-[2.5px] opacity-70">Catalogue</h4>
                        <ul className="space-y-5 text-sm font-bold text-foreground">
                            <FooterLink href="#">Engine Systems</FooterLink>
                            <FooterLink href="#">Dynamic Braking</FooterLink>
                            <FooterLink href="#">Performance Tyres</FooterLink>
                            <FooterLink href="#">Digital Electronics</FooterLink>
                        </ul>
                    </div>

                    {/* Enterprise Column */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black text-muted uppercase tracking-[2.5px] opacity-70">Enterprise</h4>
                        <ul className="space-y-5 text-sm font-bold text-foreground">
                            <FooterLink href="#">Our Methodology</FooterLink>
                            <FooterLink href="/supplier/onboarding">Supplier Network</FooterLink>
                            <FooterLink href="/technician/register">Service Partners</FooterLink>
                            <FooterLink href="#">Strategic Media</FooterLink>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black text-muted uppercase tracking-[2.5px] opacity-70">Intelligence</h4>
                        <div>
                            <p className="text-sm font-medium text-muted mb-5 leading-relaxed">
                                Receive technical insights and market updates.
                            </p>
                            <form className="relative flex items-center bg-background p-1.5 rounded-2xl border border-border focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                                <Mail size={16} className="absolute left-4 text-muted opacity-50" />
                                <input
                                    type="email"
                                    placeholder="Technical Email"
                                    className="w-full bg-transparent pl-11 pr-4 py-2.5 outline-none text-sm font-black text-foreground placeholder:text-muted/30"
                                />
                                <button type="button" className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
                                    <Send size={16} />
                                </button>
                            </form>
                            <p className="text-[10px] font-bold text-muted mt-4 px-2 tracking-wide opacity-50 uppercase tracking-widest leading-none">Secured Data Transmission</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-border flex flex-col items-center gap-8">
                    <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                        <Link href="/legal/privacy-policy" className="hover:text-primary transition-colors">Privacy Protocol</Link>
                        <Link href="/legal/terms-conditions" className="hover:text-primary transition-colors">System Terms</Link>
                        <Link href="/legal/shipping-policy" className="hover:text-primary transition-colors">Logistics Policy</Link>
                        <Link href="/legal/refund-policy" className="hover:text-primary transition-colors">Capital Reclaim</Link>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-[11px] font-black text-muted opacity-30 uppercase tracking-[0.3em] text-center">
                            &copy; {new Date().getFullYear()} Papaz LLP. All Infrastructure Secured.
                        </p>
                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.5em] opacity-40">Innovation in every rotation</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <li>
            <Link
                href={href}
                className="text-muted hover:text-primary hover:translate-x-1.5 inline-block transition-all duration-300 transform-gpu"
            >
                {children}
            </Link>
        </li>
    );
}

function SocialIcon({ icon: Icon, href }: { icon: any, href: string }) {
    return (
        <Link
            href={href}
            className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-muted hover:border-primary/50 hover:text-primary hover:-translate-y-1 transition-all duration-300"
        >
            <Icon size={18} />
        </Link>
    );
}

