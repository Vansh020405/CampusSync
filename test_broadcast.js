const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const announcement = await prisma.announcement.create({
            data: {
                content: "Test Broadcast from System",
                department: "ALL",
                semester: "ALL",
                batch: "ALL",
                senderId: "test-admin"
            }
        });
        console.log('Announcement created:', announcement);
    } catch (e) {
        console.error('Error creating announcement:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
