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
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
      <Navbar />
      <Hero />
      <Brands />
      <Categories />
      <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>}>
        <FeaturedProducts />
      </Suspense>
      <CTA />
      <Footer />
    </main>
  );
}
