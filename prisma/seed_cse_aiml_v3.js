const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const facultyId = 'e4879833-5bad-4339-9aec-d9b7d8f9699a';

    const sem4Subjects = [
        { name: 'Operating Systems', code: 'CS401' },
        { name: 'Database Systems', code: 'CS402' },
        { name: 'Computer Networks', code: 'CS403' },
        { name: 'Software Engineering', code: 'CS404' },
        { name: 'Python Programming', code: 'CS405' }
    ];

    const morningSections = ['4G1', '4G2', '4G3', '4G4', '4G5'];
    const eveningSections = ['4G6', '4G7', '4G8', '4G9', '4G10'];
    const allSections = [...morningSections, ...eveningSections];
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    console.log('Cleaning up old entries for CSE AI ML sections...');
    // Only delete AI ML department entries to avoid messing up other departments
    await prisma.timetable.deleteMany({
        where: {
            department: 'CSE AI ML',
            semester: '4',
            section: { in: allSections }
        }
    });

    console.log('Seeding Semester 4 for all sections...');
    for (const section of allSections) {
        for (let i = 0; i < sem4Subjects.length; i++) {
            await prisma.timetable.create({
                data: {
                    department: 'CSE AI ML',
                    semester: '4',
                    section: section,
                    subject: sem4Subjects[i].name,
                    day: days[i % days.length],
                    startTime: '09:00 AM',
                    endTime: '10:00 AM',
                    classroom: 'L-4' + (allSections.indexOf(section) + 1).toString().padStart(2, '0'),
                    floor: '4th Floor',
                    facultyId: facultyId
                }
            });
        }
    }

    // Also upsert SyllabusSubjects
    for (const sub of sem4Subjects) {
        await prisma.syllabusSubject.upsert({
            where: { subjectName: sub.name },
            update: { department: 'CSE AI ML' },
            create: {
                subjectName: sub.name,
                subjectCode: sub.code,
                department: 'CSE AI ML'
            }
        });
    }

    console.log('Successfully synced all Semester 4 sections for CSE AI ML.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
