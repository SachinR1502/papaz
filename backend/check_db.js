const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const checkDB = async () => {
    try {
        console.log('Connecting to DB:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);
        users.forEach(u => {
            console.log(`- Phone: "${u.phoneNumber}" | Role: ${u.role} | ID: ${u._id} | Completed: ${u.profileCompleted}`);
        });

        const target = await User.findOne({ phoneNumber: '9876543210' });
        console.log(`Specific search for 9876543210: ${target ? 'FOUND' : 'NOT FOUND'}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
