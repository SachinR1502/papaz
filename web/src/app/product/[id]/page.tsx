'use client';

import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { customerService } from '@/services/customerService';
import { toast } from 'sonner';
import {
    Heart,
    ShoppingCart,
    Star,
    ShieldCheck,
    Truck,
    Package,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct();
            checkWishlistStatus();
        }
    }, [id]);

    const checkWishlistStatus = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) return;

        try {
            const wishlist = await customerService.getWishlist();
            const isInWishlist = wishlist?.some((item: any) =>
                (item._id || item.id) === id
            );
            setIsWishlisted(isInWishlist);
        } catch (err) {
            console.error('Failed to fetch wishlist status:', err);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await customerService.getProduct(id as string);
            setProduct(res.data || res);
        } catch {
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        setIsAddingToCart(true);
        addToCart({
            ...product,
            image: product.image || product.images?.[0]
        });
        toast.success('Added to cart');
        setIsAddingToCart(false);
    };

    const handleWishlist = async () => {
        if (wishlistLoading) return;

        // Check if user is logged in
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) {
            toast.error('Authentication Required', {
                description: 'Please login to add items to your wishlist.',
            });
            return;
        }

        try {
            setWishlistLoading(true);
            if (isWishlisted) {
                await customerService.removeFromWishlist(id as string);
                setIsWishlisted(false);
                toast.success('Removed from wishlist');
            } else {
                await customerService.addToWishlist(id as string);
                setIsWishlisted(true);
                toast.success('Added to wishlist');
            }
        } catch (err) {
            console.error('Wishlist error:', err);
            toast.error(isWishlisted ? 'Failed to remove from wishlist' : 'Failed to add to wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    if (loading || !product) return null;

    const images =
        product.images?.length > 0
            ? product.images
            : [product.image || 'https://via.placeholder.com/800'];

    const discount = product.mrp
        ? Math.round(
            ((product.mrp - product.price) /
                product.mrp) *
            100
        )
        : 0;

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Breadcrumb - Clean & Premium */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
                    <ChevronRight size={12} className="text-slate-200" />
                    <span className="text-slate-300">{product.category}</span>
                    <ChevronRight size={12} className="text-slate-200" />
                    <span className="text-slate-900 italic underline decoration-orange-500/30 underline-offset-4">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Gallery Section */}
                    <div className="space-y-6">
                        <div className="relative aspect-square bg-slate-50 rounded-[40px] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/20 group">
                            <img
                                src={images[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />

                            {discount > 0 && (
                                <div className="absolute top-8 left-8 bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-2xl animate-pulse">
                                    {discount}% SAVED
                                </div>
                            )}

                            <button
                                onClick={handleWishlist}
                                className={cn(
                                    "absolute top-8 right-8 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
                                    isWishlisted
                                        ? "bg-orange-500 text-white shadow-orange-500/30 scale-110"
                                        : "bg-white/90 backdrop-blur-xl text-slate-400 border border-slate-100 hover:bg-orange-500 hover:text-white"
                                )}
                            >
                                <Heart
                                    size={24}
                                    className={cn("transition-transform duration-500", isWishlisted && "fill-current")}
                                />
                            </button>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={cn(
                                            "w-24 h-24 rounded-[24px] overflow-hidden border-2 transition-all duration-500 flex-shrink-0 shadow-lg",
                                            activeImage === idx
                                                ? 'border-orange-500 scale-105 shadow-orange-500/20'
                                                : 'border-transparent hover:border-slate-200'
                                        )}
                                    >
                                        <img
                                            src={img}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col">
                        <div className="bg-white border border-slate-100 rounded-[40px] p-10 sm:p-14 shadow-2xl shadow-slate-200/20 relative overflow-hidden">
                            {/* Accent Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[100px] -mr-10 -mt-10" />

                            {/* Brand + Rating */}
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-xs font-black text-orange-600 uppercase tracking-[0.3em] italic">
                                    {product.brand || 'Premium Genuine'}
                                </span>

                                <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-950 text-white rounded-full text-[11px] font-black shadow-xl">
                                    <Star size={12} className="fill-orange-500 text-orange-500" />
                                    <span>{product.rating?.toFixed(1) || '4.8'}</span>
                                </div>
                            </div>

                            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight italic uppercase">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4 mb-10">
                                <div className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 italic">
                                    SKU: {product.sku}
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                                    PRODUCT ID: {product.productId}
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="flex flex-col mb-12">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 italic ml-1">Current Listing Price</span>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-6xl font-black text-slate-950 tracking-tighter italic">
                                        ₹{product.price?.toLocaleString()}
                                    </span>
                                    {product.mrp && product.mrp > product.price && (
                                        <span className="text-2xl text-slate-300 line-through mb-1 italic opacity-60">
                                            ₹{product.mrp.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-slate-500 mb-12 leading-[1.8] text-sm font-medium">
                                {product.shortDescription}
                            </p>

                            {/* Trust Features */}
                            <div className="grid grid-cols-2 gap-4 mb-12">
                                <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-xl transition-all duration-500">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-inner group-hover:scale-110 transition-transform">
                                        <Truck size={20} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">Shipping</p>
                                        <p className="text-xs font-black text-slate-900 uppercase italic">Priority Delivery</p>
                                    </div>
                                </div>
                                <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-xl transition-all duration-500">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-inner group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={20} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">Protection</p>
                                        <p className="text-xs font-black text-slate-900 uppercase italic">Verified Qual.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Main CTA */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart}
                                    className="flex-[3] py-6 bg-slate-950 text-white rounded-[32px] text-base font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-4 hover:bg-orange-600 transition-all duration-500 shadow-2xl shadow-slate-900/40 active:scale-95 disabled:opacity-50 group"
                                >
                                    <ShoppingCart size={22} className="group-hover:-translate-y-1 transition-transform" />
                                    Add to Cart
                                </button>
                            </div>
                        </div>

                        {/* Compatibility Matrix - Mobile friendly style but premium */}
                        {product.compatibility && product.compatibility.length > 0 && (
                            <div className="mt-8 bg-white border border-slate-100 rounded-[40px] p-10 shadow-2xl shadow-slate-200/20">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] italic mb-8 flex items-center gap-3 underline decoration-orange-500 decoration-2 underline-offset-8">
                                    <Package size={18} className="text-orange-500" />
                                    Vehicle Compatibility
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {product.compatibility.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                                            <div className="text-xs font-black text-slate-900 uppercase italic">{item.model}</div>
                                            <div className="flex items-center gap-4">
                                                <div className="px-3 py-1 bg-white rounded-full border border-slate-100 text-[10px] font-black text-slate-400">
                                                    {item.yearRange?.from} - {item.yearRange?.to}
                                                </div>
                                                <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest italic">{item.engineType}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}