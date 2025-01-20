/// <reference types="jest"/>

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Create Prisma client for tests
const prisma = new PrismaClient();

// Before all tests
beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
});

// After all tests
afterAll(async () => {
    // Clean up database
    await prisma.$disconnect();
});

// Before each test
beforeEach(async () => {
    // Clean up tables
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
});

// Make prisma available to tests
export { prisma };