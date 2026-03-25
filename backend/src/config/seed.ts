import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product';
import { User } from '../models/User';

dotenv.config();

const products = [
  { name: 'MacBook Pro M3', description: 'El chip M3 más potente en un diseño ultradelgado. Hasta 22 horas de batería y pantalla Liquid Retina XDR.', price: 2499, stock: 5, category: 'Laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600' },
  { name: 'AirPods Pro', description: 'Cancelación activa de ruido de última generación con chip H2. Audio espacial personalizado.', price: 249, stock: 20, category: 'Audio', image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600' },
  { name: 'iPhone 15 Pro', description: 'Primer iPhone con diseño en titanio aeroespacial. Cámara pro de 48 MP y chip A17 Pro.', price: 1199, stock: 8, category: 'Phones', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600' },
  { name: 'iPad Air', description: 'Chip M1 en un diseño ultradelgado compatible con Apple Pencil y Magic Keyboard.', price: 749, stock: 12, category: 'Tablets', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600' },
  { name: 'Apple Watch Ultra', description: 'El smartwatch más robusto. Titanio 49mm, GPS de doble frecuencia y 60 horas de batería.', price: 799, stock: 6, category: 'Wearables', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600' },
  { name: 'Logitech MX Keys', description: 'Teclado inalámbrico premium con retroiluminación adaptativa. Hasta 3 dispositivos simultáneos.', price: 119, stock: 30, category: 'Accessories', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' },
  { name: 'Samsung 4K Monitor', description: 'Panel OLED 4K a 144Hz. Negros absolutos, 0.1ms latencia y USB-C 90W.', price: 649, stock: 4, category: 'Monitors', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600' },
  { name: 'Raspberry Pi 5', description: '2-3x más rápida que la Pi 4. 8GB RAM, conector PCIe y doble salida 4K.', price: 80, stock: 25, category: 'Accessories', image: 'https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=600' },
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed products
    await Product.insertMany(products);
    console.log(`📦 Seeded ${products.length} products`);

    // Create admin user
    await User.create({ name: 'Ricardo Sanhueza', email: 'admin@techstore.cl', password: 'admin123456', role: 'admin' });
    console.log('👤 Created admin user: admin@techstore.cl / admin123456');

    // Create test user
    await User.create({ name: 'Test User', email: 'user@test.cl', password: 'user123456', role: 'user' });
    console.log('👤 Created test user: user@test.cl / user123456');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
