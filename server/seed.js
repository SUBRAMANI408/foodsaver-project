import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: __dirname + '/.env' });

import User from './models/User.js';
import Merchant from './models/Merchant.js';
import DeliveryPartner from './models/DeliveryPartner.js';
import HelpingCenter from './models/HelpingCenter.js';

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/savebite');
    console.log('MongoDB connected for seeding');

    // Create User (Customer)
    await User.findOneAndUpdate(
      { email: 'customer@sports.com' },
      { name: 'Test Customer', phone: '1234567890', password: 'password123', role: 'user', isVerified: true, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create Admin
    await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      { name: 'Admin User', phone: '1234567891', password: 'admin123', role: 'admin', isVerified: true, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create Merchant
    await Merchant.findOneAndUpdate(
      { email: 'merchant@example.com' },
      { 
        businessName: 'Test Merchant',
        ownerName: 'Merchant Owner',
        phone: '1234567892', 
        password: 'password123', 
        isVerified: true, 
        isActive: true,
        businessType: 'restaurant',
        fssaiLicense: '12345678901234',
        location: { type: 'Point', coordinates: [0, 0], address: '' }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create Delivery Partner
    await DeliveryPartner.findOneAndUpdate(
      { email: 'delivery@example.com' },
      { 
        name: 'Test Delivery', 
        phone: '1234567893', 
        password: 'password123', 
        isVerified: true, 
        isActive: true,
        vehicleType: 'bike',
        vehicleNumber: 'MH01AB1234',
        drivingLicense: 'DL1234567890123',
        location: { type: 'Point', coordinates: [0, 0], address: '' }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create NGO / Helping Center
    await HelpingCenter.findOneAndUpdate(
      { email: 'ngo@example.com' },
      { 
        orgName: 'Test NGO', 
        contactPerson: 'NGO Contact',
        phone: '1234567894', 
        password: 'password123', 
        isVerified: true, 
        isActive: true,
        registrationNumber: 'NGO123456',
        capacity: 100,
        location: { type: 'Point', coordinates: [0, 0], address: '' }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Dummy users seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
};

seedDB();
