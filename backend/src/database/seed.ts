import { query } from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('password123', 10);
    const adminId = uuidv4();
    
    await query(
      `INSERT INTO users (id, email, password, full_name, role, wallet_balance, profile_complete, created_date, updated_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $2)
       ON CONFLICT (email) DO NOTHING`,
      [adminId, 'admin@canteen.com', adminPassword, 'Admin User', 'admin', 0, true]
    );

    // Create student user
    const studentPassword = await bcrypt.hash('password123', 10);
    const studentId = uuidv4();
    
    await query(
      `INSERT INTO users (id, email, password, full_name, role, wallet_balance, profile_complete, created_date, updated_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $2)
       ON CONFLICT (email) DO NOTHING`,
      [studentId, 'student@canteen.com', studentPassword, 'Student User', 'student', 100, true]
    );

    // Create sample menu items
    const menuItems = [
      {
        id: uuidv4(),
        name: 'Masala Dosa',
        description: 'Crispy dosa with spiced potato filling',
        price: 60,
        category: 'Breakfast',
        image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
        is_special: true,
        is_available: true,
      },
      {
        id: uuidv4(),
        name: 'Veg Biryani',
        description: 'Fragrant basmati rice with mixed vegetables',
        price: 120,
        category: 'Lunch',
        image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
        is_special: false,
        is_available: true,
      },
      {
        id: uuidv4(),
        name: 'Samosa',
        description: 'Crispy fried pastry with spiced potato filling',
        price: 25,
        category: 'Snacks',
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
        is_special: true,
        is_available: true,
      },
      {
        id: uuidv4(),
        name: 'Cold Coffee',
        description: 'Iced coffee with milk and cream',
        price: 50,
        category: 'Beverages',
        image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        is_special: false,
        is_available: true,
      },
      {
        id: uuidv4(),
        name: 'Gulab Jamun',
        description: 'Sweet milk dumplings in sugar syrup',
        price: 40,
        category: 'Desserts',
        image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
        is_special: false,
        is_available: true,
      },
    ];

    for (const item of menuItems) {
      await query(
        `INSERT INTO menu_items (id, name, description, price, category, image_url, is_special, is_available, created_date, updated_date, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          item.id,
          item.name,
          item.description,
          item.price,
          item.category,
          item.image_url,
          item.is_special,
          item.is_available,
          'admin@canteen.com',
        ]
      );
    }

    // Create payment settings
    await query(
      `INSERT INTO payment_settings (id, upi_id, merchant_name, bank_details, created_date, updated_date, created_by)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)
       ON CONFLICT (id) DO NOTHING`,
      [
        uuidv4(),
        'canteen@upi',
        'Campus Canteen',
        JSON.stringify({ bank: 'Sample Bank', account: '123456789' }),
        'admin@canteen.com',
      ]
    );

    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seed;
