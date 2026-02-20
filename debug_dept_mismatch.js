const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Students...");
    const students = await prisma.student.findMany({
        take: 5,
        select: { name: true, rollNo: true, department: true, section: true }
    });
    console.log("Students:", JSON.stringify(students, null, 2));

    console.log("\nChecking Timetable Entries...");
    const timetable = await prisma.timetable.findMany({
        take: 10,
        select: { day: true, subject: true, department: true, section: true }
    });
    console.log("Timetable Samples:", JSON.stringify(timetable, null, 2));

    console.log("\nChecking Distinct Departments in Timetable:");
    const distinctDepts = await prisma.timetable.groupBy({
        by: ['department'],
    });
    console.log(distinctDepts);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
