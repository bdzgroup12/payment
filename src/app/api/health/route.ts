import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'set' : 'missing',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'missing',
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'missing',
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'set' : 'missing',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'set' : 'missing'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 