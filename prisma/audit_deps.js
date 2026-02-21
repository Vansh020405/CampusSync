const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditDepartments() {
    console.log("--- STUDENT DEPARTMENTS ---");
    const studentDeps = await prisma.student.groupBy({ by: ['department'], _count: { _all: true } });
    studentDeps.forEach(d => console.log(`'${d.department}': ${d._count._all}`));

    console.log("\n--- TIMETABLE DEPARTMENTS ---");
    const timetableDeps = await prisma.timetable.groupBy({ by: ['department'], _count: { _all: true } });
    timetableDeps.forEach(d => console.log(`'${d.department}': ${d._count._all}`));

    console.log("\n--- SECTION MENTOR DEPARTMENTS ---");
    const mentorDeps = await prisma.sectionMentor.groupBy({ by: ['department'], _count: { _all: true } });
    mentorDeps.forEach(d => console.log(`'${d.department}': ${d._count._all}`));
}

auditDepartments().finally(() => prisma.$disconnect());
