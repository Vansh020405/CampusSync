
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("\n--- Students (First 1) ---");
        const students = await prisma.student.findMany({ take: 1 });
        console.dir(students, { depth: null });

        console.log("\n--- Subject Assignments ---");
        const assignments = await prisma.subjectAssignment.findMany();
        console.dir(assignments, { depth: null });

        console.log("\n--- Syllabus Subjects ---");
        const subjects = await prisma.syllabusSubject.findMany({
            include: { topics: true }
        });
        console.dir(subjects, { depth: null });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
