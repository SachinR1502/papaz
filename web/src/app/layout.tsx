import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Papaz | Vehicle Service & Technician Management',
  description: 'Admin dashboard for managing service requests, technicians, and fleet operations.',
  icons: {
    icon: '/icon.png',
  },
};

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
