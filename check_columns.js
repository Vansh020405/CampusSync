const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const columns = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Student' AND table_schema = 'public'`;
        console.log('Columns in Student table:', columns);
    } catch (e) {
        console.error('Error fetching columns:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
