import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

// Create a single PrismaClient instance
const prisma = new PrismaClient();

// Initialize admin user and default store
async function initializeData() {
  try {
    console.log('Initializing database data...');
    
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@admin.com' },
    });

    if (!adminExists) {
      console.log('Creating admin user...');
      await prisma.user.create({
        data: {
          email: 'admin@admin.com',
          password: await hash('admin123', 12),
          role: 'admin',
        },
      });
      console.log('Admin user created successfully');
    }

    const store = await prisma.store.findFirst();
    if (!store) {
      console.log('Creating default store...');
      const newStore = await prisma.store.create({
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
      console.log('Default store created successfully');
      return newStore;
    }
    console.log('Store already exists');
    return store;
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
}

// GET /api/store
export async function GET() {
  try {
    console.log('Store API GET request received');
    
    // Check if database is accessible
    await prisma.$connect();
    console.log('Database connection successful');
    
    const store = await initializeData();
    
    if (!store) {
      console.error('Store initialization failed');
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Get store with products
    const storeWithProducts = await prisma.store.findFirst({
      include: {
        products: true,
      },
    });

    console.log('Store data fetched successfully');
    return NextResponse.json(storeWithProducts);
  } catch (error) {
    console.error('Store API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch store data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/store
export async function PUT(req: Request) {
  try {
    console.log('Store API PUT request received');
    
    const data = await req.json();
    const store = await prisma.store.findFirst();

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Update store settings
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        name: data.name,
        description: data.description,
        backgroundColor: data.backgroundColor,
        stripeSecretKey: data.stripeSecretKey,
        stripePublishableKey: data.stripePublishableKey,
      },
      include: {
        products: true,
      },
    });

    // Update products
    if (data.products) {
      await Promise.all(
        data.products.map((product: any) =>
          prisma.product.update({
            where: { id: product.id },
            data: {
              title: product.title,
              price: product.price,
              description: product.description,
            },
          })
        )
      );
    }

    console.log('Store updated successfully');
    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error('Store API PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update store',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 