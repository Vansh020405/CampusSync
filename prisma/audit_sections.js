const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    console.log("--- STUDENTS ---");
    const students = await prisma.student.findMany({
        select: { section: true, semester: true, department: true, batch: true },
        distinct: ['section', 'semester', 'department', 'batch']
    });
    students.forEach(s => console.log(`STUDENT: ${s.section} | Sem ${s.semester} | ${s.department} | ${s.batch}`));

    console.log("\n--- TIMETABLE ---");
    const timetable = await prisma.timetable.findMany({
        select: { section: true, semester: true, department: true, batch: true },
        distinct: ['section', 'semester', 'department', 'batch']
    });
    timetable.forEach(t => console.log(`TIMETABLE: ${t.section} | Sem ${t.semester} | ${t.department} | ${t.batch}`));

    console.log("\n--- SECTION MENTORS ---");
    const mentors = await prisma.sectionMentor.findMany({});
    mentors.forEach(m => console.log(`MENTOR: ${m.section} | Sem ${m.semester} | ${m.department} | ${m.batch} -> ${m.facultyId}`));
}

audit().finally(() => prisma.$disconnect());
