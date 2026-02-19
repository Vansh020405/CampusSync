
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking database schema...");
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "SyllabusTopic" ADD COLUMN IF NOT EXISTS "examType" TEXT;
        `);
        console.log("Successfully added examType column (if it didn't exist).");
    } catch (e) {
        console.error("Error adding column:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
