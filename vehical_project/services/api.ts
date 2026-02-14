import { BillItem, JobStatus, ServiceRequest } from '@/types/models';
import { STORAGE_KEYS, StorageHelper } from '@/utils/storage';

const BASE_URL = 'https://api.papaz.com/v1'; // Mock API URL (Logical only)

// Initial Seed Data
const SEED_DATA = {
    JOBS: [
        {
            id: '#JO-902',
            vehicleId: 'v-seed-1',
            vehicleModel: 'Honda City 2022', // Flattened for UI easy access
            description: 'Engine making weird noise when accelerating.',
            status: 'pending' as JobStatus,
            createdAt: new Date().toISOString(),
            technicianId: undefined,
            technicianName: undefined,
            garageName: undefined,
            photos: ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80'],
            voiceNote: null,
            quote: undefined,
            bill: undefined,
            address: '123, MG Road, Bangalore',
            customerPhone: '+919988776655',
            partsSource: undefined
        }
    ] as ServiceRequest[],
    INVENTORY: [
        { id: 'sp1', name: 'Brake Pads (Honda City)', type: 'Car', price: 1200, quantity: 15, deliveryTime: '2 hrs', shop: 'Genuine Parts Co.', icon: 'disc' },
        { id: 'sp2', name: 'Engine Oil 5W-40', type: 'Car', price: 3200, quantity: 8, deliveryTime: '1 hr', shop: 'Castrol Hub', icon: 'water' },
        { id: 'sp3', name: 'Chain Lube', type: 'Bike', price: 450, quantity: 40, deliveryTime: '30 mins', shop: 'AutoMart', icon: 'spray' }
    ]
};

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const API_ENDPOINTS = {
    JOBS: {
        GET_ALL: '/technician/jobs',
        CREATE: '/customer/jobs/create',
        ACCEPT: (id: string) => `/technician/jobs/${id}/accept`,
        ARRIVED: (id: string) => `/technician/jobs/${id}/arrived`,
        QUOTE: (id: string) => `/technician/jobs/${id}/quote`,
        QUOTE_RESPOND: (id: string) => `/customer/jobs/${id}/quote/respond`,
        BILL_RESPOND: (id: string) => `/customer/jobs/${id}/bill/respond`,
        UPDATE_STATUS: (id: string) => `/technician/jobs/${id}/status`,
        COMPLETE: (id: string) => `/technician/jobs/${id}/complete`,
        SEND_BILL: (id: string) => `/technician/jobs/${id}/bill`
    },
    VEHICLE: {
        GET_ALL: '/vehicles',
        GET_HISTORY: (id: string) => `/vehicles/${id}/history`,
        SCAN_QR: '/vehicles/scan',
        REGISTER: '/vehicles/register'
    },
    INVENTORY: {
        GET: '/technician/inventory',
        ADD: '/technician/inventory/add',
        REQUEST_PART: '/technician/parts/request'
    },
    ADMIN: {
        STATS: '/admin/stats',
        DASHBOARD: '/admin/dashboard',
        PENDING_USERS: {
            GET: '/admin/users/pending',
            APPROVE: (id: string) => `/admin/users/${id}/approve`,
            REJECT: (id: string) => `/admin/users/${id}/reject`
        },
        JOBS: '/admin/jobs',
        SETTINGS: '/admin/settings'
    },
    CUSTOMER: {
        GET_DATA: '/customer/data'
    },
    SUPPLIER: {
        INVENTORY: {
            GET: '/supplier/inventory',
            ADD: '/supplier/inventory/add',
            UPDATE: (id: string) => `/supplier/inventory/${id}`,
            DELETE: (id: string) => `/supplier/inventory/${id}`
        },
        ORDERS: {
            GET: '/supplier/orders',
            ACTION: (id: string) => `/supplier/orders/${id}/action`,
            SEND_WHOLESALE: '/supplier/wholesale/request',
            GET_WHOLESALE: '/supplier/wholesale/orders'
        }
    }
};

