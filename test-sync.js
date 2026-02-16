import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function testSync() {
    const faculty = await prisma.faculty.findFirst({
        where: { name: 'Reetu' }
    })

    if (!faculty) {
        console.error("Reetu not found")
        return
    }

    console.log("Found Reetu with ID:", faculty.id)

    const timetable = [
        {
            day: 'MONDAY',
            time: '09:00 - 10:00',
            subject: 'STATISTICS',
            room: 'MB-303',
            section: 'SEC 402',
            facultyId: faculty.id
        }
    ]

    try {
        await prisma.$transaction(async (tx) => {
            console.log("Cleaning faculty matrix for:", faculty.id);
            await tx.timetable.deleteMany({
                where: { facultyId: faculty.id }
            });

            for (const slot of timetable) {
                const [start, end] = slot.time.split(' - ');
                await tx.timetable.create({
                    data: {
                        day: slot.day,
                        startTime: start,
                        endTime: end,
                        subject: slot.subject || "No Subject",
                        classroom: slot.room || "TBA",
                        section: slot.section || "TBA",
                        facultyId: faculty.id,
                        department: "CSE",
                        semester: "4",
                        floor: "1"
                    }
                });
            }
        })
        console.log("Test Sync Successful")
    } catch (error) {
        console.error("Test Sync Failed:", error)
    }
}

testSync()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
