'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle2, Package, ArrowRight, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id') || 'ORD-UNKNOWN';
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 40 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#f97316', '#fbbf24', '#ffffff']
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#f97316', '#fbbf24', '#ffffff']
            });
        }, 300);

        return () => clearInterval(interval);
    }, []);

    const copyOrderId = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-4">
                <div className="max-w-xl w-full">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="p-8 md:p-12 text-center">
                            {/* Icon */}
                            <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-8 animate-in zoom-in duration-500 delay-200 shadow-lg shadow-green-100">
                                <CheckCircle2 size={40} strokeWidth={2.5} />
                            </div>

                            {/* Text */}
                            <div className="mb-10">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                                    Order Placed Successfully
                                </h1>
                                <p className="text-gray-500 font-medium">
                                    Thank you for your purchase. We've received your order and we're getting it ready for shipment.
                                </p>
                            </div>

                            {/* Order ID Panel */}
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between mb-10 group hover:border-orange-200 transition-colors">
                                <div className="text-left">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Order Identifier</span>
                                    <span className="text-xl font-bold text-gray-900">#{orderId}</span>
                                </div>
                                <button
                                    onClick={copyOrderId}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                        copied
                                            ? "bg-green-100 text-green-600"
                                            : "bg-white text-gray-600 border border-gray-200 hover:border-orange-500 hover:text-orange-600 shadow-sm"
                                    )}
                                >
                                    {copied ? (
                                        <>Copied!</>
                                    ) : (
                                        <><Copy size={14} /> Copy ID</>
                                    )}
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link href="/account/orders" className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition-all text-sm">
                                    <Package size={18} />
                                    View My Orders
                                </Link>
                                <Link href="/" className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all text-sm shadow-lg shadow-slate-200">
                                    Continue Shopping
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>

                        <div className="bg-orange-50 border-t border-orange-100 p-4 flex items-center justify-center gap-2">
                            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">A confirmation email has been sent to your inbox.</span>
                        </div>
                    </div>

                    <p className="text-center mt-8 text-xs text-gray-400 font-medium">
                        Need help with your order? <Link href="/support" className="text-orange-600 font-bold hover:underline">Contact Support</Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <span className="text-sm font-bold uppercase tracking-widest">Confirming Order...</span>
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}
