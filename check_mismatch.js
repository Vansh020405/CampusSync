
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const students = await prisma.student.groupBy({
            by: ['department'],
            _count: { id: true }
        });
        console.log('Student Departments:', JSON.stringify(students, null, 2));

        const subjects = await prisma.syllabusSubject.groupBy({
            by: ['department'],
            _count: { id: true }
        });
        console.log('Subject Departments:', JSON.stringify(subjects, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
