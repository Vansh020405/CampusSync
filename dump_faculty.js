
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    try {
        const faculty = await prisma.faculty.findMany();
        fs.writeFileSync('all_faculty_dump.txt', JSON.stringify(faculty, null, 2), 'utf8');
        console.log("Done");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
