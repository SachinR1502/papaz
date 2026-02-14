const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Technician = require('./models/Technician');
const Supplier = require('./models/Supplier');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vehical_project';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

const clearAllData = async () => {
    console.log('🗑️  Clearing ALL data from database...');

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
        console.log(`   ✓ Cleared ${collection.collectionName}`);
    }

    console.log('✅ All data cleared successfully!\n');
};

const seedUsers = async () => {
    console.log('👥 Creating Users...\n');

    // ---------------------------------------------------------
    // 1. ADMIN USER
    // ---------------------------------------------------------
    console.log('Creating Admin...');
    await User.create({
        phoneNumber: '1234567890',
        role: 'admin',
        profileCompleted: true,
        isRegistered: true
    });
    console.log('   ✓ Admin created: 1234567890\n');

    // ---------------------------------------------------------
    // 2. CUSTOMER USERS
    // ---------------------------------------------------------
    console.log('Creating Customers...');

    const custUser1 = await User.create({
        phoneNumber: '9876543210',
        role: 'customer',
        profileCompleted: true,
        isRegistered: true
    });

    await Customer.create({
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
        walletBalance: 5000.00,
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
            }
        ]
    });
    console.log('   ✓ Customer 1: 9876543210 (Rahul Sharma)');

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
    console.log('   ✓ Customer 2: 9876543211 (Priya Patel)\n');

    // ---------------------------------------------------------
    // 3. TECHNICIAN USERS
    // ---------------------------------------------------------
    console.log('Creating Technicians...');

    const techUser1 = await User.create({
        phoneNumber: '9999999999',
        role: 'technician',
        profileCompleted: true,
        isRegistered: true
    });

    await Technician.create({
        user: techUser1._id,
        fullName: 'Alex Mechanic',
        garageName: 'Rapid Auto Fix',
        address: 'MG Road, Bangalore',
        city: 'Bangalore',
        locationName: 'MG Road',
        location: {
            type: 'Point',
            coordinates: [77.5896, 12.9750]
        },
        serviceRadius: '15',
        vehicleTypes: ['Car', 'Bike'],
        isApproved: true,
        isOnline: true,
        walletBalance: 2500.00,
        totalEarnings: 15000.00,
        rating: 4.8,
        profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop',
        documents: { idProof: true, garagePhoto: true, license: true }
    });
    console.log('   ✓ Technician 1: 9999999999 (Alex Mechanic)');

    const techUser2 = await User.create({
        phoneNumber: '8888888888',
        role: 'technician',
        profileCompleted: true,
        isRegistered: true
    });

    await Technician.create({
        user: techUser2._id,
        fullName: 'Suresh Kumar',
        garageName: 'City Garage Services',
        address: 'HSR Layout, Bangalore',
        city: 'Bangalore',
        locationName: 'HSR Layout',
        location: {
            type: 'Point',
            coordinates: [77.6446, 12.9121]
        },
        serviceRadius: '10',
        vehicleTypes: ['Car'],
        isApproved: true,
        isOnline: true,
        walletBalance: 1500.00,
        totalEarnings: 8000.00,
        rating: 4.5,
        profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
        documents: { idProof: true, garagePhoto: true, license: true }
    });
    console.log('   ✓ Technician 2: 8888888888 (Suresh Kumar)\n');

    // ---------------------------------------------------------
    // 4. SUPPLIER USERS
    // ---------------------------------------------------------
    console.log('Creating Suppliers...');

    const supplierUser1 = await User.create({
        phoneNumber: '9900880077',
        role: 'supplier',
        profileCompleted: true,
        isRegistered: true
    });

    await Supplier.create({
        user: supplierUser1._id,
        fullName: 'Sunil Kumar',
        storeName: 'FastTrack Spares',
        address: 'Koramangala 5th Block, Bangalore',
        city: 'Bangalore',
        locationName: 'Koramangala',
        location: {
            type: 'Point',
            coordinates: [77.6245, 12.9352]
        },
        email: 'sunil@fasttrack.com',
        phoneNumber: '9900880077',
        isApproved: true,
        walletBalance: 5000.00,
        revenue: 50000.00,
        rating: 4.7
    });
    console.log('   ✓ Supplier 1: 9900880077 (Sunil Kumar - FastTrack Spares)\n');

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
    console.log('   ✓ Supplier 2: 9900880088 (Rajesh Gupta - Gupta Auto Parts)\n');

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
    console.log('   ✓ Supplier 3: 9900880099 (Amit Singh - Singh Spares)\n');

    console.log('✅ User seeding complete!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('👤 Admin:        1234567890');
    console.log('👥 Customer 1:   9876543210 (Rahul)');
    console.log('👥 Customer 2:   9876543211 (Priya)');
    console.log('🔧 Technician 1: 9999999999 (Alex)');
    console.log('🔧 Technician 2: 8888888888 (Suresh)');
    console.log('🏪 Supplier 1:   9900880077 (Sunil)');
    console.log('🏪 Supplier 2:   9900880088 (Rajesh)');
    console.log('🏪 Supplier 3:   9900880099 (Amit)');
    console.log('═══════════════════════════════════════\n');
};

const runSeed = async () => {
    try {
        await connectDB();
        await clearAllData();
        await seedUsers();
        console.log('🎉 Seed process completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed Failed:', error);
        process.exit(1);
    }
};

runSeed();
