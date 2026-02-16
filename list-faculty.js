const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const faculty = await prisma.faculty.findMany();
    console.log('--- Faculty List ---');
    faculty.forEach(f => {
        console.log(`[${f.name}] ID: [${f.id}]`);
    });
}

main().finally(() => prisma.$disconnect());
