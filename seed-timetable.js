const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Clear existing timetable
    await prisma.timetable.deleteMany();

    const faculty = await prisma.faculty.findMany();
    if (faculty.length === 0) {
        console.error("No faculty found. Please run seed.js first.");
        return;
    }

    const sumit = faculty.find(f => f.name === 'Sumit Sharma');
    const neha = faculty.find(f => f.name === 'Dr. Neha Kapoor');

    if (!sumit || !neha) {
        console.error("Required faculty not found.");
        return;
    }

    const timetableData = [
        {
            department: 'Computer Science',
            section: '4G2',
            semester: '3',
            subject: 'Java Programming',
            facultyId: sumit.id,
            classroom: 'A-101',
            floor: '1st',
            day: 'MONDAY',
            startTime: '09:00 AM',
            endTime: '10:00 AM'
        },
        {
            department: 'Computer Science',
            section: '4G2',
            semester: '3',
            subject: 'Data Structures',
            facultyId: sumit.id,
            classroom: 'A-101',
            floor: '1st',
            day: 'MONDAY',
            startTime: '10:15 AM',
            endTime: '11:15 AM'
        },
        {
            department: 'Mathematics',
            section: '4G2',
            semester: '3',
            subject: 'Applied Probability',
            facultyId: neha.id,
            classroom: 'B-205',
            floor: '2nd',
            day: 'MONDAY',
            startTime: '11:30 AM',
            endTime: '12:30 PM'
        },
        {
            department: 'Computer Science',
            section: '4G2',
            semester: '3',
            subject: 'Java Lab',
            facultyId: sumit.id,
            classroom: 'Lab-1',
            floor: 'Ground',
            day: 'MONDAY',
            startTime: '01:30 PM',
            endTime: '03:30 PM'
        }
    ];

    for (const data of timetableData) {
        await prisma.timetable.create({ data });
    }

    console.log('Timetable seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
