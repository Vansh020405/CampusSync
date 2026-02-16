const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.studentAttendance.deleteMany();
    const students = await prisma.student.findMany();
    const sumit = await prisma.faculty.findUnique({
        where: { facultyId: 'FAC-SUMIT-01' }
    });

    if (!sumit) {
        console.error('Faculty not found');
        return;
    }

    const subjects = ['Java', 'Java Lab', 'Applied Prob', 'OT', 'S&UL', 'DBMS', 'Explore', 'S&UL Lab'];
    const dates = [
        new Date('2026-02-15T09:00:00'),
        new Date('2026-02-15T10:15:00'),
        new Date('2026-02-15T11:30:00')
    ];

    for (const student of students) {
        for (const subject of subjects) {
            for (const date of dates) {
                // Check if already exists to avoid duplicates
                const exists = await prisma.studentAttendance.findFirst({
                    where: { studentId: student.id, subject, date }
                });
                if (!exists) {
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
        }
    }

    console.log('Attendance seeded for all students successfully');
}

main().finally(() => prisma.$disconnect());
