const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const timetable = await prisma.timetable.findMany();
    console.log(JSON.stringify(timetable, null, 2));
}

main().finally(() => prisma.$disconnect());