class ApiService {

    // Helper to simulate network delay
    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async request<T>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<T> {
        console.log(`[API] ${method} ${endpoint}`, body);
        await this.delay(400); // Simulate network lag
        return this.mockResponse(endpoint, method, body);
    }

    private async mockResponse(endpoint: string, method: string, body: any): Promise<any> {
        // --- Persistence Logic Wrapper ---

        // Customer: Create Job
        if (endpoint === API_ENDPOINTS.JOBS.CREATE && method === 'POST') {
            const jobs = await StorageHelper.get<ServiceRequest[]>(STORAGE_KEYS.JOBS, SEED_DATA.JOBS);
            const vehicles = await StorageHelper.get<any[]>(STORAGE_KEYS.VEHICLES, []);

            const selectedVehicle = vehicles.find((v: any) => v.id === body.vehicleId);
            const vehicleModelStr = selectedVehicle
                ? `${selectedVehicle.make || ''} ${selectedVehicle.model || ''}`.trim()
                : 'Unknown Vehicle';

            const newJob: ServiceRequest = {
                id: `#JO-${Math.floor(Math.random() * 10000)}`,
                vehicleId: body.vehicleId,
                description: body.description,
                status: 'pending',
                createdAt: new Date().toISOString(),
                technicianId: undefined,
                technicianName: undefined,
                garageName: undefined,
                vehicleModel: vehicleModelStr,
                address: body.address,
                customerPhone: body.customerPhone || '+919876543210',
                photos: body.photos || [],
                voiceNote: body.voiceNote || null,
                quote: undefined,
                bill: undefined
            };

            await StorageHelper.set(STORAGE_KEYS.JOBS, [newJob, ...jobs]);
            return { success: true, job: newJob };
        }

        // Technician: Job Actions
        if (endpoint.includes('/technician/jobs')) {
            const jobs = await StorageHelper.get<ServiceRequest[]>(STORAGE_KEYS.JOBS, SEED_DATA.JOBS);
            const jobId = endpoint.split('/')[3];
            const jobIndex = jobs.findIndex((j) => j.id === jobId);

            // If we are listing all jobs
            if (endpoint === API_ENDPOINTS.JOBS.GET_ALL) {
                return jobs;
            }

            if (jobIndex !== -1) {
                const job = jobs[jobIndex];

                // Accept
                if (endpoint.includes('/accept')) {
                    job.status = 'accepted';
                    job.technicianName = 'Alex Pro';
                }

                // Arrived
                if (endpoint.includes('/arrived')) {
                    job.status = 'arrived';
                }

                // Send Quote
                if (endpoint.includes('/quote') && !endpoint.includes('respond')) {
                    job.status = 'quote_pending';
                    job.quote = {
                        items: body.items,
                        laborAmount: body.labor,
                        totalAmount: body.items.reduce((s: number, i: any) => s + i.total, 0) + body.labor,
                        status: 'pending'
                    };
                }

                // Send Bill (Completion)
                if (endpoint.includes('/bill')) {
                    job.status = 'billing_pending';
                    job.bill = {
                        id: `BIL-${Date.now()}`,
                        items: body.items,
                        laborAmount: body.labor,
                        totalAmount: body.items.reduce((s: number, i: any) => s + i.total, 0) + body.labor,
                        status: 'pending',
                        createdAt: new Date().toISOString()
                    };
                }

                // Status Update (Generic)
                if (endpoint.includes('/status')) {
                    job.status = body.status;
                    if (body.status === 'completed' && job.bill) {
                        job.bill.status = 'paid';
                        if (!job.completedAt) job.completedAt = new Date().toISOString();
                    }
                }

                // Complete
                if (endpoint.includes('/complete')) {
                    job.status = 'completed';
                    job.completedAt = new Date().toISOString();
                }

                jobs[jobIndex] = job;
                await StorageHelper.set(STORAGE_KEYS.JOBS, jobs);
                return { success: true };
            }
        }

        // Customer: Respond to Quote
        if (endpoint.includes('/customer/jobs') && endpoint.includes('/quote/respond')) {
            const jobs = await StorageHelper.get<ServiceRequest[]>(STORAGE_KEYS.JOBS, SEED_DATA.JOBS);
            const jobId = endpoint.split('/')[3];
            const jobIndex = jobs.findIndex((j) => j.id === jobId);

            if (jobIndex !== -1) {
                const job = jobs[jobIndex];
                if (body.response === 'reject') {
                    job.status = 'cancelled';
                } else if (body.response === 'accept_with_parts') {
                    job.status = 'parts_required';
                    job.partsSource = 'technician';
                } else if (body.response === 'accept_own_parts') {
                    job.status = 'in_progress';
                    job.partsSource = 'customer';
                } else if (body.response === 'approve') {
                    job.status = 'parts_required';
                } else {
                    job.status = 'in_progress';
                }

                jobs[jobIndex] = job;
                await StorageHelper.set(STORAGE_KEYS.JOBS, jobs);
            }
            return { success: true };
        }

        // Customer: Respond to Bill
        if (endpoint.includes('/customer/jobs') && endpoint.includes('/bill/respond')) {
            const jobs = await StorageHelper.get<ServiceRequest[]>(STORAGE_KEYS.JOBS, SEED_DATA.JOBS);
            const jobId = endpoint.split('/')[3];
            const jobIndex = jobs.findIndex((j) => j.id === jobId);

            if (jobIndex !== -1) {
                const job = jobs[jobIndex];
                if (body.response === 'approve') {
                    if (job.bill) {
                        job.bill.status = body.paymentMethod === 'online' ? 'paid' : 'pending';
                        if (body.paymentMethod === 'online') {
                            job.status = 'completed';
                            job.completedAt = new Date().toISOString();
                        }
                    }
                } else {
                    if (job.bill) job.bill.status = 'rejected';
                }

                jobs[jobIndex] = job;
                await StorageHelper.set(STORAGE_KEYS.JOBS, jobs);
            }
            return { success: true };
        }

        // Merged into Admin Stats block below to prevent conflict

        if (endpoint === API_ENDPOINTS.INVENTORY.REQUEST_PART && method === 'POST') {
            if (body.jobId) {
                const jobs = await StorageHelper.get<ServiceRequest[]>(STORAGE_KEYS.JOBS, SEED_DATA.JOBS);
                const jobIndex = jobs.findIndex(j => j.id === body.jobId);
                if (jobIndex !== -1) {
                    jobs[jobIndex].status = 'parts_ordered';
                    await StorageHelper.set(STORAGE_KEYS.JOBS, jobs);
                }
            }

            // Create Supplier Order
            const orders = await StorageHelper.get<any[]>(STORAGE_KEYS.ORDERS, []);
            let partDetails = { name: body.customDetails?.name || 'Unknown Part', price: 100, type: 'Car' };

            if (body.productId) {
                const inventory = await StorageHelper.get<any[]>(STORAGE_KEYS.INVENTORY, SEED_DATA.INVENTORY);
                const found = inventory.find((p: any) => p.id === body.productId);
                if (found) partDetails = found;
            }

            const newOrder = {
                id: `ORD-${Date.now()}`,
                partName: partDetails.name,
                quantity: body.quantity,
                amount: partDetails.price * body.quantity,
                urgency: 'High', // Default for now
                status: 'pending',
                location: 'Apex Performance HQ', // Mock Tech Location
                type: partDetails.type,
                createdAt: new Date().toISOString()
            };

            await StorageHelper.set(STORAGE_KEYS.ORDERS, [newOrder, ...orders]);
            return { success: true };
        }

        // Supplier Inventory
        if (endpoint.includes('/supplier/inventory')) {
            let inventory = await StorageHelper.get<any[]>(STORAGE_KEYS.INVENTORY, SEED_DATA.INVENTORY);

            if (endpoint.includes('/add') && method === 'POST') {
                const newProduct = { ...body, id: Math.random().toString(36).substr(2, 9) };
                inventory.push(newProduct);
                await StorageHelper.set(STORAGE_KEYS.INVENTORY, inventory);
                return newProduct;
            }
            if (method === 'GET') {
                return inventory;
            }
        }

        // Supplier Orders Actions
        if (endpoint.includes('/supplier/orders') && endpoint.includes('/action')) {
            const orders = await StorageHelper.get<any[]>(STORAGE_KEYS.ORDERS, []);
            const orderId = endpoint.split('/')[3];
            const orderIndex = orders.findIndex(o => o.id === orderId);

            if (orderIndex !== -1) {
                if (body.action === 'reject') {
                    orders[orderIndex].status = 'rejected';
                } else if (body.action === 'accept') {
                    orders[orderIndex].status = 'accepted';
                } else if (body.action === 'update_status') {
                    orders[orderIndex].status = body.status;
                }
                await StorageHelper.set(STORAGE_KEYS.ORDERS, orders);
                return { success: true };
            }
            return { success: false };
        }

        // Supplier Orders List (GET)
        if (endpoint === API_ENDPOINTS.SUPPLIER.ORDERS.GET && method === 'GET') {
            return StorageHelper.get<any[]>(STORAGE_KEYS.ORDERS, []);
        }

        // Supplier: Wholesale Requests (Consolidated)
        if (endpoint === API_ENDPOINTS.SUPPLIER.ORDERS.SEND_WHOLESALE && method === 'POST') {
            const wholesaleOrders = await StorageHelper.get<any[]>(STORAGE_KEYS.WHOLESALE_ORDERS, []);
            const newOrder = {
                id: `W-ORD-${Math.floor(Math.random() * 100000)}`,
                supplierName: body.supplierName,
                items: body.items,
                status: 'pending',
                type: 'wholesale_custom',
                createdAt: new Date().toISOString(),
                technicianId: 'T-982',
                technicianName: 'Garage Pro'
            };

            wholesaleOrders.unshift(newOrder);
            await StorageHelper.set(STORAGE_KEYS.WHOLESALE_ORDERS, wholesaleOrders);
            return { success: true, order: newOrder };
        }

        if (endpoint === API_ENDPOINTS.SUPPLIER.ORDERS.GET_WHOLESALE && method === 'GET') {
            return StorageHelper.get<any[]>(STORAGE_KEYS.WHOLESALE_ORDERS, [
                {
                    id: 'W-ORD-882',
                    supplierName: 'FastTrack Spares',
                    items: [
                        { id: '1', name: 'Brake Pads', company: 'Brembo', partNumber: 'BR-901', qty: '4' },
                        { id: '2', name: 'Disc Rotors', company: 'Brembo', partNumber: 'DR-102', qty: '2' }
                    ],
                    status: 'pending',
                    type: 'wholesale_custom',
                    createdAt: new Date().toISOString(),
                    technicianId: 'T-982',
                    technicianName: 'Alex Auto Garage'
                }
            ]);
        }

        // Vehicle: Actions
        if (endpoint.includes('/vehicles')) {
            const vehicles = await StorageHelper.get<any[]>(STORAGE_KEYS.VEHICLES, []);

            if (endpoint === API_ENDPOINTS.VEHICLE.GET_ALL && method === 'GET') {
                return vehicles;
            }

            if (endpoint === API_ENDPOINTS.VEHICLE.REGISTER && method === 'POST') {
                const id = Math.random().toString(36).substr(2, 9);
                const newVehicle = {
                    ...body,
                    id,
                    qrCode: `VEH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                };
                await StorageHelper.set(STORAGE_KEYS.VEHICLES, [newVehicle, ...vehicles]);
                return { success: true, vehicle: newVehicle };
            }
        }

        // Admin Endpoints
        if (endpoint.includes('/admin')) {
            if (endpoint === API_ENDPOINTS.ADMIN.STATS && method === 'GET') {
                const jobs = await StorageHelper.get<ServiceRequest[]>(STORAGE_KEYS.JOBS, SEED_DATA.JOBS);
                return {
                    totalRevenue: 125000, // Mock revenue
                    platformCommission: 12500,
                    activeJobs: jobs.filter(j => !['completed', 'cancelled'].includes(j.status)).length,
                    pendingApprovals: 2,
                    pendingCerts: Math.floor(Math.random() * 5),
                    systemHealth: 'ONLINE',
                    activeNodes: 12 + Math.floor(Math.random() * 3)
                };
            }
            if (endpoint === API_ENDPOINTS.ADMIN.JOBS && method === 'GET') {
                const jobs = await StorageHelper.get<ServiceRequest[]>(STORAGE_KEYS.JOBS, SEED_DATA.JOBS);
                return jobs.map(j => ({
                    id: j.id,
                    status: j.status === 'completed' ? 'Completed' : j.status === 'in_progress' ? 'In Progress' : 'Pending',
                    type: 'Regular Service',
                    customer: 'Customer',
                    tech: 'Technician'
                }));
            }
            if (endpoint === API_ENDPOINTS.ADMIN.PENDING_USERS.GET) {
                return [
                    { id: 'u1', name: 'Speedy Fix', businessName: 'Speedy Fix Garage', type: 'technician', location: 'New York', status: 'pending', appliedDate: new Date().toISOString(), documents: [] },
                    { id: 'u2', name: 'AutoParts Plus', businessName: 'AutoParts Plus', type: 'supplier', location: 'New Jersey', status: 'pending', appliedDate: new Date().toISOString(), documents: [] }
                ];
            }
            if (endpoint === API_ENDPOINTS.ADMIN.SETTINGS) {
                return { maintenanceMode: false, allowRegistrations: true, commissionRate: 15, payoutSchedule: 'Weekly', currency: 'USD' };
            }
        }

        return { success: true };
    }

    // --- Public Methods ---

    async createServiceRequest(vehicleId: string, description: string, photos: string[], voiceNote: string | null, address: string): Promise<any> {
        return this.request(API_ENDPOINTS.JOBS.CREATE, 'POST', { vehicleId, description, photos, voiceNote, address });
    }

    async getJobs(): Promise<ServiceRequest[]> {
        return this.request<ServiceRequest[]>(API_ENDPOINTS.JOBS.GET_ALL);
    }

    async acceptJob(jobId: string) {
        return this.request(API_ENDPOINTS.JOBS.ACCEPT(jobId), 'POST');
    }

    async markArrived(jobId: string) {
        return this.request(API_ENDPOINTS.JOBS.ARRIVED(jobId), 'POST');
    }

    async sendQuote(jobId: string, items: BillItem[], labor: number) {
        return this.request(API_ENDPOINTS.JOBS.QUOTE(jobId), 'POST', { items, labor });
    }

    async sendBill(jobId: string, items: BillItem[], labor: number) {
        return this.request(API_ENDPOINTS.JOBS.SEND_BILL(jobId), 'POST', { items, labor });
    }

    async respondToQuote(jobId: string, response: 'accept_with_parts' | 'accept_own_parts' | 'reject' | 'approve') {
        return this.request(API_ENDPOINTS.JOBS.QUOTE_RESPOND(jobId), 'POST', { response });
    }

    async respondToBill(jobId: string, response: 'approve' | 'reject', paymentMethod?: 'cash' | 'online') {
        return this.request(API_ENDPOINTS.JOBS.BILL_RESPOND(jobId), 'POST', { response, paymentMethod });
    }

    async updateJobStatus(jobId: string, status: string) {
        return this.request(API_ENDPOINTS.JOBS.UPDATE_STATUS(jobId), 'PUT', { status });
    }

    async searchGlobalInventory(query: string = '') {
        const inventory = await StorageHelper.get<any[]>(STORAGE_KEYS.INVENTORY, SEED_DATA.INVENTORY);
        if (!query) return inventory;

        const lowerQuery = query.toLowerCase();
        const queryParts = lowerQuery.split(' ').filter(p => p.length > 2); // Filter out short words

        return inventory.filter((i: any) => {
            const name = i.name.toLowerCase();
            // Exact substring match (either way)
            if (name.includes(lowerQuery) || lowerQuery.includes(name)) return true;

            // Check if at least one significant keyword matches
            if (queryParts.length > 0) {
                return queryParts.some(part => name.includes(part));
            }
            return false;
        });
    }

    async requestPart(productId: string, quantity: number, supplierId: string, jobId?: string, customDetails?: any) {
        return this.request(API_ENDPOINTS.INVENTORY.REQUEST_PART, 'POST', { productId, quantity, supplierId, jobId, customDetails });
    }

    async requestCustomPart(details: { name: string, brand?: string, partNumber?: string, description?: string, quantity: number, supplierId?: string }) {
        return this.request(API_ENDPOINTS.INVENTORY.REQUEST_PART, 'POST', {
            isCustom: true,
            ...details
        });
    }

    async getVehicleHistory(vehicleId: string) {
        return {
            id: vehicleId,
            history: [
                { date: '2023-12-10', type: 'Service', details: 'Oil change', cost: 4500 }
            ]
        };
    }

    async registerVehicle(data: any): Promise<any> {
        return this.request(API_ENDPOINTS.VEHICLE.REGISTER, 'POST', data);
    }

    async getVehicles(): Promise<any[]> {
        return this.request<any[]>(API_ENDPOINTS.VEHICLE.GET_ALL);
    }

    // --- Supplier Methods ---

    async getSupplierInventory() {
        return this.request(API_ENDPOINTS.SUPPLIER.INVENTORY.GET);
    }

    async getSupplierOrders() {
        return this.request(API_ENDPOINTS.SUPPLIER.ORDERS.GET);
    }

    async addSupplierProduct(product: any) {
        return this.request(API_ENDPOINTS.SUPPLIER.INVENTORY.ADD, 'POST', product);
    }

    async updateSupplierOrder(orderId: string, action: string, status?: string) {
        return this.request(API_ENDPOINTS.SUPPLIER.ORDERS.ACTION(orderId), 'POST', { action, status });
    }

    async requestWholesale(supplierName: string, items: any[]) {
        return this.request(API_ENDPOINTS.SUPPLIER.ORDERS.SEND_WHOLESALE, 'POST', { supplierName, items });
    }

    async getWholesaleOrders(): Promise<any[]> {
        return this.request<any[]>(API_ENDPOINTS.SUPPLIER.ORDERS.GET_WHOLESALE, 'GET');
    }

    async getAdminStats() {
        return this.request(API_ENDPOINTS.ADMIN.STATS);
    }

    async getAdminJobs() {
        return this.request(API_ENDPOINTS.ADMIN.JOBS);
    }

    async getAdminDashboardCore() {
        return this.request(API_ENDPOINTS.ADMIN.STATS);
    }

    async getAdminPendingUsers() {
        return this.request(API_ENDPOINTS.ADMIN.PENDING_USERS.GET);
    }

    async getAdminSettings() {
        return this.request(API_ENDPOINTS.ADMIN.SETTINGS);
    }

    async approveAdminUser(id: string) {
        return this.request(API_ENDPOINTS.ADMIN.PENDING_USERS.APPROVE(id), 'POST');
    }

    async rejectAdminUser(id: string) {
        return this.request(API_ENDPOINTS.ADMIN.PENDING_USERS.REJECT(id), 'POST');
    }

    async updateAdminSettings(settings: any) {
        return this.request(API_ENDPOINTS.ADMIN.SETTINGS, 'POST', settings);
    }
}

export const api = new ApiService();
