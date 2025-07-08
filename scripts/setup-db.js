const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create admin user if it doesn't exist
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@admin.com' },
    });

    if (!adminExists) {
      await prisma.user.create({
        data: {
          email: 'admin@admin.com',
          password: await hash('admin123', 12),
          role: 'admin',
        },
      });
      console.log('Admin user created');
    }

    // Create default store if it doesn't exist
    const store = await prisma.store.findFirst();
    if (!store) {
      await prisma.store.create({
        data: {
          name: 'My Store',
          description: 'Welcome to our store',
          backgroundColor: '#ffffff',
          stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
          stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
          products: {
            create: [
              {
                title: 'The Blue Shirt',
                price: 20.00,
                description: 'A comfortable and stylish blue shirt for everyday wear',
              },
              {
                title: 'The Red Shirt',
                price: 25.00,
                description: 'A vibrant red shirt that makes a statement',
              },
              {
                title: 'The Green Shirt',
                price: 22.00,
                description: 'An eco-friendly green shirt made from sustainable materials',
              },
            ],
          },
        },
      });
      console.log('Default store created');
    }

    console.log('Database setup complete');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase().catch(console.error); 