const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Clear existing attendance
    await prisma.studentAttendance.deleteMany();

    const student = await prisma.student.findUnique({
        where: { rollNo: '23-4G2-01' }
    });

    const sumit = await prisma.faculty.findUnique({
        where: { facultyId: 'FAC-SUMIT-01' }
    });

    if (!student || !sumit) {
        console.error('Student or Faculty not found');
        return;
    }

    const subjects = ['Java Programming', 'Data Structures', 'Applied Probability'];
    const dates = [
        new Date('2026-02-15T09:00:00'),
        new Date('2026-02-15T10:15:00'),
        new Date('2026-02-15T11:30:00')
    ];

    for (const subject of subjects) {
        for (const date of dates) {
            await prisma.studentAttendance.create({
                data: {
                    studentId: student.id,
                    facultyId: sumit.id,
                    subject: subject,
                    date: date,
                    period: 1,
                    status: 'PRESENT'
                }
            });
        }
    }

    console.log('Attendance seeded successfully');
}

main().finally(() => prisma.$disconnect());
