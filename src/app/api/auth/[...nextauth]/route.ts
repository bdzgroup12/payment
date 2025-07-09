import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('NextAuth authorize attempt');
          
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials');
            throw new Error('Please enter an email and password');
          }

          console.log('Checking database connection...');
          await prisma.$connect();
          
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            console.error('User not found:', credentials.email);
            throw new Error('No user found');
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.error('Invalid password for user:', credentials.email);
            throw new Error('Invalid password');
          }

          console.log('User authenticated successfully:', user.email);
          return {
            id: user.id,
            email: user.email,
            role: user.role
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        } finally {
          await prisma.$disconnect();
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login?error=true'
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: any) {
      console.log('NextAuth session callback');
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      console.log('NextAuth JWT callback');
      if (user) {
        token.role = user.role;
      }
      return token;
    }
  },
  debug: process.env.NODE_ENV === 'development'
});

export { handler as GET, handler as POST }; 