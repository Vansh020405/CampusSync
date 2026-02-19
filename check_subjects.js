
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    try {
        const subjects = await prisma.syllabusSubject.findMany({
            include: { topics: true }
        });
        fs.writeFileSync('subject_results.txt', JSON.stringify(subjects, null, 2), 'utf8');
        console.log("Done");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
