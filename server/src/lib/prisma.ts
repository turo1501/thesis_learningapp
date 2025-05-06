import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client instance
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Attach to global object in development to prevent hot-reloading issues
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 
 
 