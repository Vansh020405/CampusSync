const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to create Announcement table manually...');
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Announcement" (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "department" TEXT NOT NULL DEFAULT 'ALL',
        "semester" TEXT NOT NULL DEFAULT 'ALL',
        "batch" TEXT NOT NULL DEFAULT 'ALL',
        "senderId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
      );
    `);

        console.log('Attempting to create index...');
        await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Announcement_department_semester_batch_idx" ON "Announcement"("department", "semester", "batch");
    `);

        console.log('Announcement table created successfully.');
    } catch (e) {
        console.error('Error creating table:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
