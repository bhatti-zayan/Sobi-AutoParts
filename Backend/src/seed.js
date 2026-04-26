const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./adapters/database/models/UserModel');
const Product = require('./adapters/database/models/ProductModel');
const Order = require('./adapters/database/models/OrderModel');
const Activity = require('./adapters/database/models/ActivityModel');

dotenv.config();

const seedData = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB for seeding: ${conn.connection.host}`);

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Activity.deleteMany();

    console.log('🗑️ Existing data cleared');

    // 1. Create Users
    const users = await User.insertMany([
      {
        name: 'Zayan Ahmed',
        email: 'zayan@example.com',
        password: 'buyer123',
        role: 'buyer',
        initials: 'ZA'
      },
      {
        name: 'M. Soban',
        email: 'soban@example.com',
        password: 'seller123',
        role: 'seller',
        initials: 'MS'
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        initials: 'AD'
      }
    ]);

    const buyer = users[0];
    const seller = users[1];

    console.log('👤 Users seeded');

    // 2. Create Products
    const products = await Product.insertMany([
      {
        title: 'Honda Civic Alloy Rims',
        subtitle: 'Set of 4 · 16 inch',
        description: 'Good condition alloy rims, no cracks. Selling as set only.',
        category: 'Wheels & Tyres',
        condition: 'Used — Good',
        price: 12800,
        type: 'auction',
        sellerId: seller._id,
        status: 'live',
        startingPrice: 8000,
        currentBid: 12800,
        auctionEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      },
      {
        title: 'Toyota Camry Headlight',
        subtitle: '2018–2022 compatible',
        description: 'OEM headlight assembly for Toyota Camry. Left side.',
        category: 'Electrical',
        condition: 'New',
        price: 4500,
        type: 'fixed',
        sellerId: seller._id,
        status: 'live'
      },
      {
        title: 'Suzuki Alto Engine Cover',
        subtitle: 'OEM part · Used',
        description: 'Original engine cover for Suzuki Alto VXR/VXL.',
        category: 'Engine parts',
        condition: 'Used — Good',
        price: 2200,
        type: 'bargain',
        sellerId: seller._id,
        status: 'live',
        bargainMin: 1800,
        bargainMax: 2200
      }
    ]);

    console.log('📦 Products seeded');

    // 3. Create Orders (Purchase History)
    await Order.insertMany([
      {
        buyerId: buyer._id,
        sellerId: seller._id,
        productId: products[1]._id,
        item: 'Toyota Camry Headlight',
        method: 'fixed',
        amount: 4500,
        status: 'completed'
      }
    ]);

    console.log('🧾 Orders seeded');

    // 4. Create Activities
    await Activity.insertMany([
      { text: 'New user registered — <b>Zayan Ahmed</b> (Buyer)', type: 'user_registration' },
      { text: 'New listing — <b>Honda Civic Alloy Rims</b> by M. Soban', type: 'new_listing' },
      { text: 'Offer accepted — <b>PKR 1,900</b> for Suzuki Alto Engine Cover', type: 'offer_accepted' }
    ]);

    console.log('📜 Activities seeded');

    console.log('✅ Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
