import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/storefront/Hero';
import Brands from '@/components/storefront/Brands';
import Categories from '@/components/storefront/Categories';
import FeaturedProducts from '@/components/storefront/FeaturedProducts';
import CTA from '@/components/storefront/CTA';

export default function Storefront() {
  return (
    <main className="min-h-screen bg-[var(--bg-body)]">
      <Navbar />
      <Hero />
      <Brands />
      <Categories />
      <Suspense fallback={<div className="py-20 text-center text-[var(--text-muted)] opacity-50 font-black uppercase tracking-widest text-xs">Loading Intelligence...</div>}>
        <FeaturedProducts />
      </Suspense>
      <CTA />
      <Footer />
    </main>
  );
}
