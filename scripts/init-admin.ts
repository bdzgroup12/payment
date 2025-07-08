import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await hash('admin123', 12);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log('Admin user created:', user);

    const store = await prisma.store.create({
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

    console.log('Store created:', store);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 