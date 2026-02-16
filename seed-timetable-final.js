const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Clear existing timetable
    await prisma.timetable.deleteMany();

    // Faculty data from screenshot
    const lecturers = [
        { name: 'Sumit Sharma', id: 'FAC-SUMIT-01', subjects: 'Java' },
        { name: 'Aarchit', id: 'FAC-AARCHIT-01', subjects: 'Java Lab, DBMS' },
        { name: 'Manpreet', id: 'FAC-MANPREET-01', subjects: 'Applied Prob' },
        { name: 'Priyanka', id: 'FAC-PRIYANKA-01', subjects: 'OT' },
        { name: 'Surender', id: 'FAC-SURENDER-01', subjects: 'S&UL' },
        { name: 'Harsh', id: 'FAC-HARSH-01', subjects: 'DBMS' },
        { name: 'Deepali', id: 'FAC-DEEPALI-01', subjects: 'DBMS' },
        { name: 'Trainer 1', id: 'FAC-TRAINER-01', subjects: 'Explore' },
        { name: 'Divyanshi', id: 'FAC-DIVYANSHI-01', subjects: 'S&UL' },
        { name: 'Harjeet', id: 'FAC-HARJEET-01', subjects: 'S&UL Lab' }
    ];

    // Seed/Update Faculty
    for (const f of lecturers) {
        await prisma.faculty.upsert({
            where: { facultyId: f.id },
            update: { name: f.name, subjects: f.subjects },
            create: {
                facultyId: f.id,
                name: f.name,
                subjects: f.subjects,
                department: 'Computer Science',
                sectionsTeaching: '4G2',
                password: 'password123'
            }
        });
    }

    const facultyMap = {};
    const allFaculty = await prisma.faculty.findMany();
    allFaculty.forEach(f => {
        facultyMap[f.name.split(' ')[0]] = f.id;
    });

    const timetableData = [
        // MONDAY
        { day: 'MONDAY', subject: 'Java', faculty: 'Sumit', start: '09:00 AM', end: '10:00 AM', room: 'MB LH-303' },
        { day: 'MONDAY', subject: 'Java Lab', faculty: 'Aarchit', start: '10:00 AM', end: '12:00 PM', room: 'MB LH-303' },
        { day: 'MONDAY', subject: 'Applied Prob', faculty: 'Manpreet', start: '01:30 PM', end: '02:30 PM', room: 'MB LH-303' },
        { day: 'MONDAY', subject: 'OT', faculty: 'Priyanka', start: '02:30 PM', end: '03:30 PM', room: 'MB LH-303' },

        // TUESDAY
        { day: 'TUESDAY', subject: 'Java', faculty: 'Sumit', start: '09:00 AM', end: '10:00 AM', room: 'MB LH-303' },
        { day: 'TUESDAY', subject: 'S&UL', faculty: 'Surender', start: '10:00 AM', end: '11:00 AM', room: 'MB LH-303' },
        { day: 'TUESDAY', subject: 'DBMS', faculty: 'Harsh', start: '11:00 AM', end: '12:00 PM', room: 'MB LH-303' },

        // WEDNESDAY
        { day: 'WEDNESDAY', subject: 'S&UL', faculty: 'Surender', start: '09:00 AM', end: '10:00 AM', room: 'MB LH-303' },
        { day: 'WEDNESDAY', subject: 'Java', faculty: 'Sumit', start: '11:00 AM', end: '12:00 PM', room: 'MB LH-303' },
        { day: 'WEDNESDAY', subject: 'DBMS', faculty: 'Deepali', start: '01:30 PM', end: '02:30 PM', room: 'MB LH-302' },

        // THURSDAY
        { day: 'THURSDAY', subject: 'DBMS', faculty: 'Harsh', start: '09:00 AM', end: '10:00 AM', room: 'MB LH-303' },
        { day: 'THURSDAY', subject: 'DBMS', faculty: 'Harsh', start: '10:00 AM', end: '11:00 AM', room: 'MB LH-303' },
        { day: 'THURSDAY', subject: 'Applied Prob', faculty: 'Manpreet', start: '11:00 AM', end: '12:00 PM', room: 'MB LH-303' },
        { day: 'THURSDAY', subject: 'Explore', faculty: 'Trainer', start: '12:00 PM', end: '01:00 PM', room: 'MB LH-303' },
        { day: 'THURSDAY', subject: 'Java', faculty: 'Sumit', start: '01:30 PM', end: '02:30 PM', room: 'MB LH-303' },

        // FRIDAY
        { day: 'FRIDAY', subject: 'S&UL', faculty: 'Divyanshi', start: '09:00 AM', end: '10:00 AM', room: 'MB LH-303' },
        { day: 'FRIDAY', subject: 'OT', faculty: 'Priyanka', start: '11:00 AM', end: '12:00 PM', room: 'MB LH-302' },
        { day: 'FRIDAY', subject: 'Applied Prob', faculty: 'Manpreet', start: '01:30 PM', end: '02:30 PM', room: 'MB LH-303' },
        { day: 'FRIDAY', subject: 'S&UL Lab', faculty: 'Harjeet', start: '02:30 PM', end: '04:30 PM', room: 'MB LH-303' }
    ];

    for (const item of timetableData) {
        await prisma.timetable.create({
            data: {
                department: 'Computer Science',
                section: '4G2',
                semester: '4', // Assuming Spring 2026 is 4th sem
                subject: item.subject,
                facultyId: facultyMap[item.faculty] || facultyMap['Sumit'],
                classroom: item.room,
                floor: '3rd',
                day: item.day,
                startTime: item.start,
                endTime: item.end
            }
        });
    }

    console.log('Timetable updated to match screenshot (Section 4G2)');
}

main().finally(() => prisma.$disconnect());
