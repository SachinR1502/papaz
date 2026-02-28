'use client';

import { useParams } from 'next/navigation';
import { OrderDetail } from '@/components/supplier/OrderDetail';

export default function SupplierOrderDetailPage() {
    const { id } = useParams();

    if (!id || typeof id !== 'string') return null;

    return <OrderDetail orderId={id} />;
}
