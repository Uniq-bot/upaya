// lib/prisma.ts
import 'dotenv/config';
import { PrismaClient } from '@/app/generated/prisma/client'; // Adjust path to your generator output
import { PrismaPg } from '@prisma/adapter-pg';      // Replace with your DB adapter

// 1. Initialize the adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// 2. Instantiate PrismaClient with the adapter
export const prisma = new PrismaClient({ 
  adapter 
});   