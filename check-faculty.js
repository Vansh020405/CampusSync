const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('--- DB CHECK ---');
        const count = await prisma.faculty.count();
        console.log('Faculty count:', count);
        if (count === 0) {
            console.log('Warning: No faculty found in database.');
        } else {
            const first = await prisma.faculty.findFirst({ select: { name: true, department: true } });
            console.log('Sample faculty:', first);
        }
    } catch (err) {
        console.error('Database connection failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
