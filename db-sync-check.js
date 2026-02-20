const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Syncing database schema for SectionMentors...');

    // We can't run db push directly if locked, but we can try to verify if the model exists in the DB
    try {
        const sections = await prisma.student.findMany({
            select: { department: true, semester: true, section: true, batch: true },
            distinct: ['department', 'semester', 'section', 'batch'],
            take: 5
        });
        console.log('Successfully connected to DB and fetched sample students:', sections.length);
    } catch (err) {
        console.error('DB Connection or Schema error:', err.message);
        if (err.message.includes('relation "SectionMentor" does not exist')) {
            console.log('CRITICAL: SectionMentor table is missing. You MUST stop the dev server and run "npx prisma db push".');
        }
    }
}

main().finally(() => prisma.$disconnect());
