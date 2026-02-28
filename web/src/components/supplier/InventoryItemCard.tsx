'use client';

import Link from 'next/link';
import { SupplierProduct } from '@/types/models';
import { Edit2, Package, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryItemCardProps {
    item: SupplierProduct;
    currencySymbol?: string;
}

export default function InventoryItemCard({
    item,
    currencySymbol = '₹',
}: InventoryItemCardProps) {

    const isLowStock = item.quantity < 5;

    const renderIcon = () => {
        const type = item.type?.toLowerCase() || '';
        if (type.includes('car')) return '🚗';
        if (type.includes('bike')) return '🏍️';
        if (type.includes('truck')) return '🚚';
        if (type.includes('tractor')) return '🚜';
        return '⚙️';
    };

    return (
        <div className="flex flex-col p-4 rounded-lg border border-gray-200 bg-white hover:border-orange-400 transition">

            {/* Top Section */}
            <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-lg">
                        {renderIcon()}
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                            {item.name || 'Unknown Product'}
                        </h3>

                        <p className="text-xs text-gray-500 mt-0.5">
                            {item.category || 'Spare Part'}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                        {currencySymbol}{item.price?.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 my-3" />

            {/* Bottom Section */}
            <div className="flex justify-between items-center">

                <div className="flex gap-4 items-center text-xs text-gray-600">

                    <div className="flex items-center gap-1">
                        <Package size={14} className={cn(isLowStock && "text-red-500")} />
                        <span className={cn(
                            isLowStock ? "text-red-500 font-medium" : ""
                        )}>
                            {item.quantity} in stock
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{item.localDeliveryTime || '2-3 days'}</span>
                    </div>

                </div>

                <Link
                    href={`/supplier/inventory/edit/${item.id}`}
                    className="p-2 rounded-md border border-gray-200 hover:border-orange-500 hover:text-orange-600 transition"
                >
                    <Edit2 size={14} />
                </Link>

            </div>
        </div>
    );
}