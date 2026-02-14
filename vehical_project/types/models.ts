export type JobStatus =
    | 'pending'
    | 'pending_pickup'
    | 'accepted'
    | 'arrived'
    | 'diagnosing'
    | 'quote_pending'
    | 'parts_required'
    | 'parts_ordered'
    | 'in_progress'
    | 'quality_check'
    | 'ready_for_delivery'
    | 'billing_pending'
    | 'vehicle_delivered'
    | 'payment_pending_cash'
    | 'completed'
    | 'cancelled'
    | 'bill_rejected'
    | 'quote_rejected';

export interface Vehicle {
    id: string;
    _id?: string;
    make: string;
    model: string;
    vehicleType?: string;
    year: string;
    registrationNumber: string;
    fuelType?: string;
    bsNorm?: string;
    chassisNumber?: string;
    engineNumber?: string;
    qrCode: string;
    images?: string[];
    color?: string;
    mileage?: string;
}

export interface BillItem {
    id: string;
    _id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    type?: 'part' | 'labor';
    brand?: string;
    partNumber?: string;
    product?: any;
    isCustom?: boolean;
    isNote?: boolean;
}

export interface Bill {
    id: string;
    items: BillItem[];
    laborAmount: number;
    totalAmount: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    createdAt: string;
    note?: string;
    photos?: string[];
    voiceNote?: string | null;
}

export interface Quote {
    id?: string;
    items: BillItem[];
    laborAmount: number;
    totalAmount: number;
    status?: 'pending' | 'approved' | 'rejected';
    note?: string;
    photos?: string[];
    voiceNote?: string | null;
}

export interface ServiceRequest {
    id: string;
    vehicleId: string;
    description: string;
    serviceType?: 'car_wash' | 'repairs' | 'maintenance' | 'towing' | 'inspection' | 'other';
    serviceMethod?: 'home_pickup' | 'on_spot' | 'walk_in';
    isBroadcast?: boolean;
    status: JobStatus;
    createdAt: string;
    updatedAt?: string;
    completedAt?: string;
    technicianId?: string;
    technicianName?: string;
    technician?: any; // Populated technician object
    customer?: any;   // Populated customer object
    vehicle?: Vehicle; // Populated vehicle object
    customerName?: string;
    customerPhone?: string;
    garageName?: string;
    bill?: Bill;
    quote?: Quote;
    diagnosticReport?: string;
    workDone?: string;
    photos?: string[];
    voiceNote?: string | null;
    address?: string;
    partsSource?: 'technician' | 'customer';
    vehicleModel?: string; // Sometimes redundant with Vehicle object, but often flattened in API
    vehicleNumber?: string;
    billTotal?: number;
    requirements?: { id?: string; _id?: string; title: string; isCompleted: boolean }[];
    location?: {
        latitude: number;
        longitude: number;
        address?: string; // Optional full address string inside location object
        lat?: number; // Support for alternate naming if API varies
        lng?: number; // Support for alternate naming if API varies
    };
    rating?: number;
    review?: string;
    repairDetails?: {
        notes?: string;
        photos?: string[];
        videoUrl?: string;
    };
}

export interface UserProfile {
    id: string;
    name: string;
    role: 'customer' | 'technician' | 'admin' | 'supplier';
    phoneNumber: string;
    email?: string;
}

export interface Message {
    id: string; // or _id
    conversationId: string;
    senderId: string;
    senderRole: string;
    content: string;
    messageType: 'text' | 'image' | 'system';
    timestamp: string;
    isRead: boolean;
    sender?: {
        name: string;
        profileImage?: string;
    };
}
