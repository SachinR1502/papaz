'use client';

import Link from 'next/link';
import { SupplierProduct } from '@/types/models';
import { Edit2, Package, Clock, ShoppingCart, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryItemCardProps {
    item: SupplierProduct;
    currencySymbol?: string;
}

export default function InventoryItemCard({ item, currencySymbol = '₹' }: InventoryItemCardProps) {
    const isLowStock = item.quantity < 5;

    // Determine icon based on type
    const renderIcon = () => {
        const type = item.type?.toLowerCase() || '';
        if (type.includes('car')) return '🚗';
        if (type.includes('bike')) return '🏍️';
        if (type.includes('truck')) return '🚚';
        if (type.includes('tractor')) return '🚜';
        return '⚙️';
    };

    return (
        <div className="group relative flex flex-col p-6 rounded-[32px] border border-border bg-card/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:bg-card/40 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden">
            {/* Ambient hover effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl border border-primary/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 italic">
                        {renderIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-foreground italic uppercase tracking-tight group-hover:text-primary transition-colors leading-tight mb-1">
                            {item.name || 'Unknown Product'}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted opacity-60">
                                {item.type || 'Spare'} Part
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                                {item.category || 'Components'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black text-foreground tracking-tighter">
                        {currencySymbol}{item.price?.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="h-px bg-border/50 w-full mb-6" />

            <div className="flex justify-between items-center mt-auto">
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <Package size={14} className={cn("text-muted", isLowStock && "text-red-500 animate-pulse")} />
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest transition-colors",
                            isLowStock ? "text-red-500" : "text-muted"
                        )}>
                            Stock: <span className={cn("text-xs", !isLowStock && "text-foreground")}>{item.quantity}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted">
                        <Clock size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.localDeliveryTime || '2-3 Days'}</span>
                    </div>
                </div>

                <Link
                    href={`/supplier/inventory/edit/${item.id}`}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border text-muted hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all active:scale-95 group-hover:shadow-lg group-hover:shadow-primary/10"
                >
                    <Edit2 size={16} />
                </Link>
            </div>

            {/* View Details Overlay for group hover */}
            <div className="mt-6 pt-4 border-t border-border/50 flex justify-end transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <Link
                    href={`/supplier/inventory/edit/${item.id}`}
                    className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:gap-2 transition-all"
                >
                    Manage Inventory <ChevronRight size={14} />
                </Link>
            </div>
        </div>
    );
}
