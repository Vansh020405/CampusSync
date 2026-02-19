const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const counts = {
            students: await prisma.student.count(),
            faculty: await prisma.faculty.count(),
            subjects: await prisma.syllabusSubject.count(),
            timetable: await prisma.timetable.count(),
            exams: await prisma.exam.count()
        };
        console.log(JSON.stringify(counts, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
