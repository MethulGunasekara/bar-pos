const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// We need to import the UserModel (make sure the path matches your structure)
const User = require('./models/UserModel');

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database...');

        // Clear any accidentally created users to start fresh
        await User.deleteMany();

        // Generate a hashed password for a 4-digit PIN
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('1234', salt);

        // Create the Admin User
        await User.create({
            username: 'admin',
            passwordHash: hashedPassword,
            role: 'admin'
        });

        console.log('✅ Admin user successfully seeded!');
        console.log('Username: admin');
        console.log('Password: 1234');
        
        process.exit(); // Close the script
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedUsers();