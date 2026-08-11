import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Import Models
import User from '../models/User.js';
import Merchant from '../models/Merchant.js';
import HelpingCenter from '../models/HelpingCenter.js';
import FoodItem from '../models/FoodItem.js';
import MerchantPost from '../models/MerchantPost.js';
import MerchantRequest from '../models/MerchantRequest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from the parent directory
dotenv.config({ path: resolve(__dirname, '../.env') });

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1481070555726-e2fe83477d4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1589302168068-964664d93cb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
];

const PROFILE_IMAGES = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
];

const BAKERIES = ["The Oven Bakery", "Sweet Cravings", "Daily Bread Co", "Morning Glory Pastries", "Crust & Crumb"];
const RESTAURANTS = ["Bistro Delight", "Green Leaf Vegan", "Tandoori Nights", "Sushi Master", "Burger Joint", "Pasta Paradise", "Salad Symphony", "The Grillery", "Taco Fiesta", "Noodle Haven", "Spice Route", "Ocean Catch", "Urban Cafe", "Rustic Diner", "Gourmet Bites"];
const NAMES = ["Rahul Sharma", "Priya Patel", "Amit Singh", "Neha Gupta", "Vikram Reddy", "Anjali Desai", "Suresh Kumar", "Riya Jain", "Karan Malhotra", "Sneha Joshi", "Rohit Verma", "Pooja Chawla"];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomCoordinates = () => {
  // Center roughly around Bangalore: 12.9716, 77.5946
  const lat = 12.9716 + (Math.random() * 0.1 - 0.05);
  const lng = 77.5946 + (Math.random() * 0.1 - 0.05);
  return [lng, lat];
};

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/savebite');
    console.log('📦 Connected to MongoDB. Clearing existing data...');

    // Clear existing data
    await User.deleteMany({});
    await Merchant.deleteMany({});
    await HelpingCenter.deleteMany({});
    await FoodItem.deleteMany({});
    await MerchantPost.deleteMany({});
    await MerchantRequest.deleteMany({});
    
    console.log('🧹 Database cleared. Starting seed generation...');

    const defaultPassword = await bcrypt.hash('password123', 10);

    // 1. Generate Customers & Admin
    const customers = [];
    customers.push({
      name: 'System Admin',
      email: 'admin@example.com',
      phone: '9800000000',
      password: defaultPassword,
      role: 'admin',
      isVerified: true,
      isActive: true,
      avatar: getRandom(PROFILE_IMAGES)
    });
    for (let i = 0; i < 15; i++) {
      customers.push({
        name: getRandom(NAMES),
        email: `customer${i + 1}@example.com`,
        phone: `98000000${String(i + 1).padStart(2, '0')}`,
        password: defaultPassword,
        role: 'user',
        isVerified: true,
        isActive: true,
        avatar: getRandom(PROFILE_IMAGES)
      });
    }
    await User.insertMany(customers);
    console.log('✅ Admin and 15 Customers created');

    // 2. Generate NGOs
    const ngos = [];
    for (let i = 0; i < 5; i++) {
      ngos.push({
        name: getRandom(NAMES),
        centerName: `Helping Hands NGO ${i+1}`,
        email: `ngo${i + 1}@example.com`,
        contactPhone: `88000000${String(i).padStart(2, '0')}`,
        phone: `88000000${String(i).padStart(2, '0')}`,
        password: defaultPassword,
        role: 'helping_center',
        isVerified: true,
        isActive: true,
        centerType: 'ngo',
        address: `12${i} Charity Lane`,
        location: { type: 'Point', coordinates: getRandomCoordinates() },
        profileImage: getRandom(PROFILE_IMAGES)
      });
    }
    await HelpingCenter.insertMany(ngos);
    console.log('✅ 5 NGOs created');



    // 4. Generate Merchants
    const merchants = [];
    for (let i = 0; i < 20; i++) {
      const isBakery = i % 4 === 0;
      const bName = isBakery ? getRandom(BAKERIES) + ` ${i}` : getRandom(RESTAURANTS) + ` ${i}`;
      merchants.push({
        name: getRandom(NAMES),
        businessName: bName,
        ownerName: getRandom(NAMES),
        email: `merchant${i + 1}@example.com`,
        phone: `68000000${String(i).padStart(2, '0')}`,
        password: defaultPassword,
        role: 'merchant',
        isVerified: true,
        isActive: true,
        businessType: isBakery ? 'bakery' : 'restaurant',
        address: `${getRandomInt(1, 999)} Culinary Street, Block ${i}`,
        location: { type: 'Point', coordinates: getRandomCoordinates() },
        openingTime: '08:00',
        closingTime: '23:00',
        logo: getRandom(PROFILE_IMAGES),
        images: [getRandom(FOOD_IMAGES)],
        rating: (Math.random() * 2 + 3).toFixed(1) // 3.0 to 5.0
      });
    }
    const insertedMerchants = await Merchant.insertMany(merchants);
    console.log('✅ 20 Merchants created');

    // 5. Generate Food Items for Merchants
    const foods = [];
    const foodNames = ["Truffle Pasta", "Margarita Pizza", "Paneer Tikka", "Choco Lava Cake", "Caesar Salad", "Sushi Platter", "Garlic Bread", "Berry Smoothie", "Grill Burger", "Veg Biryani", "Muffins", "Croissants"];
    
    for (let merchant of insertedMerchants) {
      // For demo purposes, we assign all food items to the first merchant
      // so when the user logs in with the test credentials, they see all orders
      const targetMerchant = insertedMerchants[0];
      const numFoods = getRandomInt(2, 5);
      for (let j = 0; j < numFoods; j++) {
        const originalPrice = getRandomInt(100, 800);
        const discountPercentage = getRandomInt(30, 70); // 30-70% off
        
        const quantity = getRandomInt(1, 10);
        
        foods.push({
          merchant: targetMerchant._id,
          name: `${getRandom(foodNames)} (Surplus)`,
          description: 'Perfectly good food, just made in excess. Save food, save money!',
          originalPrice,
          discountPercentage,
          discountedPrice: originalPrice - (originalPrice * discountPercentage / 100),
          quantity,
          availableQuantity: quantity,
          isVeg: getRandomInt(0, 1) === 0,
          category: getRandom(['meals', 'snacks', 'bakery', 'beverages', 'desserts']),
          images: [getRandom(FOOD_IMAGES)],
          expiryTime: new Date(Date.now() + getRandomInt(2, 12) * 60 * 60 * 1000), // 2 to 12 hours from now
          status: 'available'
        });
      }
    }
    await FoodItem.insertMany(foods);
    console.log(`✅ ${foods.length} Food items created`);

    // 6. Generate Merchant Community Posts
    const posts = [];
    for (let i = 0; i < 15; i++) {
      const creator = getRandom(insertedMerchants);
      const type = getRandomInt(0, 2) === 0 ? 'food_requirement' : 'excess_food';
      const quantity = getRandomInt(5, 50);
      
      let title, description;
      if (type === 'excess_food') {
        title = `Excess ${quantity} kg of Rice & Dal`;
        description = `We had a bulk cancellation. Does any merchant or NGO need this? Available to pick up immediately.`;
      } else {
        title = `Urgent Requirement: ${quantity} portions of Veg Curry`;
        description = `We are running short on our catering order for tonight. Can anyone supply ${quantity} portions of good quality veg curry?`;
      }

      posts.push({
        merchant: creator._id,
        postType: type,
        foodDetails: `${title} - ${description}`,
        totalQuantity: quantity,
        availableQuantity: quantity,
        status: 'active',
        scope: 'public'
      });
    }
    const insertedPosts = await MerchantPost.insertMany(posts);
    console.log('✅ 15 Community Posts created');

    // 7. Generate some Community Requests
    const requests = [];
    for (let i = 0; i < 10; i++) {
      const post = getRandom(insertedPosts);
      let requester = getRandom(insertedMerchants);
      while(requester._id.toString() === post.merchant.toString()) {
        requester = getRandom(insertedMerchants); // Ensure requester isn't the owner
      }

      requests.push({
        post: post._id,
        requester: requester._id,
        owner: post.merchant,
        requestedQuantity: getRandomInt(1, post.availableQuantity),
        status: getRandom(['pending', 'accepted', 'completed']),
        message: 'Hi, we can definitely help with this! Please let me know when we can connect.'
      });
    }
    await MerchantRequest.insertMany(requests);
    console.log('✅ 10 Community Requests created');

    console.log('🎉 Seed Generation Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
