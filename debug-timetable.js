const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const timetable = await prisma.timetable.findMany({
        include: { faculty: true }
    });
    console.log(JSON.stringify(timetable, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
