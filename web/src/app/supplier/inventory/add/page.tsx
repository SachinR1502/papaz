'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ProductForm } from '@/components/supplier/ProductForm';

export default function AddProductPage() {
    const { addProduct } = useSupplier();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await addProduct(data);
            toast.success('Listing Published Successfully');
            router.push('/supplier/inventory');
        } catch (err: any) {
            console.error('[AddProductPage] Error during submission:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Publishing Internal Error';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-20">
            {/* Header */}
            <header className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-orange-500 transition shadow-sm"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        New <span className="text-orange-500">Product</span>
                    </h1>
                    <p className="text-xs text-gray-500">
                        Expansion Protocol: Manual Entry
                    </p>
                </div>
            </header>

            <ProductForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                buttonText="Publish to Network"
            />
        </div>
    );
}
