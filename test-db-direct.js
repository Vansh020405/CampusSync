const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function test() {
    try {
        console.log('Testing connection with DIRECT_URL...');
        const adminCount = await prisma.admin.count();
        console.log('Admin count:', adminCount);

        const admins = await prisma.admin.findMany();
        console.log('Admins:', admins);
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
