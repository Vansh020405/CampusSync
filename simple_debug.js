
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.subjectAssignment.count();
        console.log('Assignment count:', count);
        if (count > 0) {
            const a = await prisma.subjectAssignment.findMany();
            console.log('Assignments:', JSON.stringify(a, null, 2));
        }
        const students = await prisma.student.findMany({ take: 1 });
        console.log('Sample Student:', JSON.stringify(students[0], null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
