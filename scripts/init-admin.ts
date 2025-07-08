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
        backgroundColor: '#ffffff',
        product: {
          create: {
            title: 'Sample Product',
            price: 99.99,
            description: 'A great product description goes here.',
          },
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