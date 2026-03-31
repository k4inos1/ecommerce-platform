import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Only clear users to avoid wiping real product catalog data
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create admin user — change credentials via env or after first login
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@techstore.cl';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`👤 Created admin user: ${adminEmail}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('ℹ️  Add products via the admin panel at /admin/products');
    console.log('ℹ️  Import products from AliExpress/eBay at /admin/import');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
