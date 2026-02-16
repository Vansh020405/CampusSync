const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const timetable = await prisma.timetable.findMany();
    console.log('--- Timetable Data ---');
    timetable.forEach(t => {
        console.log(`Day: [${t.day}], Section: [${t.section}], Subject: [${t.subject}]`);
    });
}

main().finally(() => prisma.$disconnect());
