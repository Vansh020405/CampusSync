const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const counts = await prisma.student.groupBy({
        by: ['section'],
        _count: { id: true }
    });
    console.log('Student counts by section:');
    console.log(JSON.stringify(counts, null, 2));

    const sample = await prisma.student.findMany({
        take: 5
    });
    console.log('Sample students:');
    console.log(JSON.stringify(sample, null, 2));
}

main().finally(() => prisma.$disconnect());
