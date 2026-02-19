const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to add batch column to Student table...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "batch" TEXT NOT NULL DEFAULT 'Morning';
    `);
        console.log('Batch column added successfully.');
    } catch (e) {
        console.error('Error adding column:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
