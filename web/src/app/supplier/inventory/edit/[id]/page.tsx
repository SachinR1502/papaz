'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { ProductForm } from '@/components/supplier/ProductForm';

export default function EditProductPage() {
    const params = useParams();
    const productId = params?.id || params?.productId;

    const { inventory, updateProduct } = useSupplier();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        if (productId && inventory.length > 0) {
            const product = inventory.find(p => p.id === productId);
            if (product) setInitialData(product);
        }
    }, [productId, inventory]);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await updateProduct(productId as string, data);
            toast.success('Product updated');
            router.push('/supplier/inventory');
        } catch {
            toast.error('Update failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (inventory.length > 0 && !initialData) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <AlertTriangle size={32} className="text-red-500" />
                <div className="text-center">
                    <h3 className="text-base font-semibold text-gray-900">
                        Product not found
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        This item does not exist in your inventory.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/supplier/inventory')}
                    className="px-4 py-2 bg-gray-100 text-xs rounded-md hover:bg-gray-200 transition"
                >
                    Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-12">

            {/* Header */}
            <header className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-md border border-gray-200 text-gray-500 hover:text-orange-500 hover:border-orange-500 transition"
                >
                    <ArrowLeft size={16} />
                </button>

                <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                        Edit <span className="text-orange-500">Product</span>
                    </h1>
                    <p className="text-xs text-gray-500">
                        Update product details
                    </p>
                </div>
            </header>

            {/* Form */}
            {initialData ? (
                <ProductForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    buttonText="Save Changes"
                />
            ) : (
                <div className="py-12 flex justify-center">
                    <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}