
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const subjects = await prisma.syllabusSubject.findMany({ select: { department: true, subjectName: true } });
        console.log('Subject Departments:', subjects);
        const students = await prisma.student.findMany({ select: { department: true, name: true }, take: 5 });
        console.log('Student Departments:', students);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
