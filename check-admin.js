const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const admin = await prisma.admin.findUnique({
        where: { username: 'admin' }
    });
    console.log('Admin found:', admin ? 'Yes' : 'No');
    if (admin) {
        console.log('Username:', admin.username);
    }
}

check().finally(() => prisma.$disconnect());
