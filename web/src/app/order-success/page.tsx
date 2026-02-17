'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle2, Package, ArrowRight, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

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
                colors: ['#FF8C00', '#FFBD33', '#ffffff']
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#FF8C00', '#FFBD33', '#ffffff']
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
            <Navbar />

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="glass-panel success-card" style={{
                        maxWidth: '680px',
                        width: '100%',
                        padding: '80px 48px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: '48px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 40px 120px rgba(0,0,0,0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Background glow effects */}
                        <div style={{
                            position: 'absolute', top: '-10%', right: '-10%',
                            width: '300px', height: '300px', background: 'var(--color-primary)', filter: 'blur(140px)', opacity: 0.1
                        }}></div>

                        <div className="success-icon-container" style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '40px',
                            background: 'var(--status-success)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            marginBottom: '40px',
                            position: 'relative',
                            boxShadow: '0 20px 50px rgba(52, 199, 89, 0.3)'
                        }}>
                            <CheckCircle2 size={60} strokeWidth={3} />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <h1 style={{
                                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                                fontWeight: 900,
                                lineHeight: 1,
                                margin: 0,
                                letterSpacing: '-2px'
                            }}>
                                Transmission <span style={{ color: 'var(--status-success)' }}>Successful</span>
                            </h1>
                            <p style={{
                                fontSize: '1.25rem',
                                color: 'var(--text-muted)',
                                marginTop: '16px',
                                fontWeight: 500,
                                maxWidth: '500px'
                            }}>
                                Your procurement sequence has been finalized. Our logistics network is now synchronizing for dispatch.
                            </p>
                        </div>

                        <div className="order-id-panel" style={{
                            background: 'var(--bg-body)',
                            padding: '24px 32px',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                            border: '1px solid var(--border-color)',
                            marginBottom: '48px'
                        }}>
                            <div style={{ textAlign: 'left' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Sequence ID</span>
                                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '1px' }}>#{orderId}</span>
                            </div>
                            <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }}></div>
                            <button
                                onClick={copyOrderId}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: copied ? 'var(--status-success)' : 'var(--text-body)',
                                    cursor: 'pointer',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {copied ? 'Synchronized' : <><Copy size={18} /> Copy ID</>}
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', width: '100%', flexWrap: 'wrap' }}>
                            <Link href="/account/orders" style={{ flex: 1, minWidth: '200px' }}>
                                <div className="btn btn-secondary" style={{
                                    width: '100%',
                                    padding: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    borderRadius: '18px',
                                    fontWeight: 900,
                                    fontSize: '1.1rem'
                                }}>
                                    <Package size={22} /> Operations Hub
                                </div>
                            </Link>
                            <Link href="/" style={{ flex: 1, minWidth: '200px' }}>
                                <div className="btn btn-primary" style={{
                                    width: '100%',
                                    padding: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    borderRadius: '18px',
                                    fontWeight: 900,
                                    fontSize: '1.1rem',
                                    boxShadow: '0 10px 30px rgba(255,140,0,0.2)'
                                }}>
                                    Continue Sourcing <ArrowRight size={22} />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <style jsx>{`
                .success-icon-container {
                    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes popIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .success-card {
                    animation: slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                @keyframes slideUp {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .order-id-panel:hover {
                    border-color: var(--color-primary);
                }
            `}</style>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', color: 'var(--text-muted)', fontWeight: 600 }}>Deciphering Sequence...</div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
