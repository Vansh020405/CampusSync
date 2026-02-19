
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const faculty = await prisma.faculty.findMany();
        const fs = require('fs');
        fs.writeFileSync('all_faculty.txt', JSON.stringify(faculty, null, 2), 'utf8');
        console.log("Done");
        const fs = require('fs');
        fs.writeFileSync('faculty_ids.txt', JSON.stringify(faculty, null, 2), 'utf8');
        console.log("Done");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
