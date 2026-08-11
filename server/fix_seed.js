import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

const fixSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/savebite');
    console.log('MongoDB connected for fix seed');

    // Hash passwords manually
    const passwordHashCustomer = await bcrypt.hash('customer123', 10);
    const passwordHashMerchant = await bcrypt.hash('merchant123', 10);
    const passwordHashDelivery = await bcrypt.hash('delivery123', 10);
    const passwordHashNGO = await bcrypt.hash('ngo123', 10);
    const passwordHashAdmin = await bcrypt.hash('admin123', 10);

    // Create User (Customer)
    await User.findOneAndUpdate(
      { email: 'customer@sports.com' },
      { name: 'Test Customer', phone: '1234567890', password: passwordHashCustomer, role: 'user', isVerified: true, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create Admin
    await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      { name: 'Admin User', phone: '1234567891', password: passwordHashAdmin, role: 'admin', isVerified: true, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create Merchant
    await Merchant.findOneAndUpdate(
      { email: 'merchant@example.com' },
      { 
        name: 'Merchant User',
        businessName: 'Test Merchant',
        ownerName: 'Merchant Owner',
        phone: '1234567892', 
        password: passwordHashMerchant, 
        isVerified: true, 
        isActive: true,
        businessType: 'restaurant',
        fssaiLicense: '12345678901234',
        location: { type: 'Point', coordinates: [0, 0] },
        address: '123 Merchant Street',
        openingTime: '09:00',
        closingTime: '22:00'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create Second Merchant (h1@gmail.com)
    await Merchant.findOneAndUpdate(
      { email: 'h1@gmail.com' },
      { 
        name: 'H1 Merchant',
        businessName: 'H1 Test Restaurant',
        ownerName: 'H1 Owner',
        phone: '1234567899', 
        password: await bcrypt.hash('123456789', 10), 
        isVerified: true, 
        isActive: true,
        businessType: 'restaurant',
        fssaiLicense: '99999999999999',
        location: { type: 'Point', coordinates: [0, 0] },
        address: '123 H1 Street',
        openingTime: '09:00',
        closingTime: '22:00'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create Delivery Partner
    await DeliveryPartner.findOneAndUpdate(
      { email: 'delivery@example.com' },
      { 
        name: 'Test Delivery', 
        phone: '1234567893', 
        password: passwordHashDelivery, 
        isVerified: true, 
        isActive: true,
        vehicleType: 'motorcycle',
        vehicleNumber: 'MH01AB1234',
        licenseNumber: 'DL1234567890123',
        currentLocation: { type: 'Point', coordinates: [0, 0] }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Create NGO / Helping Center
    await HelpingCenter.findOneAndUpdate(
      { email: 'ngo@example.com' },
      { 
        name: 'NGO User',
        centerName: 'Test NGO', 
        contactPerson: 'NGO Contact',
        phone: '1234567894', 
        password: passwordHashNGO, 
        isVerified: true, 
        isActive: true,
        centerType: 'ngo',
        registrationNumber: 'NGO123456',
        capacity: 100,
        address: '456 NGO Avenue',
        location: { type: 'Point', coordinates: [0, 0] }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Dummy users fixed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing DB:', err);
    process.exit(1);
  }
};

fixSeed();
