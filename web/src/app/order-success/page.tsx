'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { CheckCircle2, Package, ArrowRight, Home, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

import { Suspense } from 'react';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id') || 'ORD-UNKNOWN';
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Trigger confetti on load
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const copyOrderId = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div className="container" style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px'
            }}>
                <div className="glass-panel" style={{
                    maxWidth: '600px', width: '100%', padding: '60px 40px', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
                    position: 'relative', overflow: 'hidden'
                }}>
                    {/* Background glow */}
                    <div style={{
                        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
                        width: '300px', height: '300px', background: 'var(--status-success)', filter: 'blur(120px)', opacity: 0.1, zIndex: 0
                    }}></div>

                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', background: 'var(--status-success)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                        boxShadow: '0 10px 30px rgba(52, 199, 89, 0.3)', marginBottom: '16px', position: 'relative', zIndex: 1
                    }}>
                        <CheckCircle2 size={40} strokeWidth={3} />
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1, margin: 0, position: 'relative', zIndex: 1 }}>
                        Order Confirmed!
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '400px', margin: 0, position: 'relative', zIndex: 1 }}>
                        Thank you for your purchase. Your order has been received and is being processed by our suppliers.
                    </p>

                    <div style={{
                        background: 'rgba(255,255,255,0.03)', padding: '16px 24px', borderRadius: '16px',
                        display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-color)',
                        marginTop: '16px', position: 'relative', zIndex: 1
                    }}>
                        <div style={{ textAlign: 'left' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>ORDER ID</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-body)' }}>#{orderId}</span>
                        </div>
                        <button
                            onClick={copyOrderId}
                            style={{
                                background: 'transparent', border: 'none', color: copied ? 'var(--status-success)' : 'var(--color-primary)',
                                cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
                            }}
                        >
                            {copied ? 'Copied' : <><Copy size={16} /> Copy</>}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '32px', width: '100%', position: 'relative', zIndex: 1 }}>
                        <Link href="/account/orders" style={{ flex: 1 }}>
                            <button className="btn btn-secondary" style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Package size={18} /> Track Order
                            </button>
                        </Link>
                        <Link href="/" style={{ flex: 1 }}>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <ArrowRight size={18} /> Continue Shopping
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
