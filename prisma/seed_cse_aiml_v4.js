const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const facultyId = 'e4879833-5bad-4339-9aec-d9b7d8f9699a';

    const sem4Subjects = [
        { name: 'Java', code: 'CS411' },
        { name: 'DBMS', code: 'CS412' },
        { name: 'Applied Prob', code: 'MA411' },
        { name: 'OT', code: 'CS413' },
        { name: 'S&UL', code: 'CS414' }
    ];

    const morningSections = ['4G1', '4G2', '4G3', '4G4', '4G5'];
    const eveningSections = ['4G6', '4G7', '4G8', '4G9', '4G10'];
    const allSections = [...morningSections, ...eveningSections];
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

    console.log('Cleaning up old entries for CSE AI ML Semester 4...');
    await prisma.timetable.deleteMany({
        where: {
            department: 'CSE AI ML',
            semester: '4',
            section: { in: allSections }
        }
    });

    console.log('Seeding updated Semester 4 subjects for all sections...');
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

    // Ensure SyllabusSubjects exist for these
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

    // Special case: Add a few topics for OT and S&UL so they aren't empty
    const otTopics = ['Intro to Optimization', 'Linear Programming', 'Simplex Method', 'Duality', 'Transportation Problems'];
    const sulTopics = ['Intro to Unix', 'Shell Scripting', 'Process Management', 'File Systems', 'Security'];

    const otSub = await prisma.syllabusSubject.findFirst({ where: { subjectName: 'OT' } });
    if (otSub) {
        for (let i = 0; i < otTopics.length; i++) {
            await prisma.syllabusTopic.create({
                data: {
                    subjectId: otSub.id,
                    title: otTopics[i],
                    order: i
                }
            });
        }
    }

    const sulSub = await prisma.syllabusSubject.findFirst({ where: { subjectName: 'S&UL' } });
    if (sulSub) {
        for (let i = 0; i < sulTopics.length; i++) {
            await prisma.syllabusTopic.create({
                data: {
                    subjectId: sulSub.id,
                    title: sulTopics[i],
                    order: i
                }
            });
        }
    }

    console.log('Successfully synced Java, DBMS, Applied Prob, OT, and S&UL for all CSE AI ML sections.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
