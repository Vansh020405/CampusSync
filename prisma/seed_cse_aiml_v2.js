const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const facultyId = 'e4879833-5bad-4339-9aec-d9b7d8f9699a'; // Found earlier

    // Sem 4 Subjects
    const sem4Subjects = [
        { name: 'Operating Systems', code: 'CS401' },
        { name: 'Database Systems', code: 'CS402' },
        { name: 'Computer Networks', code: 'CS403' },
        { name: 'Software Engineering', code: 'CS404' },
        { name: 'Python Programming', code: 'CS405' }
    ];

    // Sem 5 Subjects (AI ML specific)
    const sem5Subjects = [
        { name: 'Artificial Intelligence', code: 'CSAI301' },
        { name: 'Machine Learning', code: 'CSAI302' },
        { name: 'Neural Networks', code: 'CSAI303' },
        { name: 'Data Mining', code: 'CSAI304' },
        { name: 'Deep Learning', code: 'CSAI305' }
    ];

    const departments = ['Computer Science', 'CSE AI ML'];
    const sections = ['4G2', '4G3'];
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    // Upsert into SyllabusSubject
    for (const sub of [...sem4Subjects, ...sem5Subjects]) {
        await prisma.syllabusSubject.upsert({
            where: { subjectName: sub.name }, // Use name as unique or handled
            update: { department: 'CSE AI ML' },
            create: {
                subjectName: sub.name,
                subjectCode: sub.code,
                department: 'CSE AI ML'
            }
        });
    }

    // Add to Timetable with correct fields
    for (const section of sections) {
        // Sem 4
        for (let i = 0; i < sem4Subjects.length; i++) {
            await prisma.timetable.create({
                data: {
                    department: 'CSE AI ML',
                    semester: '4',
                    section: section,
                    subject: sem4Subjects[i].name,
                    day: days[i % days.length],
                    startTime: '10:00 AM',
                    endTime: '11:00 AM',
                    classroom: 'L-401',
                    floor: '4th Floor',
                    facultyId: facultyId
                }
            });
        }

        // Sem 5
        for (let i = 0; i < sem5Subjects.length; i++) {
            await prisma.timetable.create({
                data: {
                    department: 'CSE AI ML',
                    semester: '5',
                    section: section,
                    subject: sem5Subjects[i].name,
                    day: days[i % days.length],
                    startTime: '11:00 AM',
                    endTime: '12:00 PM',
                    classroom: 'L-501',
                    floor: '5th Floor',
                    facultyId: facultyId
                }
            });
        }
    }

    console.log('Successfully seeded Sem 4 & Sem 5 subjects for CSE AI ML.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
