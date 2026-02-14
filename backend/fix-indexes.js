require('dotenv').config();
const mongoose = require('mongoose');
const ServiceRequest = require('./models/ServiceRequest');

async function fixIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        console.log('Synchronizing indexes...');
        await ServiceRequest.syncIndexes();
        console.log('Indexes synchronized successfully');

        // Explicitly create the 2dsphere index just in case
        await ServiceRequest.collection.createIndex({ "location.coordinates": "2dsphere" });
        console.log('2dsphere index confirmed');

        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
}

fixIndexes();
