require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        
        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            phoneNumber: '9999999999',  // Added phoneNumber
            role: 'admin',
            isActive: true
        });
        
        console.log('✅ Admin created successfully!');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
