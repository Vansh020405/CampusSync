
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    try {
        const faculty = await prisma.faculty.findMany({
            select: { name: true, subjects: true, sectionsTeaching: true }
        });
        const output = faculty.map(f => `${f.name} | Sub: ${f.subjects} | Sec: ${f.sectionsTeaching}`).join('\n');
        fs.writeFileSync('faculty_results.txt', output, 'utf8');
        console.log("Done");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
