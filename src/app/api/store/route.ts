import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// Initialize admin user and default store
async function initializeData() {
  try {
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
    }

    const store = await prisma.store.findFirst();
    if (!store) {
      await prisma.store.create({
        data: {
          name: 'My Store',
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
    }
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
}

// GET /api/store
export async function GET() {
  try {
    const headersList = headers();
    
    // Check if it's an API request
    const isApiRequest = headersList.get('accept')?.includes('application/json');
    
    await initializeData();
    const store = await prisma.store.findFirst({
      include: {
        products: true,
      },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // For API requests, return JSON
    if (isApiRequest) {
      return NextResponse.json(store);
    }

    // For page requests, return HTML
    return new NextResponse(JSON.stringify(store), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store data' },
      { status: 500 }
    );
  }
}

// PUT /api/store
export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const store = await prisma.store.findFirst();

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Update store settings
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        name: data.name,
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

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json(
      { error: 'Failed to update store' },
      { status: 500 }
    );
  }
} 