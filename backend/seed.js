const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Technician = require('./models/Technician');
const ServiceRequest = require('./models/ServiceRequest');
const Vehicle = require('./models/Vehicle');
const Product = require('./models/Product');
const Transaction = require('./models/Transaction');
const Supplier = require('./models/Supplier');
const Order = require('./models/Order');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vehical_project';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

const DEFAULT_STEPS = [
    { title: 'Booking Confirmed', status: 'completed' },
    { title: 'Technician Assigned', status: 'pending' },
    { title: 'Inspection Started', status: 'pending' },
    { title: 'Quote Shared', status: 'pending' },
    { title: 'Repair in Progress', status: 'pending' },
    { title: 'Quality Check', status: 'pending' },
    { title: 'Ready for Delivery', status: 'pending' }
];

const completeStepsTo = (index) => {
    return DEFAULT_STEPS.map((step, i) => ({
        ...step,
        status: i <= index ? 'completed' : 'pending',
        time: i <= index ? new Date(Date.now() - (index - i) * 3600000) : null
    }));
};

const seedData = async () => {
    console.log('Starting seed process...');

    console.log('Clearing old data...');
    await Promise.all([
        User.deleteMany({}),
        Customer.deleteMany({}),
        Technician.deleteMany({}),
        ServiceRequest.deleteMany({}),
        Vehicle.deleteMany({}),
        Product.deleteMany({}),
        Transaction.deleteMany({}),
        Supplier.deleteMany({}),
        Order.deleteMany({}),
        Message.deleteMany({}),
        Notification.deleteMany({})
    ]);

    // ---------------------------------------------------------
    // 0. Create ADMIN
    // ---------------------------------------------------------
    console.log('Generating Admin...');
    await User.create({
        phoneNumber: '1234567890',
        role: 'admin',
        profileCompleted: true,
        isRegistered: true
    });

    // ---------------------------------------------------------
    // 1. Create CUSTOMERS
    // ---------------------------------------------------------
    console.log('Generating Customers...');

    const custUser1 = await User.create({
        phoneNumber: '9876543210',
        role: 'customer',
        profileCompleted: true,
        isRegistered: true
    });

    const customer1 = await Customer.create({
        user: custUser1._id,
        fullName: 'Rahul Sharma',
        email: 'rahul@example.com',
        phoneNumber: '9876543210',
        address: '12th Main, Indiranagar, Bangalore',
        city: 'Bangalore',
        locationName: 'Indiranagar',
        location: {
            type: 'Point',
            coordinates: [77.6408, 12.9784] // [lng, lat]
        },
        walletBalance: 25000.00,
        savedAddresses: [
            {
                label: 'Home',
                address: '12th Main, Indiranagar, Bangalore',
                addressLine1: '12th Main',
                city: 'Bangalore',
                state: 'Karnataka',
                zipCode: '560038',
                phone: '9876543210',
                icon: 'home',
                location: {
                    type: 'Point',
                    coordinates: [77.6408, 12.9784]
                }
            },
            {
                label: 'Office',
                address: 'Embassy GolfLinks, Domlur, Bangalore',
                addressLine1: 'Embassy GolfLinks',
                city: 'Bangalore',
                state: 'Karnataka',
                zipCode: '560071',
                phone: '9876543210',
                icon: 'briefcase',
                location: {
                    type: 'Point',
                    coordinates: [77.6381, 12.9624]
                }
            }
        ]
    });

    const custUser2 = await User.create({
        phoneNumber: '9876543211',
        role: 'customer',
        profileCompleted: true,
        isRegistered: true
    });

    await Customer.create({
        user: custUser2._id,
        fullName: 'Priya Patel',
        email: 'priya@example.com',
        phoneNumber: '9876543211',
        address: 'Koramangala, Bangalore',
        city: 'Bangalore',
        locationName: 'Koramangala',
        location: {
            type: 'Point',
            coordinates: [77.6245, 12.9352]
        },
        walletBalance: 3000.00
    });

    // ---------------------------------------------------------
    // 2. Create TECHNICIANS
    // ---------------------------------------------------------
    console.log('Generating Technicians...');

    const techUser1 = await User.create({
        phoneNumber: '9999999999',
        role: 'technician',
        profileCompleted: true,
        isRegistered: true
    });

    const tech1 = await Technician.create({
        user: techUser1._id,
        fullName: 'Alex Mechanic',
        garageName: 'Rapid Auto Fix',
        address: 'MG Road, Bangalore',
        city: 'Bangalore',
        locationName: 'MG Road',
        location: {
            type: 'Point',
            coordinates: [77.5896, 12.9750] // [lng, lat]
        },
        serviceRadius: '15',
        vehicleTypes: ['Car', 'Bike'],
        isApproved: true,
        isOnline: true,
        walletBalance: 12500.00,
        totalEarnings: 85000.00,
        rating: 4.8,
        profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop',
        documents: { idProof: true, garagePhoto: true, license: true }
    });

    const techUser2 = await User.create({
        phoneNumber: '8888888888',
        role: 'technician',
        profileCompleted: true,
        isRegistered: true
    });

    const tech2 = await Technician.create({
        user: techUser2._id,
        fullName: 'Suresh Mechanic',
        garageName: 'City Garage Services',
        address: 'HSR Layout, Bangalore',
        city: 'Bangalore',
        locationName: 'HSR Layout',
        location: {
            type: 'Point',
            coordinates: [77.6446, 12.9121] // [lng, lat]
        },
        serviceRadius: '10',
        vehicleTypes: ['Car'],
        isApproved: true,
        isOnline: true,
        walletBalance: 5000.00,
        totalEarnings: 12000.00,
        rating: 4.5,
        profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
        documents: { idProof: true, garagePhoto: true, license: true }
    });

    // ---------------------------------------------------------
    // 2b. Create SUPPLIERS
    // ---------------------------------------------------------
    console.log('Generating Suppliers...');

    const supplierUser1 = await User.create({
        phoneNumber: '9900880077',
        role: 'supplier',
        profileCompleted: true,
        isRegistered: true
    });

    const supplier1 = await Supplier.create({
        user: supplierUser1._id,
        fullName: 'Sunil Kumar',
        storeName: 'FastTrack Spares',
        address: 'Koramangala 5th Block, Bangalore',
        city: 'Bangalore',
        locationName: 'Koramangala',
        location: {
            type: 'Point',
            coordinates: [77.6245, 12.9352] // [lng, lat]
        },
        email: 'sunil@fasttrack.com',
        phoneNumber: '9900880077',
        isApproved: true,
        walletBalance: 15400.00,
        revenue: 450000.00,
        rating: 4.7
    });

    const supplierUser2 = await User.create({
        phoneNumber: '9900880088',
        role: 'supplier',
        profileCompleted: true,
        isRegistered: true
    });

    await Supplier.create({
        user: supplierUser2._id,
        fullName: 'Rajesh Gupta',
        storeName: 'Gupta Auto Parts',
        address: '100ft Road, Indiranagar, Bangalore',
        city: 'Bangalore',
        locationName: 'Indiranagar',
        location: {
            type: 'Point',
            coordinates: [77.6411, 12.9716]
        },
        email: 'rajesh@guptaauto.com',
        phoneNumber: '9900880088',
        isApproved: true,
        walletBalance: 8000.00,
        revenue: 75000.00,
        rating: 4.5
    });

    const supplierUser3 = await User.create({
        phoneNumber: '9900880099',
        role: 'supplier',
        profileCompleted: true,
        isRegistered: true
    });

    await Supplier.create({
        user: supplierUser3._id,
        fullName: 'Amit Singh',
        storeName: 'Singh Spares & Accessories',
        address: 'ITPL Main Road, Whitefield, Bangalore',
        city: 'Bangalore',
        locationName: 'Whitefield',
        location: {
            type: 'Point',
            coordinates: [77.7499, 12.9698]
        },
        email: 'amit@singhspares.com',
        phoneNumber: '9900880099',
        isApproved: true,
        walletBalance: 3000.00,
        revenue: 25000.00,
        rating: 4.2
    });

    // ---------------------------------------------------------
    // 3. Create Vehicles
    // ---------------------------------------------------------
    console.log('Generating Vehicles...');

    const v1 = await Vehicle.create({
        customer: customer1._id,
        make: 'Honda',
        model: 'City',
        vehicleType: 'Car',
        year: '2021',
        registrationNumber: 'KA01AB1234',
        fuelType: 'Petrol',
        bsNorm: 'BS6',
        images: ['https://imgcdnblog.carbay.com/wp-content/uploads/2020/07/28135805/2020-Honda-City-3.jpg'],
        qrCode: 'VN-KA01AB1234'
    });

    const v2 = await Vehicle.create({
        customer: customer1._id,
        make: 'Royal Enfield',
        model: 'Classic 350',
        vehicleType: 'Bike',
        year: '2023',
        registrationNumber: 'KA03XY9999',
        fuelType: 'Petrol',
        images: ['https://bd.gaadicdn.com/processedimages/royal-enfield/classic-350/source/classic-3506131bb8720aa3.jpg'],
        qrCode: 'VN-KA03XY9999'
    });

    // ---------------------------------------------------------
    // 4. Create Store Products
    // ---------------------------------------------------------
    console.log('Generating Products...');
    const productsData = [
        {
            name: 'Exide Matrix Battery',
            price: 5499,
            category: 'Batteries',
            image: 'https://images.unsplash.com/photo-1620939511593-27765103d3c8?w=400&h=400&fit=crop',
            rating: 4.8,
            compatibleModels: ['Universal'],
            stock: 20,
            supplier: supplier1._id,
            description: 'High-performance car battery with long life.'
        },
        {
            name: 'Michelin Pilot Sport 4',
            price: 12200,
            category: 'Tires',
            image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=400&fit=crop',
            rating: 4.9,
            compatibleModels: ['Model 3', 'Civic', 'City'],
            stock: 12,
            supplier: supplier1._id,
            description: 'Superior grip and handling tires.'
        },
        {
            name: 'Castrol Edge 5W-40',
            price: 3800,
            category: 'Engine Oil',
            image: 'https://images.unsplash.com/photo-1635817235338-e67c9f806969?w=400&h=400&fit=crop',
            rating: 4.7,
            compatibleModels: ['Civic', 'City', 'Swift'],
            stock: 50,
            supplier: supplier1._id,
            description: 'Fully synthetic engine oil for modern engines.'
        },
        {
            name: 'Bosch Icon Wiper Blades',
            price: 1850,
            category: 'Accessories',
            image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop',
            rating: 4.5,
            compatibleModels: ['Universal'],
            stock: 30,
            supplier: supplier1._id,
            description: 'Clear visibility in all weather conditions.'
        },
        {
            name: 'Brembo Brake Pads',
            price: 6500,
            category: 'Brakes',
            image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
            rating: 5.0,
            compatibleModels: ['Swift', 'City', 'Civic'],
            stock: 8,
            supplier: supplier1._id,
            description: 'High-performance brake pads for safety.'
        }
    ];

    const createdProducts = await Product.insertMany(productsData);
    supplier1.products = createdProducts.map(p => p._id);
    await supplier1.save();

    // ---------------------------------------------------------
    // 5. Create Service Requests (Jobs)
    // ---------------------------------------------------------
    console.log('Generating Jobs...');

    // 1. BROADCAST JOB (Available for everyone nearby) - "Broadcasts" Tab
    await ServiceRequest.create({
        customer: customer1._id,
        vehicle: v1._id,
        vehicleModel: 'Honda City',
        vehicleNumber: 'KA01AB1234',
        description: '[BROADCAST] AC is not cooling properly, needs gas refill.',
        status: 'pending',
        technician: null, // Crucial for Broadcast
        location: {
            latitude: 12.9784,
            longitude: 77.6408,
            address: '12th Main, Indiranagar, Bangalore',
            type: 'Point',
            coordinates: [77.6408, 12.9784]
        },
        steps: completeStepsTo(0),
        createdAt: new Date()
    });

    // 2. DIRECT REQUEST for Tech 1 (Pending) - "My Requests" Tab
    await ServiceRequest.create({
        customer: customer1._id,
        vehicle: v2._id,
        vehicleModel: 'Royal Enfield Classic 350',
        vehicleNumber: 'KA03XY9999',
        description: '[DIRECT REQUEST] Need urgent brake check.',
        status: 'pending',
        technician: tech1._id, // Assigned specifically
        location: {
            latitude: 12.9784,
            longitude: 77.6408,
            address: '12th Main, Indiranagar, Bangalore',
            type: 'Point',
            coordinates: [77.6408, 12.9784]
        },
        steps: completeStepsTo(0),
        createdAt: new Date()
    });

    // 3. ACTIVE JOB for Tech 1 (In Progress) - "Active" Tab
    await ServiceRequest.create({
        customer: customer1._id,
        technician: tech1._id,
        vehicle: v1._id,
        vehicleModel: 'Honda City',
        vehicleNumber: 'KA01AB1234',
        description: '[ACTIVE] Engine rattling noise inspection.',
        status: 'in_progress',
        location: {
            latitude: 12.9784,
            longitude: 77.6408,
            address: '12th Main, Indiranagar, Bangalore',
            type: 'Point',
            coordinates: [77.6408, 12.9784]
        },
        steps: completeStepsTo(4), // Inspection & Quote done
        quote: {
            items: [
                { description: 'Engine Oil Change', quantity: 1, unitPrice: 1500, total: 1500, brand: 'Castrol', partNumber: 'C-5W40-001' },
                { description: 'Oil Filter', quantity: 1, unitPrice: 450, total: 450, brand: 'Bosch', partNumber: 'B-OF-882' }
            ],
            laborAmount: 1200,
            totalAmount: 3150,
            status: 'approved'
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    // 4. COMPLETED JOB for Tech 1 - "History" (or filtered out of Active)
    await ServiceRequest.create({
        customer: customer1._id,
        technician: tech1._id,
        vehicle: v2._id,
        vehicleModel: 'Royal Enfield Classic 350',
        vehicleNumber: 'KA03XY9999',
        description: '[COMPLETED] Chain lubrication and tightening.',
        status: 'completed',
        rating: 5,
        review: 'Excellent service!',
        location: {
            latitude: 12.9784,
            longitude: 77.6408,
            address: '12th Main, Indiranagar, Bangalore',
            type: 'Point',
            coordinates: [77.6408, 12.9784]
        },
        steps: completeStepsTo(6),
        billTotal: 800,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });


    // 5. JOB for Tech 2 (Billing Pending)
    const quote2 = {
        items: [
            { description: 'Chain Cleaning & Lube', quantity: 1, unitPrice: 500, total: 500, brand: 'Motul', partNumber: 'M-CC-12' },
            { description: 'Brake Pad Set', quantity: 1, unitPrice: 1200, total: 1200, brand: 'Brembo', partNumber: 'BR-BP-990' },
            { description: 'Note: Check tire pressure also', quantity: 1, unitPrice: 0, total: 0, isNote: true }
        ],
        laborAmount: 800,
        totalAmount: 2500,
        status: 'approved'
    };

    await ServiceRequest.create({
        customer: customer1._id,
        technician: tech2._id,
        vehicle: v2._id,
        vehicleModel: 'Royal Enfield Classic 350',
        vehicleNumber: 'KA03XY9999',
        description: 'Routine maintenance and brake check.',
        status: 'billing_pending',
        location: {
            latitude: 12.9121,
            longitude: 77.6446,
            address: 'Somasundarapalaya, HSR Layout',
            type: 'Point',
            coordinates: [77.6446, 12.9121]
        },
        steps: completeStepsTo(6),
        quote: quote2,
        bill: {
            ...quote2,
            status: 'pending',
            createdAt: new Date()
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    // ---------------------------------------------------------
    // 6. Create Wallet Transactions
    // ---------------------------------------------------------
    console.log('Generating Transactions...');
    await Transaction.create({
        customer: customer1._id,
        type: 'topup',
        amount: 25000.00,
        description: 'Initial Wallet Topup',
        status: 'completed',
        paymentMethod: 'online'
    });

    await Transaction.create({
        technician: tech1._id,
        type: 'earnings',
        amount: 12500.00,
        description: 'Initial Balance/Previous Earnings',
        status: 'completed',
        paymentMethod: 'wallet'
    });

    // ---------------------------------------------------------
    // 7. Create Some Orders for Supplier
    // ---------------------------------------------------------
    console.log('Generating Orders...');
    await Order.create({
        orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        supplier: supplier1._id,
        technician: tech1._id,
        items: [
            {
                product: createdProducts[0]._id,
                name: createdProducts[0].name,
                price: createdProducts[0].price,
                quantity: 1,
                image: createdProducts[0].image,
                brand: 'Exide',
                partNumber: 'MTX-55',
                description: 'Exide Matrix Battery'
            }
        ],
        totalAmount: createdProducts[0].price,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'wallet',
        createdAt: new Date()
    });

    // Custom Quote Request (Inquiry)
    await Order.create({
        orderId: 'REQ-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        customer: customer1._id,
        supplier: supplier1._id,
        items: [
            {
                name: 'Custom Alloy Wheels',
                price: 0,
                quantity: 4,
                description: 'Black Matte finish, 17 inch for Honda City',
                brand: 'Enkei',
                partNumber: 'ENK-17-BLK'
            }
        ],
        totalAmount: 0,
        status: 'inquiry',
        paymentStatus: 'pending',
        createdAt: new Date()
    });

    console.log('Seed Complete!');
    console.log('-----------------------------------');
    console.log('Customer 1:   9876543210 (Rahul)');
    console.log('Customer 2:   9876543211 (Priya)');
    console.log('Technician 1: 9999999999 (Alex)');
    console.log('Technician 2: 8888888888 (Suresh)');
    console.log('Supplier 1:   9900880077 (Sunil)');
    console.log('Supplier 2:   9900880088 (Rajesh)');
    console.log('Supplier 3:   9900880099 (Amit)');
    console.log('Admin:        1234567890 (Admin)');
    console.log('-----------------------------------');
};

const runSeed = async () => {
    try {
        await connectDB();
        await seedData();
        process.exit(0);
    } catch (error) {
        console.error('Seed Failed:', error);
        process.exit(1);
    }
};

runSeed();
