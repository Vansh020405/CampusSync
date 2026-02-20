const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const students = await prisma.student.findMany({
        distinct: ['department', 'section', 'semester']
    });
    console.log("Students:", JSON.stringify(students.map(s => ({ dept: s.department, sem: s.semester, sec: s.section })), null, 2));

    const mentors = await prisma.sectionMentor.findMany({});
    console.log("Mentors:", JSON.stringify(mentors.map(m => ({ dept: m.department, sem: m.semester, sec: m.section, fac: m.facultyId })), null, 2));
    await prisma.$disconnect();
}
run();
