const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Testing connection...');
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
