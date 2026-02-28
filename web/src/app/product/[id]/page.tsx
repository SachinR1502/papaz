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

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

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
        try {
            await customerService.addToWishlist(id as string);
            setIsWishlisted(true);
            toast.success('Added to wishlist');
        } catch {
            toast.error('Failed to add to wishlist');
        }
    };

    if (loading || !product) return null;

    const images =
        product.images?.length > 0
            ? product.images
            : [product.image || 'https://via.placeholder.com/800'];

    const discount = product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) /
                product.originalPrice) *
            100
        )
        : 0;

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-500 flex items-center gap-2">
                <Link href="/" className="hover:text-orange-500">Home</Link>
                <ChevronRight size={14} />
                <span className="truncate max-w-[200px] text-gray-800">
                    {product.name}
                </span>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Gallery */}
                    <div>
                        <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200">
                            <img
                                src={images[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />

                            {discount > 0 && (
                                <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-md">
                                    {discount}% OFF
                                </div>
                            )}

                            <button
                                onClick={handleWishlist}
                                className="absolute top-4 right-4 w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center"
                            >
                                <Heart
                                    size={18}
                                    className={
                                        isWishlisted
                                            ? 'fill-orange-500 text-orange-500'
                                            : 'text-gray-400'
                                    }
                                />
                            </button>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-3 mt-4 overflow-x-auto">
                            {images.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border ${activeImage === idx
                                            ? 'border-orange-500'
                                            : 'border-gray-200'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200">

                        {/* Brand + Rating */}
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-sm text-orange-600 font-medium">
                                {product.brand || 'Brand'}
                            </span>

                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                {product.rating || 4.5}
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl font-semibold text-gray-900">
                                ₹{product.price?.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                                <span className="text-lg text-gray-400 line-through">
                                    ₹{product.originalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-600 mb-8">
                            {product.description}
                        </p>

                        {/* Trust Info */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Truck size={18} className="text-orange-500" />
                                Fast delivery
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <ShieldCheck size={18} className="text-orange-500" />
                                Quality guarantee
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
                            >
                                <ShoppingCart size={18} />
                                Add to Cart
                            </button>

                            <button
                                onClick={handleWishlist}
                                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                <Heart
                                    size={18}
                                    className={
                                        isWishlisted
                                            ? 'fill-orange-500 text-orange-500'
                                            : 'text-gray-600'
                                    }
                                />
                            </button>
                        </div>

                        {/* Specifications */}
                        <div className="mt-10">
                            <h3 className="text-lg font-semibold mb-4">
                                Specifications
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                {(product.specs || []).map(
                                    (spec: any, i: number) => (
                                        <div key={i}>
                                            <span className="text-gray-500">
                                                {spec.key}:
                                            </span>{' '}
                                            {spec.value}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}