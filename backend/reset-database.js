const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import all models to ensure they're registered
const User = require('./models/User');
const Customer = require('./models/Customer');
const Technician = require('./models/Technician');
const Supplier = require('./models/Supplier');
const ServiceRequest = require('./models/ServiceRequest');
const Product = require('./models/Product');
const Vehicle = require('./models/Vehicle');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const Settings = require('./models/Settings');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');
const Device = require('./models/Device');
const File = require('./models/File');
const Counter = require('./models/Counter');

const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function resetDatabase() {
    try {
        console.log('🔄 Starting database reset...\n');

        // Connect to MongoDB
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/vehical_app';
        console.log(`📡 Connecting to: ${mongoURI}`);

        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB\n');

        // Get all collections
        const collections = await mongoose.connection.db.collections();
        console.log(`📋 Found ${collections.length} collections\n`);

        // Drop all collections
        console.log('🗑️  Dropping all collections...');
        for (let collection of collections) {
            const collectionName = collection.collectionName;
            try {
                await collection.drop();
                console.log(`   ✓ Dropped: ${collectionName}`);
            } catch (error) {
                console.log(`   ⚠️  Could not drop ${collectionName}: ${error.message}`);
            }
        }

        console.log('\n✅ All collections dropped successfully\n');

        // Clear uploads directory
        console.log('🗑️  Clearing uploads directory...');
        if (fs.existsSync(UPLOADS_DIR)) {
            const files = fs.readdirSync(UPLOADS_DIR);
            let deletedCount = 0;

            for (const file of files) {
                const filePath = path.join(UPLOADS_DIR, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    // Remove directory recursively
                    fs.rmSync(filePath, { recursive: true, force: true });
                    deletedCount++;
                } else if (file !== '.gitkeep') {
                    // Remove file (but keep .gitkeep)
                    fs.unlinkSync(filePath);
                    deletedCount++;
                }
            }

            console.log(`   ✓ Deleted ${deletedCount} files/folders from uploads`);
        } else {
            console.log('   ⚠️  Uploads directory does not exist');
        }

        console.log('\n✅ Uploads directory cleared\n');

        // Recreate indexes
        console.log('🔧 Recreating indexes...');
        const models = [
            User, Customer, Technician, Supplier,
            ServiceRequest, Product, Vehicle,
            Message, Notification, Settings,
            Order, Transaction, Device, File, Counter
        ];

        for (const Model of models) {
            try {
                await Model.createIndexes();
                console.log(`   ✓ Indexes created for: ${Model.modelName}`);
            } catch (error) {
                console.log(`   ⚠️  Could not create indexes for ${Model.modelName}: ${error.message}`);
            }
        }

        console.log('\n✅ Indexes recreated successfully\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ DATABASE RESET COMPLETE! ✨');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n📝 Next steps:');
        console.log('   1. Run: node seedUsers.js (to create test users)');
        console.log('   2. Run: node seed.js (to seed products and data)');
        console.log('   3. Restart your server: node server.js\n');

    } catch (error) {
        console.error('\n❌ Error resetting database:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB\n');
        process.exit(0);
    }
}

// Run the reset
resetDatabase();
