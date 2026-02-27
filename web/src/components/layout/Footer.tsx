'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Send, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer
            role="contentinfo"
            className="relative bg-[var(--bg-card)] border-t border-[var(--border-color)] pt-16 sm:pt-20 lg:pt-24 pb-10 sm:pb-12 overflow-hidden"
        >
            {/* Decorative Background */}
            <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] bg-[radial-gradient(circle,var(--color-primary)_0%,transparent_70%)] blur-[120px] opacity-10 pointer-events-none" />

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Main Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" aria-label="Papaz Home" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <span className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                                PAPAZ
                            </span>
                        </Link>

                        <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-sm">
                            India's premier integrated automotive ecosystem. Engineering
                            the future of vehicle lifecycle management through innovation.
                        </p>

                        <div className="flex gap-3">
                            <SocialIcon href="#" label="Facebook">
                                <Facebook size={16} />
                            </SocialIcon>
                            <SocialIcon href="#" label="Twitter">
                                <Twitter size={16} />
                            </SocialIcon>
                            <SocialIcon href="#" label="Instagram">
                                <Instagram size={16} />
                            </SocialIcon>
                            <SocialIcon href="#" label="LinkedIn">
                                <Linkedin size={16} />
                            </SocialIcon>
                        </div>
                    </div>

                    {/* Catalogue */}
                    <FooterColumn title="Catalogue">
                        <FooterLink href="/search?category=Engine%20Parts">Engine Systems</FooterLink>
                        <FooterLink href="/search?category=Brakes">Dynamic Braking</FooterLink>
                        <FooterLink href="/search?category=Tires">Performance Tyres</FooterLink>
                        <FooterLink href="/search?category=Accessories">Digital Electronics</FooterLink>
                    </FooterColumn>

                    {/* Enterprise */}
                    <FooterColumn title="Enterprise">
                        <FooterLink href="/about">Our Methodology</FooterLink>
                        <FooterLink href="/supplier/onboarding">Supplier Network</FooterLink>
                        <FooterLink href="/technician/register">Service Partners</FooterLink>
                        <FooterLink href="/media">Strategic Media</FooterLink>
                    </FooterColumn>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
                            Intelligence
                        </h4>

                        <p className="text-sm text-[var(--text-muted)] mb-4">
                            Receive technical insights and automotive updates.
                        </p>

                        <form
                            className="flex items-center bg-[var(--bg-body)] border border-[var(--border-color)] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--color-primary)]"
                            aria-label="Newsletter subscription"
                        >
                            <Mail size={16} className="text-[var(--text-muted)] mr-2" />
                            <input
                                type="email"
                                required
                                placeholder="Enter your email"
                                className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--text-muted)]"
                            />
                            <button
                                type="submit"
                                aria-label="Subscribe"
                                className="ml-2 bg-[var(--color-primary)] text-white p-2 rounded-lg hover:opacity-90 transition"
                            >
                                <Send size={14} />
                            </button>
                        </form>

                        <p className="text-[10px] text-[var(--text-muted)] mt-3 uppercase tracking-widest opacity-50">
                            Secured Data Transmission
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-[var(--border-color)] pt-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-[var(--text-muted)]">

                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                        <Link href="/legal/privacy-policy" className="hover:text-[var(--color-primary)]">
                            Privacy Policy
                        </Link>
                        <Link href="/legal/terms-conditions" className="hover:text-[var(--color-primary)]">
                            Terms & Conditions
                        </Link>
                        <Link href="/legal/shipping-policy" className="hover:text-[var(--color-primary)]">
                            Shipping Policy
                        </Link>
                        <Link href="/legal/refund-policy" className="hover:text-[var(--color-primary)]">
                            Refund Policy
                        </Link>
                    </div>

                    <p className="text-center sm:text-right">
                        © {new Date().getFullYear()} Papaz LLP. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

/* ---------- Reusable Components ---------- */

function FooterColumn({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
                {title}
            </h4>
            <ul className="space-y-3 text-sm">{children}</ul>
        </div>
    );
}

function FooterLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <li>
            <Link
                href={href}
                className="text-[var(--text-muted)] hover:text-[var(--color-primary)] transition"
            >
                {children}
            </Link>
        </li>
    );
}

function SocialIcon({
    href,
    children,
    label,
}: {
    href: string;
    children: React.ReactNode;
    label: string;
}) {
    return (
        <Link
            href={href}
            aria-label={label}
            className="w-9 h-9 flex items-center justify-center border border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition"
        >
            {children}
        </Link>
    );
}