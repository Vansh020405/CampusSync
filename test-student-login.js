const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
    const rollNo = '23-4G2-01'; // Rahul Sharma
    const password = 'password123';

    console.log('Testing student login...');
    console.log('Roll No:', rollNo);

    const student = await prisma.student.findUnique({
        where: { rollNo }
    });

    if (!student) {
        console.log('❌ Student not found in database');
        return;
    }

    console.log('✅ Student found:', student.name);
    console.log('Stored password hash:', student.password);

    const isValid = await bcrypt.compare(password, student.password);
    console.log('Password validation result:', isValid ? '✅ VALID' : '❌ INVALID');
}

testLogin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
