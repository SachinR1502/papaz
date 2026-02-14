export interface SupplierProduct {
    id: string;
    name: string;
    type: string;
    price: number;
    quantity: number;
    localDeliveryTime: string;
    transportDeliveryTime: string;
    deliveryCharges: number;
    brand?: string;
    partNumber?: string;
    compatibleModels?: string[];
    [key: string]: any;
}

export interface SupplierOrder {
    id: string;
    partName: string;
    quantity: number;
    location: string;
    urgency: string;
    status: 'pending' | 'accepted' | 'rejected' | 'packed' | 'out_for_delivery' | 'delivered';
    amount: number;
    type?: 'Car' | 'Bike';
    name?: string;
    [key: string]: any;
}

export interface UserProfile {
    id: string;
    role: string;
    fullName?: string;
    shopName?: string;
    storeName?: string; // Backend compatibility
    phoneNumber?: string;
    status?: string;
    walletBalance?: number;
    [key: string]: any;
}
