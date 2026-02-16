const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
    const username = 'admin';
    const password = 'admin123';

    console.log('Testing admin login...');
    console.log('Username:', username);

    const admin = await prisma.admin.findUnique({
        where: { username }
    });

    if (!admin) {
        console.log('❌ Admin user not found in database');
        return;
    }

    console.log('✅ Admin user found');
    console.log('Stored password hash:', admin.password);

    const isValid = await bcrypt.compare(password, admin.password);
    console.log('Password validation result:', isValid ? '✅ VALID' : '❌ INVALID');

    // Test with the actual password
    console.log('\nTesting password hash generation:');
    const testHash = await bcrypt.hash(password, 10);
    console.log('New hash:', testHash);
    const testValid = await bcrypt.compare(password, testHash);
    console.log('New hash validates:', testValid ? '✅ YES' : '❌ NO');
}

testLogin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
